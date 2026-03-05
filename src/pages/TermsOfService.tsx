import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: March 6, 2026</p>

          <div className="space-y-8 text-sm md:text-base text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">1. Acceptance</h2>
              <p>
                By accessing or using abhishekpanda.com, you agree to these Terms. If you do not agree, please do not
                use the services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">2. Services</h2>
              <p>
                Services include blog content, courses, ebooks, mentorship, product pages, and related digital
                resources. Features may evolve, be updated, or be discontinued at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">3. Accounts and Access</h2>
              <p>
                You are responsible for maintaining account security and accurate information. Unauthorized access,
                misuse, or attempts to disrupt services are prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">4. Intellectual Property</h2>
              <p>
                Unless stated otherwise, site content, course material, and product assets are protected intellectual
                property. Reproduction, redistribution, or resale without permission is prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">5. Payments and Billing</h2>
              <p>
                Paid offerings are billed as shown at checkout. You agree to provide valid payment information and
                comply with applicable payment processor terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">6. Limitation of Liability</h2>
              <p>
                Services are provided on an as-is and as-available basis. To the maximum extent allowed by law, the
                site owner is not liable for indirect, incidental, or consequential damages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">7. Contact</h2>
              <p>
                For terms-related questions, contact hello@abhishekpanda.com.
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
