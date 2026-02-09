import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Baby,
  Award,
  GraduationCap,
  Briefcase,
  Building2,
  Plane,
  Landmark,
  Car,
  Rocket,
  Cpu,
  Star,
  Globe,
  Code2,
  Sparkles,
  Crown,
  Target,
  CheckCircle2,
  TrendingUp,
  X,
  BookOpen,
  BadgeCheck,
  XCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Import company logos
import xeroxLogo from "@/assets/company-logos/xerox.png";
import conduentLogo from "@/assets/company-logos/conduent.png";
import virtusaLogo from "@/assets/company-logos/virtusa.png";
import wellsfargoLogo from "@/assets/company-logos/wellsfargo.png";
import soleraLogo from "@/assets/company-logos/solera.png";
import originxLogo from "@/assets/company-logos/originx.png";

interface TimelineProject {
  title: string;
  highlights: string[];
}

interface TimelineItem {
  year: string;
  title: string;
  subtitle?: string;
  description: string;
  type: "personal" | "education" | "work" | "founder";
  company?: string;
  companyLogo?: string;
  companyColor?: string;
  location?: string;
  icon: typeof Baby;
  projects?: TimelineProject;
  achievements?: string[];
}

const timelineData: TimelineItem[] = [
  {
    year: "1992",
    title: "Born — 8th May",
    subtitle: "Odisha, India",
    description: "A journey that would eventually blend engineering, architecture, and innovation at scale.",
    type: "personal",
    icon: Baby,
  },
  {
    year: "2007",
    title: "10th Grade — District Topper",
    subtitle: "9.3/10 GPA",
    description: "Excelled with top-ranking performance across school and district.",
    type: "education",
    icon: Award,
  },
  {
    year: "2009",
    title: "Completed 12th",
    subtitle: "81% (CHSE Odisha)",
    description: "Strong academic grounding in science and mathematics.",
    type: "education",
    icon: GraduationCap,
  },
  {
    year: "2010",
    title: "Started Engineering",
    subtitle: "Computer Science & Engineering",
    description: "Biju Patnaik University of Technology, Odisha.",
    type: "education",
    icon: Code2,
  },
  {
    year: "2014",
    title: "Graduated with Distinction",
    subtitle: "B.Tech in CSE (7.2/10 GPA)",
    description: "BPUT, Odisha. A launchpad into professional engineering.",
    type: "education",
    icon: GraduationCap,
  },
  {
    year: "2014",
    title: "Associate Software Engineer",
    subtitle: "Xerox / Conduent",
    description: "Started career developing .NET systems for large-scale enterprise workloads.",
    type: "work",
    company: "Xerox / Conduent",
    companyLogo: xeroxLogo,
    companyColor: "#E5173F",
    location: "Bangalore, India",
    icon: Building2,
    projects: {
      title: "Enterprise Financial Systems",
      highlights: [
        "Bank of America – Financial Workflow Automation",
        "MetLife – Insurance Platforms",
        "Built production-grade .NET systems",
        "Large-scale enterprise workload management"
      ]
    }
  },
  {
    year: "2016-2018",
    title: "Software Engineer → Senior Engineer",
    subtitle: "Conduent",
    description: "Built production-grade REST APIs, cloud workflows, and internal ops platforms.",
    type: "work",
    company: "Conduent",
    companyLogo: conduentLogo,
    companyColor: "#00629B",
    location: "Bangalore, India",
    icon: Building2,
    projects: {
      title: "Enterprise Operations Platforms",
      highlights: [
        "Reduced downtime by 35%",
        "Accelerated financial workflows",
        "Designed scalable APIs",
        "Optimized SQL systems for performance"
      ]
    },
    achievements: ["35% Downtime Reduction", "Scalable API Architecture"]
  },
  {
    year: "2018-2019",
    title: "Associate Consultant",
    subtitle: "Virtusa",
    description: "Worked for CITIBANK & Qatar Airways on cloud transformations.",
    type: "work",
    company: "Virtusa",
    companyLogo: virtusaLogo,
    companyColor: "#FF6600",
    location: "Bangalore & Qatar",
    icon: Globe,
    projects: {
      title: "Banking & Aviation Systems",
      highlights: [
        "CITIBANK – Banking Platform Modernization",
        "Qatar Airways – Aviation Systems",
        "Architected .NET Core microservices",
        "Built Azure Functions pipelines",
        "Modernized legacy systems",
        "Improved reporting accuracy & automation"
      ]
    }
  },
  {
    year: "2019-2020",
    title: "Lead Consultant",
    subtitle: "Virtusa",
    description: "Designed high-scale disruption management systems for Qatar Airways.",
    type: "work",
    company: "Virtusa",
    companyLogo: virtusaLogo,
    companyColor: "#FF6600",
    location: "Doha, Qatar",
    icon: Plane,
    projects: {
      title: "Qatar Airways PAX Disruption Management System",
      highlights: [
        "Architected Azure-based .NET Core microservices",
        "Azure API Management governance with OAuth2, JWT validation",
        "Serverless event-processing with Azure Functions + Service Bus",
        "Migrated legacy .NET Framework to .NET Core",
        "Real-time disruption handling pipelines",
        "Production-grade secure API design"
      ]
    },
    achievements: ["Azure Architecture", "Event-Driven Design"]
  },
  {
    year: "2020-2022",
    title: "Assistant Vice President / Technical Architect",
    subtitle: "Wells Fargo",
    description: "Led mission-critical brokerage & banking platforms in regulated environment.",
    type: "work",
    company: "Wells Fargo",
    companyLogo: wellsfargoLogo,
    companyColor: "#D71E28",
    location: "Hyderabad, India",
    icon: Landmark,
    projects: {
      title: "Wealth & Investment Management Technology (WIMT)",
      highlights: [
        "Architected 14+ mission-critical brokerage platforms",
        "Event-driven microservices (.NET Core + Kafka + AWS Lambda)",
        "AWS infrastructure: IAM, KMS, VPC, EC2, SQS, RDS",
        "40% server efficiency improvement",
        "$500K+ annual AWS cost savings",
        "Led 24x7 AMS operations & SLA governance",
        "Blue-green & canary deployment strategies",
        "Managed 10+ engineers across backend, cloud & automation"
      ]
    },
    achievements: ["Employee of the Year 2021", "$500K+ Cost Savings", "40% Efficiency Boost"]
  },
  {
    year: "2022-2025",
    title: "Technical Architect / Engineering Lead",
    subtitle: "Solera",
    description: "Led architecture for global automotive & fleet platforms.",
    type: "work",
    company: "Solera",
    companyLogo: soleraLogo,
    companyColor: "#00B4E4",
    location: "Bangalore, India",
    icon: Car,
    projects: {
      title: "GFP-Smart Drive (Automotive / Fleet Management)",
      highlights: [
        "Cloud-native .NET Core microservices on Azure",
        "Event-driven fleet telemetry & dispatch optimization",
        "OAuth2, JWT, rate limiting, IP filtering security",
        "CI/CD with Azure DevOps, Docker, Kubernetes, Terraform",
        "Angular + TypeScript real-time dashboards",
        "Azure Monitor & Application Insights observability",
        "20% system performance improvement",
        "Led & mentored 18+ engineers globally"
      ]
    },
    achievements: ["Employee of Month (May 2024)", "20% Performance Boost", "18+ Engineers Led"]
  },
  {
    year: "2018-2024",
    title: "Cloud & AI Certifications",
    subtitle: "AWS, Azure, Kubernetes, AI/ML",
    description: "Continuous learning and professional certifications across major cloud platforms and AI/ML domains.",
    type: "education",
    icon: BadgeCheck,
    achievements: [
      "AWS Solutions Architect",
      "Azure Developer Associate",
      "Azure Solutions Architect",
      "Kubernetes (CKA)",
      "AI/ML Professional"
    ]
  },
  {
    year: "2023",
    title: "Left Executive M.Tech Program",
    subtitle: "BITS Pilani (Work Integrated Learning)",
    description: "Made the bold decision to drop out from BITS Pilani's Executive M.Tech program to pursue building innovative products rather than following the traditional, theory-heavy education system.",
    type: "education",
    icon: XCircle,
    achievements: ["Chose Innovation Over Theory", "Entrepreneurial Mindset"]
  },
  {
    year: "2025",
    title: "Founder & CEO",
    subtitle: "OriginX Labs",
    description: "OriginX Labs Pvt. Ltd. — Building next-gen AI systems.",
    type: "founder",
    company: "OriginX Labs",
    companyLogo: originxLogo,
    companyColor: "#6366F1",
    location: "India",
    icon: Rocket,
    projects: {
      title: "AI & Automation Innovation",
      highlights: [
        "Multi-agent systems development",
        "AI workflow orchestration",
        "Cloud-native automation engines",
        "LLM infrastructure and toolchains",
        "Product innovation and R&D"
      ]
    }
  },
  {
    year: "Aug 2025",
    title: "Published Author",
    subtitle: "Awake While Alive!",
    description: "Wrote and published a book — receiving the Rising Star Author Award from Notion Press.",
    type: "personal",
    icon: BookOpen,
    projects: {
      title: "Book Publication",
      highlights: [
        "Available on Amazon, Flipkart & Kindle",
        "Published via Notion Press",
        "Rising Star Author Award Winner",
        "Flipkart: flipkart.com/awake-while-alive",
        "Amazon: amzn.in/d/f2kbz5j",
        "Kindle eBook available"
      ]
    },
    achievements: ["Rising Star Author Award", "Multi-Platform Publication"]
  },
  {
    year: "2025",
    title: "AETHERGRID — Launched",
    subtitle: "Proprietary Automation Intelligence",
    description: '"Where intelligence, networks, and automation converge."',
    type: "founder",
    company: "OriginX Labs",
    companyLogo: originxLogo,
    companyColor: "#8B5CF6",
    icon: Cpu,
    projects: {
      title: "AETHERGRID Platform",
      highlights: [
        "Workflow automation intelligence",
        "Multi-agent systems orchestration",
        "LLM routing & optimization",
        "Social automation engine",
        "Personal ecosystem management"
      ]
    }
  },
  {
    year: "Today",
    title: "CEO of OriginX Labs Private Limited",
    subtitle: "OriginX Labs Pvt. Ltd.",
    description: ".NET Architect • AI/ML Engineer • Enterprise Systems Designer — Building next-gen digital ecosystems.",
    type: "founder",
    company: "OriginX Labs Pvt. Ltd.",
    companyLogo: originxLogo,
    companyColor: "#111827",
    icon: Crown,
    projects: {
      title: "Current Focus Areas",
      highlights: [
        "Next-gen digital ecosystems",
        "Automation frameworks",
        "Intelligent architectures",
        "Solutions for developers, founders & enterprises",
        "Founder of OriginX Labs"
      ]
    }
  }
];

