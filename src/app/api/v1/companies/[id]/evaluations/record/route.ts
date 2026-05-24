import { getAgentFromRequest, jsonResponse, errorResponse } from "@/lib/auth";
import {
  fetchEvaluationPoints,
  fetchEvaluationResultOnCore,
  submitEvaluationOnCore,
} from "@/lib/core-client";
import { getAoCompany, listAoCompanyTeam, recordAoCompanyEvaluation } from "@/lib/store";
import { requireSchoolAccess } from "@/lib/school-context";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/companies/:id/evaluations/record
 * Records AO company eval linkage. Prefer core submit (forward Bearer) + opaque result_id.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const agent = await getAgentFromRequest(request);
  if (!agent) return errorResponse("Unauthorized", undefined, 401);
  const denied = requireSchoolAccess(agent, "ao");
  if (denied) return denied;

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return errorResponse("Unauthorized", undefined, 401);

  const { id } = await context.params;
  const company = await getAoCompany(id);
  if (!company) return errorResponse("Not found", "Company not found", 404);
  const team = await listAoCompanyTeam(id);
  const canRecord = team.some(
    (m) => m.agentId === agent.id && (m.role === "founder" || m.role === "employee")
  );
  if (!canRecord) {
    return errorResponse("Forbidden", "Only company team members can record evaluations.", 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON", undefined, 400);
  }
  const evaluationId = typeof body.evaluation_id === "string" ? body.evaluation_id : "";
  if (!evaluationId) return errorResponse("evaluation_id required", undefined, 400);

  let resultId = typeof body.result_id === "string" ? body.result_id : undefined;
  let score = typeof body.score === "number" ? body.score : undefined;
  let maxScore = typeof body.max_score === "number" ? body.max_score : undefined;
  let passed = typeof body.passed === "boolean" ? body.passed : undefined;
  const cohortId = typeof body.cohort_id === "string" ? body.cohort_id : undefined;

  if (!resultId && body.submission != null) {
    const submitted = await submitEvaluationOnCore(evaluationId, authHeader, {
      submission: body.submission,
      company_id: id,
    });
    if (!submitted?.result_id) {
      return errorResponse("Evaluation submit failed", "Submit via core eval engine first", 502);
    }
    resultId = submitted.result_id;
    score = submitted.score ?? score;
    maxScore = submitted.max_score ?? maxScore;
    passed = submitted.passed ?? passed;
  }

  if (resultId && (passed === undefined || maxScore === undefined)) {
    const remote = await fetchEvaluationResultOnCore(resultId, authHeader);
    if (remote) {
      passed = remote.passed ?? passed;
      score = remote.score ?? score;
      maxScore = remote.max_score ?? maxScore;
    }
  }

  if (maxScore == null) {
    const points = await fetchEvaluationPoints(evaluationId, authHeader);
    if (points > 0) maxScore = points;
  }

  const row = await recordAoCompanyEvaluation({
    companyId: id,
    evaluationId,
    resultId,
    score,
    maxScore,
    passed,
    cohortId,
  });
  if (!row) return errorResponse("Failed to record", undefined, 500);
  return jsonResponse({
    success: true,
    evaluation: {
      id: row.id,
      evaluation_id: row.evaluationId,
      result_id: row.resultId,
      passed: row.passed,
      completed_at: row.completedAt,
    },
  });
}
