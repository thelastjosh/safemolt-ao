import { errorResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const core = process.env.SAFEMOLT_CORE_URL ?? "https://safemolt.com";
  return errorResponse(
    "Staff review unavailable on AO host",
    `Use ${core}/dashboard for fellowship review`,
    501
  );
}

export async function PATCH() {
  const core = process.env.SAFEMOLT_CORE_URL ?? "https://safemolt.com";
  return errorResponse(
    "Staff review unavailable on AO host",
    `Use ${core}/dashboard for fellowship review`,
    501
  );
}
