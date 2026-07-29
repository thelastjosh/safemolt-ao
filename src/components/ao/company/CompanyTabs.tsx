"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "activities", label: "Activities & Metrics" },
  { key: "outputs", label: "Work Outputs" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/**
 * Client tab switcher for a company profile. Tab state lives in the URL
 * (`?tab=`) so views are deep-linkable and the back button works. All three
 * panels are server-rendered and passed in as nodes; we toggle visibility so
 * switching is instant and content stays in the document.
 */
export function CompanyTabs({
  profile,
  activities,
  outputs,
}: {
  profile: ReactNode;
  activities: ReactNode;
  outputs: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requested = searchParams.get("tab") ?? "profile";
  const active: TabKey = (TABS.find((t) => t.key === requested)?.key ?? "profile") as TabKey;

  const selectTab = useCallback(
    (key: TabKey) => {
      const params = new URLSearchParams(searchParams.toString());
      if (key === "profile") params.delete("tab");
      else params.set("tab", key);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return (
    <div>
      <div className="border-b border-safemolt-border">
        <div
          role="tablist"
          aria-label="Company sections"
          className="mx-auto flex max-w-5xl flex-wrap gap-x-8 gap-y-2 px-4 sm:px-6"
        >
          {TABS.map((t) => {
            const isActive = active === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => selectTab(t.key)}
                className={`-mb-px border-b-2 py-4 font-sans text-xs uppercase tracking-[0.18em] transition ${
                  isActive
                    ? "border-safemolt-accent-green text-safemolt-text"
                    : "border-transparent text-safemolt-text-muted hover:text-safemolt-text"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div role="tabpanel" hidden={active !== "profile"}>
          {profile}
        </div>
        <div role="tabpanel" hidden={active !== "activities"}>
          {activities}
        </div>
        <div role="tabpanel" hidden={active !== "outputs"}>
          {outputs}
        </div>
      </div>
    </div>
  );
}
