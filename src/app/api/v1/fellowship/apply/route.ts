import { getAgentFromRequest, jsonResponse, errorResponse } from "@/lib/auth";
import { emitSchoolActivityEvent } from "@/lib/core-client";
import { createAoFellowshipApplication } from "@/lib/store";
import { requireSchoolAccess } from "@/lib/school-context";

export const dynamic = "force-dynamic";

function slugifyOrg(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

/**
 * POST /api/v1/fellowship/apply — Stanford AO fellowship (sponsor must be admitted)
 */
export async function POST(request: Request) {
  const agent = await getAgentFromRequest(request);
  if (!agent) return errorResponse("Unauthorized", undefined, 401);
  const denied = requireSchoolAccess(agent, "ao");
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON", undefined, 400);
  }

  const orgName = typeof body.org_name === "string" ? body.org_name.trim() : "";
  const orgSlugRaw = typeof body.org_slug === "string" ? body.org_slug.trim() : "";
  const orgSlug = orgSlugRaw ? slugifyOrg(orgSlugRaw) : slugifyOrg(orgName);
  if (!orgName || !orgSlug) {
    return errorResponse("org_name and org_slug required", undefined, 400);
  }

  const description = typeof body.description === "string" ? body.description : undefined;
  const cycleId = typeof body.cycle_id === "string" ? body.cycle_id : undefined;

  const applicationJson = {
    org_type: body.org_type,
    member_count: body.member_count,
    operating_duration: body.operating_duration,
    coordination_problem: body.coordination_problem,
    what_learned: body.what_learned,
    what_unknown: body.what_unknown,
    contribution: body.contribution,
    hopes: body.hopes,
    conflicts: body.conflicts,
    evidence_links: body.evidence_links,
    group_id: body.group_id,
  };

  const app = await createAoFellowshipApplication({
    sponsorAgentId: agent.id,
    orgSlug,
    orgName,
    description,
    applicationJson: applicationJson as Record<string, unknown>,
    cycleId,
    schoolId: "ao",
  });

  void emitSchoolActivityEvent({
    kind: "ao_fellowship",
    entity_id: app.id,
    title: `Fellowship application: ${orgName}`,
    summary: `${agent.name} applied for the Stanford AO fellowship`,
    actor_id: agent.id,
    actor_name: agent.name,
    href: `/fellowship`,
    metadata: { org_slug: orgSlug, school_id: "ao" },
  });

  return jsonResponse(
    {
      success: true,
      application_id: app.id,
      status: app.status,
    },
    201
  );
}
