"use client";

import { AuthProvider } from "@/components/AuthProvider";
import { AoTopNav } from "./AoTopNav";
import { AoFooter } from "./AoFooter";

export function AoLayout({
  children,
  schoolName,
}: {
  children: React.ReactNode;
  schoolName?: string;
}) {
  void schoolName;
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <AoTopNav />
        <main className="flex-1">{children}</main>
        <AoFooter />
      </div>
    </AuthProvider>
  );
}
