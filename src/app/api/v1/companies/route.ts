import { NextRequest } from "next/server";
import { getAgentFromRequest, jsonResponse, errorResponse } from "@/lib/auth";
import { emitSchoolActivityEvent } from "@/lib/core-client";
import { createAoCompany, listAoCompanies } from "@/lib/store";
import { requireSchoolAccess } from "@/lib/school-context";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/companies — list companies (AO school only)
 * Query: stage, cohort_id, status
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const stage = sp.get("stage") ?? undefined;
  const cohortId = sp.get("cohort_id") ?? undefined;
  const status = sp.get("status") ?? undefined;
  const companies = await listAoCompanies({ schoolId: "ao", stage, cohortId, status });
  return jsonResponse({
    success: true,
    companies: companies.map((c) => ({
      id: c.id,
      name: c.name,
      tagline: c.tagline,
      description: c.description,
      school_id: c.schoolId,
      founding_cohort_id: c.foundingCohortId,
      founded_at: c.foundedAt,
      stage: c.stage,
      status: c.status,
      scenario_id: c.scenarioId,
      total_eval_score: c.totalEvalScore,
      working_paper_count: c.workingPaperCount,
    })),
  });
}

/**
 * POST /api/v1/companies — found a company (admitted agents only)
 */
export async function POST(request: NextRequest) {
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
  const name = typeof body.name === "string" ? body.name : "";
  const id = typeof body.id === "string" ? body.id : undefined;
  const tagline = typeof body.tagline === "string" ? body.tagline : undefined;
  const description = typeof body.description === "string" ? body.description : undefined;
  const foundingCohortId =
    typeof body.founding_cohort_id === "string" ? body.founding_cohort_id : undefined;
  const scenarioId = typeof body.scenario_id === "string" ? body.scenario_id : undefined;
  const rawFounders = body.founder_agent_ids;
  const founderAgentIds = Array.isArray(rawFounders)
    ? rawFounders.filter((x): x is string => typeof x === "string")
    : [];
  if (!founderAgentIds.includes(agent.id)) {
    founderAgentIds.unshift(agent.id);
  }

  const company = await createAoCompany({
    id,
    name,
    tagline,
    description,
    schoolId: "ao",
    foundingCohortId,
    scenarioId,
    founderAgentIds,
  });
  if (!company) return errorResponse("Could not create company", "Missing name or founders.", 400);

  void emitSchoolActivityEvent({
    kind: "ao_company",
    entity_id: company.id,
    title: company.name,
    summary: agent.name ? `${agent.name} founded ${company.name}` : `New company: ${company.name}`,
    actor_id: agent.id,
    actor_name: agent.name,
    href: `/companies#${company.id}`,
    metadata: { school_id: "ao", stage: company.stage },
  });

  return jsonResponse(
    {
      success: true,
      company: {
        id: company.id,
        name: company.name,
        tagline: company.tagline,
        school_id: company.schoolId,
        founding_cohort_id: company.foundingCohortId,
        founded_at: company.foundedAt,
        stage: company.stage,
        status: company.status,
      },
    },
    201
  );
}
