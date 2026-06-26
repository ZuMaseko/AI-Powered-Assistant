import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "./ai-gateway.server";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(DEFAULT_MODEL);
}

async function persistHistory(
  supabase: any,
  userId: string,
  toolType: "email" | "meeting" | "tasks" | "research",
  prompt: unknown,
  response: string,
  title?: string,
) {
  await supabase.from("ai_history").insert({
    user_id: userId,
    tool_type: toolType,
    prompt: prompt as any,
    response,
    title: title ?? null,
  });
}

// -------- EMAIL --------
const EmailInput = z.object({
  purpose: z.string().min(1).max(500),
  recipientType: z.enum(["client", "manager", "team_member", "hr", "other"]),
  keyPoints: z.string().min(1).max(4000),
  tone: z.enum(["formal", "friendly", "persuasive", "apologetic", "professional"]),
});

export const generateEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => EmailInput.parse(data))
  .handler(async ({ data, context }) => {
    const model = getModel();
    const system = `You are an expert email writer. Write a single complete email (with Subject line on the first line as "Subject: ...", then a blank line, then body). Tone: ${data.tone}. Audience: ${data.recipientType}. Be concise, clear, and professional. Do not invent facts.`;
    const prompt = `Email purpose: ${data.purpose}\n\nKey points to include:\n${data.keyPoints}`;
    const { text } = await generateText({ model, system, prompt });
    await persistHistory(context.supabase, context.userId, "email", data, text, data.purpose.slice(0, 80));
    return { text };
  });

// -------- MEETING --------
const MeetingInput = z.object({
  notes: z.string().min(20).max(50000),
  title: z.string().max(200).optional(),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => MeetingInput.parse(data))
  .handler(async ({ data, context }) => {
    const model = getModel();
    const system = `You are a meeting notes assistant. Return STRICT JSON only (no markdown fences) matching:
{
  "summary": string,
  "decisions": string[],
  "actionItems": { "task": string, "owner": string, "deadline": string }[],
  "deadlines": string[],
  "urgent": string[]
}
If a field is unknown, use an empty array or empty string.`;
    const { text } = await generateText({
      model,
      system,
      prompt: `Meeting notes:\n\n${data.notes}`,
    });
    let parsed: any = { summary: text, decisions: [], actionItems: [], deadlines: [], urgent: [] };
    try {
      const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {}
    await persistHistory(context.supabase, context.userId, "meeting", { title: data.title }, JSON.stringify(parsed), data.title ?? "Meeting summary");
    return parsed as {
      summary: string;
      decisions: string[];
      actionItems: { task: string; owner: string; deadline: string }[];
      deadlines: string[];
      urgent: string[];
    };
  });

// -------- TASKS --------
export const listTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("tasks")
      .select("*")
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

const CreateTaskInput = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(2000).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  deadline: z.string().nullable().optional(),
});

export const createTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => CreateTaskInput.parse(data))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("tasks")
      .insert({
        user_id: context.userId,
        title: data.title,
        notes: data.notes ?? null,
        priority: data.priority,
        deadline: data.deadline ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

const UpdateTaskInput = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  notes: z.string().max(2000).nullable().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  deadline: z.string().nullable().optional(),
});

export const updateTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => UpdateTaskInput.parse(data))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const { error } = await context.supabase.from("tasks").update(rest).eq("id", id);
    if (error) throw error;
    return { ok: true };
  });

export const deleteTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("tasks").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const planTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: tasks } = await context.supabase
      .from("tasks")
      .select("id, title, notes, priority, deadline, status")
      .neq("status", "done");
    const list = (tasks ?? [])
      .map((t: any, i: number) => `${i + 1}. [${t.priority}] ${t.title}${t.deadline ? ` (due ${t.deadline})` : ""}${t.notes ? ` — ${t.notes}` : ""}`)
      .join("\n");
    const model = getModel();
    const system = `You are a productivity coach. Given a task list, produce a focused daily plan with time-blocks, prioritization rationale, and a 0-100 productivity score. Return STRICT JSON only:
{
  "score": number,
  "summary": string,
  "blocks": { "time": string, "task": string, "rationale": string }[],
  "tips": string[]
}`;
    const { text } = await generateText({
      model,
      system,
      prompt: list || "No tasks yet — suggest a starter daily structure for a knowledge worker.",
    });
    let parsed: any = { score: 60, summary: text, blocks: [], tips: [] };
    try {
      const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {}
    await persistHistory(context.supabase, context.userId, "tasks", { count: tasks?.length ?? 0 }, JSON.stringify(parsed), "Daily plan");
    return parsed;
  });

