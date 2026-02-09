import { Link } from "react-router-dom";
import { 
  Instagram, 
  Youtube, 
  Linkedin, 
  Github, 
  Mail, 
  MapPin,
  ExternalLink,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BurningLogo } from "@/components/ui/BurningLogo";

const footerLinks = {
  explore: [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Blog", path: "/blog" },
    { name: "Academy", path: "/academy" },
    { name: "LLM Galaxy", path: "/llm-galaxy" },
  ],
  resources: [
    { name: "Digital Products", path: "/products" },
    { name: "Mentorship", path: "/mentorship" },
    { name: "Newsletter", path: "/#newsletter" },
    { name: "Contact", path: "/contact" },
  ],
  books: [
    { name: "Awake While Alive!", url: "https://amzn.in/d/f2kbz5j", external: true },
    { name: "Buy on Flipkart", url: "https://www.flipkart.com/awake-while-alive/p/itmc8fc663e9b8aa", external: true },
    { name: "Kindle Edition", url: "https://amzn.in/d/hUih88n", external: true },
    { name: "Notion Press", url: "https://notionpress.com/in/read/awake-while-alive/", external: true },
  ],
  ecosystem: [
    { name: "Stackcraft.io", url: "https://stackcraft.io", external: true, note: "Engineering blog" },
    { name: "NEWSTACK.LIVE", url: "https://newstack.live", external: true, note: "All global news at one place" },
    { name: "CHRONYX", url: "https://www.getchronyx.com", external: true, note: "Personal one-place destination" },
  ],
  legal: [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Refund Policy", path: "/refund" },
  ],
};

// Twitter/X Icon
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const socialLinks = [
  { name: "Instagram", icon: Instagram, url: "https://www.instagram.com/the_abhishekpanda/", color: "hover:bg-[#E4405F]" },
  { name: "YouTube", icon: Youtube, url: "https://www.youtube.com/@abhishekpanda_official", color: "hover:bg-[#FF0000]" },
  { name: "LinkedIn", icon: Linkedin, url: "https://www.linkedin.com/in/abhishekpandaofficial/", color: "hover:bg-[#0077B5]" },
  { name: "GitHub", icon: Github, url: "https://github.com/abhishekpandaOfficial", color: "hover:bg-[#333]" },
  { name: "X (Twitter)", icon: XIcon, url: "https://x.com/Panda_Abhishek8", color: "hover:bg-[#000]", isCustom: true },
];

const blogLinks = [
  { name: "Medium", url: "https://medium.com/@official.abhishekpanda", color: "hover:bg-[#00AB6C]" },
  { name: "Substack", url: "https://substack.com/@abhishekpanda08", color: "hover:bg-[#FF6719]" },
  { name: "Hashnode", url: "https://hashnode.com/@abhishekpanda", color: "hover:bg-[#2962FF]" },
];

const platformLinks = [
  { name: "Udemy", url: "https://www.udemy.com/user/abhishek-panda-134/", color: "hover:bg-[#A435F0]" },
  { name: "Stack Overflow", url: "https://writing.stackexchange.com/users/82639/abhishek-official", color: "hover:bg-[#F48024]" },
];

// Custom SVG icons for platforms
const MediumIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
  </svg>
);

const SubstackIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
  </svg>
);

const HashnodeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M22.351 8.019l-6.37-6.37a5.63 5.63 0 00-7.962 0l-6.37 6.37a5.63 5.63 0 000 7.962l6.37 6.37a5.63 5.63 0 007.962 0l6.37-6.37a5.63 5.63 0 000-7.962zM12 15.953a3.953 3.953 0 110-7.906 3.953 3.953 0 010 7.906z"/>
  </svg>
);

const UdemyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 0L5.81 3.573v3.574l6.189-3.574 6.191 3.574V3.573zM5.81 10.148v8.144c0 1.85.589 3.243 1.741 4.234S10.177 24 11.973 24s3.269-.482 4.448-1.474c1.179-.991 1.768-2.439 1.768-4.314v-8.064h-3.242v7.85c0 2.036-1.509 3.055-2.974 3.055-1.465 0-2.921-1.019-2.921-3.055v-7.85z"/>
  </svg>
);

const StackOverflowIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M15.725 0l-1.72 1.277 6.39 8.588 1.72-1.277L15.725 0zm-3.94 3.418l-1.369 1.644 8.225 6.85 1.369-1.644-8.225-6.85zm-3.15 4.465l-.905 1.94 9.702 4.517.904-1.94-9.701-4.517zm-1.85 4.86l-.44 2.093 10.473 2.201.44-2.092-10.473-2.203zM1.89 15.47V24h14.79v-8.53h-2.133v6.397H4.021v-6.396H1.89zm4.265 2.133v2.13h5.82v-2.13H6.154z"/>
  </svg>
);

export const Footer = () => {
  return (
    <footer className="relative bg-card border-t border-border">
      {/* Gradient overlay */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      
      <div className="relative container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <BurningLogo size="md" animate={false} />
              <span className="font-bold text-xl">
                <span className="text-foreground">abhishek</span>
                <span className="gradient-text">panda</span>
              </span>
            </Link>
            <p className="text-muted-foreground mb-4 text-sm">
              Engineering ideas into reality, one clean build at a time. 
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              .NET Architect • AI/ML Engineer • Cloud-Native Specialist
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Founder, <span className="text-secondary">OriginX Labs</span>
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-2 mb-4">
              {socialLinks.map((social) => (
                <Tooltip key={social.name}>
                  <TooltipTrigger asChild>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-9 h-9 rounded-lg bg-muted hover:text-primary-foreground flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow ${social.color}`}
                      aria-label={social.name}
                    >
                      {(social as any).isCustom ? <social.icon /> : <social.icon className="w-4 h-4" />}
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>{social.name}</TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Blog & Platform Icons */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={blogLinks[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-lg bg-muted hover:text-primary-foreground flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow ${blogLinks[0].color}`}
                    aria-label="Medium"
                  >
                    <MediumIcon />
                  </a>
                </TooltipTrigger>
                <TooltipContent>Medium</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={blogLinks[1].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-lg bg-muted hover:text-primary-foreground flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow ${blogLinks[1].color}`}
                    aria-label="Substack"
                  >
                    <SubstackIcon />
                  </a>
                </TooltipTrigger>
                <TooltipContent>Substack</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={blogLinks[2].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-lg bg-muted hover:text-primary-foreground flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow ${blogLinks[2].color}`}
                    aria-label="Hashnode"
                  >
                    <HashnodeIcon />
                  </a>
                </TooltipTrigger>
                <TooltipContent>Hashnode</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={platformLinks[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-lg bg-muted hover:text-primary-foreground flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow ${platformLinks[0].color}`}
                    aria-label="Udemy"
                  >
                    <UdemyIcon />
                  </a>
                </TooltipTrigger>
                <TooltipContent>Udemy</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={platformLinks[1].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-lg bg-muted hover:text-primary-foreground flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow ${platformLinks[1].color}`}
                    aria-label="Stack Overflow"
                  >
                    <StackOverflowIcon />
                  </a>
                </TooltipTrigger>
                <TooltipContent>Stack Overflow</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4 text-sm">Explore</h4>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4 text-sm">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* My Books */}
          <div>
            <h4 className="font-bold text-foreground mb-4 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              My Books
            </h4>
            <ul className="space-y-2">
              {footerLinks.books.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1"
                  >
                    {link.name}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Ecosystem */}
          <div>
            <h4 className="font-bold text-foreground mb-4 text-sm flex items-center gap-2">
              Ecosystem
            </h4>
            <ul className="space-y-2">
              {footerLinks.ecosystem.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1"
                  >
                    <span className="truncate">{link.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {"note" in link && link.note ? (
                    <div className="text-[11px] text-muted-foreground/70 mt-0.5">{link.note}</div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-foreground mb-4 text-sm">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:hello@abhishekpanda.com" className="text-sm hover:text-primary transition-colors">
                  hello@abhishekpanda.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm">India</span>
              </li>
            </ul>
            <Button variant="hero-outline" size="sm" className="mt-4" asChild>
              <Link to="/contact">
                Get in Touch
                <ExternalLink className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Attribution Section */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                <span className="text-primary font-semibold">LLM Galaxy</span> — Created & Maintained by{" "}
                <span className="text-foreground font-medium">Abhishek Panda</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                OriginX Labs R&amp;D Division
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">CEO &amp; Founder of</span>
              <a
                href="https://www.originxlabs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-primary hover:underline underline-offset-4"
              >
                OriginX Labs (www.originxlabs.com)
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Abhishek Panda. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
