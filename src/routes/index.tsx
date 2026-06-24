import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Mail,
  StickyNote,
  ListChecks,
  BookOpen,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NimbusAI — Your AI workplace productivity assistant" },
      { name: "description", content: "Generate emails, summarize meetings, plan tasks, and chat with an AI co-pilot built for modern teams." },
      { property: "og:title", content: "NimbusAI — Your AI workplace productivity assistant" },
      { property: "og:description", content: "Generate emails, summarize meetings, plan tasks, and chat with an AI co-pilot built for modern teams." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Mail, title: "Smart Email Generator", desc: "Draft professional emails with the right tone in seconds." },
  { icon: StickyNote, title: "Meeting Summarizer", desc: "Turn long transcripts into decisions, action items, and deadlines." },
  { icon: ListChecks, title: "AI Task Planner", desc: "Auto-prioritize work and build a focused daily schedule." },
  { icon: BookOpen, title: "Research Assistant", desc: "Summarize articles or URLs into quick-read insights." },
  { icon: MessageSquare, title: "Workplace Chatbot", desc: "Ask anything — get answers, drafts, plans, and follow-ups." },
  { icon: ShieldCheck, title: "Privacy-first", desc: "Your data stays yours — encrypted, scoped, and never sold." },
];

const stats = [
  { value: "10x", label: "Faster drafting" },
  { value: "30%", label: "More focus time" },
  { value: "5+", label: "AI tools in one" },
  { value: "24/7", label: "Always available" },
];

const testimonials = [
  { quote: "Cuts my email time in half. The tone selector is genuinely useful.", name: "Maya R.", role: "Product Lead" },
  { quote: "Our team finally has meeting notes everyone reads — because they're 5 bullets.", name: "Ian K.", role: "Engineering Manager" },
  { quote: "The daily planner is like a chief of staff in my pocket.", name: "Sofia A.", role: "Founder" },
];

function Landing() {
  return (
    <div className="min-h-screen aurora-bg">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex h-16 items-center px-4 sm:px-6">
          <BrandLogo />
          <nav className="ml-auto flex items-center gap-2">
            <a href="#features" className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground px-3 py-1.5">Features</a>
            <a href="#testimonials" className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground px-3 py-1.5">Loved by teams</a>
            <ThemeToggle />
            <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
            <Button asChild><Link to="/auth">Get started</Link></Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground mb-6"
          >
            <Sparkles className="h-3 w-3 text-primary" /> Powered by Lovable AI · Gemini
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
          >
            Your AI co-pilot for <br className="hidden sm:block" />
            <span className="gradient-text">work that matters.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground"
          >
            NimbusAI automates the busywork — emails, meeting notes, task planning, research — so your team can focus on what actually moves the needle.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="gap-2">
              <Link to="/auth">Start for free <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline"><a href="#features">See features</a></Button>
          </motion.div>

          {/* Product mock */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35 }}
            className="mt-16 relative mx-auto max-w-5xl"
          >
            <div className="glass rounded-2xl p-2 sm:p-3">
              <div className="rounded-xl bg-card/80 border border-border/60 overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/60">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                  <span className="ml-3 text-xs text-muted-foreground">nimbus.ai/dashboard</span>
                </div>
                <div className="grid grid-cols-12 min-h-[280px]">
                  <div className="col-span-3 border-r border-border/60 p-3 hidden sm:block">
                    {["Dashboard","Email","Meetings","Tasks","Research","Chat"].map(s => (
                      <div key={s} className="text-xs text-muted-foreground py-1.5 px-2 rounded hover:bg-secondary/40">{s}</div>
                    ))}
                  </div>
                  <div className="col-span-12 sm:col-span-9 p-6 text-left">
                    <div className="text-xs text-muted-foreground mb-2">Today's plan</div>
                    <div className="font-display text-2xl mb-4">Good morning, Alex 👋</div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { t: "Productivity score", v: "82" },
                        { t: "Tasks for today", v: "6" },
                        { t: "Emails drafted", v: "12" },
                        { t: "Meetings summarized", v: "3" },
                      ].map((s) => (
                        <div key={s.t} className="rounded-lg border border-border/60 bg-card/60 p-3">
                          <div className="text-xs text-muted-foreground">{s.t}</div>
                          <div className="font-display text-2xl gradient-text">{s.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <div className="font-display text-3xl sm:text-4xl font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-5xl font-bold">Everything your team needs, in one workspace.</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Five focused AI tools, one beautiful interface.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-6 hover:shadow-[var(--shadow-glow)] transition-shadow"
              >
                <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--gradient-brand)" }}>
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="font-display text-lg font-semibold">{f.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-5xl font-bold">Loved by modern teams.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.name} className="glass rounded-2xl p-6">
                <p className="text-sm">"{t.quote}"</p>
                <div className="mt-4 text-xs text-muted-foreground">{t.name} · {t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Zap className="h-8 w-8 mx-auto text-primary mb-4" />
          <h2 className="font-display text-3xl sm:text-5xl font-bold">Ready to give your team superpowers?</h2>
          <p className="mt-4 text-muted-foreground">Get started in under a minute. No credit card required.</p>
          <Button asChild size="lg" className="mt-8 gap-2">
            <Link to="/auth">Create your free account <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <BrandLogo />
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Bot className="h-3 w-3" /> Built with responsible AI — outputs may require review.
          </div>
        </div>
      </footer>
    </div>
  );
}
