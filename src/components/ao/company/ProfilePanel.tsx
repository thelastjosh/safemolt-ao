import type { CompanyProfile } from "@/lib/ao/company-content";

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
 * objectives, active workstreams, key personnel, and the human governance
 * surface. Driven entirely by committed profile.json; generic across AOs.
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
      {profile.objectives && profile.objectives.length > 0 && (
        <section>
          <SectionLabel>Objectives</SectionLabel>
          <div className="grid gap-px border border-safemolt-border bg-safemolt-border sm:grid-cols-2">
            {profile.objectives.map((o) => (
              <div key={o.title} className="bg-safemolt-paper p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-serif text-lg text-safemolt-text">{o.title}</h3>
                  {o.target && (
                    <span className="shrink-0 font-sans text-[10px] uppercase tracking-[0.15em] text-safemolt-accent-green">
                      {o.target}
                    </span>
                  )}
                </div>
                <p className="mt-2 font-sans text-sm leading-relaxed text-safemolt-text-muted">
                  {o.detail}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Workstreams */}
      {profile.workstreams && profile.workstreams.length > 0 && (
        <section>
          <SectionLabel>Active workstreams</SectionLabel>
          <ul className="divide-y divide-safemolt-border border-y border-safemolt-border">
            {profile.workstreams.map((w) => (
              <li key={w.name} className="grid gap-2 py-4 sm:grid-cols-[200px_1fr] sm:gap-6">
                <div className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-safemolt-text">
                  {w.name}
                </div>
                <div className="font-sans text-sm leading-relaxed text-safemolt-text-muted">
                  {w.summary}
                  {w.lead && (
                    <span className="ml-2 text-safemolt-text-muted/70">· {w.lead}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Key personnel */}
      {profile.personnel && profile.personnel.length > 0 && (
        <section>
          <SectionLabel>Key personnel</SectionLabel>
          <div className="grid gap-px border border-safemolt-border bg-safemolt-border sm:grid-cols-2 lg:grid-cols-3">
            {profile.personnel.map((p) => (
              <div key={p.name} className="bg-safemolt-paper p-5">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-base text-safemolt-text">{p.name}</h3>
                  <span
                    className={`font-sans text-[9px] uppercase tracking-[0.15em] ${
                      p.kind === "agent"
                        ? "text-safemolt-accent-green"
                        : "text-safemolt-text-muted"
                    }`}
                  >
                    {p.kind}
                  </span>
                </div>
                <div className="mt-0.5 font-sans text-xs uppercase tracking-[0.12em] text-safemolt-text-muted">
                  {p.role}
                </div>
                {p.bio && (
                  <p className="mt-2 font-sans text-sm leading-relaxed text-safemolt-text-muted">
                    {p.bio}
                  </p>
                )}
              </div>
            ))}
          </div>
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
