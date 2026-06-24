import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { generateEmail } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Loader2, Copy, RefreshCw, Download } from "lucide-react";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { toast } from "sonner";
import jsPDF from "jspdf";

export const Route = createFileRoute("/_authenticated/email")({
  head: () => ({ meta: [{ title: "Smart Email Generator — NimbusAI" }] }),
  component: EmailPage,
});

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState("");
  const [recipientType, setRecipientType] = useState("client");
  const [tone, setTone] = useState("professional");
  const [keyPoints, setKeyPoints] = useState("");

  const mutation = useMutation({
    mutationFn: () => fn({ data: { purpose, recipientType: recipientType as any, tone: tone as any, keyPoints } }),
    onError: (e: any) => toast.error(e?.message ?? "Failed to generate email"),
  });

  const output = mutation.data?.text ?? "";

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };
  const downloadTxt = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "email.txt";
    a.click();
  };
  const downloadPdf = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(output, 180);
    doc.setFont("helvetica");
    doc.setFontSize(11);
    doc.text(lines, 14, 18);
    doc.save("email.pdf");
  };

  return (
    <div className="space-y-6">
      <Header icon={Mail} title="Smart Email Generator" desc="Write polished, on-tone emails in seconds." />
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 space-y-4">
          <div>
            <Label htmlFor="purpose">Email purpose</Label>
            <Input id="purpose" placeholder="e.g. Explain a project delay" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Recipient</Label>
              <Select value={recipientType} onValueChange={setRecipientType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="team_member">Team member</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                  <SelectItem value="apologetic">Apologetic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="points">Key points</Label>
            <Textarea id="points" rows={8} placeholder="• Slip of 2 weeks due to scope addition\n• New milestones for Aug 12 and Sept 1\n• Offer a 10% discount" value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} />
          </div>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !purpose || !keyPoints} className="w-full gap-2">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Generate email
          </Button>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-display text-lg font-semibold">Generated email</div>
            <AiDisclaimer />
          </div>
          <AnimatePresence mode="wait">
            {output ? (
              <motion.div key="o" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans bg-secondary/30 rounded-lg p-4 max-h-[440px] overflow-auto">{output}</pre>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={copy} className="gap-2"><Copy className="h-4 w-4" /> Copy</Button>
                  <Button variant="outline" size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending} className="gap-2"><RefreshCw className="h-4 w-4" /> Regenerate</Button>
                  <Button variant="outline" size="sm" onClick={downloadTxt} className="gap-2"><Download className="h-4 w-4" /> TXT</Button>
                  <Button variant="outline" size="sm" onClick={downloadPdf} className="gap-2"><Download className="h-4 w-4" /> PDF</Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground text-center py-16">
                Fill in the form and click <strong>Generate email</strong>.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Header({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-brand)" }}>
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}