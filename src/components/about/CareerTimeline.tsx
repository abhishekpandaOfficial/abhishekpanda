import { Bot, BrainCircuit, Building2, Car, Cloud, Globe, Landmark, Plane, ShieldCheck } from "lucide-react";
import type { ComponentType } from "react";
import {
  SiAmazonwebservices,
  SiAngular,
  SiApachekafka,
  SiAwslambda,
  SiDocker,
  SiDotnet,
  SiGit,
  SiGraphql,
  SiKubernetes,
  SiRabbitmq,
  SiSharp,
  SiTerraform,
} from "react-icons/si";
import conduentLogo from "@/assets/company-logos/conduent-official.png";
import jdSportsLogo from "@/assets/company-logos/jd-sports-official.svg";
import virtusaLogo from "@/assets/company-logos/virtusa-official.svg";
import wellsfargoLogo from "@/assets/company-logos/wellsfargo-official.png";
import kpmgLogo from "@/assets/company-logos/kpmg-official.svg";
import accionLogo from "@/assets/company-logos/accionlabs-official.svg";
import soleraLogo from "@/assets/company-logos/solera-official.svg";
import qualitestLogo from "@/assets/company-logos/qualitest.svg";
import clientDellLogo from "@/assets/company-logos/client-dell.svg";
import clientKpmgLogo from "@/assets/company-logos/client-kpmg.svg";
import clientQatarLogo from "@/assets/company-logos/client-qatar-airways.svg";
import clientCitiLogo from "@/assets/company-logos/client-citi.svg";
import clientMetlifeLogo from "@/assets/company-logos/client-metlife.svg";
import clientBoaLogo from "@/assets/company-logos/client-boa.svg";
import clientHiscoxLogo from "@/assets/company-logos/client-hiscox.svg";

type ClientInfo = {
  name: string;
  logo: string;
  url?: string;
  logoBackgroundClass?: string;
};

type TechInfo = {
  name: string;
  icon: ComponentType<{ className?: string }>;
  colorClass?: string;
};

const AzureLogoIcon = ({ className }: { className?: string }) => (
  <img
    src="/brand-logos/stacks/microsoftazure.svg"
    alt="Azure logo"
    className={className}
  />
);

type TimelineItem = {
  year: string;
  title: string;
  subtitle?: string;
  description: string;
  type: "work";
  company?: string;
  companyLogo?: string;
  companyUrl?: string;
  logoBackgroundClass?: string;
  timelineLogoNodeClass?: string;
  timelineLogoImageClass?: string;
  cardLogoImageClass?: string;
  clients?: ClientInfo[];
  techStack?: TechInfo[];
  location?: string;
  icon: typeof Building2;
  achievements?: string[];
};

