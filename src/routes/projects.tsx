import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import workshopAsset from "@/assets/project-workshop.jpg.asset.json";
import tablesAsset from "@/assets/project-tables-benches.jpg.asset.json";
import loungeAsset from "@/assets/project-lounge.jpg.asset.json";

const PROJECTS = [
  {
    img: workshopAsset.url,
    title: "Workshop builds",
    tag: "In progress",
    blurb: "Behind the scenes — joinery, sanding and assembly of bench bases and tabletops on the workshop floor.",
  },
  {
    img: tablesAsset.url,
    title: "Outdoor table & bench sets",
    tag: "Patio",
    blurb: "A collection of solid wood patio tables paired with matching benches and stools — built for everyday use outdoors.",
  },
  {
    img: loungeAsset.url,
    title: "Pallet-wood lounge styling",
    tag: "Décor",
    blurb: "Modular pallet-wood lounge seating, side tables and planters styled for an outdoor entertainment area.",
  },
];

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Calaphansi Group" },
      { name: "description", content: "A gallery of handcrafted wooden tables, benches, lounge sets and décor built by Calaphansi Group." },
      { property: "og:title", content: "Projects — Calaphansi Group" },
      { property: "og:description", content: "Handcrafted tables, benches and lounge sets from the Calaphansi workshop." },
      { property: "og:image", content: tablesAsset.url },
      { name: "twitter:image", content: tablesAsset.url },
    ],
  }),
  component: Projects,
});

function Projects() {
  return (
    <div className="min-h-screen warm-bg">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Projects</div>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Pieces we've built</h1>
          <p className="mt-4 text-muted-foreground">A selection of recent work — from raw pallet wood to finished pieces in use.</p>
        </header>
        <div className="mt-12 grid gap-10">
          {PROJECTS.map((p, i) => (
            <article key={p.title} className={`grid items-center gap-8 md:grid-cols-2 ${i % 2 ? "md:[&>div:first-child]:order-2" : ""}`}>
              <div className="soft-card overflow-hidden rounded-3xl">
                <img src={p.img} alt={p.title} loading="lazy" className="h-full max-h-[520px] w-full object-cover" />
              </div>
              <div>
                <span className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">{p.tag}</span>
                <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{p.title}</h2>
                <p className="mt-3 text-muted-foreground">{p.blurb}</p>
              </div>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}