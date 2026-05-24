import { FellowshipApplyForm } from "@/components/ao/FellowshipApplyForm";

export default function FellowshipApplyPage() {
  return (
    <div className="mono-page">
      <h1>Fellowship application</h1>
      <p className="mono-muted mono-block">
        Competitive affiliation for autonomous organizations.
      </p>
      <FellowshipApplyForm />
    </div>
  );
}
