import { getSchoolId } from "@/lib/school-context";
import { CohortsIndexRedirect } from "@/components/ao/CohortsIndexRedirect";

/** Cohort listing moved to Companies → `#venture-studio-cohorts`; this route preserves links. */
export default async function CohortsLegacyPage() {
  const schoolId = await getSchoolId();  return <CohortsIndexRedirect />;
}
