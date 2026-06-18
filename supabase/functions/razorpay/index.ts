import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not configured');
      throw new Error('Payment gateway not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { action, ...data } = await req.json();

    console.log(`Processing action: ${action}`, data);

    // Create order
    if (action === 'create-order') {
      const { amount, currency = 'INR', product_type, product_id, user_id, metadata } = data;

      // Create Razorpay order
      const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
      const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay expects amount in paise
          currency,
          receipt: `receipt_${Date.now()}`,
          notes: {
            product_type,
            product_id,
            user_id,
          },
        }),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.text();
        console.error('Razorpay order creation failed:', error);
        throw new Error('Failed to create payment order');
      }

      const order = await orderResponse.json();
      console.log('Razorpay order created:', order.id);

      // Store order in database
      const { error: dbError } = await supabase.from('payments').insert({
        user_id,
        order_id: order.id,
        amount,
        currency,
        status: 'created',
        product_type,
        product_id,
        metadata,
      });

      if (dbError) {
        console.error('Database insert error:', dbError);
      }

      return new Response(JSON.stringify({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: RAZORPAY_KEY_ID,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify payment
    if (action === 'verify-payment') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

      // Verify signature using HMAC
      const hmac = createHmac('sha256', RAZORPAY_KEY_SECRET);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const expectedSignature = hmac.digest('hex');

      if (expectedSignature !== razorpay_signature) {
        console.error('Signature verification failed');
        return new Response(JSON.stringify({
          success: false,
          error: 'Payment verification failed',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Payment verified successfully:', razorpay_payment_id);

      // Update payment status
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .update({ 
          payment_id: razorpay_payment_id, 
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', razorpay_order_id)
        .select()
        .single();

      if (paymentError) {
        console.error('Payment update error:', paymentError);
      }

      // If course enrollment, create enrollment record
      if (payment && payment.product_type === 'course') {
        const { error: enrollError } = await supabase.from('enrollments').insert({
          user_id: payment.user_id,
          course_id: payment.product_id,
          payment_id: razorpay_payment_id,
          payment_status: 'completed',
          amount_paid: payment.amount,
        });

        if (enrollError) {
          console.error('Enrollment creation error:', enrollError);
        }
      }

      // Generate invoice
      const invoiceNumber = `INV-${Date.now()}`;
      const { error: invoiceError } = await supabase.from('invoices').insert({
        payment_id: payment?.id,
        invoice_number: invoiceNumber,
        user_id: payment?.user_id,
        amount: payment?.amount,
        tax_amount: Math.round((payment?.amount || 0) * 0.18),
        total_amount: Math.round((payment?.amount || 0) * 1.18),
        status: 'generated',
        billing_details: payment?.metadata,
      });

      if (invoiceError) {
        console.error('Invoice creation error:', invoiceError);
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Payment verified successfully',
        invoice_number: invoiceNumber,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get payment details
    if (action === 'get-payment') {
      const { payment_id } = data;
      
      const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
      const response = await fetch(`https://api.razorpay.com/v1/payments/${payment_id}`, {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      });

      const paymentDetails = await response.json();
      
      return new Response(JSON.stringify({
        success: true,
        payment: paymentDetails,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process refund - REQUIRES ADMIN AUTHENTICATION
    if (action === 'refund') {
      const { payment_id, amount, reason } = data;
      
      // Verify admin authorization
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        console.error('Refund attempted without authorization');
        return new Response(JSON.stringify({
          success: false,
          error: 'Authorization required for refunds',
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Validate user and check admin role
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.error('Invalid authorization token for refund');
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid authorization',
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (roleError || !roleData) {
        console.error('Refund attempted by non-admin user:', user.id);
        return new Response(JSON.stringify({
          success: false,
          error: 'Admin privileges required for refunds',
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Admin refund authorized for user:', user.id);
      
      const razorpayAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
      const refundResponse = await fetch(`https://api.razorpay.com/v1/payments/${payment_id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${razorpayAuth}`,
        },
        body: JSON.stringify({
          amount: amount ? amount * 100 : undefined,
          notes: { reason, processed_by: user.id },
        }),
      });

      const refund = await refundResponse.json();
      console.log('Refund processed:', refund);

      // Update payment status
      await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('payment_id', payment_id);

      return new Response(JSON.stringify({
        success: true,
        refund,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
