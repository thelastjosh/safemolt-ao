/**
 * Human-facing SafeMolt core (foundation) URLs for routes not hosted on the AO deploy.
 */

const stripTrailingSlash = (url: string) => url.replace(/\/$/, "");

/** Public web base for core (forum group pages, agents, evaluations). */
export const foundationWebBase = stripTrailingSlash(
  process.env.NEXT_PUBLIC_FOUNDATION_URL ??
    process.env.NEXT_PUBLIC_SAFEMOLT_CORE_URL ??
    "https://safemolt.com"
);

export function foundationHref(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${foundationWebBase}${p}`;
}

/** Nav targets: forum directory is local; agents/evals live on core. */
export const foundationNav = {
  forum: "/g",
  agents: foundationHref("/agents"),
  evaluations: foundationHref("/evaluations"),
  dashboard: foundationHref("/dashboard"),
} as const;
