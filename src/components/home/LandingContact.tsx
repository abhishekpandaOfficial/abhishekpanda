import { Mail } from "lucide-react";
import {
  SiGithub,
  SiHashnode,
  SiInstagram,
  SiLinkedin,
  SiMedium,
  SiSubstack,
  SiX,
  SiYoutube,
} from "react-icons/si";

const profiles = [
  { name: "LinkedIn", href: "https://www.linkedin.com/in/iamabhishekpanda/", icon: SiLinkedin, color: "hover:border-[#0A66C2] hover:text-[#0A66C2]" },
  { name: "GitHub", href: "https://github.com/abhishekpandaOfficial", icon: SiGithub, color: "hover:border-slate-950 hover:text-slate-950 dark:hover:border-white dark:hover:text-white" },
  { name: "StackedIN", href: "https://stackedin.substack.com/", icon: SiSubstack, color: "hover:border-[#FF6719] hover:text-[#FF6719]" },
  { name: "X", href: "https://x.com/Stacked_in", icon: SiX, color: "hover:border-slate-950 hover:text-slate-950 dark:hover:border-white dark:hover:text-white" },
  { name: "Instagram", href: "https://www.instagram.com/i_am_abhishekPanda", icon: SiInstagram, color: "hover:border-[#E4405F] hover:text-[#E4405F]" },
  { name: "YouTube", href: "https://www.youtube.com/@stackedin", icon: SiYoutube, color: "hover:border-[#FF0000] hover:text-[#FF0000]" },
  { name: "Medium", href: "https://medium.com/@official.abhishekpanda", icon: SiMedium, color: "hover:border-slate-950 hover:text-slate-950 dark:hover:border-white dark:hover:text-white" },
  { name: "Hashnode", href: "https://abhishekpanda.hashnode.dev/", icon: SiHashnode, color: "hover:border-[#2962FF] hover:text-[#2962FF]" },
] as const;

export function LandingContact() {
  return (
    <section id="contact" className="mt-20 border-t border-slate-200 py-16 dark:border-slate-800">
      <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-[0_24px_80px_-50px_rgba(37,99,235,0.5)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/75 md:p-9">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600 dark:text-blue-300">Connect</p>
        <div className="mt-4 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-[-0.04em] md:text-4xl">Let’s build something that matters.</h2>
            <a
              href="mailto:official.abhishekpanda@gmail.com"
              className="mt-5 inline-flex max-w-full items-center gap-2 text-sm font-bold text-slate-700 transition hover:text-blue-700 dark:text-slate-200 dark:hover:text-blue-300 sm:text-base"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><Mail className="h-4 w-4" /></span>
              <span className="truncate">official.abhishekpanda@gmail.com</span>
            </a>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Social and publishing profiles">
            {profiles.map(({ name, href, icon: Icon, color }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                title={name}
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 ${color}`}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
