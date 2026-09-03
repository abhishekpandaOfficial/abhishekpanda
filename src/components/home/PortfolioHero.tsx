import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Download, MapPin, Sparkles } from "lucide-react";
import portrait from "@/assets/about/hero-avatar-default.png";
import soleraLogo from "@/assets/company-logos/solera-official.svg";
import accionLogo from "@/assets/company-logos/accionlabs-official.svg";
import kpmgLogo from "@/assets/company-logos/kpmg-official.svg";
import wellsfargoLogo from "@/assets/company-logos/wellsfargo-official.png";
import virtusaLogo from "@/assets/company-logos/virtusa-official.svg";
import jdSportsLogo from "@/assets/company-logos/jd-sports-official.svg";
import conduentLogo from "@/assets/company-logos/conduent-official.png";
import hiscoxLogo from "@/assets/company-logos/client-hiscox.svg";
import dellLogo from "@/assets/company-logos/client-dell.svg";
import qatarLogo from "@/assets/company-logos/client-qatar-airways.svg";
import metlifeLogo from "@/assets/company-logos/client-metlife.svg";
import boaLogo from "@/assets/company-logos/client-boa.svg";
import { CVDownloadModal } from "@/components/cv/CVDownloadModal";
import { PortfolioAtmosphere } from "@/components/home/PortfolioAtmosphere";

type Logo = { src?: string; alt: string; className?: string; monogram?: string };
type CareerItem = {
  period: string;
  company: string;
  role: string;
  location: string;
  summary: string;
  companyLogos: Logo[];
  clientLogos?: Logo[];
  client?: string;
  highlights: string[];
};

const career: CareerItem[] = [
  {
    period: "Mar 2026 - Present",
    company: "Quality AI",
    role: "Architect | AI Solution Architect",
    location: "Bengaluru",
    summary: "Architecting governed, cloud-native AI for underwriting transformation, document intelligence, knowledge discovery, and intelligent workflow automation.",
    companyLogos: [{ alt: "Quality AI", monogram: "QAI" }],
    clientLogos: [{ src: hiscoxLogo, alt: "Hiscox" }],
    client: "Client: Hiscox - London Market Insurance",
    highlights: ["Agentic AI + multi-agent systems", "MCP-enabled enterprise integrations", "Azure + Vertex AI + ADK"],
  },
  {
    period: "Jan 2023 - Aug 2025",
    company: "Solera | SmartDrive",
    role: "Senior ML Engineer",
    location: "Bengaluru",
    summary: "Built fleet intelligence, enterprise RAG, driver-performance ML, and predictive-maintenance agents for a production platform serving global mobility operations.",
    companyLogos: [{ src: soleraLogo, alt: "Solera" }],
    client: "Enterprise Fleet Intelligence & Agentic AI Platform",
    highlights: ["10K+ active drivers", "100K+ documents", "40% faster deployments"],
  },
  {
    period: "Jun 2022 - Dec 2022",
    company: "Accion Labs + KPMG",
    role: "Senior Machine Learning Engineer",
    location: "Bengaluru",
    summary: "Designed Dell's enterprise conversational AI platform, combining transformer NLP, semantic retrieval, FastAPI services, and AKS-based inference.",
    companyLogos: [{ src: accionLogo, alt: "Accion Labs" }, { src: kpmgLogo, alt: "KPMG" }],
    clientLogos: [{ src: dellLogo, alt: "Dell" }],
    client: "KPMG contract: Jun-Aug 2022 | Accion Labs: Aug-Dec 2022",
    highlights: ["25K+ monthly queries", "92% intent accuracy", "35% less manual support"],
  },
  {
    period: "May 2020 - Jul 2022",
    company: "Wells Fargo",
    role: "Assistant Vice President",
    location: "Hyderabad",
    summary: "Led .NET modernization and Azure architecture for regulated brokerage platforms across Wealth & Investment Management Technology.",
    companyLogos: [{ src: wellsfargoLogo, alt: "Wells Fargo", className: "max-h-8" }],
    client: "Wealth & Investment Management Technology",
    highlights: ["14+ governed platforms", "40% infrastructure efficiency", "10+ engineers mentored"],
  },
  {
    period: "Aug 2018 - Jun 2020",
    company: "Virtusa",
    role: "Associate Consultant",
    location: "Doha, Qatar",
    summary: "Modernized passenger-disruption and ground-operations systems using Azure microservices, secure APIs, event-driven workflows, and Angular.",
    companyLogos: [{ src: virtusaLogo, alt: "Virtusa" }],
    clientLogos: [{ src: qatarLogo, alt: "Qatar Airways" }],
    client: "Client: Qatar Airways",
    highlights: ["Azure API Management", "OAuth 2.0 + JWT", "Service Bus event workflows"],
  },
  {
    period: "Apr 2018 - Jun 2018",
    company: "JD Sports & Fashion",
    role: "Software Engineer",
    location: "Hyderabad",
    summary: "Delivered retail applications for orders, inventory, and customer-service workflows with C#, .NET, Angular, SQL Server, and RabbitMQ.",
    companyLogos: [{ src: jdSportsLogo, alt: "JD Sports & Fashion" }],
    highlights: ["Retail operations", "Asynchronous messaging", "Release automation"],
  },
  {
    period: "Jul 2015 - Jul 2017",
    company: "Conduent",
    role: "Software Engineer",
    location: "Bengaluru",
    summary: "Engineered secure insurance and financial systems spanning policy administration, claims, billing, underwriting, credit operations, and compliance.",
    companyLogos: [{ src: conduentLogo, alt: "Conduent", className: "rounded bg-[#005DAA] px-1 py-0.5" }],
    clientLogos: [{ src: metlifeLogo, alt: "MetLife" }, { src: boaLogo, alt: "Bank of America" }],
    client: "Clients: MetLife and Bank of America",
    highlights: ["~30% SQL performance gain", "~35% less downtime", ".NET enterprise services"],
  },
];

