import { cn } from "@/lib/utils";

export function BrandLogo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-8 w-8 rounded-lg" style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}>
        <div className="absolute inset-[3px] rounded-md bg-background/60 backdrop-blur-sm flex items-center justify-center">
          <span className="font-display text-sm font-bold gradient-text">N</span>
        </div>
      </div>
      {withText && (
        <span className="font-display text-lg font-semibold tracking-tight">
          Nimbus<span className="gradient-text">AI</span>
        </span>
      )}
    </div>
  );
}