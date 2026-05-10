import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, ToggleLeft, ToggleRight } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Trip } from "@/lib/types";
import { buildNotifications, getNotificationSettings, getNotificationStorageKey, NotificationItem } from "@/lib/notifications";

type NotificationSettings = {
  enabled: boolean;
};

export default function ProfileNotifications() {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({ enabled: false });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const savedSettings = getNotificationSettings(user.uid);
    setSettings(savedSettings);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(getNotificationStorageKey(user.uid), JSON.stringify(settings));
  }, [settings, user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const tripsQuery = query(collection(db, "trips"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(
      tripsQuery,
      (snapshot) => {
        const tripsData: Trip[] = [];
        snapshot.forEach((doc) => tripsData.push({ id: doc.id, ...doc.data() } as Trip));
        setNotifications(buildNotifications(tripsData));
      },
      (error) => {
        console.error("Error loading trip notifications:", error);
        setNotifications([]);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const toggleNotifications = () => {
    setSettings((current) => ({ enabled: !current.enabled }));
  };

  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-on-background">Loading notifications...</div>;
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
            <Bell className="w-5 h-5 text-primary" />
            <h1 className="font-headline-lg text-headline-lg">Notifications</h1>
          </div>
          <p className="font-body-md text-body-md text-secondary">Control whether you receive reminders, travel updates, payment reminders, and trip alerts based on your upcoming trips.</p>
        </div>

        <div className="rounded-3xl bg-background border border-outline-variant p-lg flex flex-col gap-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-label-md text-label-md text-secondary uppercase tracking-wider">Notification status</p>
            <p className={`font-body-lg text-body-lg mt-2 ${settings.enabled ? "text-success" : "text-error"}`}>
              {settings.enabled ? "Notifications are enabled" : "Notifications are disabled"}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleNotifications}
            className={`inline-flex items-center gap-2 rounded-full px-lg py-sm font-label-md text-label-md transition-colors ${settings.enabled ? "bg-success text-on-success hover:bg-success-container" : "bg-error text-on-error hover:bg-error-container"}`}
          >
            {settings.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            {settings.enabled ? "Disable Notifications" : "Enable Notifications"}
          </button>
        </div>

        {!settings.enabled && (
          <div className="mt-lg rounded-3xl bg-error-container/25 border border-error/20 p-lg text-error">
            Notifications are turned off. Enable them to receive reminders, travel updates, payment reminders, and trip alerts for your upcoming trips.
          </div>
        )}

        <div className="mt-lg grid gap-lg lg:grid-cols-[1fr_1.5fr]">
          <div className="rounded-3xl bg-background border border-outline-variant p-lg">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-3">Notification types</h2>
            <ul className="space-y-3 text-body-md text-body-md text-on-surface-variant">
              <li>• <span className="font-medium text-on-surface">Reminders</span> for trips starting in two days or sooner.</li>
              <li>• <span className="font-medium text-on-surface">Travel updates</span> when departure is near and itinerary planning is due.</li>
              <li>• <span className="font-medium text-on-surface">Payment reminders</span> before departure to settle bookings and expenses.</li>
              <li>• <span className="font-medium text-on-surface">Trip alerts</span> when your next trip is approaching and action is needed.</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-background border border-outline-variant p-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Upcoming alerts</h2>
                <p className="text-secondary text-body-sm mt-1">{notifications.length} generated notification{notifications.length === 1 ? "" : "s"}</p>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-label-sm ${settings.enabled ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                {settings.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>

            {notifications.length > 0 ? (
              <ul className="space-y-3">
                {notifications.map((note) => (
                  <li key={note.id} className="rounded-3xl border border-outline-variant p-md bg-surface-container-lowest">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <span className="inline-flex rounded-full bg-primary/10 text-primary px-3 py-1 text-label-sm">{note.type}</span>
                      <span className="text-secondary text-body-sm">{note.startDate}</span>
                    </div>
                    <h3 className="font-body-md text-body-md text-on-surface mt-3">{note.title}</h3>
                    <p className="text-body-sm text-on-surface-variant mt-2">{note.message}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-md text-secondary">No upcoming alerts found. Create a trip to start receiving reminders and alerts as your departure date approaches.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
