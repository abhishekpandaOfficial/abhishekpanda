import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Refund Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: March 6, 2026</p>

          <div className="space-y-8 text-sm md:text-base text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">1. Digital Products and Courses</h2>
              <p>
                Refunds for paid digital products and courses are supported within 7 days from purchase date, provided
                usage is limited and refund abuse is not detected.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">2. Non-Refundable Cases</h2>
              <p>
                Refund requests may be declined in cases of substantial content consumption, policy abuse, or clear
                violation of Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">3. Mentorship Sessions</h2>
              <p>
                Rescheduling is preferred for mentorship bookings. Refunds for missed or completed sessions are
                generally not provided except for verified service-side issues.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">4. Processing Time</h2>
              <p>
                Approved refunds are initiated within 5–10 business days. Final credit timing depends on the payment
                provider and your banking/payment network.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">5. How to Request a Refund</h2>
              <p>
                Email hello@abhishekpanda.com with your order reference, purchase email, and refund reason. Requests
                are reviewed case-by-case under this policy.
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