const skills = ["Agentic AI", "LLMs + RAG", "MCP", "MLOps + LLMOps", "Python", ".NET", "Azure", "Google Cloud"];

export function PortfolioHero() {
  const [downloadOpen, setDownloadOpen] = useState(false);

  return (
    <section className="relative overflow-x-clip border-b border-slate-200 bg-[#f7f8fa] pt-24 text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-white md:pt-28">
      <PortfolioAtmosphere />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(59,130,246,0.13),transparent_28%),radial-gradient(circle_at_82%_28%,rgba(14,165,233,0.10),transparent_24%),linear-gradient(to_bottom,rgba(255,255,255,0.18),#f7f8fa_72%)] dark:bg-[radial-gradient(circle_at_18%_12%,rgba(37,99,235,0.20),transparent_28%),linear-gradient(to_bottom,rgba(2,6,23,0.1),#020617_76%)]" />

      <div className="relative mx-auto grid w-full max-w-[1480px] gap-12 px-5 pb-20 md:px-8 lg:grid-cols-[minmax(330px,0.72fr)_minmax(0,1.28fr)] lg:items-start lg:gap-20 lg:pb-28 xl:px-12">
        <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-5.75rem)] lg:self-start">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-700 shadow-sm backdrop-blur dark:border-blue-400/25 dark:bg-slate-900/70 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5" /> Enterprise AI Solution Architect
            </div>
            <h1 className="max-w-xl text-5xl font-black tracking-[-0.055em] md:text-6xl xl:text-[4.6rem] xl:leading-[0.92]">
              Abhishek<br /><span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">Panda.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base font-medium leading-7 text-slate-600 dark:text-slate-300 xl:text-lg">
              I design secure, scalable, production-grade AI systems where business ambition meets engineering reality.
            </p>

            <div className="relative mt-5 overflow-hidden rounded-[1.75rem] border border-white/90 bg-white/70 p-2 shadow-[0_36px_90px_-42px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/65">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem] bg-slate-200 lg:h-[clamp(250px,36vh,390px)] lg:aspect-auto">
                <motion.img src={portrait} alt="Abhishek Panda, Enterprise AI Solution Architect" className="h-full w-full object-cover object-[center_18%]" initial={{ scale: 1.04 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white md:p-7">
                  <div className="flex items-end justify-between gap-4">
                    <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">Based in</p><p className="mt-1 flex items-center gap-2 text-base font-bold"><MapPin className="h-4 w-4" /> Bengaluru, India</p></div>
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">12.6+ years</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[['12.6+', 'Years'], ['7', 'Career chapters'], ['4', 'Industries']].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white/75 px-2 py-3 text-center backdrop-blur dark:border-slate-800 dark:bg-slate-900/70"><div className="text-lg font-black tracking-tight">{value}</div><div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">{label}</div></div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => setDownloadOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-100"><Download className="h-4 w-4" /> Download CV</button>
              <a href="https://www.linkedin.com/in/iamabhishekpanda/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:-translate-y-0.5 hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white">LinkedIn <ArrowUpRight className="h-4 w-4" /></a>
            </div>
          </motion.div>
        </div>

        <div>
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }} className="mb-12 border-b border-slate-200 pb-10 dark:border-slate-800">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600 dark:text-blue-300">Profile summary</p>
            <h2 className="mt-4 max-w-4xl text-3xl font-black tracking-[-0.04em] md:text-5xl md:leading-[1.08]">Architecture for intelligent systems that have to work in the real world.</h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">Enterprise AI Solution Architect with experience across insurance, banking, aviation, and automotive domains. My work spans Generative AI, LLMs, RAG, agentic systems, vector search, MLOps, LLMOps, and multi-cloud architecture across Microsoft Foundry, Azure, Google Cloud, Python, Kubernetes, and .NET.</p>
            <div className="mt-6 flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{skill}</span>)}</div>
          </motion.div>

          <div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600 dark:text-blue-300">Experience</p><h2 className="mt-2 text-3xl font-black tracking-[-0.04em] md:text-4xl">Career timeline</h2></div><ArrowDownRight className="hidden h-8 w-8 text-slate-300 md:block" /></div>
          <div className="relative pl-[4.25rem] md:pl-24">
            <div className="absolute bottom-8 left-6 top-7 w-px bg-gradient-to-b from-blue-600 via-cyan-400 to-slate-200 dark:to-slate-800 md:left-8" />
            <div className="space-y-7">
              {career.map((item, index) => (
                <motion.article key={`${item.company}-${item.period}`} initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.58, delay: Math.min(index, 3) * 0.05, ease: [0.22, 1, 0.36, 1] }} className="group relative rounded-[1.6rem] border border-slate-200 bg-white/80 p-5 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.4)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_28px_70px_-38px_rgba(37,99,235,0.28)] dark:border-slate-800 dark:bg-slate-900/75 md:p-7">
                  <div className="absolute -left-[4.05rem] top-5 z-10 flex min-h-12 w-12 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_10px_30px_-12px_rgba(37,99,235,0.55)] ring-4 ring-[#f7f8fa] dark:border-slate-700 dark:bg-slate-900 dark:ring-slate-950 md:-left-[6rem] md:min-h-16 md:w-16 md:p-2">
                    {item.companyLogos.map((logo) => logo.src ? (
                      <img key={logo.alt} src={logo.src} alt={`${logo.alt} logo`} title={logo.alt} className={`${item.companyLogos.length > 1 ? "max-h-5 md:max-h-6" : "max-h-7 md:max-h-9"} max-w-full object-contain ${logo.className || ""}`} loading="lazy" />
                    ) : (
                      <span key={logo.alt} title={logo.alt} className="flex h-full w-full items-center justify-center rounded-xl bg-slate-950 text-[11px] font-black tracking-tight text-white dark:bg-blue-600 md:text-sm">{logo.monogram}</span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">{item.period}</p><h3 className="mt-2 text-xl font-black tracking-tight md:text-2xl">{item.company}</h3><p className="mt-1 text-sm font-bold text-slate-600 dark:text-slate-300">{item.role}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.location}</p></div>
                    {item.clientLogos?.length ? <div className="flex max-w-[230px] flex-wrap items-center gap-2 sm:justify-end">{item.clientLogos.map((logo) => <div key={logo.alt} className="flex h-12 min-w-16 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm" title={`${logo.alt} client`}><img src={logo.src} alt={`${logo.alt} client logo`} className={`max-h-7 max-w-[110px] object-contain ${logo.className || ""}`} loading="lazy" /></div>)}</div> : null}
                  </div>
                  {item.client ? <p className="mt-5 text-xs font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">{item.client}</p> : null}
                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-[15px]">{item.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-2">{item.highlights.map((highlight) => <span key={highlight} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{highlight}</span>)}</div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </div>
      <CVDownloadModal isOpen={downloadOpen} onClose={() => setDownloadOpen(false)} />
    </section>
  );
}
