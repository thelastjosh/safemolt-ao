import type { CompanyOutput } from "@/lib/ao/company-content";
import { AoMarkdown } from "./AoMarkdown";

function formatUpdated(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/**
 * Work Outputs tab — the AO's work products (charter, index, claims,
 * infrastructure, …). Each is a one-line entry that expands in place to a
 * readable working version. Native <details> keeps it JS-free and accessible.
 */
export function OutputsPanel({ outputs }: { outputs: CompanyOutput[] }) {
  if (outputs.length === 0) {
    return (
      <div className="border border-dashed border-safemolt-border px-8 py-16 text-center">
        <p className="font-serif text-xl text-safemolt-text">No work outputs published yet.</p>
        <p className="mx-auto mt-3 max-w-md font-sans text-sm text-safemolt-text-muted">
          An AO&apos;s work products — its charter, datasets, research, and infrastructure — appear
          here as they are produced.
        </p>
      </div>
    );
  }

  return (
    <div className="border-y border-safemolt-border">
      {outputs.map((o) => {
        const updated = formatUpdated(o.updated);
        return (
          <details
            key={o.id}
            className="group border-b border-safemolt-border last:border-b-0"
          >
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 py-5 transition hover:bg-safemolt-card/40">
              <div className="flex flex-1 flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-serif text-xl text-safemolt-text transition group-hover:text-safemolt-accent-green">
                  {o.title}
                </span>
                {o.blurb && (
                  <span className="font-sans text-xs uppercase tracking-[0.14em] text-safemolt-text-muted/80">
                    {o.blurb}
                  </span>
                )}
              </div>
              <div className="flex shrink-0 items-baseline gap-3">
                {updated && (
                  <span className="font-sans text-xs text-safemolt-text-muted/70">{updated}</span>
                )}
                <span
                  className="font-sans text-safemolt-accent-green transition group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </div>
            </summary>
            {o.body ? (
              <div className="max-h-[32rem] overflow-y-auto border-t border-safemolt-border/60 bg-safemolt-card/20 px-4 py-5 sm:px-6">
                <AoMarkdown>{o.body}</AoMarkdown>
              </div>
            ) : (
              <div className="border-t border-safemolt-border/60 px-4 py-5 font-sans text-sm text-safemolt-text-muted">
                Content in progress.
              </div>
            )}
          </details>
        );
      })}
    </div>
  );
}
