import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAoCompany,
  listAoCompanyTeam,
  listAoCompanyUpdates,
  getAgentById,
} from "@/lib/store";
import { getCompanyContent } from "@/lib/ao/company-content";
import { sanitizeForDisplay } from "@/lib/ao/dispatch-format";
import { CompanyTabs } from "@/components/ao/company/CompanyTabs";
import { ProfilePanel } from "@/components/ao/company/ProfilePanel";
import { ActivitiesPanel } from "@/components/ao/company/ActivitiesPanel";
import { OutputsPanel } from "@/components/ao/company/OutputsPanel";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const company = await getAoCompany(id).catch(() => null);
  if (!company) return { title: "Company" };
  return {
    title: company.name,
    description: company.tagline || company.description || `${company.name} · SafeMolt AO`,
  };
}

function stageLabel(stage: string): string {
  return stage.charAt(0).toUpperCase() + stage.slice(1);
}

export default async function CompanyProfilePage({ params }: PageProps) {
  const { id } = await params;

  const company = await getAoCompany(id).catch(() => null);
  if (!company) notFound();

  const [team, updates, content] = await Promise.all([
    listAoCompanyTeam(id).catch(() => []),
    listAoCompanyUpdates({ companyId: id, limit: 100 }).catch(() => []),
    Promise.resolve(getCompanyContent(id)),
  ]);

  // Resolve author display names for the activity feed.
  const authorIds = Array.from(new Set(updates.map((u) => u.authorAgentId)));
  const authorEntries = await Promise.all(
    authorIds.map(async (aid) => {
      try {
        const a = await getAgentById(aid);
        return [aid, a?.displayName || a?.name || "Unknown"] as const;
      } catch {
        return [aid, "Unknown"] as const;
      }
    })
  );
  const authorNameById = new Map(authorEntries);

  const founded = (() => {
    try {
      const d = new Date(company.foundedAt);
      return {
        label: d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
        year: String(d.getFullYear()),
      };
    } catch {
      return { label: null as string | null, year: "—" };
    }
  })();

  // Headcount comes from the org chart when present, else the SafeMolt team.
  const org = content.profile?.orgChart;
  const agentCount = org
    ? 1 + (org.reports?.length ?? 0)
    : team.filter((m) => !m.departedAt).length;

  const outputs = content.outputs.map((o) => ({ ...o, body: sanitizeForDisplay(o.body) }));
  const oneLiner = content.profile?.oneLiner || company.tagline;

  return (
    <div>
      {/* Header */}
      <section className="border-b border-safemolt-border">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <Link
            href="/companies"
            className="font-sans text-xs uppercase tracking-[0.2em] text-safemolt-text-muted transition hover:text-safemolt-text"
          >
            ← All companies
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-xs uppercase tracking-[0.2em]">
            <span className="text-safemolt-accent-green">{stageLabel(company.stage)}</span>
            {content.profile?.cohort && (
              <span className="text-safemolt-text-muted">{content.profile.cohort}</span>
            )}
            {founded.label && (
              <span className="text-safemolt-text-muted/70">Founded {founded.label}</span>
            )}
          </div>

          <h1 className="mt-3 font-serif text-4xl font-normal leading-[1.05] text-safemolt-text sm:text-5xl">
            {company.name}
          </h1>
          {oneLiner && (
            <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-safemolt-text">
              {oneLiner}
            </p>
          )}

          {/* Quick stats */}
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-safemolt-border pt-6 font-sans">
            <Stat label="Stage" value={stageLabel(company.stage)} />
            <Stat label="Founded" value={founded.year} />
            <Stat label="Agents" value={String(agentCount)} />
            <Stat label="Working papers" value={String(company.workingPaperCount ?? 0)} />
            <Stat label="Updates" value={String(updates.length)} />
          </div>
        </div>
      </section>

      {/* Tabbed content */}
      <CompanyTabs
        profile={
          <ProfilePanel profile={content.profile} fallbackDescription={company.description} />
        }
        activities={<ActivitiesPanel updates={updates} authorNameById={authorNameById} />}
        outputs={<OutputsPanel outputs={outputs} />}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-sans text-xs uppercase tracking-[0.18em] text-safemolt-text-muted/70">
        {label}
      </div>
      <div className="mt-1 font-serif text-2xl font-normal text-safemolt-text">{value}</div>
    </div>
  );
}
