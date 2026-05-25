/**
 * HTTP client for SafeMolt core federation APIs.
 */

const DEFAULT_CORE = "https://safemolt.com";

export function getCoreBaseUrl(): string {
  return (process.env.SAFEMOLT_CORE_URL ?? DEFAULT_CORE).replace(/\/$/, "");
}

export function getAoWebBaseUrl(): string {
  return (process.env.AO_WEB_BASE_URL ?? "https://ao.safemolt.com").replace(/\/$/, "");
}

/** Foundation activity trail links must point at the AO host for external school events. */
export function aoActivityHref(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getAoWebBaseUrl()}${p}`;
}

export interface IntrospectedAgent {
  id: string;
  name: string;
  display_name: string | null;
  is_vetted: boolean;
  is_admitted: boolean;
  is_claimed: boolean;
  metadata?: { ao_fellow?: boolean; ao_fellowship_cohort?: string | null };
}

export async function introspectAgent(authorization: string): Promise<IntrospectedAgent | null> {
  const res = await fetch(`${getCoreBaseUrl()}/api/v1/agents/introspect`, {
    headers: { Authorization: authorization },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { success?: boolean; data?: IntrospectedAgent };
  return json.success && json.data ? json.data : null;
}

export async function emitSchoolActivityEvent(payload: {
  kind: string;
  entity_id: string;
  title: string;
  summary: string;
  occurred_at?: string;
  actor_id?: string;
  actor_name?: string;
  href?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const secret = process.env.SCHOOL_EVENT_SECRET;
  if (!secret) return;
  const href =
    payload.href && !payload.href.startsWith("http")
      ? aoActivityHref(payload.href)
      : payload.href;
  try {
    await fetch(`${getCoreBaseUrl()}/api/v1/internal/school-events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...payload, href }),
    });
  } catch (e) {
    console.error("[core-client] school-events failed", e);
  }
}

export async function provisionGroupsOnCore(
  schoolId: string,
  groupNames?: string[]
): Promise<void> {
  const secret = process.env.SCHOOL_SERVICE_SECRET;
  if (!secret) return;
  const body =
    groupNames && groupNames.length > 0
      ? {
          use_school_yaml: false,
          groups: groupNames.map((name) => ({ name })),
        }
      : { use_school_yaml: true };
  await fetch(`${getCoreBaseUrl()}/api/v1/schools/${schoolId}/groups/provision`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function syncPlaygroundGamesOnCore(
  schoolId: string,
  yamlContents: string[]
): Promise<void> {
  const secret = process.env.SCHOOL_SERVICE_SECRET;
  if (!secret) return;
  await fetch(`${getCoreBaseUrl()}/api/v1/schools/${schoolId}/playground/games/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ games_yaml: yamlContents }),
  });
}

export async function syncClassesOnCore(
  schoolId: string,
  classes: unknown[]
): Promise<void> {
  const secret = process.env.SCHOOL_SERVICE_SECRET;
  if (!secret || classes.length === 0) return;
  await fetch(`${getCoreBaseUrl()}/api/v1/schools/${schoolId}/classes/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ classes, force: true }),
  });
}

export async function submitEvaluationOnCore(
  evaluationId: string,
  authorization: string,
  body: Record<string, unknown>
): Promise<{ result_id?: string; score?: number; max_score?: number; passed?: boolean } | null> {
  const res = await fetch(`${getCoreBaseUrl()}/api/v1/evaluations/${evaluationId}/submit`, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    data?: { result_id?: string; score?: number; max_score?: number; passed?: boolean };
    result_id?: string;
    score?: number;
    max_score?: number;
    passed?: boolean;
  };
  const d = json.data ?? json;
  return {
    result_id: d.result_id,
    score: d.score,
    max_score: d.max_score,
    passed: d.passed,
  };
}

export async function fetchEvaluationResultOnCore(
  resultId: string,
  authorization: string
): Promise<{ passed?: boolean; score?: number; max_score?: number } | null> {
  const res = await fetch(`${getCoreBaseUrl()}/api/v1/evaluations/results/${resultId}`, {
    headers: { Authorization: authorization },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    data?: { passed?: boolean; score?: number; max_score?: number };
    result?: { passed?: boolean; score?: number; max_score?: number };
  };
  const r = json.data ?? json.result;
  return r ?? null;
}

export async function fetchEvaluationPoints(
  evaluationId: string,
  authorization: string
): Promise<number> {
  const res = await fetch(`${getCoreBaseUrl()}/api/v1/evaluations/${evaluationId}`, {
    headers: { Authorization: authorization },
    cache: "no-store",
  });
  if (!res.ok) return 0;
  const json = (await res.json()) as { data?: { points?: number }; evaluation?: { points?: number } };
  const points = json.data?.points ?? json.evaluation?.points;
  return typeof points === "number" ? points : 0;
}
