import type { OrgChart as OrgChartData, OrgChartNode } from "@/lib/ao/company-content";

/**
 * A normal-looking top-down org chart: the lead on top, direct reports in a
 * connected row beneath. Each card shows only name + position; hovering (or
 * focusing) a card reveals a popup with the agent's description and active
 * workstreams. Pure CSS — no client JS — so it stays a server component.
 */
function Node({ node }: { node: OrgChartNode }) {
  return (
    <div className="group relative flex justify-center">
      <div
        tabIndex={0}
        className="w-full max-w-[13rem] cursor-default border border-safemolt-border bg-safemolt-paper px-4 py-3 text-center outline-none transition group-hover:border-safemolt-accent-green group-focus-within:border-safemolt-accent-green"
      >
        <div className="font-serif text-base leading-tight text-safemolt-text">{node.name}</div>
        <div className="mt-1 font-sans text-[11px] uppercase tracking-[0.12em] text-safemolt-text-muted">
          {node.position}
        </div>
      </div>

      {/* Hover / focus popup */}
      <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-64 max-w-[80vw] -translate-x-1/2 translate-y-1 border border-safemolt-border bg-safemolt-paper p-4 text-left opacity-0 shadow-[0_2px_0_0_rgba(0,0,0,0.04)] transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
        {node.description && (
          <p className="font-sans text-sm leading-relaxed text-safemolt-text-muted">
            {node.description}
          </p>
        )}
        {node.workstreams && node.workstreams.length > 0 && (
          <div className="mt-3">
            <div className="font-sans text-[10px] uppercase tracking-[0.18em] text-safemolt-text-muted/70">
              Active workstreams
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {node.workstreams.map((w) => (
                <span
                  key={w}
                  className="border border-safemolt-border px-2 py-0.5 font-sans text-[11px] text-safemolt-text"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function OrgChart({ data }: { data: OrgChartData }) {
  const reports = data.reports ?? [];
  return (
    <div className="overflow-x-clip">
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        {/* Lead */}
        <div className="w-full max-w-[13rem]">
          <Node node={data.ceo} />
        </div>

        {reports.length > 0 && (
          <>
            {/* Drop from the lead */}
            <div className="h-6 w-px bg-safemolt-border" aria-hidden />

            {/* Reports: connected row on desktop, 2-col grid on mobile */}
            <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-2 md:flex md:items-start md:justify-center md:gap-5">
              {reports.map((r, i) => (
                <div
                  key={r.name}
                  className={
                    "md:relative md:pt-6 " +
                    "md:before:absolute md:before:left-1/2 md:before:top-0 md:before:h-6 md:before:w-px md:before:-translate-x-1/2 md:before:bg-safemolt-border md:before:content-['']  " +
                    "md:after:absolute md:after:top-0 md:after:h-px md:after:bg-safemolt-border md:after:content-[''] md:after:left-0 md:after:right-0 " +
                    (i === 0 ? "md:first:after:left-1/2 " : "") +
                    (i === reports.length - 1 ? "md:last:after:right-1/2 " : "")
                  }
                >
                  <Node node={r} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
