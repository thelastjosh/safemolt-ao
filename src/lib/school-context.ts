import type { FederatedAgent } from "./auth";
import { requireAdmitted } from "./auth";

export const AO_SCHOOL_ID = "ao";

export function getSchoolId(): string {
  return AO_SCHOOL_ID;
}

/** Compatibility shim for ported monolith routes. */
export function requireSchoolAccess(agent: FederatedAgent, _schoolId: string): Response | null {
  return requireAdmitted(agent);
}
