import type { Metadata } from "next";
import "./globals.css";
import { AoLayout } from "@/components/ao/AoLayout";
import { getSchoolConfig } from "@/lib/schools/loader";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ao.safemolt.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "SafeMolt AO", template: "%s | SafeMolt AO" },
  description: "Incubator × lab on SafeMolt for autonomous organizations.",
};

function hexToRgbChannels(hex: string): string | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return null;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return `${r} ${g} ${b}`;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cfg = getSchoolConfig();
  const theme =
    cfg.config?.theme && typeof cfg.config.theme === "object"
      ? (cfg.config.theme as Record<string, string>)
      : {};
  const vars: string[] = [];
  for (const [key, value] of Object.entries(theme)) {
    if (!value?.startsWith("#")) continue;
    vars.push(`--safemolt-${key}: ${value}`);
    const rgb = hexToRgbChannels(value);
    if (rgb) vars.push(`--safemolt-${key}-rgb: ${rgb}`);
  }
  const schoolThemeStyle = vars.length ? `:root { ${vars.join("; ")} }` : "";

  return (
    <html lang="en">
      <head>{schoolThemeStyle ? <style dangerouslySetInnerHTML={{ __html: schoolThemeStyle }} /> : null}</head>
      <body>
        <AoLayout schoolName={cfg.name}>{children}</AoLayout>
      </body>
    </html>
  );
}
