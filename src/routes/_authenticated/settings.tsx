import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProfile, updateProfile, clearChat } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Save, Trash2, ShieldCheck } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — NimbusAI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const profileFn = useServerFn(getProfile);
  const updateFn = useServerFn(updateProfile);
  const clearFn = useServerFn(clearChat);
  const { theme, setTheme } = useTheme();

  const profile = useQuery({ queryKey: ["profile"], queryFn: () => profileFn() });
  const [name, setName] = useState("");
  useEffect(() => { if (profile.data?.full_name) setName(profile.data.full_name); }, [profile.data]);

  const save = useMutation({
    mutationFn: () => updateFn({ data: { full_name: name, theme } }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["profile"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const clear = useMutation({
    mutationFn: () => clearFn(),
    onSuccess: () => { toast.success("Chat history cleared"); qc.invalidateQueries({ queryKey: ["chat-messages"] }); },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-brand)" }}>
          <SettingsIcon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your profile, preferences, and data.</p>
        </div>
      </div>

      <section className="glass rounded-2xl p-5 space-y-4">
        <div className="font-display text-lg font-semibold">Profile</div>
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Theme</Label>
          <div className="flex gap-2 mt-1">
            <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")}>Dark</Button>
            <Button variant={theme === "light" ? "default" : "outline"} size="sm" onClick={() => setTheme("light")}>Light</Button>
          </div>
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending} className="gap-2"><Save className="h-4 w-4" /> Save</Button>
      </section>

      <section className="glass rounded-2xl p-5 space-y-3">
        <div className="font-display text-lg font-semibold">Responsible AI</div>
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary mt-0.5" />
          <p>NimbusAI outputs may contain inaccuracies. Always review AI-generated content before sending or acting on it. We do not sell your data; AI requests are processed via Lovable AI Gateway.</p>
        </div>
      </section>

      <section className="glass rounded-2xl p-5 space-y-3">
        <div className="font-display text-lg font-semibold">Data</div>
        <p className="text-sm text-muted-foreground">Clear your chatbot conversation history.</p>
        <Button variant="destructive" onClick={() => clear.mutate()} disabled={clear.isPending} className="gap-2"><Trash2 className="h-4 w-4" /> Clear chat history</Button>
      </section>
    </div>
  );
}