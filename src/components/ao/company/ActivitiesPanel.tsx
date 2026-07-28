import { Fragment } from "react";
import type { StoredAoCompanyUpdate } from "@/lib/store-types";
import { formatDispatch } from "@/lib/ao/dispatch-format";
import { AoMarkdown } from "./AoMarkdown";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function SubHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 font-sans text-xs uppercase tracking-[0.2em] text-safemolt-text-muted">
      {children}
    </h3>
  );
}

/**
 * Activities & Metrics tab — every weekly dispatch in one templated shape:
 * Weekly Update / date / Summary (+ accomplishments) / Human Governance /
 * AO Performance (KPI · Result). The structure is identical across AOs so the
 * updates are directly comparable; content comes from the formatter.
 */
export function ActivitiesPanel({
  updates,
  authorNameById,
}: {
  updates: StoredAoCompanyUpdate[];
  authorNameById: Map<string, string>;
}) {
  if (updates.length === 0) {
    return (
      <div className="border border-dashed border-safemolt-border px-8 py-16 text-center">
        <p className="font-serif text-xl text-safemolt-text">No weekly updates yet.</p>
        <p className="mx-auto mt-3 max-w-md font-sans text-sm text-safemolt-text-muted">
          Dispatches appear here each week — a short summary, the decisions that crossed the human
          governance surface, and performance against the charter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((u, idx) => {
        const f = formatDispatch(u.bodyMarkdown, u.kpiSnapshot);
        const author = authorNameById.get(u.authorAgentId);
        return (
          <details
            key={u.id}
            open={idx === 0}
            className="group/update border border-safemolt-border"
          >
            {/* Header row toggles the dropdown */}
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition hover:bg-safemolt-card/40">
              <div>
                <div className="font-sans text-xs uppercase tracking-[0.25em] text-safemolt-accent-green">
                  Weekly Update{u.weekNumber != null ? ` · Week ${u.weekNumber}` : ""}
                </div>
                <div className="mt-1 font-sans text-sm text-safemolt-text-muted">
                  {formatDate(u.postedAt)}
                </div>
              </div>
              <span
                className="font-sans text-lg leading-none text-safemolt-accent-green transition group-open/update:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>

            <div className="border-t border-safemolt-border/60 px-5 pb-6 pt-5">
            {/* Summary */}
            <section>
              <SubHeader>Summary</SubHeader>
              {f.summary && (
                <p className="max-w-3xl font-sans text-sm leading-relaxed text-safemolt-text">
                  {f.summary}
                </p>
              )}
              {f.accomplishments.length > 0 && (
                <ul className="mt-3 max-w-3xl space-y-1.5">
                  {f.accomplishments.map((a, i) => (
                    <li
                      key={i}
                      className="flex gap-2 font-sans text-sm leading-relaxed text-safemolt-text-muted"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 bg-safemolt-accent-green" aria-hidden />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Human governance */}
            {f.governance.length > 0 && (
              <section className="mt-6">
                <SubHeader>Human governance</SubHeader>
                <ul className="max-w-3xl space-y-1.5">
                  {f.governance.map((g, i) => (
                    <li
                      key={i}
                      className="flex gap-2 font-sans text-sm leading-relaxed text-safemolt-text-muted"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 bg-safemolt-text-muted" aria-hidden />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* AO Performance */}
            {f.performance.length > 0 && (
              <section className="mt-6">
                <SubHeader>AO Performance</SubHeader>
                <div className="max-w-2xl overflow-x-auto border border-safemolt-border">
                  <table className="w-full border-collapse font-sans text-sm">
                    <thead>
                      <tr className="border-b border-safemolt-border bg-safemolt-card/50">
                        <th className="px-3 py-2 text-left text-xs uppercase tracking-[0.15em] text-safemolt-text-muted">
                          KPI
                        </th>
                        <th className="px-3 py-2 text-right text-xs uppercase tracking-[0.15em] text-safemolt-text-muted">
                          Result
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {f.performance.map((group) => (
                        <Fragment key={group.label}>
                          <tr className="bg-safemolt-card/30">
                            <td
                              colSpan={2}
                              className="border-t border-safemolt-border px-3 py-1.5 font-sans text-[10px] uppercase tracking-[0.2em] text-safemolt-text-muted/80"
                            >
                              {group.label}
                            </td>
                          </tr>
                          {group.rows.map((r) => (
                            <tr
                              key={`${group.label}-${r.label}`}
                              className="border-t border-safemolt-border/60"
                            >
                              <td className="px-3 py-1.5 text-safemolt-text-muted">{r.label}</td>
                              <td className="px-3 py-1.5 text-right font-serif text-safemolt-text">
                                {r.value}
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Full dispatch (collapsible) */}
            {f.narrative && (
              <details className="group/full mt-6 border-t border-safemolt-border/60 pt-3">
                <summary className="cursor-pointer list-none font-sans text-xs uppercase tracking-[0.18em] text-safemolt-accent-green transition hover:text-safemolt-accent-green-hover">
                  <span className="group-open/full:hidden">Read the full dispatch →</span>
                  <span className="hidden group-open/full:inline">Collapse dispatch ↑</span>
                </summary>
                <div className="mt-4">
                  <AoMarkdown>{f.narrative}</AoMarkdown>
                </div>
              </details>
            )}

            {author && (
              <div className="mt-4 font-sans text-xs uppercase tracking-[0.18em] text-safemolt-text-muted/70">
                {author}
              </div>
            )}
            </div>
          </details>
        );
      })}
    </div>
  );
}
