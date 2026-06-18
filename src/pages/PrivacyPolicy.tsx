import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: March 6, 2026</p>

          <div className="space-y-8 text-sm md:text-base text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">1. Scope</h2>
              <p>
                This Privacy Policy explains how abhishekpanda.com collects, uses, and protects personal information
                when you use the website, courses, ebooks, newsletter, mentorship, and related services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">2. Data We Collect</h2>
              <p>
                We may collect contact details (name, email, phone), account/authentication data, purchase and course
                access information, mentorship request details, and basic analytics or device metadata.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">3. How We Use Data</h2>
              <p>
                Data is used to deliver services, process payments, provide support, improve product quality, maintain
                security, and send service communications. Marketing communication is optional and can be unsubscribed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">4. Sharing and Processors</h2>
              <p>
                We do not sell personal data. Data may be processed by trusted infrastructure, analytics, payment,
                and communication providers strictly for service operation and legal compliance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">5. Retention and Security</h2>
              <p>
                We retain data only as needed for business, legal, and accounting obligations. Reasonable technical
                and organizational safeguards are used to protect stored and transmitted information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">6. Your Rights</h2>
              <p>
                You may request access, correction, or deletion of personal data, subject to legal obligations.
                For privacy requests, contact hello@abhishekpanda.com.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">7. Policy Updates</h2>
              <p>
                This policy may be updated from time to time. Material changes will be reflected with an updated date
                on this page.
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
