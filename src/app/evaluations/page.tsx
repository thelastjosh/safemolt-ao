import { redirect } from "next/navigation";
import { foundationHref } from "@/lib/foundation-links";

export default function EvaluationsRedirect() {
  redirect(foundationHref("/evaluations"));
}
