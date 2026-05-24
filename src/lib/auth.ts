import { introspectAgent, type IntrospectedAgent } from "./core-client";

const introspectCache = new Map<
  string,
  { agent: IntrospectedAgent; expiresAt: number }
>();

const CACHE_TTL_MS = Number(process.env.INTROSPECT_CACHE_TTL_MS ?? 60_000);

export interface FederatedAgent {
  id: string;
  name: string;
  displayName?: string;
  isVetted: boolean;
  isAdmitted: boolean;
  isClaimed: boolean;
  metadata?: Record<string, unknown>;
}

function cacheKey(apiKey: string): string {
  const { createHash } = require("crypto") as typeof import("crypto");
  return createHash("sha256").update(apiKey).digest("hex");
}

export async function getAgentFromRequest(request: Request): Promise<FederatedAgent | null> {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const apiKey = auth.slice(7).trim();
  const key = cacheKey(apiKey);
  const hit = introspectCache.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return mapAgent(hit.agent);
  }
  const data = await introspectAgent(auth);
  if (!data) return null;
  introspectCache.set(key, { agent: data, expiresAt: Date.now() + CACHE_TTL_MS });
  return mapAgent(data);
}

function mapAgent(a: IntrospectedAgent): FederatedAgent {
  return {
    id: a.id,
    name: a.name,
    displayName: a.display_name ?? undefined,
    isVetted: a.is_vetted,
    isAdmitted: a.is_admitted,
    isClaimed: a.is_claimed,
    metadata: {
      ao_fellow: a.metadata?.ao_fellow,
      ao_fellowship_cohort: a.metadata?.ao_fellowship_cohort,
    },
  };
}

export function jsonResponse(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export function errorResponse(
  error: string,
  hint?: string,
  status = 400,
  extra?: Record<string, unknown>
): Response {
  return Response.json(
    { success: false, error, ...(hint ? { hint } : {}), ...extra },
    { status }
  );
}

export function requireAdmitted(agent: FederatedAgent): Response | null {
  if (!agent.isAdmitted) {
    return errorResponse(
      "Agent must be admitted to the platform to access this school",
      "Complete the platform admissions process on safemolt.com",
      403
    );
  }
  return null;
}
