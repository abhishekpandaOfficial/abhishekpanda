import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OpenOwlLogo } from "@/components/ui/OpenOwlLogo";
import { Bot, Brain, Shield, Sparkles } from "lucide-react";

const pillars = [
  {
    icon: Bot,
    title: "Assistant Identity",
    text: "OpenOwl is the conversational assistant brand across public and admin surfaces.",
  },
  {
    icon: Brain,
    title: "Knowledge Layer",
    text: "Answers are grounded in site knowledge, model intelligence, and OriginX updates.",
  },
  {
    icon: Shield,
    title: "Safe Execution",
    text: "Built with bounded context and secure integration flows via Supabase edge functions.",
  },
];

export default function AdminOpenOwl() {
  return (
    <div className="space-y-6">
      <Card className="border-slate-200/70 dark:border-slate-700/70 bg-white/75 dark:bg-slate-900/70 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center gap-4">
          <OpenOwlLogo size="lg" animate imageClassName="h-12 w-12" className="ring-sky-300/45" />
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              OpenOwl Control
              <Sparkles className="w-5 h-5 text-sky-500" />
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Brand, assistant identity, and conversational intelligence workspace.
            </p>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pillars.map((p) => (
          <Card key={p.title} className="border-slate-200/70 dark:border-slate-700/70">
            <CardContent className="pt-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center mb-3">
                <p.icon className="w-5 h-5 text-white" />
              </div>
              <div className="font-semibold text-foreground">{p.title}</div>
              <p className="text-sm text-muted-foreground mt-1">{p.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
