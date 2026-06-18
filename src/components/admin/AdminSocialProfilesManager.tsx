import { useMemo, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useAdminSocialProfiles,
  useDeleteSocialProfile,
  useUpsertSocialProfile,
  type SocialProfileRow,
} from "@/hooks/useSocialProfiles";
import { iconForKey } from "@/lib/social/iconMap";

const ICON_KEYS = [
  "instagram",
  "facebook",
  "youtube",
  "linkedin",
  "github",
  "x",
  "stackcraft",
  "medium",
  "substack",
  "hashnode",
  "stackexchange",
  "website",
] as const;

const CATEGORIES = ["social", "blog", "platform", "website"] as const;

type EditState = Partial<SocialProfileRow> & {
  platform: string;
  display_name: string;
  icon_key: string;
};

function normalizePlatformKey(v: string) {
  return v
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminSocialProfilesManager() {
  const { data, isLoading, error } = useAdminSocialProfiles();
  const upsert = useUpsertSocialProfile();
  const del = useDeleteSocialProfile();

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<EditState | null>(null);

  const rows = data ?? [];

  const connectedCount = useMemo(() => rows.filter((r) => r.connected).length, [rows]);

  const openNew = () => {
    setEdit({
      platform: "",
      display_name: "",
      category: "social",
      username: "",
      profile_url: "",
      icon_key: "website",
      brand_color: "",
      brand_bg: "",
      description: "",
      followers: 0,
      connected: true,
      is_visible: true,
      sort_order: 0,
      credential_hints: null,
    });
    setOpen(true);
  };

  const openEdit = (r: SocialProfileRow) => {
    setEdit({ ...r });
    setOpen(true);
  };

  const save = async () => {
    if (!edit) return;

    const platform = normalizePlatformKey(edit.platform || "");
    const display = (edit.display_name || "").trim();
    if (!platform) return toast.error("Platform key is required");
    if (!display) return toast.error("Display name is required");
    if (!edit.icon_key) return toast.error("Icon key is required");

    let cred: any = null;
    if (typeof edit.credential_hints === "string") {
      const t = (edit.credential_hints || "").trim();
      if (t) {
        try {
          cred = JSON.parse(t);
        } catch {
          return toast.error("Credential hints must be valid JSON (or blank).");
        }
      }
    } else if (edit.credential_hints && typeof edit.credential_hints === "object") {
      cred = edit.credential_hints;
    }

    try {
      await upsert.mutateAsync({
        platform,
        display_name: display,
        category: (edit.category as any) ?? "social",
        username: edit.username || null,
        profile_url: edit.profile_url || null,
        icon_key: edit.icon_key,
        brand_color: edit.brand_color || null,
        brand_bg: edit.brand_bg || null,
        description: edit.description || null,
        followers: Number(edit.followers ?? 0) || 0,
        connected: !!edit.connected,
        is_visible: !!edit.is_visible,
        sort_order: Number(edit.sort_order ?? 0) || 0,
        credential_hints: cred,
      });
      toast.success("Saved social profile");
      setOpen(false);
      setEdit(null);
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    }
  };

  const remove = async () => {
    if (!edit) return;
    const platform = normalizePlatformKey(edit.platform || "");
    if (!platform) return;
    try {
      await del.mutateAsync(platform);
      toast.success("Deleted social profile");
      setOpen(false);
      setEdit(null);
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-white">Social Profiles</div>
          <div className="text-xs text-slate-300">
            Public site pulls from this table. Keep secrets in Supabase Edge Function secrets; store only hints here.
          </div>
        </div>
        <Button size="sm" onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Profile
        </Button>
      </div>

      <Card className="border-white/10 bg-white/[0.04] p-4 overflow-x-auto">
        {error ? (
          <div className="text-sm text-red-200">{String((error as any).message ?? error)}</div>
        ) : isLoading ? (
          <div className="text-sm text-slate-200">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-slate-300">
              <tr className="border-b border-white/10">
                <th className="py-2 pr-3">Visible</th>
                <th className="py-2 pr-3">Platform</th>
                <th className="py-2 pr-3">URL</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Followers</th>
                <th className="py-2 pr-3">Connected</th>
                <th className="py-2 pr-3">Edit</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              {rows.map((r) => {
                const Icon = iconForKey(r.icon_key);
                return (
                  <tr key={r.id} className="border-b border-white/5">
                    <td className="py-3 pr-3">
                      <Switch checked={r.is_visible} onCheckedChange={() => openEdit({ ...r, is_visible: !r.is_visible })} />
                    </td>
                    <td className="py-3 pr-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{r.display_name}</span>
                        <span className="text-[11px] text-slate-400">({r.platform})</span>
                      </div>
                    </td>
                    <td className="py-3 pr-3 min-w-[260px]">
                      <div className="truncate text-slate-300">{r.profile_url || "-"}</div>
                    </td>
                    <td className="py-3 pr-3 whitespace-nowrap">{r.category}</td>
                    <td className="py-3 pr-3 whitespace-nowrap">{(r.followers ?? 0).toLocaleString()}</td>
                    <td className="py-3 pr-3 whitespace-nowrap">{r.connected ? "yes" : "no"}</td>
                    <td className="py-3 pr-3 whitespace-nowrap">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(r)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="mt-3 text-[11px] text-slate-400">Connected: {connectedCount}</div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{edit?.id ? "Edit Profile" : "Add Profile"}</DialogTitle>
          </DialogHeader>

          {edit ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Platform Key</Label>
                <Input
                  value={edit.platform}
                  onChange={(e) => setEdit({ ...edit, platform: e.target.value })}
                  placeholder="e.g. stackcraft"
                />
              </div>
              <div className="space-y-1">
                <Label>Display Name</Label>
                <Input
                  value={edit.display_name}
                  onChange={(e) => setEdit({ ...edit, display_name: e.target.value })}
                  placeholder="e.g. Stackcraft"
                />
              </div>

              <div className="space-y-1">
                <Label>Category</Label>
                <Select value={String(edit.category ?? "social")} onValueChange={(v) => setEdit({ ...edit, category: v as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Icon Key</Label>
                <Select value={edit.icon_key} onValueChange={(v) => setEdit({ ...edit, icon_key: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_KEYS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Username</Label>
                <Input value={edit.username ?? ""} onChange={(e) => setEdit({ ...edit, username: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Profile URL</Label>
                <Input value={edit.profile_url ?? ""} onChange={(e) => setEdit({ ...edit, profile_url: e.target.value })} />
              </div>

              <div className="space-y-1">
                <Label>Followers</Label>
                <Input
                  value={String(edit.followers ?? 0)}
                  onChange={(e) => setEdit({ ...edit, followers: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label>Sort Order</Label>
                <Input
                  value={String(edit.sort_order ?? 0)}
                  onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) })}
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={!!edit.is_visible} onCheckedChange={(v) => setEdit({ ...edit, is_visible: v })} />
                <span className="text-sm text-slate-200">Visible on website</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={!!edit.connected} onCheckedChange={(v) => setEdit({ ...edit, connected: v })} />
                <span className="text-sm text-slate-200">Connected</span>
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label>Description</Label>
                <Input value={edit.description ?? ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label>Credential Hints (JSON)</Label>
                <Textarea
                  value={
                    typeof edit.credential_hints === "string"
                      ? edit.credential_hints
                      : edit.credential_hints
                      ? JSON.stringify(edit.credential_hints, null, 2)
                      : ""
                  }
                  onChange={(e) => setEdit({ ...edit, credential_hints: e.target.value })}
                  placeholder='e.g. {"secret_names":["X_API_KEY","X_API_SECRET"]}'
                  className="min-h-[120px]"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
                <Button variant="secondary" onClick={save} className="gap-2" disabled={upsert.isPending}>
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button
                  variant="destructive"
                  onClick={remove}
                  className="gap-2"
                  disabled={!edit.id || del.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

