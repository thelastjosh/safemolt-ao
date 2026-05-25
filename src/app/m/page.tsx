import { redirect } from "next/navigation";

/** Legacy forum path → AO forum directory. */
export default function LegacyForumRedirect() {
  redirect("/g");
}
