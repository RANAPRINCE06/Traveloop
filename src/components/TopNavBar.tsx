import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, Bell } from "lucide-react";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { buildNotifications, getNotificationSettings } from "@/lib/notifications";

export function TopNavBar() {
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/" },
    { name: "My Trips", path: "/trips" },
    { name: "Profile", path: "/profile" },
  ];

  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    let unsubscribeTrips: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setNotificationsEnabled(false);
        setNotificationCount(0);
        if (unsubscribeTrips) {
          unsubscribeTrips();
          unsubscribeTrips = null;
        }
        return;
      }

      setNotificationsEnabled(getNotificationSettings(currentUser.uid).enabled);
      if (unsubscribeTrips) {
        unsubscribeTrips();
      }

      const tripsQuery = query(collection(db, "trips"), where("userId", "==", currentUser.uid));
      unsubscribeTrips = onSnapshot(
        tripsQuery,
        (snapshot) => {
          const trips: any[] = [];
          snapshot.forEach((doc) => trips.push({ id: doc.id, ...doc.data() }));
          setNotificationCount(buildNotifications(trips).length);
        },
        () => {
          setNotificationCount(0);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeTrips) {
        unsubscribeTrips();
      }
    };
  }, []);

  return (
    <header className="nav-glass">
      <div className="flex items-center justify-between px-margin-mobile md:px-margin-desktop py-md max-w-[1240px] mx-auto w-full">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-headline-md font-headline-lg text-primary tracking-tight hover:text-on-primary">
            Traveloop
          </Link>
          <div className="hidden md:flex items-center gap-3 text-on-background/70 text-sm">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-primary">✦</span>
            Luxury travel planning for modern explorers
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-5">
          {links.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "font-label-md text-label-md px-4 py-2 rounded-[20px] transition-all duration-300",
                  isActive
                    ? "bg-surface-container-low text-primary shadow-[0_10px_30px_rgba(77,168,255,0.18)]"
                    : "text-on-background/70 hover:text-primary hover:bg-white/5"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/profile/notifications"
            className="relative inline-flex items-center justify-center rounded-[20px] border border-white/10 bg-white/5 text-on-background transition-all duration-300 px-4 py-2 hover:bg-white/10"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-primary" />
            {notificationCount > 0 && notificationsEnabled && (
              <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-tertiary text-on-tertiary text-[11px] px-1">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Link>
          <Link
            to="/create"
            className="premium-button"
          >
            Plan New Trip
          </Link>
        </div>

        <button className="md:hidden text-on-background/70 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
