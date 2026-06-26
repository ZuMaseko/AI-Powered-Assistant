import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader, SiteFooter } from "@/components/site-header";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(10, "Tell us a bit more").max(1000),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Calaphansi Group" },
      { name: "description", content: "Get in touch with Calaphansi Group to commission a handcrafted wooden table, bench, lounge set or décor piece." },
      { property: "og:title", content: "Contact Calaphansi Group" },
      { property: "og:description", content: "Commission a handcrafted wooden piece or ask about our work." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSending(true);
    const subject = encodeURIComponent(`Enquiry from ${parsed.data.name}`);
    const body = encodeURIComponent(`${parsed.data.message}\n\n— ${parsed.data.name} (${parsed.data.email})`);
    window.location.href = `mailto:hello@calaphansigroup.co.za?subject=${subject}&body=${body}`;
    setTimeout(() => setSending(false), 800);
  };

  return (
    <div className="min-h-screen warm-bg">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Contact</div>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Let's build something</h1>
          <p className="mt-4 text-muted-foreground">Send us the piece you have in mind — measurements, finish, where it'll live — and we'll come back with timing and a quote.</p>
        </header>
        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <form onSubmit={onSubmit} className="soft-card rounded-3xl p-6 sm:p-8">
            <div className="grid gap-4">
              <label className="block">
                <span className="text-sm font-medium">Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={100}
                  required
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-accent/40 transition-shadow focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  maxLength={255}
                  required
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-accent/40 transition-shadow focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">What can we build for you?</span>
                <textarea
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  maxLength={1000}
                  required
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-accent/40 transition-shadow focus:ring-2"
                />
              </label>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                <Send className="h-4 w-4" /> {sending ? "Opening mail…" : "Send enquiry"}
              </button>
            </div>
          </form>
          <aside className="space-y-4">
            <div className="soft-card rounded-2xl p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Direct</div>
              <ul className="mt-4 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-accent" />
                  <div>
                    <div className="font-medium">Email</div>
                    <a href="mailto:hello@calaphansigroup.co.za" className="text-muted-foreground hover:text-accent">hello@calaphansigroup.co.za</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-accent" />
                  <div>
                    <div className="font-medium">Phone / WhatsApp</div>
                    <span className="text-muted-foreground">On request via email</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-accent" />
                  <div>
                    <div className="font-medium">Workshop</div>
                    <span className="text-muted-foreground">By appointment only</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="soft-card rounded-2xl p-6">
              <div className="font-display text-lg font-semibold">Lead time</div>
              <p className="mt-2 text-sm text-muted-foreground">Most commissions ship in 2–4 weeks depending on size and finish. Restorations are quoted per piece.</p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}