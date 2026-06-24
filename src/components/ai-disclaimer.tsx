import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function AiDisclaimer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground",
        className,
      )}
    >
      <Sparkles className="h-3 w-3 text-primary" />
      AI-generated — review before sending.
    </div>
  );
}