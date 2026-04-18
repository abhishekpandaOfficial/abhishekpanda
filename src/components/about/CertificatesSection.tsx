import { motion } from "framer-motion";
import { Award, ExternalLink, ShieldCheck, BadgeCheck } from "lucide-react";

type Certificate = {
  title: string;
  issuer: string;
  timeline: string;
  status: "Certified" | "Pursuing";
  isLatest?: boolean;
  tags: string[];
  logo: string;
  logoAlt: string;
  link: string;
};

const certificates: Certificate[] = [
  {
    title: "AWS DevOps Engineer Course",
    issuer: "Intellipaat",
    timeline: "Issue Date: December 30, 2022",
    status: "Certified",
    isLatest: true,
    tags: ["AWS", "DevOps", "CI/CD"],
    logo: "/brand-logos/stacks/aws.svg",
    logoAlt: "AWS logo",
    link: "/certificates/intellipaat-certificate.pdf",
  },
  {
    title: "Azure Solutions Architect Expert (AZ-305)",
    issuer: "Microsoft",
    timeline: "In Progress",
    status: "Pursuing",
    tags: ["Azure", "Architecture", "Cloud"],
    logo: "/brand-logos/stacks/microsoftazure.svg",
    logoAlt: "Microsoft Azure logo",
    link: "https://learn.microsoft.com/en-us/credentials/certifications/azure-solutions-architect/",
  },
  {
    title: "AWS Solutions Architect Associate",
    issuer: "Amazon Web Services",
    timeline: "In Progress",
    status: "Pursuing",
    tags: ["AWS", "Architecture", "Cloud"],
    logo: "/brand-logos/stacks/aws.svg",
    logoAlt: "AWS logo",
    link: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
  },
  {
    title: "Microsoft Certified: Azure Developer Associate",
    issuer: "Microsoft",
    timeline: "In Progress",
    status: "Pursuing",
    tags: ["Azure", ".NET", "Developer"],
    logo: "/brand-logos/stacks/microsoftazure.svg",
    logoAlt: "Microsoft Azure logo",
    link: "https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/",
  },
  {
    title: "Certified Kubernetes Administrator (CKA)",
    issuer: "The Linux Foundation",
    timeline: "In Progress",
    status: "Pursuing",
    tags: ["Kubernetes", "DevOps", "Containers"],
    logo: "/brand-logos/stacks/kubernetes.svg",
    logoAlt: "Kubernetes logo",
    link: "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/",
  },
  {
    title: "AI/ML Specialization",
    issuer: "Coursera / DeepLearning.AI",
    timeline: "In Progress",
    status: "Pursuing",
    tags: ["AI", "Machine Learning", "Neural Networks"],
    logo: "/brand-logos/stacks/python.svg",
    logoAlt: "AI/ML credential logo",
    link: "https://www.coursera.org/specializations/machine-learning-introduction",
  },
];

export function CertificatesSection() {
  return (
    <section className="relative overflow-hidden bg-muted/20 py-12 md:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_26%)]" />
      <div className="relative w-full px-4 md:px-6 xl:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-8 max-w-4xl text-center"
        >
          <h2 className="text-2xl font-black tracking-tight md:text-3xl lg:text-4xl">
            Certifications & <span className="gradient-text">Credentials</span>
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
            Key certifications across cloud architecture, AI/ML, and production engineering.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {certificates.map((cert, index) => (
            <motion.article
              key={cert.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="rounded-2xl border border-border/70 bg-background/90 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:shadow-[0_20px_45px_-28px_rgba(34,211,238,0.45)]"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-2.5 py-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-background">
                    <img src={cert.logo} alt={cert.logoAlt} className="h-5 w-5 object-contain" loading="lazy" />
                  </span>
                  <span className="text-xs font-semibold text-foreground/90">{cert.issuer}</span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-300">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Credential
                </span>
              </div>

              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      cert.status === "Certified"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {cert.status === "Certified" ? <ShieldCheck className="h-3.5 w-3.5" /> : <Award className="h-3.5 w-3.5" />}
                    {cert.status}
                  </span>
                  {cert.isLatest ? (
                    <span className="inline-flex items-center rounded-full bg-cyan-500/15 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
                      Latest
                    </span>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground">{cert.timeline}</span>
              </div>

              <h3 className="text-base font-bold text-foreground">{cert.title}</h3>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {cert.tags.map((tag) => (
                  <span
                    key={`${cert.title}-${tag}`}
                    className="rounded-md border border-border/70 bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground/90"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href={cert.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 underline-offset-2 hover:underline"
              >
                View Certificate
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
