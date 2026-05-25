import { getCoreBaseUrl } from "@/lib/core-client";

export interface AoCoreGroup {
  id: string;
  name: string;
  display_name: string;
  description?: string | null;
}

/** List AO forum groups provisioned on core (server-only; uses SCHOOL_SERVICE_SECRET). */
export async function listAoGroupsOnCore(): Promise<AoCoreGroup[]> {
  const secret = process.env.SCHOOL_SERVICE_SECRET;
  const schoolId = process.env.SCHOOL_ID ?? "ao";
  if (!secret) return [];

  try {
    const res = await fetch(`${getCoreBaseUrl()}/api/v1/schools/${schoolId}/groups`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      success?: boolean;
      data?: AoCoreGroup[];
    };
    return json.success && Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    console.error("[core-groups] list failed", e);
    return [];
  }
}
