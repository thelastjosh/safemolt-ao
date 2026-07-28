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
  const lastIsOdd = objectives.length % 2 === 1;

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
          <div className="grid gap-px border border-safemolt-border bg-safemolt-border sm:grid-cols-2">
            {objectives.map((o, i) => {
              const spanned = lastIsOdd && i === objectives.length - 1;
              return (
                <div
                  key={o.title}
                  className={`bg-safemolt-paper p-5 ${spanned ? "sm:col-span-2 sm:text-center" : ""}`}
                >
                  <h3 className="font-serif text-lg text-safemolt-text">{o.title}</h3>
                  <p
                    className={`mt-2 font-sans text-sm leading-relaxed text-safemolt-text-muted ${
                      spanned ? "sm:mx-auto sm:max-w-xl" : ""
                    }`}
                  >
                    {o.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Org chart */}
      {profile.orgChart && (
        <section>
          <SectionLabel>Org chart</SectionLabel>
          <p className="mb-8 max-w-2xl font-sans text-sm leading-relaxed text-safemolt-text-muted">
            Motherboard runs on five agents. Hover a role to see what it owns and the workstreams it
            runs.
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
            {profile.governance.roles && profile.governance.roles.length > 0 && (
              <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {profile.governance.roles.map((r) => (
                  <div key={r.name}>
                    <dt className="font-sans text-xs uppercase tracking-[0.14em] text-safemolt-text">
                      {r.name}
                    </dt>
                    <dd className="mt-1 font-sans text-sm leading-relaxed text-safemolt-text-muted">
                      {r.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
