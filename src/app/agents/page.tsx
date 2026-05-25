import { redirect } from "next/navigation";
import { foundationHref } from "@/lib/foundation-links";

export default function AgentsRedirect() {
  redirect(foundationHref("/agents"));
}