// -------- RESEARCH --------
const ResearchInput = z.object({
  source: z.string().min(10).max(50000),
  isUrl: z.boolean().default(false),
});

import { promises as dns } from "node:dns";
import net from "node:net";

function isPrivateIp(ip: string): boolean {
  if (net.isIP(ip) === 4) {
    const p = ip.split(".").map(Number);
    if (p[0] === 10) return true;
    if (p[0] === 127) return true;
    if (p[0] === 169 && p[1] === 254) return true;
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true;
    if (p[0] === 192 && p[1] === 168) return true;
    if (p[0] === 0) return true;
    if (p[0] >= 224) return true;
    return false;
  }
  if (net.isIP(ip) === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true;
    if (lower.startsWith("fe80:") || lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (lower.startsWith("::ffff:")) return isPrivateIp(lower.slice(7));
    return false;
  }
  return false;
}

async function assertSafePublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid URL");
  }
  if (url.protocol !== "https:") {
    throw new Error("Only https:// URLs are allowed");
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (!hostname || hostname.toLowerCase() === "localhost") {
    throw new Error("URL host is not allowed");
  }
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error("URL host is not allowed");
  } else {
    let addrs: { address: string }[] = [];
    try {
      addrs = await dns.lookup(hostname, { all: true });
    } catch {
      throw new Error("Could not resolve URL host");
    }
    if (addrs.length === 0 || addrs.some((a) => isPrivateIp(a.address))) {
      throw new Error("URL host is not allowed");
    }
  }
  return url;
}

export const researchSummarize = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ResearchInput.parse(data))
  .handler(async ({ data, context }) => {
    let content = data.source;
    if (data.isUrl) {
      const safeUrl = await assertSafePublicUrl(data.source);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(safeUrl.toString(), {
          headers: { "user-agent": "Mozilla/5.0 LovableBot" },
          redirect: "error",
          signal: controller.signal,
        }).finally(() => clearTimeout(timeout));
        const html = await res.text();
        content = html
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .slice(0, 20000);
      } catch (e) {
        throw new Error("Could not fetch the URL");
      }
    }
    const model = getModel();
    const system = `You are a research assistant. Return STRICT JSON only:
{
  "summary": string,
  "keyInsights": string[],
  "quickRead": string,
  "recommendations": string[]
}
Be specific, cite numbers when present, and keep "quickRead" under 80 words.`;
    const { text } = await generateText({
      model,
      system,
      prompt: `Source content:\n\n${content}`,
    });
    let parsed: any = { summary: text, keyInsights: [], quickRead: "", recommendations: [] };
    try {
      const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {}
    await persistHistory(context.supabase, context.userId, "research", { isUrl: data.isUrl, sourcePreview: data.source.slice(0, 200) }, JSON.stringify(parsed));
    return parsed as { summary: string; keyInsights: string[]; quickRead: string; recommendations: string[] };
  });

// -------- HISTORY --------
export const listHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("ai_history")
      .select("id, tool_type, title, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return data ?? [];
  });

// -------- CHAT --------
export const listChatMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) throw error;
    return data ?? [];
  });

export const clearChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.from("chat_messages").delete().eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

// -------- PROFILE --------
export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("profiles")
      .select("id, full_name, avatar_url, theme")
      .eq("id", context.userId)
      .maybeSingle();
    return data;
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      full_name: z.string().max(120).optional(),
      theme: z.enum(["dark", "light"]).optional(),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update(data)
      .eq("id", context.userId);
    if (error) throw error;
    return { ok: true };
  });