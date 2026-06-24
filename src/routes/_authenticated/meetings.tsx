import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { summarizeMeeting } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StickyNote, Upload, Loader2, Download, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/meetings")({
  head: () => ({ meta: [{ title: "Meeting Notes Summarizer — NimbusAI" }] }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const fn = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");

  const onDrop = useCallback((files: File[]) => {
    const f = files[0];
    if (!f) return;
    f.text().then(setNotes);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/plain": [".txt", ".md", ".vtt"] },
    maxFiles: 1,
  });

  const mutation = useMutation({
    mutationFn: () => fn({ data: { notes, title: title || undefined } }),
    onError: (e: any) => toast.error(e?.message ?? "Failed to summarize"),
  });

  const r = mutation.data;

  const download = () => {
    if (!r) return;
    const md = `# ${title || "Meeting summary"}\n\n## Summary\n${r.summary}\n\n## Decisions\n${r.decisions.map(d => `- ${d}`).join("\n")}\n\n## Action items\n${r.actionItems.map(a => `- ${a.task} — ${a.owner} (${a.deadline})`).join("\n")}\n\n## Urgent\n${r.urgent.map(d => `- ${d}`).join("\n")}\n`;
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title || "meeting"}-summary.md`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-brand)" }}>
          <StickyNote className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Meeting Notes Summarizer</h1>
          <p className="text-sm text-muted-foreground">Turn raw notes or transcripts into decisions, action items, and deadlines.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 space-y-4">
          <div>
            <Label htmlFor="title">Meeting title (optional)</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Q3 Planning sync" />
          </div>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm">Drop a .txt / .md / .vtt file, or click to upload</p>
          </div>
          <div>
            <Label htmlFor="notes">Or paste notes</Label>
            <Textarea id="notes" rows={12} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste raw meeting notes or transcript here..." />
          </div>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || notes.length < 20} className="w-full gap-2">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <StickyNote className="h-4 w-4" />}
            Summarize
          </Button>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-display text-lg font-semibold">AI summary</div>
            <AiDisclaimer />
          </div>
          <AnimatePresence mode="wait">
            {r ? (
              <motion.div key="r" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-h-[520px] overflow-auto pr-2">
                <Section title="Summary"><p className="text-sm">{r.summary}</p></Section>
                {r.urgent?.length > 0 && (
                  <Section title="Urgent" icon={AlertTriangle} accent>
                    <ul className="text-sm space-y-1.5">{r.urgent.map((u, i) => <li key={i} className="flex gap-2"><span className="text-destructive">•</span>{u}</li>)}</ul>
                  </Section>
                )}
                {r.decisions?.length > 0 && (
                  <Section title="Decisions" icon={CheckCircle2}>
                    <ul className="text-sm space-y-1.5">{r.decisions.map((d, i) => <li key={i} className="flex gap-2"><span className="text-primary">•</span>{d}</li>)}</ul>
                  </Section>
                )}
                {r.actionItems?.length > 0 && (
                  <Section title="Action items">
                    <ul className="text-sm space-y-2">
                      {r.actionItems.map((a, i) => (
                        <li key={i} className="rounded-lg border border-border/60 bg-secondary/30 px-3 py-2">
                          <div className="font-medium">{a.task}</div>
                          <div className="text-xs text-muted-foreground">{a.owner} · {a.deadline}</div>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}
                {r.deadlines?.length > 0 && (
                  <Section title="Deadlines" icon={Clock}>
                    <ul className="text-sm space-y-1.5">{r.deadlines.map((d, i) => <li key={i} className="flex gap-2"><span>•</span>{d}</li>)}</ul>
                  </Section>
                )}
                <Button variant="outline" onClick={download} className="gap-2"><Download className="h-4 w-4" /> Download .md</Button>
              </motion.div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-20">Upload or paste notes to see your summary.</div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, accent, children }: any) {
  return (
    <div>
      <div className={`flex items-center gap-2 text-sm font-semibold mb-2 ${accent ? "text-destructive" : ""}`}>
        {Icon && <Icon className="h-4 w-4" />} {title}
      </div>
      {children}
    </div>
  );
}