import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, User as UserIcon } from "lucide-react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

type ProfileForm = {
  name: string;
  username: string;
  email: string;
  contactNumber: string;
};

const getStorageKey = (uid: string | null) => `traveloop-profile-${uid || "guest"}`;

export default function ProfilePersonal() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    username: "",
    email: "",
    contactNumber: "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const saved = localStorage.getItem(getStorageKey(user.uid));
    const initialForm: ProfileForm = {
      name: user.displayName || "",
      username: "",
      email: user.email || "",
      contactNumber: "",
    };

    if (saved) {
      try {
        setForm({ ...initialForm, ...(JSON.parse(saved) as ProfileForm) });
      } catch {
        setForm(initialForm);
      }
      return;
    }

    setForm(initialForm);
  }, [user]);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    try {
      localStorage.setItem(getStorageKey(user.uid), JSON.stringify(form));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Profile save failed", err);
      setError("Unable to save profile locally. Please check your browser settings.");
    }
  };

  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-on-background">Loading profile...</div>;
  }

  return (
    <main className="flex-1 w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl pb-24 md:pb-xl">
      <div className="mb-lg flex items-center gap-md">
        <Link to="/profile" className="inline-flex items-center gap-2 text-primary hover:text-primary-container transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>
      </div>

      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
        <div className="flex flex-col gap-sm mb-lg">
          <div className="flex items-center gap-sm text-on-surface">
            <UserIcon className="w-5 h-5 text-primary" />
            <h1 className="font-headline-lg text-headline-lg">Personal Information</h1>
          </div>
          <p className="font-body-md text-body-md text-secondary">Update your basic profile details below. Changes are saved locally inside the app.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-lg">
          <div className="grid gap-sm">
            <label htmlFor="name" className="font-label-md text-label-md text-on-surface">Name</label>
            <input
              id="name"
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
              className="bg-background border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Your full name"
              autoComplete="name"
            />
          </div>

          <div className="grid gap-sm">
            <label htmlFor="username" className="font-label-md text-label-md text-on-surface">Username</label>
            <input
              id="username"
              value={form.username}
              onChange={(event) => handleChange("username", event.target.value)}
              className="bg-background border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Preferred username"
              autoComplete="username"
            />
          </div>

          <div className="grid gap-sm">
            <label htmlFor="email" className="font-label-md text-label-md text-on-surface">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              className="bg-background border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Email address"
              autoComplete="email"
            />
          </div>

          <div className="grid gap-sm">
            <label htmlFor="contactNumber" className="font-label-md text-label-md text-on-surface">Contact Number</label>
            <input
              id="contactNumber"
              type="tel"
              value={form.contactNumber}
              onChange={(event) => handleChange("contactNumber", event.target.value)}
              className="bg-background border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Phone number"
              autoComplete="tel"
            />
          </div>

          <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              className="bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-lg hover:bg-primary-container transition-colors shadow-sm w-full sm:w-auto"
            >
              Save changes
            </button>
            {saved && <span className="font-body-sm text-success">Saved successfully.</span>}
          </div>
          {error && <p className="text-error font-body-sm mt-sm">{error}</p>}
        </form>
      </section>
    </main>
  );
}
