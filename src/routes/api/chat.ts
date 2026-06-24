import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "@/lib/ai-gateway.server";

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return new Response("Unauthorized", { status: 401 });

        const SUPABASE_URL = process.env.SUPABASE_URL!;
        const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
        });

        const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
        if (claimsError || !claims?.claims?.sub) return new Response("Unauthorized", { status: 401 });
        const userId = claims.claims.sub;

        const body = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(body.messages)) return new Response("Bad request", { status: 400 });
        const messages = body.messages as UIMessage[];

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const last = messages[messages.length - 1];
        if (last?.role === "user") {
          const userText = last.parts
            .map((p: any) => (p.type === "text" ? p.text : ""))
            .join("");
          if (userText) {
            await supabase.from("chat_messages").insert({
              user_id: userId,
              role: "user",
              content: userText,
            });
          }
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway(DEFAULT_MODEL);
        const system =
          "You are an AI workplace productivity assistant. Help the user with writing emails, summarizing meetings, planning tasks, researching topics, and general workplace questions. Use markdown formatting. Keep answers practical and concise.";

        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ responseMessage }) => {
            const text = responseMessage.parts
              .map((p: any) => (p.type === "text" ? p.text : ""))
              .join("");
            if (text) {
              await supabase.from("chat_messages").insert({
                user_id: userId,
                role: "assistant",
                content: text,
              });
            }
          },
        });
      },
    },
  },
});