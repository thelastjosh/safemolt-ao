"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({
  children,
  session = null,
}: {
  children: React.ReactNode;
  session?: null;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
