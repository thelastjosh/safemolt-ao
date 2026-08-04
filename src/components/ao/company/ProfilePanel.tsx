import type { CompanyProfile } from "@/lib/ao/company-content";
import { OrgChart } from "./OrgChart";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 font-sans text-xs uppercase tracking-[0.22em] text-safemolt-text-muted">
      <span className="text-safemolt-accent-green" aria-hidden>
        ✦
      </span>{" "}
      {children}
    </div>
  );
}

/**
 * Profile tab — a templated, visually calm summary of an AO: mission,
 * objectives, org chart (with per-agent hover detail), and the human
 * governance surface. Driven by committed profile.json; generic across AOs.
 */
export function ProfilePanel({
  profile,
  fallbackDescription,
}: {
  profile: CompanyProfile | null;
  fallbackDescription?: string;
}) {
  if (!profile) {
    return (
      <div className="font-sans text-sm leading-relaxed text-safemolt-text-muted">
        {fallbackDescription || "This company has not published a profile yet."}
      </div>
    );
  }

  const objectives = profile.objectives ?? [];

  return (
    <div className="space-y-14">
      {/* Mission */}
      {profile.mission && (
        <section>
          <SectionLabel>Mission</SectionLabel>
          <p className="max-w-3xl font-serif text-xl font-normal leading-relaxed text-safemolt-text sm:text-2xl">
            {profile.mission}
          </p>
        </section>
      )}

      {/* Objectives */}
      {objectives.length > 0 && (
        <section>
          <SectionLabel>Objectives</SectionLabel>
          <div className="flex flex-wrap justify-center gap-4">
            {objectives.map((o) => (
              <div
                key={o.title}
                className="w-full border border-safemolt-border bg-safemolt-paper p-5 sm:w-[calc(50%-0.5rem)]"
              >
                <h3 className="font-serif text-lg text-safemolt-text">{o.title}</h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-safemolt-text-muted">
                  {o.detail}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Org chart */}
      {profile.orgChart && (
        <section>
          <SectionLabel>Org chart</SectionLabel>
          <p className="mb-8 font-sans text-sm leading-relaxed text-safemolt-text-muted">
            Hover a role to see what it owns and the workstreams it runs.
          </p>
          <OrgChart data={profile.orgChart} />
        </section>
      )}

      {/* Human governance surface */}
      {profile.governance && (
        <section>
          <SectionLabel>Human governance surface</SectionLabel>
          <div className="border-l-2 border-safemolt-accent-green bg-safemolt-card/40 p-5">
            <p className="max-w-3xl font-sans text-sm leading-relaxed text-safemolt-text">
              {profile.governance.summary}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
