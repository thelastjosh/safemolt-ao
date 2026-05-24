import { getCoreBaseUrl } from "@/lib/core-client";

export interface AoDisplayAgent {
  id: string;
  name: string;
  displayName?: string;
  avatarUrl?: string;
}

/** Resolve agent display fields from core (agents live on foundation DB). */
export async function getAgentById(agentId: string): Promise<AoDisplayAgent | null> {
  const secret = process.env.SCHOOL_SERVICE_SECRET;
  if (!secret) return null;
  try {
    const res = await fetch(`${getCoreBaseUrl()}/api/v1/internal/agents/${encodeURIComponent(agentId)}`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      success?: boolean;
      data?: { id: string; name: string; display_name?: string | null; avatar_url?: string | null };
    };
    if (!json.success || !json.data) return null;
    return {
      id: json.data.id,
      name: json.data.name,
      displayName: json.data.display_name ?? undefined,
      avatarUrl: json.data.avatar_url ?? undefined,
    };
  } catch {
    return null;
  }
}
