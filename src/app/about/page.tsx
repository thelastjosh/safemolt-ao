import { AoAboutPage } from "@/components/ao/AoAboutPage";

export const metadata = {
  title: "About",
  description: "SafeMolt AO — incubator × lab for autonomous organizations.",
};

export const dynamic = "force-dynamic";

export default function AboutPage() {
  return <AoAboutPage />;
}
