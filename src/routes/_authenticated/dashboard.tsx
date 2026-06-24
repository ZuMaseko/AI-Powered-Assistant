import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listHistory, listTasks, getProfile } from "@/lib/ai.functions";
import {
  Mail,
  StickyNote,
  ListChecks,
  BookOpen,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — NimbusAI" }] }),
  component: Dashboard,
});

const tools = [
  { to: "/email", title: "Smart Email", desc: "Draft a professional email", icon: Mail, color: "from-blue-500 to-indigo-500" },
  { to: "/meetings", title: "Meeting Notes", desc: "Summarize a transcript", icon: StickyNote, color: "from-indigo-500 to-purple-500" },
  { to: "/tasks", title: "Task Planner", desc: "Plan your day", icon: ListChecks, color: "from-purple-500 to-pink-500" },
  { to: "/research", title: "Research", desc: "Summarize an article", icon: BookOpen, color: "from-cyan-500 to-blue-500" },
  { to: "/chat", title: "Chatbot", desc: "Ask anything", icon: MessageSquare, color: "from-emerald-500 to-cyan-500" },
] as const;

function Dashboard() {
  const profileFn = useServerFn(getProfile);
  const historyFn = useServerFn(listHistory);
  const tasksFn = useServerFn(listTasks);

  const profile = useQuery({ queryKey: ["profile"], queryFn: () => profileFn() });
  const history = useQuery({ queryKey: ["history"], queryFn: () => historyFn() });
  const tasks = useQuery({ queryKey: ["tasks"], queryFn: () => tasksFn() });

  const openTasks = (tasks.data ?? []).filter((t: any) => t.status !== "done").length;
  const doneTasks = (tasks.data ?? []).filter((t: any) => t.status === "done").length;
  const totalAi = history.data?.length ?? 0;
  const score = Math.min(100, 40 + doneTasks * 8 + Math.min(20, totalAi * 2));

  const greet = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl sm:text-4xl font-bold"
        >
          {greet}, <span className="gradient-text">{profile.data?.full_name?.split(" ")[0] ?? "there"}</span>.
        </motion.h1>
        <p className="text-muted-foreground mt-1 text-sm">Here's your productivity snapshot for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={TrendingUp} label="Productivity score" value={`${score}`} hint="out of 100" />
        <StatCard icon={ListChecks} label="Open tasks" value={`${openTasks}`} hint="in your queue" />
        <StatCard icon={CheckCircle2} label="Completed" value={`${doneTasks}`} hint="this period" />
        <StatCard icon={Sparkles} label="AI runs" value={`${totalAi}`} hint="recent activity" />
      </div>

      {/* Quick tools */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-3">Quick access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tools.map((t, i) => (
            <motion.div
              key={t.to}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
            >
              <Link to={t.to} className="block glass rounded-2xl p-5 hover:shadow-[var(--shadow-glow)] transition-shadow">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${t.color}`}>
                  <t.icon className="h-5 w-5 text-white" />
                </div>
                <div className="font-display text-lg font-semibold mt-3">{t.title}</div>
                <div className="text-sm text-muted-foreground">{t.desc}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-3">Recent activity</h2>
        <div className="glass rounded-2xl divide-y divide-border/60">
          {(history.data ?? []).slice(0, 8).map((h: any) => (
            <div key={h.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className="rounded-md bg-primary/15 text-primary px-2 py-0.5 text-xs uppercase tracking-wide">{h.tool_type}</span>
              <span className="truncate">{h.title ?? "Untitled"}</span>
              <span className="ml-auto text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString()}</span>
            </div>
          ))}
          {(history.data ?? []).length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No activity yet — try a tool above to get started.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string; hint: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4"
    >
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="font-display text-3xl font-bold gradient-text mt-2">{value}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </motion.div>
  );
}