const timelineData: TimelineItem[] = [
  {
    year: "Mar 2026 - Present",
    title: "Technical Architect / AI Architect",
    subtitle: "Qualitest",
    description:
      "Leading AI and architecture initiatives for Hiscox, focused on cloud-native platform design, intelligent automation, and production-scale engineering delivery.",
    type: "work",
    company: "Qualitest",
    companyLogo: qualitestLogo,
    companyUrl: "https://www.qualitestgroup.com/",
    location: "Bangalore, India",
    icon: Building2,
    clients: [
      {
        name: "Hiscox",
        logo: clientHiscoxLogo,
        url: "https://www.hiscoxlondonmarket.com/",
        logoBackgroundClass: "bg-white dark:bg-slate-100",
      },
    ],
    techStack: [
      { name: "AI/ML", icon: Bot, colorClass: "text-cyan-300" },
      { name: "ML.NET", icon: BrainCircuit, colorClass: "text-cyan-300" },
      { name: "C#", icon: SiSharp, colorClass: "text-emerald-400" },
      { name: ".NET", icon: SiDotnet, colorClass: "text-violet-400" },
      { name: "Azure", icon: AzureLogoIcon, colorClass: "text-sky-400" },
      { name: "Kubernetes", icon: SiKubernetes, colorClass: "text-blue-400" },
      { name: "Docker", icon: SiDocker, colorClass: "text-sky-500" },
      { name: "Terraform", icon: SiTerraform, colorClass: "text-violet-400" },
    ],
    achievements: ["Current Company", "Technical Architect", "London Market Tech (Hiscox)"],
  },
  {
    year: "Jan 2023 - Aug 2025",
    title: "Technical Architect / Engineering Lead",
    subtitle: "Solera",
    description: "Led architecture for global automotive & fleet platforms.",
    type: "work",
    company: "Solera",
    companyLogo: soleraLogo,
    companyUrl: "https://www.solera.com/",
    location: "Bangalore, India",
    icon: Car,
    clients: [
      {
        name: "GFP SmartDrive",
        logo: soleraLogo,
        url: "https://www.solera.com/",
      },
    ],
    techStack: [
      { name: "C#", icon: SiSharp, colorClass: "text-emerald-400" },
      { name: ".NET", icon: SiDotnet, colorClass: "text-violet-400" },
      { name: "Azure", icon: AzureLogoIcon, colorClass: "text-sky-400" },
      { name: "Kubernetes", icon: SiKubernetes, colorClass: "text-blue-400" },
      { name: "RabbitMQ", icon: SiRabbitmq, colorClass: "text-orange-400" },
      { name: "GraphQL", icon: SiGraphql, colorClass: "text-pink-400" },
      { name: "Angular", icon: SiAngular, colorClass: "text-red-400" },
      { name: "ML.NET", icon: BrainCircuit, colorClass: "text-cyan-300" },
      { name: "AI/ML", icon: Bot, colorClass: "text-cyan-300" },
      { name: "Docker", icon: SiDocker, colorClass: "text-sky-500" },
      { name: "Terraform", icon: SiTerraform, colorClass: "text-violet-400" },
      { name: "AWS", icon: SiAmazonwebservices, colorClass: "text-amber-300" },
      { name: "AWS Lambda", icon: SiAwslambda, colorClass: "text-amber-300" },
    ],
    achievements: ["Employee of Month (May 2024)", "20% Performance Boost", "18+ Engineers Led"],
  },
  {
    year: "Aug 2022 - Dec 2022",
    title: "Principal Software Engineer",
    subtitle: "Accion Labs",
    description: "Built cloud-native .NET microservices for Dell customer-service AI chatbot orchestration and enterprise integrations.",
    type: "work",
    company: "Accion Labs",
    companyLogo: accionLogo,
    companyUrl: "https://www.accionlabs.com/",
    location: "Bangalore, India",
    icon: Plane,
    clients: [
      {
        name: "Dell Technologies",
        logo: clientDellLogo,
        url: "https://www.dell.com/",
      },
      {
        name: "KPMG Global Services",
        logo: clientKpmgLogo,
        url: "https://kpmg.com/in/en.html",
      },
    ],
    techStack: [
      { name: "C#", icon: SiSharp, colorClass: "text-emerald-400" },
      { name: ".NET", icon: SiDotnet, colorClass: "text-violet-400" },
      { name: "Azure", icon: AzureLogoIcon, colorClass: "text-sky-400" },
      { name: "ML.NET", icon: BrainCircuit, colorClass: "text-cyan-300" },
      { name: "AI/ML", icon: Bot, colorClass: "text-cyan-300" },
      { name: "Docker", icon: SiDocker, colorClass: "text-sky-500" },
      { name: "OAuth2/JWT", icon: ShieldCheck, colorClass: "text-emerald-300" },
      { name: "Git", icon: SiGit, colorClass: "text-orange-400" },
    ],
    achievements: ["Principal Engineer Role", "ML.NET + Azure Cognitive Services", "AI Chatbot Platform"],
  },
  {
    year: "Jun 2022 - Aug 2022",
    title: "Associate Manager",
    subtitle: "KPMG Global Services",
    description: "Led backend architecture and delivery for enterprise AI and conversational service platforms.",
    type: "work",
    company: "KPMG Global Services",
    companyLogo: kpmgLogo,
    companyUrl: "https://kpmg.com/in/en.html",
    location: "Bangalore, India",
    icon: Plane,
    clients: [
      {
        name: "KPMG Global Services",
        logo: clientKpmgLogo,
        url: "https://kpmg.com/in/en.html",
      },
    ],
    techStack: [
      { name: "C#", icon: SiSharp, colorClass: "text-emerald-400" },
      { name: ".NET", icon: SiDotnet, colorClass: "text-violet-400" },
      { name: "Azure", icon: AzureLogoIcon, colorClass: "text-sky-400" },
      { name: "AI/ML", icon: Bot, colorClass: "text-cyan-300" },
      { name: "ML.NET", icon: BrainCircuit, colorClass: "text-cyan-300" },
      { name: "Docker", icon: SiDocker, colorClass: "text-sky-500" },
    ],
    achievements: ["Client Delivery Leadership", "Cloud-native .NET Services", "Enterprise Integration"],
  },
  {
    year: "May 2020 - May 2022",
    title: "Assistant Vice President / Lead Engineer",
    subtitle: "Wells Fargo",
    description: "Led mission-critical brokerage & banking platforms in regulated environment.",
    type: "work",
    company: "Wells Fargo",
    companyLogo: wellsfargoLogo,
    companyUrl: "https://www.wellsfargo.com/",
    logoBackgroundClass: "bg-transparent",
    timelineLogoNodeClass: "min-w-[96px] md:min-w-[108px]",
    timelineLogoImageClass: "h-8 max-w-[92px] md:h-9 md:max-w-[102px]",
    cardLogoImageClass: "h-8 max-w-[176px]",
    location: "Hyderabad, India",
    icon: Landmark,
    clients: [
      {
        name: "Wells Fargo (WIMT)",
        logo: wellsfargoLogo,
        url: "https://www.wellsfargo.com/",
      },
    ],
    techStack: [
      { name: "C#", icon: SiSharp, colorClass: "text-emerald-400" },
      { name: ".NET", icon: SiDotnet, colorClass: "text-violet-400" },
      { name: "Kafka", icon: SiApachekafka, colorClass: "text-slate-200" },
      { name: "Azure", icon: AzureLogoIcon, colorClass: "text-sky-400" },
      { name: "Kubernetes", icon: SiKubernetes, colorClass: "text-blue-400" },
      { name: "GraphQL", icon: SiGraphql, colorClass: "text-pink-400" },
      { name: "Angular", icon: SiAngular, colorClass: "text-red-400" },
      { name: "Docker", icon: SiDocker, colorClass: "text-sky-500" },
    ],
    achievements: ["Kafka + Azure Microservices", "24x7 Production Governance", "Mentored 10+ Engineers"],
  },
  {
    year: "Aug 2018 - Jun 2020",
    title: "Associate Consultant",
    subtitle: "Virtusa",
    description: "Architected and modernized .NET Core microservices for Qatar Airways and Citi Bank workloads.",
    type: "work",
    company: "Virtusa",
    companyLogo: virtusaLogo,
    companyUrl: "https://www.virtusa.com/",
    location: "Doha, Qatar",
    icon: Globe,
    clients: [
      {
        name: "Qatar Airways",
        logo: clientQatarLogo,
        url: "https://www.qatarairways.com/",
      },
      {
        name: "Citi Bank",
        logo: clientCitiLogo,
        url: "https://www.citigroup.com/",
      },
    ],
    techStack: [
      { name: "C#", icon: SiSharp, colorClass: "text-emerald-400" },
      { name: ".NET", icon: SiDotnet, colorClass: "text-violet-400" },
      { name: "Azure", icon: AzureLogoIcon, colorClass: "text-sky-400" },
      { name: "Angular", icon: SiAngular, colorClass: "text-red-400" },
      { name: "OAuth2/JWT", icon: ShieldCheck, colorClass: "text-emerald-300" },
    ],
    achievements: ["APIM + OAuth2/JWT", "Event-Driven Architecture", "SQL Performance +30-40%"],
  },
  {
    year: "Apr 2018 - Jun 2018",
    title: "Software Engineer",
    subtitle: "JD Sports Fashion LLP",
    description: "Delivered retail API services for order, inventory, and customer workflows with RabbitMQ and Azure deployments.",
    type: "work",
    company: "JD Sports Fashion LLP",
    companyLogo: jdSportsLogo,
    companyUrl: "https://www.jdplc.com/overview/default.aspx",
    location: "Hyderabad, India",
    icon: Building2,
    clients: [
      {
        name: "JD Sports Fashion",
        logo: jdSportsLogo,
        url: "https://www.jdplc.com/overview/default.aspx",
      },
    ],
    techStack: [
      { name: "C#", icon: SiSharp, colorClass: "text-emerald-400" },
      { name: ".NET", icon: SiDotnet, colorClass: "text-violet-400" },
      { name: "RabbitMQ", icon: SiRabbitmq, colorClass: "text-orange-400" },
      { name: "Azure", icon: AzureLogoIcon, colorClass: "text-sky-400" },
      { name: "Angular", icon: SiAngular, colorClass: "text-red-400" },
      { name: "Git", icon: SiGit, colorClass: "text-orange-400" },
    ],
    achievements: ["Retail Platform Modernization", "RabbitMQ Messaging", "CI/CD Enablement"],
  },
  {
    year: "Jul 2015 - Jul 2017",
    title: "Associate Software Engineer",
    subtitle: "Conduent",
    description: "Built enterprise .NET APIs and workflow modules for MetLife and Bank of America (Merrill Lynch).",
    type: "work",
    company: "Conduent",
    companyLogo: conduentLogo,
    companyUrl: "https://www.conduent.com/",
    logoBackgroundClass: "bg-[#005DAA]",
    location: "Bangalore, India",
    icon: Building2,
    clients: [
      {
        name: "MetLife",
        logo: clientMetlifeLogo,
        url: "https://www.metlife.com/",
      },
      {
        name: "Bank of America (Merrill Lynch)",
        logo: clientBoaLogo,
        url: "https://www.bankofamerica.com/",
      },
    ],
    techStack: [
      { name: "C#", icon: SiSharp, colorClass: "text-emerald-400" },
      { name: ".NET", icon: SiDotnet, colorClass: "text-violet-400" },
      { name: "Azure", icon: AzureLogoIcon, colorClass: "text-sky-400" },
      { name: "Angular", icon: SiAngular, colorClass: "text-red-400" },
      { name: "OAuth2/JWT", icon: ShieldCheck, colorClass: "text-emerald-300" },
      { name: "Git", icon: SiGit, colorClass: "text-orange-400" },
    ],
    achievements: ["ASP.NET Web API", "SQL Performance +30-40%", ".NET Framework to .NET Core 1.x"],
  },
];

