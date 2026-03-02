import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="rounded-xl border border-border bg-card/60 p-4">
        <h2 className="text-base font-semibold">Connectors</h2>
        <p className="text-sm text-muted-foreground">Token placeholders for platform integrations.</p>
        <div className="mt-4 space-y-3">
          <Input placeholder="LinkedIn token" />
          <Input placeholder="X token" />
          <Input placeholder="Telegram bot token" />
          <Input placeholder="Slack webhook URL" />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card/60 p-4">
        <h2 className="text-base font-semibold">Language Policy</h2>
        <p className="text-sm text-muted-foreground">Understand many languages, publish English only.</p>
        <div className="mt-4 space-y-4 text-sm">
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span>Multilingual understanding</span>
            <Switch checked />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span>Publish English only</span>
            <Switch checked />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span>Require approval for external actions</span>
            <Switch checked />
          </div>
        </div>
      </section>
    </div>
  );
}
