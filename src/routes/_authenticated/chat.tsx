import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listChatMessages, clearChat } from "@/lib/ai.functions";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { Trash2, MessageSquare, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "AI Chatbot — NimbusAI" }] }),
  component: ChatPage,
});

const suggestions = [
  "Summarize my last meeting",
  "Draft a follow-up email to a client",
  "Plan my workday",
  "Help me write a quarterly OKR",
];

function ChatPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listChatMessages);
  const clearFn = useServerFn(clearChat);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const history = useQuery({ queryKey: ["chat-messages"], queryFn: () => listFn() });

  const initialMessages: UIMessage[] = (history.data ?? []).map((m: any) => ({
    id: m.id,
    role: m.role,
    parts: [{ type: "text", text: m.content }],
  }));

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        fetch: async (input, init) => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          const headers = new Headers(init?.headers);
          if (token) headers.set("Authorization", `Bearer ${token}`);
          return fetch(input, { ...init, headers });
        },
      }),
    [],
  );

  const { messages, sendMessage, status } = useChat({
    id: "single",
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e?.message ?? "Chat error"),
  });

  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";

  const send = async (text: string) => {
    if (!text.trim()) return;
    setInput("");
    await sendMessage({ text });
    setTimeout(() => taRef.current?.focus(), 0);
  };

  const clear = useMutation({
    mutationFn: () => clearFn(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["chat-messages"] }); window.location.reload(); },
  });

  useEffect(() => { taRef.current?.focus(); }, []);

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-brand)" }}>
          <MessageSquare className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Workplace Chatbot</h1>
          <p className="text-sm text-muted-foreground">Your always-on AI co-pilot.</p>
        </div>
        <Button variant="outline" size="sm" className="ml-auto gap-2" onClick={() => clear.mutate()}>
          <Trash2 className="h-4 w-4" /> Clear
        </Button>
      </div>

      <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-16 px-4">
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--gradient-brand)" }}>
                  <Sparkles className="h-7 w-7 text-primary-foreground" />
                </div>
                <h2 className="font-display text-xl font-semibold">How can I help you today?</h2>
                <p className="text-sm text-muted-foreground mt-1">Try one of these:</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-2xl">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-xs hover:bg-secondary/60 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => (
              <Message from={m.role} key={m.id}>
                <MessageContent>
                  {m.role === "assistant" ? (
                    <MessageResponse>
                      {m.parts.map((p: any) => (p.type === "text" ? p.text : "")).join("")}
                    </MessageResponse>
                  ) : (
                    <p>{m.parts.map((p: any) => (p.type === "text" ? p.text : "")).join("")}</p>
                  )}
                </MessageContent>
              </Message>
            ))}
            {status === "submitted" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-2">
                <Shimmer>Thinking...</Shimmer>
              </motion.div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t border-border/60 p-3">
          <PromptInput onSubmit={(msg) => { send(msg.text ?? input); }}>
            <PromptInputTextarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything — emails, plans, summaries..."
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={isLoading || !input.trim()} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}