interface MobileModalProps {
  item: TimelineItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const MobileProjectModal = ({ item, isOpen, onClose }: MobileModalProps) => {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {item.companyLogo ? (
              <img 
                src={item.companyLogo} 
                alt={item.company || ""} 
                className="w-12 h-12 rounded-xl object-contain bg-white p-1"
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: item.companyColor || 'hsl(var(--primary))' }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <DialogTitle className="text-lg font-bold">{item.projects?.title || item.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">{item.year} • {item.location || item.subtitle}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {item.projects && (
            <ul className="space-y-2">
              {item.projects.highlights.map((highlight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    style={{ color: item.companyColor || 'hsl(var(--primary))' }}
                  />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          )}

          {item.achievements && (
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Key Achievements</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.achievements.map((ach, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary">
                    {ach}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TimelineCard = ({ item, index, onMobileClick }: { item: TimelineItem; index: number; onMobileClick: (item: TimelineItem) => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isLeft = index % 2 === 0;
  const Icon = item.icon;

  const getTypeColor = () => {
    switch (item.type) {
      case "personal": return "from-pink-500 to-rose-500";
      case "education": return "from-emerald-500 to-teal-500";
      case "work": return "from-primary to-secondary";
      case "founder": return "from-purple-500 to-indigo-500";
      default: return "from-primary to-secondary";
    }
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case "personal": return <Baby className="w-4 h-4" />;
      case "education": return <GraduationCap className="w-4 h-4" />;
      case "work": return <Briefcase className="w-4 h-4" />;
      case "founder": return <Rocket className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const handleClick = () => {
    if (item.projects || item.achievements) {
      onMobileClick(item);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative flex items-center w-full ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Content Card */}
      <div className={`w-full md:w-[calc(50%-2rem)] ${isLeft ? 'md:pr-8' : 'md:pl-8'} pl-12 md:pl-0`}>
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          onClick={handleClick}
          className="relative glass-card-hover rounded-2xl p-5 md:p-6 cursor-pointer group overflow-hidden"
        >
          {/* Background gradient on hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"
            style={{ backgroundColor: item.companyColor || 'hsl(var(--primary))' }}
          />

          {/* Year Badge */}
          <div className="flex items-center justify-between mb-3">
            <span 
              className="px-3 py-1 rounded-full text-xs md:text-sm font-bold text-white"
              style={{ backgroundColor: item.companyColor || 'hsl(var(--primary))' }}
            >
              {item.year}
            </span>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getTypeColor()} flex items-center justify-center text-white`}>
              {getTypeIcon()}
            </div>
          </div>

          {/* Company Logo/Badge */}
          {item.company && (
            <div className="flex items-center gap-3 mb-3">
              {item.companyLogo ? (
                <img 
                  src={item.companyLogo} 
                  alt={item.company} 
                  className="w-12 h-12 rounded-xl object-contain bg-white p-1 shadow-sm"
                />
              ) : (
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: item.companyColor }}
                >
                  {item.company.charAt(0)}
                </div>
              )}
              <div>
                <span className="text-xs text-muted-foreground">{item.location}</span>
                <p className="text-sm font-semibold text-foreground">{item.company}</p>
              </div>
            </div>
          )}

          {/* Title & Description */}
          <h3 className="font-bold text-foreground text-base md:text-lg mb-1 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          {item.subtitle && (
            <p className="text-sm font-medium text-primary mb-2">{item.subtitle}</p>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>

          {/* Achievements */}
          {item.achievements && (
            <div className="flex flex-wrap gap-2 mt-3">
              {item.achievements.slice(0, 3).map((achievement, i) => (
                <span 
                  key={i}
                  className="px-2 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary flex items-center gap-1"
                >
                  <Star className="w-3 h-3" />
                  {achievement}
                </span>
              ))}
              {item.achievements.length > 3 && (
                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-muted text-muted-foreground">
                  +{item.achievements.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Hover indicator - Desktop only */}
          {item.projects && (
            <div className="mt-4 hidden md:flex items-center gap-2 text-xs text-muted-foreground group-hover:text-primary transition-colors">
              <Target className="w-4 h-4" />
              <span>Hover for project details</span>
            </div>
          )}

          {/* Tap indicator - Mobile only */}
          {(item.projects || item.achievements) && (
            <div className="mt-4 flex md:hidden items-center gap-2 text-xs text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>Tap for details</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Timeline Center Line & Icon */}
      <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 flex flex-col items-center z-10">
        <motion.div
          animate={isHovered ? { scale: 1.2, rotate: 360 } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}
          className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${getTypeColor()} flex items-center justify-center shadow-lg border-4 border-background`}
        >
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </motion.div>
      </div>

      {/* Project Details Popup - Desktop only */}
      <AnimatePresence>
        {isHovered && item.projects && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className={`hidden md:block absolute ${isLeft ? 'right-0 md:right-auto md:left-[calc(50%+2rem)]' : 'left-0 md:left-auto md:right-[calc(50%+2rem)]'} top-0 w-[calc(50%-3rem)] z-20`}
          >
            <div 
              className="glass-card rounded-2xl p-6 border-2"
              style={{ borderColor: item.companyColor || 'hsl(var(--primary))' }}
            >
              <div className="flex items-center gap-3 mb-4">
                {item.companyLogo ? (
                  <img 
                    src={item.companyLogo} 
                    alt={item.company || ""} 
                    className="w-12 h-12 rounded-xl object-contain bg-white p-1"
                  />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: item.companyColor }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-foreground">{item.projects.title}</h4>
                  <p className="text-xs text-muted-foreground">Project Highlights</p>
                </div>
              </div>

              <ul className="space-y-2">
                {item.projects.highlights.map((highlight, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: item.companyColor }}
                    />
                    <span>{highlight}</span>
                  </motion.li>
                ))}
              </ul>

              {item.achievements && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Key Achievements</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.achievements.map((ach, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg text-xs bg-primary/10 text-primary">
                        {ach}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const CareerTimeline = () => {
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMobileClick = (item: TimelineItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Life & Career Timeline
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight">
            Career <span className="gradient-text">Journey</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A premium vertical timeline of personal and professional milestones, from inception to innovation leadership.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center Line */}
          <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-purple md:-translate-x-1/2" />

          {/* Timeline Items */}
          <div className="space-y-8 md:space-y-12">
            {timelineData.map((item, index) => (
              <TimelineCard 
                key={`${item.year}-${index}`} 
                item={item} 
                index={index} 
                onMobileClick={handleMobileClick}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 md:mt-16 flex flex-wrap justify-center gap-4 md:gap-6"
        >
          {[
            { type: "personal", label: "Personal", color: "from-pink-500 to-rose-500" },
            { type: "education", label: "Education", color: "from-emerald-500 to-teal-500" },
            { type: "work", label: "Work Experience", color: "from-primary to-secondary" },
            { type: "founder", label: "Founder & CEO", color: "from-purple-500 to-indigo-500" },
          ].map((legend) => (
            <div key={legend.type} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${legend.color}`} />
              <span className="text-sm text-muted-foreground">{legend.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Mobile Modal */}
      <MobileProjectModal 
        item={selectedItem} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
};
