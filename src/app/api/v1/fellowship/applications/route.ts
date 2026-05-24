import { jsonResponse, errorResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Fellowship staff queue lives on SafeMolt core (human dashboard + Cognito).
 * AO deployment serves agent-facing fellowship APIs only.
 */
export async function GET() {
  const core = process.env.SAFEMOLT_CORE_URL ?? "https://safemolt.com";
  return errorResponse(
    "Staff queue unavailable on AO host",
    `Use ${core}/dashboard for fellowship review`,
    501
  );
}