function typeClasses(type: TimelineItem["type"]) {
  return type === "work" ? "bg-sky-500" : "bg-primary";
}

export const CareerTimeline = () => {
  const timelineLogoNodeClass =
    "flex min-h-11 min-w-[74px] items-center justify-center overflow-hidden rounded-xl border-2 border-border/80 bg-white px-2.5 py-1.5 shadow-[0_8px_20px_rgba(15,23,42,0.35)] ring-1 ring-slate-300/80 transition-transform duration-200 group-hover/node:scale-105 md:min-h-12 md:min-w-[82px]";
  const timelineLogoImageClass = "h-7 w-auto max-w-[66px] object-contain md:h-8 md:max-w-[72px]";
  const cardLogoImageClass = "h-7 w-auto max-w-[150px] object-contain";

  return (
    <section className="relative overflow-hidden bg-muted/25 py-12 md:py-16">
      <div className="w-full px-4 md:px-6 xl:px-8">
        <div className="mx-auto mb-8 max-w-4xl text-center">
          <h2 className="text-2xl font-black tracking-tight md:text-3xl lg:text-4xl">
            Career <span className="gradient-text">Journey</span>
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
            A clean timeline of key career milestones, with your current employer shown first.
          </p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="absolute bottom-0 left-4 top-0 w-[5px] rounded-full bg-slate-500/55 shadow-[0_0_0_1px_rgba(255,255,255,0.15)] md:left-1/2 md:-translate-x-1/2 dark:bg-slate-200/35" />
          <div className="absolute bottom-0 left-4 top-0 w-[3px] rounded-full bg-gradient-to-b from-sky-400 via-cyan-300 to-emerald-400 shadow-[0_0_24px_rgba(56,189,248,0.5)] md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-6 md:space-y-8">
            {timelineData.map((item, index) => {
              const Icon = item.icon;
              const alignLeft = index % 2 === 0;

              return (
                <article key={`${item.year}-${item.title}`} className="group relative">
                  <div className="absolute left-4 top-8 -translate-x-1/2 md:left-1/2">
                    {item.companyUrl ? (
                      <a
                        href={item.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/node relative block"
                        aria-label={`Open ${item.company || item.title} website`}
                      >
                        {item.companyLogo ? (
                          <span className={`${timelineLogoNodeClass} ${item.timelineLogoNodeClass ?? ""}`}>
                            <img
                              src={item.companyLogo}
                              alt={item.company || item.title}
                              className={`${item.timelineLogoImageClass ?? timelineLogoImageClass} rounded-sm px-1 py-0.5 ${item.logoBackgroundClass ?? "bg-transparent"}`}
                            />
                          </span>
                        ) : (
                          <span
                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-background text-white shadow-md transition-transform duration-200 group-hover/node:scale-105 md:h-11 md:w-11 ${typeClasses(item.type)}`}
                          >
                            <Icon className="h-4 w-4 md:h-5 md:w-5" />
                          </span>
                        )}
                        <span className="pointer-events-none absolute left-1/2 top-[-2.1rem] hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border/70 bg-popover px-2 py-1 text-[10px] font-semibold text-popover-foreground shadow-lg group-hover/node:block">
                          {item.company || item.subtitle || item.title}
                        </span>
                      </a>
                    ) : item.companyLogo ? (
                      <span className={`${timelineLogoNodeClass} ${item.timelineLogoNodeClass ?? ""}`}>
                        <img
                          src={item.companyLogo}
                          alt={item.company || item.title}
                          className={`${item.timelineLogoImageClass ?? timelineLogoImageClass} rounded-sm px-1 py-0.5 ${item.logoBackgroundClass ?? "bg-transparent"}`}
                        />
                      </span>
                    ) : (
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-background text-white shadow-md md:h-11 md:w-11 ${typeClasses(item.type)}`}
                      >
                        <Icon className="h-4 w-4 md:h-5 md:w-5" />
                      </span>
                    )}
                  </div>
                  <span
                    className={`absolute top-8 hidden h-[3px] rounded-full bg-gradient-to-r from-sky-400/80 to-cyan-300/80 shadow-[0_0_10px_rgba(56,189,248,0.45)] md:block ${
                      alignLeft ? "left-[calc(50%-2.1rem)] w-9" : "left-1/2 w-9"
                    }`}
                  />

                  <div
                    className={`pl-12 md:w-[calc(50%-2rem)] md:pl-0 ${
                      alignLeft ? "md:pr-8" : "md:ml-auto md:pl-8"
                    }`}
                  >
                    <div className="rounded-2xl border border-border/70 bg-background/90 p-4 shadow-sm md:p-5">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs font-semibold tracking-wide text-foreground">
                          {item.year}
                        </span>
                        {item.location ? (
                          <span className="text-xs text-muted-foreground">{item.location}</span>
                        ) : null}
                      </div>

                      {item.companyLogo ? (
                        <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background px-2.5 py-2">
                          {item.companyUrl ? (
                            <a
                              href={item.companyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2"
                              title={item.company || item.subtitle || item.title}
                            >
                              <img
                                src={item.companyLogo}
                                alt={item.company || item.title}
                                className={`${item.cardLogoImageClass ?? cardLogoImageClass} rounded-md px-1.5 py-1 ${item.logoBackgroundClass ?? "bg-white dark:bg-slate-100"}`}
                              />
                              <span className="text-sm font-semibold text-foreground underline-offset-2 hover:underline">
                                {item.company || item.subtitle}
                              </span>
                            </a>
                          ) : (
                            <>
                              <img
                                src={item.companyLogo}
                                alt={item.company || item.title}
                                className={`${item.cardLogoImageClass ?? cardLogoImageClass} rounded-md px-1.5 py-1 ${item.logoBackgroundClass ?? "bg-white dark:bg-slate-100"}`}
                              />
                              <span className="text-sm font-semibold text-foreground">{item.company || item.subtitle}</span>
                            </>
                          )}
                        </div>
                      ) : null}

                      <h3 className="text-base font-bold text-foreground md:text-lg">{item.title}</h3>
                      {item.subtitle ? <p className="mt-1 text-sm font-medium text-primary">{item.subtitle}</p> : null}
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>

                      {item.clients?.length ? (
                        <div className="mt-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Clients</p>
                          <div className="mt-1.5 flex flex-wrap gap-2">
                            {item.clients.map((client) => (
                              <a
                                key={`${item.year}-${client.name}`}
                                href={client.url || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-background/90 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                                title={client.name}
                              >
                                <img
                                  src={client.logo}
                                  alt={client.name}
                                  className={`h-5 w-auto max-w-[96px] rounded-sm object-contain px-0.5 ${client.logoBackgroundClass ?? "bg-transparent"}`}
                                />
                                <span className="max-w-[170px] whitespace-normal leading-tight">{client.name}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {item.techStack?.length ? (
                        <div className="mt-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Tech Stack</p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {item.techStack.map((tech) => {
                              const TechIcon = tech.icon;
                              return (
                                <span
                                  key={`${item.year}-${tech.name}`}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/90 px-2 py-1 text-[11px] font-medium text-foreground"
                                  title={tech.name}
                                >
                                  <TechIcon className={`h-4 w-4 ${tech.colorClass ?? "text-foreground"}`} />
                                  <span>{tech.name}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}

                      {item.achievements?.length ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {item.achievements.slice(0, 3).map((achievement) => (
                            <span
                              key={achievement}
                              className="rounded-lg border border-border/70 bg-muted px-2 py-1 text-[11px] font-medium text-foreground/90"
                            >
                              {achievement}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
