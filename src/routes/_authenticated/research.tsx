import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { researchSummarize } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, Loader2, Link2, Type, Lightbulb } from "lucide-react";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/research")({
  head: () => ({ meta: [{ title: "AI Research Assistant — NimbusAI" }] }),
  component: ResearchPage,
});

function ResearchPage() {
  const fn = useServerFn(researchSummarize);
  const [mode, setMode] = useState<"text" | "url">("text");
  const [source, setSource] = useState("");

  const mutation = useMutation({
    mutationFn: () => fn({ data: { source, isUrl: mode === "url" } }),
    onError: (e: any) => toast.error(e?.message ?? "Failed to summarize"),
  });
  const r = mutation.data;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-brand)" }}>
          <BookOpen className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Research Assistant</h1>
          <p className="text-sm text-muted-foreground">Paste an article or URL and get summaries, insights, and a quick-read.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 space-y-4">
          <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
            <TabsList>
              <TabsTrigger value="text" className="gap-2"><Type className="h-4 w-4" /> Text</TabsTrigger>
              <TabsTrigger value="url" className="gap-2"><Link2 className="h-4 w-4" /> URL</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="mt-4">
              <Textarea rows={14} value={source} onChange={(e) => setSource(e.target.value)} placeholder="Paste article or topic..." />
            </TabsContent>
            <TabsContent value="url" className="mt-4">
              <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="https://example.com/article" type="url" />
            </TabsContent>
          </Tabs>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || source.length < 10} className="w-full gap-2">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />} Summarize
          </Button>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-display text-lg font-semibold">Insights</div>
            <AiDisclaimer />
          </div>
          <AnimatePresence mode="wait">
            {r ? (
              <motion.div key="r" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-h-[520px] overflow-auto pr-2">
                {r.quickRead && (
                  <div className="rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 p-4 border border-border/60">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1"><Lightbulb className="h-3.5 w-3.5" /> QUICK READ</div>
                    <p className="text-sm">{r.quickRead}</p>
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold mb-2">Summary</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.summary}</p>
                </div>
                {r.keyInsights?.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold mb-2">Key insights</div>
                    <ul className="text-sm space-y-1.5">{r.keyInsights.map((k, i) => <li key={i} className="flex gap-2"><span className="text-primary">•</span>{k}</li>)}</ul>
                  </div>
                )}
                {r.recommendations?.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold mb-2">Recommendations</div>
                    <ul className="text-sm space-y-1.5">{r.recommendations.map((k, i) => <li key={i} className="flex gap-2"><span className="text-accent">→</span>{k}</li>)}</ul>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-20">Add text or a URL to summarize.</div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}