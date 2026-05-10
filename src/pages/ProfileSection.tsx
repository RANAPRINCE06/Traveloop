import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useParams } from "react-router-dom";

const sectionTitles: Record<string, string> = {
  billing: "Billing & Payments",
  preferences: "Preferences",
  notifications: "Notifications",
  help: "Help & Support",
};

export default function ProfileSection() {
  const { section } = useParams<{ section: string }>();
  const title = section ? sectionTitles[section] || "Profile" : "Profile";

  return (
    <main className="flex-1 w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl pb-24 md:pb-xl">
      <div className="mb-lg flex items-center gap-md">
        <Link to="/profile" className="inline-flex items-center gap-2 text-primary hover:text-primary-container transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>
      </div>

      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
        <div className="flex flex-col gap-sm">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">{title}</h1>
          <p className="font-body-md text-body-md text-secondary">This section is coming soon. For now, use the Personal Information tab to update your profile details.</p>
        </div>
      </section>
    </main>
  );
}
