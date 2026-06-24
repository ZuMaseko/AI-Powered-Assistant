import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listTasks, createTask, updateTask, deleteTask, planTasks } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListChecks, Plus, Loader2, Trash2, Sparkles, CheckCircle2, Circle } from "lucide-react";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({ meta: [{ title: "AI Task Planner — NimbusAI" }] }),
  component: TasksPage,
});

const priorities = ["low", "medium", "high", "urgent"] as const;
const priorityColor: Record<string, string> = {
  low: "bg-slate-500/20 text-slate-300",
  medium: "bg-blue-500/20 text-blue-300",
  high: "bg-amber-500/20 text-amber-300",
  urgent: "bg-red-500/20 text-red-300",
};

function TasksPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listTasks);
  const createFn = useServerFn(createTask);
  const updateFn = useServerFn(updateTask);
  const deleteFn = useServerFn(deleteTask);
  const planFn = useServerFn(planTasks);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");

  const tasks = useQuery({ queryKey: ["tasks"], queryFn: () => listFn() });
  const create = useMutation({
    mutationFn: () => createFn({ data: { title, priority } }),
    onSuccess: () => { setTitle(""); qc.invalidateQueries({ queryKey: ["tasks"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed to add task"),
  });
  const toggle = useMutation({
    mutationFn: (t: any) => updateFn({ data: { id: t.id, status: t.status === "done" ? "todo" : "done" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const plan = useMutation({
    mutationFn: () => planFn(),
    onError: (e: any) => toast.error(e?.message ?? "Could not plan day"),
  });

  const list = tasks.data ?? [];
  const open = list.filter((t: any) => t.status !== "done");
  const done = list.filter((t: any) => t.status === "done");

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-brand)" }}>
          <ListChecks className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">AI Task Planner</h1>
          <p className="text-sm text-muted-foreground">Capture tasks, let AI prioritize and build your day.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-4">
        {/* Tasks */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <form
            onSubmit={(e) => { e.preventDefault(); if (title) create.mutate(); }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <Input placeholder="What needs to get done?" value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1" />
            <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
              <SelectTrigger className="sm:w-36"><SelectValue /></SelectTrigger>
              <SelectContent>{priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
            <Button type="submit" disabled={!title || create.isPending} className="gap-2">
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
            </Button>
          </form>

          <div className="space-y-1.5">
            <AnimatePresence>
              {open.map((t: any) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2"
                >
                  <button onClick={() => toggle.mutate(t)} className="text-muted-foreground hover:text-foreground">
                    <Circle className="h-4 w-4" />
                  </button>
                  <span className="flex-1 text-sm">{t.title}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", priorityColor[t.priority])}>{t.priority}</span>
                  <Button size="icon-sm" variant="ghost" onClick={() => remove.mutate(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </motion.div>
              ))}
            </AnimatePresence>
            {done.length > 0 && (
              <div className="pt-3 mt-3 border-t border-border/60 space-y-1.5">
                <div className="text-xs text-muted-foreground mb-1">Completed</div>
                {done.map((t: any) => (
                  <div key={t.id} className="flex items-center gap-3 px-3 py-1.5 opacity-60">
                    <button onClick={() => toggle.mutate(t)} className="text-primary"><CheckCircle2 className="h-4 w-4" /></button>
                    <span className="text-sm line-through">{t.title}</span>
                    <Button size="icon-sm" variant="ghost" className="ml-auto" onClick={() => remove.mutate(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            )}
            {list.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-10">No tasks yet — add your first above.</div>
            )}
          </div>
        </div>

        {/* AI plan */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-display text-lg font-semibold">AI daily plan</div>
            <Button onClick={() => plan.mutate()} disabled={plan.isPending} size="sm" className="gap-2">
              {plan.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Plan my day
            </Button>
          </div>
          <AnimatePresence mode="wait">
            {plan.data ? (
              <motion.div key="p" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 p-4 border border-border/60">
                  <div className="text-xs text-muted-foreground mb-1">Productivity score</div>
                  <div className="font-display text-4xl font-bold gradient-text">{plan.data.score}</div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.data.summary}</p>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2">Time blocks</div>
                  <ul className="space-y-2">
                    {(plan.data.blocks ?? []).map((b: any, i: number) => (
                      <li key={i} className="rounded-lg border border-border/60 bg-secondary/30 px-3 py-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-primary">{b.time}</span>
                          <span className="text-sm font-medium">{b.task}</span>
                        </div>
                        {b.rationale && <div className="text-xs text-muted-foreground mt-1">{b.rationale}</div>}
                      </li>
                    ))}
                  </ul>
                </div>
                {plan.data.tips?.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold mb-2">Tips</div>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      {plan.data.tips.map((t: string, i: number) => <li key={i}>• {t}</li>)}
                    </ul>
                  </div>
                )}
                <AiDisclaimer />
              </motion.div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-12">Click <strong>Plan my day</strong> to let AI organize your tasks.</div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}