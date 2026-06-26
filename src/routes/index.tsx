import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Hammer, Leaf, Sparkles } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import workshopAsset from "@/assets/project-workshop.jpg.asset.json";
import tablesAsset from "@/assets/project-tables-benches.jpg.asset.json";
import loungeAsset from "@/assets/project-lounge.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Calaphansi Group — Handcrafted Wooden Furniture & Décor" },
      { name: "description", content: "Sole trader furniture maker turning raw timber into bespoke tables, benches and lounge sets. Commissions welcome." },
      { property: "og:title", content: "Calaphansi Group — Handcrafted Wooden Furniture" },
      { property: "og:description", content: "Bespoke tables, benches and wooden décor built by hand from raw timber." },
      { property: "og:image", content: tablesAsset.url },
      { name: "twitter:image", content: tablesAsset.url },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen warm-bg">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
                <Sparkles className="h-3.5 w-3.5" /> Est. 2022
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
                Raw timber,<br />
                <span className="italic gradient-text">crafted by hand</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Calaphansi Group is a sole trader workshop turning reclaimed and raw wood into
                bespoke tables, benches, lounge sets and wooden décor — built one piece at a time.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
                >
                  View projects <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  Commission a piece
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-accent/30 via-primary/10 to-transparent blur-2xl" />
              <div className="soft-card overflow-hidden rounded-[1.75rem]">
                <img src={loungeAsset.url} alt="Handcrafted pallet-wood lounge set" className="h-[420px] w-full object-cover sm:h-[520px]" />
              </div>
              <div className="soft-card absolute -bottom-6 -left-6 hidden w-44 rounded-2xl p-4 sm:block">
                <div className="text-2xl font-display font-bold">100%</div>
                <div className="text-xs text-muted-foreground">Handmade in our workshop</div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Hammer, title: "Hand-built", text: "Every joint, edge and finish shaped in-workshop." },
              { icon: Leaf, title: "Honest materials", text: "Raw timber and reclaimed pallet wood — nothing wasted." },
              { icon: Sparkles, title: "Made to order", text: "Tell us your space, we'll build it to fit." },
            ].map((v) => (
              <div key={v.title} className="soft-card rounded-2xl p-6">
                <v.icon className="h-6 w-6 text-accent" />
                <div className="mt-3 font-display text-lg font-semibold">{v.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured work */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Featured work</div>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Pieces from the workshop</h2>
            </div>
            <Link to="/projects" className="hidden text-sm font-medium text-foreground/80 hover:text-accent sm:inline-flex">
              See all →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { img: workshopAsset.url, title: "Workshop builds", caption: "Tables & benches in progress" },
              { img: tablesAsset.url, title: "Outdoor sets", caption: "Tables, benches & garden seating" },
              { img: loungeAsset.url, title: "Pallet lounges", caption: "Modular outdoor lounge styling" },
            ].map((p) => (
              <article key={p.title} className="soft-card group overflow-hidden rounded-2xl">
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={p.img} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <div className="font-display text-lg font-semibold">{p.title}</div>
                  <div className="text-sm text-muted-foreground">{p.caption}</div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-14 text-primary-foreground sm:px-14">
            <div className="absolute inset-0 -z-0 opacity-30" style={{ backgroundImage: "var(--gradient-brand)" }} />
            <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-display text-2xl font-bold sm:text-3xl">Have a piece in mind?</h3>
                <p className="mt-2 max-w-md text-sm text-primary-foreground/80">From a single coffee table to a full outdoor lounge — let's talk through it.</p>
              </div>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary">
                Get in touch <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}