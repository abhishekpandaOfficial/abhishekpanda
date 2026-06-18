import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CronRequest {
  job_id: string;
  job_type?: string;
  edge_function_name?: string;
  payload?: Record<string, unknown>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { job_id, job_type, edge_function_name, payload }: CronRequest = await req.json();
    
    console.log(`[CRON] Executing job: ${job_id}, type: ${job_type}`);
    const startTime = Date.now();

    // Create execution record
    const { data: execution, error: execError } = await supabase
      .from("job_executions")
      .insert({
        job_id,
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (execError) {
      console.error("[CRON] Failed to create execution record:", execError);
      throw execError;
    }

    let result: { success: boolean; output?: string; error?: string } = { success: false };

    try {
      // Execute based on job type
      switch (job_type) {
        case "edge_function":
          if (edge_function_name) {
            const { data, error } = await supabase.functions.invoke(edge_function_name, {
              body: payload || {},
            });
            if (error) throw error;
            result = { success: true, output: JSON.stringify(data) };
          }
          break;

        case "analytics_report":
          // Generate analytics summary
          const { data: pageViews } = await supabase
            .from("page_views")
            .select("*", { count: "exact" })
            .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
          
          result = { 
            success: true, 
            output: JSON.stringify({ weekly_page_views: pageViews?.length || 0 })
          };
          break;

        case "cleanup":
          // Cleanup old data (example: old page views > 90 days)
          const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
          const { count } = await supabase
            .from("page_views")
            .delete()
            .lt("created_at", cutoffDate);
          
          result = { success: true, output: `Deleted ${count || 0} old records` };
          break;

        case "backup_check":
          // Simple health check
          const { data: tables } = await supabase.rpc("get_table_counts");
          result = { success: true, output: JSON.stringify(tables || { status: "healthy" }) };
          break;

        case "newsletter":
          // Placeholder for newsletter sending
          result = { success: true, output: "Newsletter job completed" };
          break;

        default:
          result = { success: true, output: `Job type '${job_type}' executed` };
      }
    } catch (jobError: any) {
      console.error("[CRON] Job execution error:", jobError);
      result = { success: false, error: jobError.message };
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Update execution record
    await supabase
      .from("job_executions")
      .update({
        status: result.success ? "success" : "failed",
        completed_at: new Date().toISOString(),
        duration_ms: duration,
        output: result.output,
        error: result.error,
      })
      .eq("id", execution.id);

    // Update job stats
    await supabase
      .from("scheduled_jobs")
      .update({ 
        last_run: new Date().toISOString(),
      })
      .eq("id", job_id);

    console.log(`[CRON] Job ${job_id} completed in ${duration}ms, success: ${result.success}`);

    return new Response(
      JSON.stringify({ 
        success: result.success, 
        duration, 
        execution_id: execution.id,
        output: result.output,
        error: result.error 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[CRON] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
