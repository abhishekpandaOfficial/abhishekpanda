import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Mail, 
  MapPin, 
  Send,
  Linkedin,
  Github,
  Youtube,
  Instagram,
  MessageSquare,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePublicSocialProfiles } from "@/hooks/useSocialProfiles";
import { iconForKey } from "@/lib/social/iconMap";
import { supabase } from "@/integrations/supabase/client";
import originxLabsLogo from "@/assets/originxlabs.png";

type PublicProfile = {
  platform: string;
  display_name: string;
  category: string;
  profile_url: string | null;
  icon_key: string;
  brand_bg: string | null;
};

function ProfileIconLink(props: { p: PublicProfile }) {
  const Icon: any = iconForKey(props.p.icon_key);
  const bg = props.p.brand_bg || "bg-primary";
  return (
    <Tooltip key={props.p.platform}>
      <TooltipTrigger asChild>
        <a
          href={props.p.profile_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-12 h-12 rounded-xl bg-muted flex items-center justify-center transition-all duration-300 hover:text-primary-foreground hover:scale-110 hover:shadow-glow"
          aria-label={props.p.display_name}
        >
          <span className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity ${bg}`} />
          <Icon className="relative w-5 h-5 text-muted-foreground group-hover:text-white" />
        </a>
      </TooltipTrigger>
      <TooltipContent>{props.p.display_name}</TooltipContent>
    </Tooltip>
  );
}

const Contact = () => {
  const { toast } = useToast();
  const { data: profiles } = usePublicSocialProfiles();
  const { social, blog, platform } = useMemo(() => {
    const rows = (profiles ?? []) as any[];
    return {
      social: rows.filter((r) => r.category === "social" && r.profile_url),
      blog: rows.filter((r) => r.category === "blog" && r.profile_url),
      platform: rows.filter((r) => (r.category === "platform" || r.category === "website") && r.profile_url),
    };
  }, [profiles]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const name = formData.name.trim();
    const email = formData.email.trim();
    const reason = formData.subject.trim();
    const intent = formData.message.trim();

    if (!name || !email || !reason || !intent) {
      toast({ title: "Missing info", description: "Please fill in all fields." });
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address." });
      setIsSubmitting(false);
      return;
    }

    try {
      // Store server-side for tracking/admin panel (RLS should allow anonymous inserts).
      const { error: insertErr } = await supabase.from("contact_requests").insert({
        name,
        email,
        reason,
        intent,
        user_agent: navigator.userAgent,
      });
      if (insertErr) throw insertErr;

      // Send Resend email via Edge Function.
      const { error: notifyErr } = await supabase.functions.invoke("contact-notification", {
        body: { name, email, reason, intent },
      });
      if (notifyErr) throw notifyErr;

      toast({
        title: "Message Sent!",
        description: "Thanks for reaching out. I’ll get back to you soon.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      console.error("Contact submit failed:", err);
      toast({
        title: "Failed to send",
        description: "Please try again in a moment. If it persists, email hello@abhishekpanda.com.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="relative overflow-hidden py-16">
          <div className="absolute inset-0 mesh-gradient opacity-50" />
          <div className="relative container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-6">
                <MessageSquare className="w-4 h-4" />
                Get in Touch
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
                Let's <span className="gradient-text">Connect</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Have a question, project idea, or just want to say hello? 
                I'd love to hear from you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <div className="glass-card rounded-2xl p-8 sticky top-24">
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Contact Information
                  </h2>

                  <div className="space-y-6 mb-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Email</p>
                        <a 
                          href="mailto:hello@abhishekpanda.com" 
                          className="text-foreground hover:text-primary transition-colors font-medium"
                        >
                          hello@abhishekpanda.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Location</p>
                        <p className="text-foreground font-medium">India</p>
                      </div>
                    </div>
                  </div>

                  {/* Social Links with Tooltips */}
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-4">Connect on social</p>
                    <div className="flex gap-3">
                      {social.map((p: any) => (
                        <ProfileIconLink key={p.platform} p={p} />
                      ))}
                    </div>
                  </div>

                  {/* Blog Platforms with Icons */}
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-4">Read my blogs</p>
                    <div className="flex gap-3">
                      {blog.map((p: any) => (
                        <ProfileIconLink key={p.platform} p={p} />
                      ))}
                    </div>
                  </div>

                  {/* Other Platforms with Icons */}
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-4">Other platforms</p>
                    <div className="flex gap-3">
                      {platform.map((p: any) => (
                        <ProfileIconLink key={p.platform} p={p} />
                      ))}
                    </div>
                  </div>

                  {/* Attribution */}
                  <div className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 rounded-lg bg-white/95 px-2 py-1 ring-1 ring-border/40 shadow-sm">
                        <img
                          src={originxLabsLogo}
                          alt="OriginX Labs"
                          className="h-6 w-auto object-contain"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground">OriginX Labs</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created & Maintained by <span className="text-foreground font-medium">Abhishek Panda</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      OriginX Labs R&amp;D Division
                    </p>
                    <a 
                      href="https://www.originxlabs.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                    >
                      Visit OriginX Labs <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Map Placeholder */}
                  <div className="mt-6 h-40 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Based in India</p>
                      <p className="text-xs text-muted-foreground">Working globally</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="lg:col-span-3"
              >
                <div className="glass-card rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Send a Message
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Your Name
                        </label>
                        <Input
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          className="bg-background h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email Address
                        </label>
                        <Input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                          className="bg-background h-12"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Subject
                      </label>
                      <Input
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="What's this about?"
                        className="bg-background h-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Message
                      </label>
                      <Textarea
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Write your message here..."
                        className="bg-background min-h-[180px]"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      variant="hero" 
                      size="xl" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Send className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
