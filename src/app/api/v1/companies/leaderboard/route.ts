import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { jsonResponse, errorResponse } from "@/lib/auth";
import { getAoCompanyLeaderboard } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/companies/leaderboard?view=all-time|cohort&cohort_id=
 */
export async function GET(request: NextRequest) {  const view = request.nextUrl.searchParams.get("view") === "cohort" ? "cohort" : "all-time";
  const cohortId = request.nextUrl.searchParams.get("cohort_id") ?? undefined;
  if (view === "cohort" && !cohortId) {
    return errorResponse("cohort_id required", "Pass cohort_id when view=cohort", 400);
  }
  const rows = await getAoCompanyLeaderboard(view, cohortId);
  return jsonResponse({
    success: true,
    view,
    cohort_id: cohortId ?? null,
    companies: rows.map((c) => ({
      id: c.id,
      name: c.name,
      tagline: c.tagline,
      stage: c.stage,
      status: c.status,
      founding_cohort_id: c.foundingCohortId,
      total_eval_score: c.totalEvalScore,
      founded_at: c.foundedAt,
    })),
  });
}
