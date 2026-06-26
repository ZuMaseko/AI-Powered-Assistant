import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Hammer, Trees, Wrench, HeartHandshake } from "lucide-react";
import workshopAsset from "@/assets/project-workshop.jpg.asset.json";

export const Route = createFileRoute("/description")({
  head: () => ({
    meta: [
      { title: "About Calaphansi Group — Our craft & story" },
      { name: "description", content: "Calaphansi Group is a sole trader furniture workshop turning raw wood into handcrafted tables, benches, lounges and décor since 2022." },
      { property: "og:title", content: "About Calaphansi Group" },
      { property: "og:description", content: "A sole trader furniture workshop turning raw wood into handcrafted pieces since 2022." },
      { property: "og:image", content: workshopAsset.url },
      { name: "twitter:image", content: workshopAsset.url },
    ],
  }),
  component: Description,
});

const SERVICES = [
  { icon: Hammer, title: "Tables & benches", text: "Coffee, dining and patio tables with matching benches and stools." },
  { icon: Trees, title: "Wooden décor", text: "Planters, side tables, shelves and accent pieces for indoor and outdoor spaces." },
  { icon: Wrench, title: "Custom commissions", text: "Built to your measurements, finish and timber preference." },
  { icon: HeartHandshake, title: "Restoration", text: "Sanding, refinishing and repair of existing wooden furniture." },
];

function Description() {
  return (
    <div className="min-h-screen warm-bg">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">About</div>
            <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Our craft & story</h1>
            <p className="mt-6 text-lg leading-relaxed text-foreground/80">
              Calaphansi Group is a sole trader furniture workshop founded in 2022. We take raw and
              reclaimed wood — including pallet timber — and transform it by hand into furniture and
              décor that's built to last.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Every piece is shaped in our workshop: cut, jointed, sanded and finished without
              shortcuts. The result is honest, rustic furniture with a modern silhouette — at home
              on a patio, in a lounge or as a statement piece in an entertainment area.
            </p>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <div key={s.title} className="soft-card rounded-2xl p-5">
                  <s.icon className="h-5 w-5 text-accent" />
                  <div className="mt-2 font-display text-base font-semibold">{s.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="soft-card overflow-hidden rounded-3xl">
              <img src={workshopAsset.url} alt="Calaphansi Group workshop in progress" className="h-full w-full object-cover" />
            </div>
            <div className="soft-card mt-6 rounded-2xl p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-display text-2xl font-bold">2022</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Established</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-bold">100%</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Handmade</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-bold">1‑off</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Each piece</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}