import { useState } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  Star,
  CheckCircle2,
  Users,
  Target,
  Zap,
} from "lucide-react";
import { MentorshipBookingModal, type MentorshipPackage } from "@/components/mentorship/MentorshipBookingModal";

const packages: Array<MentorshipPackage & { features: string[]; popular?: boolean; durationLabel: string }> = [
  {
    name: "Quick Consultation",
    durationMinutes: 30,
    durationLabel: "30 min",
    amountInr: 1499,
    description: "Perfect for quick questions, code reviews, or architectural guidance.",
    features: ["1:1 video call", "Screen sharing", "Code review", "Action items summary"],
  },
  {
    name: "Deep Dive Session",
    durationMinutes: 60,
    durationLabel: "60 min",
    amountInr: 2999,
    description: "Comprehensive session for detailed discussions and hands-on guidance.",
    features: [
      "1:1 video call",
      "Screen sharing & pair programming",
      "Architecture review",
      "Detailed notes & resources",
      "7-day follow-up support",
    ],
    popular: true,
  },
  {
    name: "Career Strategy",
    durationMinutes: 90,
    durationLabel: "90 min",
    amountInr: 4499,
    description: "Strategic career planning, interview prep, and growth roadmap.",
    features: [
      "1:1 video call",
      "Career assessment",
      "Growth roadmap creation",
      "Resume/LinkedIn review",
      "Mock interview session",
      "30-day follow-up support",
    ],
  },
];

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Senior Developer at Microsoft",
    content:
      "Abhishek's mentorship was transformative. His deep knowledge of .NET architecture helped me crack my dream job.",
    rating: 5,
  },
  {
    name: "Priya Patel",
    role: "Tech Lead at Amazon",
    content:
      "The system design session was incredibly valuable. Clear explanations and practical insights that I still use today.",
    rating: 5,
  },
  {
    name: "Amit Kumar",
    role: "Startup Founder",
    content:
      "Best investment I made for my startup. Abhishek helped us design a scalable architecture from day one.",
    rating: 5,
  },
];

const Mentorship = () => {
  const [selectedPkg, setSelectedPkg] = useState<MentorshipPackage | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="relative overflow-hidden py-16">
          <div className="absolute inset-0 mesh-gradient opacity-50" />
          <div className="relative container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-6">
                <Calendar className="w-4 h-4" />
                1:1 Mentorship Sessions
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
                Book a <span className="gradient-text">1:1 Session</span> with Me
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Get personalized guidance on .NET architecture, AI/ML, cloud solutions, career growth, or any technical
                challenge you're facing.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">HD Video Calls</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Follow-up Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">500+ Sessions Done</span>
                </div>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => {
                    setSelectedPkg(packages[1]);
                    setBookingOpen(true);
                  }}
                >
                  Book a Session
                </Button>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Times shown in IST (Asia/Kolkata)
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Packages */}
        <section className="container mx-auto px-4 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative ${pkg.popular ? "md:-mt-4 md:mb-4" : ""}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="badge-premium">Most Popular</span>
                  </div>
                )}
                <div
                  className={`glass-card-hover rounded-2xl p-6 h-full flex flex-col ${
                    pkg.popular ? "border-2 border-primary shadow-glow" : ""
                  }`}
                >
                  <div className="text-center mb-6">
                    <h3 className="font-bold text-xl text-foreground mb-2">{pkg.name}</h3>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                      <Clock className="w-4 h-4" />
                      {pkg.durationLabel}
                    </div>
                    <div className="text-4xl font-black gradient-text mb-2">
                      ₹{pkg.amountInr.toLocaleString("en-IN")}
                    </div>
                    <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  </div>

                  <ul className="space-y-3 mb-6 flex-1">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={pkg.popular ? "hero" : "hero-outline"}
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      setSelectedPkg(pkg);
                      setBookingOpen(true);
                    }}
                  >
                    Book Now
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="section-title mb-4">
                What <span className="gradient-text">Mentees</span> Say
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-bold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Booking CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center glass-card rounded-2xl p-10">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Instant Booking + Secure Payment
              </div>
              <h2 className="section-title mb-4">
                Pick a time and <span className="gradient-text">book instantly</span>
              </h2>
              <p className="section-subtitle mx-auto mb-8">
                Choose a time in IST, fill the details, pay securely via Razorpay, and receive a calendar invite (ICS) on
                email.
              </p>
              <Button
                variant="hero"
                size="xl"
                onClick={() => {
                  setSelectedPkg(packages[1]);
                  setBookingOpen(true);
                }}
              >
                <Target className="w-5 h-5" />
                Book Session
              </Button>
            </div>
          </div>
        </section>
      </main>

      <MentorshipBookingModal open={bookingOpen} onOpenChange={setBookingOpen} pkg={selectedPkg} />

      <Footer />
    </div>
  );
};

export default Mentorship;

