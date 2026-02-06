import { useState } from "react";
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

// Custom SVG icons for platforms
const MediumIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
  </svg>
);

const SubstackIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
  </svg>
);

const HashnodeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M22.351 8.019l-6.37-6.37a5.63 5.63 0 00-7.962 0l-6.37 6.37a5.63 5.63 0 000 7.962l6.37 6.37a5.63 5.63 0 007.962 0l6.37-6.37a5.63 5.63 0 000-7.962zM12 15.953a3.953 3.953 0 110-7.906 3.953 3.953 0 010 7.906z"/>
  </svg>
);

const UdemyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 0L5.81 3.573v3.574l6.189-3.574 6.191 3.574V3.573zM5.81 10.148v8.144c0 1.85.589 3.243 1.741 4.234S10.177 24 11.973 24s3.269-.482 4.448-1.474c1.179-.991 1.768-2.439 1.768-4.314v-8.064h-3.242v7.85c0 2.036-1.509 3.055-2.974 3.055-1.465 0-2.921-1.019-2.921-3.055v-7.85z"/>
  </svg>
);

const StackOverflowIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M15.725 0l-1.72 1.277 6.39 8.588 1.72-1.277L15.725 0zm-3.94 3.418l-1.369 1.644 8.225 6.85 1.369-1.644-8.225-6.85zm-3.15 4.465l-.905 1.94 9.702 4.517.904-1.94-9.701-4.517zm-1.85 4.86l-.44 2.093 10.473 2.201.44-2.092-10.473-2.203zM1.89 15.47V24h14.79v-8.53h-2.133v6.397H4.021v-6.396H1.89zm4.265 2.133v2.13h5.82v-2.13H6.154z"/>
  </svg>
);

// Twitter/X Icon
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const socialLinks = [
  { name: "Instagram", icon: Instagram, url: "https://www.instagram.com/the_abhishekpanda/", color: "hover:bg-[#E4405F]" },
  { name: "YouTube", icon: Youtube, url: "https://www.youtube.com/@abhishekpanda_official", color: "hover:bg-[#FF0000]" },
  { name: "LinkedIn", icon: Linkedin, url: "https://www.linkedin.com/in/abhishekpandaofficial/", color: "hover:bg-[#0077B5]" },
  { name: "GitHub", icon: Github, url: "https://github.com/abhishekpandaOfficial", color: "hover:bg-[#333]" },
  { name: "X (Twitter)", icon: XIcon, url: "https://twitter.com/abhishekpanda", color: "hover:bg-[#000]", isCustom: true },
];

const blogPlatforms = [
  { name: "Medium", icon: MediumIcon, url: "https://medium.com/@official.abhishekpanda", color: "hover:bg-[#00AB6C]" },
  { name: "Substack", icon: SubstackIcon, url: "https://substack.com/@abhishekpanda08", color: "hover:bg-[#FF6719]" },
  { name: "Hashnode", icon: HashnodeIcon, url: "https://hashnode.com/@abhishekpanda", color: "hover:bg-[#2962FF]" },
];

const platforms = [
  { name: "Udemy", icon: UdemyIcon, url: "https://www.udemy.com/user/abhishek-panda-134/", color: "hover:bg-[#A435F0]" },
  { name: "Stack Overflow", icon: StackOverflowIcon, url: "https://writing.stackexchange.com/users/82639/abhishek-official", color: "hover:bg-[#F48024]" },
];

const Contact = () => {
  const { toast } = useToast();
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
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast({
      title: "Message Sent!",
      description: "Thank you for reaching out. I'll get back to you soon.",
    });
    
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
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
                      {socialLinks.map((social) => (
                        <Tooltip key={social.name}>
                          <TooltipTrigger asChild>
                            <a
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center transition-all duration-300 hover:text-primary-foreground hover:scale-110 hover:shadow-glow ${social.color}`}
                              aria-label={social.name}
                            >
                              {(social as any).isCustom ? <social.icon /> : <social.icon className="w-5 h-5" />}
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>{social.name}</TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  {/* Blog Platforms with Icons */}
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-4">Read my blogs</p>
                    <div className="flex gap-3">
                      {blogPlatforms.map((platform) => (
                        <Tooltip key={platform.name}>
                          <TooltipTrigger asChild>
                            <a
                              href={platform.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center transition-all duration-300 hover:text-primary-foreground hover:scale-110 hover:shadow-glow ${platform.color}`}
                              aria-label={platform.name}
                            >
                              <platform.icon />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>{platform.name}</TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  {/* Other Platforms with Icons */}
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-4">Other platforms</p>
                    <div className="flex gap-3">
                      {platforms.map((platform) => (
                        <Tooltip key={platform.name}>
                          <TooltipTrigger asChild>
                            <a
                              href={platform.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center transition-all duration-300 hover:text-primary-foreground hover:scale-110 hover:shadow-glow ${platform.color}`}
                              aria-label={platform.name}
                            >
                              <platform.icon />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>{platform.name}</TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  {/* Attribution */}
                  <div className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-black text-primary text-xl">OX</span>
                      <span className="text-sm font-medium text-foreground">OriginX Labs</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created & Maintained by <span className="text-foreground font-medium">Abhishek Panda</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      OriginX Labs (OX) R&D Division
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
