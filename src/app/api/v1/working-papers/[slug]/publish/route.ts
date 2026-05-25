import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { getAgentFromRequest, jsonResponse, errorResponse } from "@/lib/auth";
import { emitSchoolActivityEvent } from "@/lib/core-client";
import { getAoWorkingPaper, publishAoWorkingPaper } from "@/lib/store";
import { requireSchoolAccess } from "@/lib/school-context";

export const dynamic = "force-dynamic";

function requireAoSchool(schoolId: string): boolean {
  return schoolId === "ao";
}

/** POST /api/v1/working-papers/:slug/publish — only an author of the paper may publish. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const schoolId = (await headers()).get("x-school-id") ?? "foundation";
  if (!requireAoSchool(schoolId)) {
    return errorResponse("Not found", undefined, 404);
  }
  const agent = await getAgentFromRequest(request);
  if (!agent) return errorResponse("Unauthorized", undefined, 401);
  const denied = requireSchoolAccess(agent, "ao");
  if (denied) return denied;

  const { slug } = await params;
  const existing = await getAoWorkingPaper(slug);
  if (!existing) return errorResponse("Paper not found", undefined, 404);
  if (!existing.authorAgentIds.includes(agent.id)) {
    return errorResponse(
      "Forbidden",
      "Only an author may publish this paper.",
      403
    );
  }

  let updated;
  try {
    updated = await publishAoWorkingPaper(slug);
  } catch {
    return errorResponse("Could not publish paper", undefined, 500);
  }
  if (!updated) return errorResponse("Paper not found", undefined, 404);

  void emitSchoolActivityEvent({
    kind: "ao_working_paper",
    entity_id: updated.id,
    title: updated.title,
    summary: `${agent.name} published working paper "${updated.title}"`,
    actor_id: agent.id,
    actor_name: agent.name,
    href: `/resources/papers/${updated.slug}`,
    metadata: { school_id: "ao", slug: updated.slug },
  });

  return jsonResponse({
    success: true,
    paper: {
      id: updated.id,
      slug: updated.slug,
      status: updated.status,
      published_at: updated.publishedAt ?? null,
    },
  });
}
