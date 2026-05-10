import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Wallet, TrendingUp, Calendar, Compass } from "lucide-react";
import { getLocalTrips } from "@/lib/localTrips";
import { auth } from "@/lib/firebase";
import { Trip } from "@/lib/types";
import { buildNotifications, getNotificationSettings } from "@/lib/notifications";

export default function Dashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const user = auth.currentUser;

  const alerts = useMemo(() => buildNotifications(trips), [trips]);

  useEffect(() => {
    const fetchTrips = () => {
      const tripsData = getLocalTrips();
      // If user is logged in, optionally filter by user.uid? No, we are making it completely local.
      tripsData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setTrips(tripsData);
    };

    fetchTrips();

    window.addEventListener("local-trips-updated", fetchTrips);
    return () => {
      window.removeEventListener("local-trips-updated", fetchTrips);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setNotificationsEnabled(false);
      return;
    }

    setNotificationsEnabled(getNotificationSettings(user.uid).enabled);
  }, [user]);

  const recentTrips = trips.slice(0, 2);

  return (
    <main className="flex-1 w-full max-w-max-width mx-auto pb-24 md:pb-0">
      <section className="px-margin-mobile md:px-margin-desktop pt-xl pb-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Welcome back, {user?.displayName?.split(' ')[0] || 'Traveler'}!</h1>
          <p className="font-body-md text-body-md text-secondary">Ready to organize your next adventure?</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Link
            to="/create"
            className="md:hidden w-full bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-lg hover:bg-primary-container transition-colors flex items-center justify-center gap-sm"
          >
            <Plus className="w-[18px] h-[18px]" />
            Plan New Trip
          </Link>
        </div>
      </section>

      <div className="px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-12 gap-lg pb-xl">
        {/* Budget Summary */}
        <div className="md:col-span-4 flex flex-col gap-lg">
          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-md shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-lg">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Budget Summary</h2>
              <Wallet className="w-6 h-6 text-secondary" />
            </div>
            <div className="mb-lg">
              <p className="font-label-md text-label-md text-secondary mb-1 uppercase tracking-wider">Total Available</p>
              <p className="font-headline-lg text-headline-lg text-primary">
                ₹3,40,000<span className="font-body-sm text-body-sm text-secondary"></span>
              </p>
            </div>
            <div className="mt-auto">
              <div className="flex justify-between font-label-md text-label-md text-secondary mb-2">
                <span>Spent: ₹1,00,000</span>
                <span>Limit: ₹4,40,000</span>
              </div>
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[22%]"></div>
              </div>
              <div className="flex items-center gap-2 mt-4 bg-surface-container-low p-3 rounded-lg border border-surface-variant">
                <TrendingUp className="w-5 h-5 text-tertiary-container" />
                <span className="font-body-sm text-body-sm text-on-surface-variant">You're on track with your saving goals this month.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trips */}
        <div className="md:col-span-8 flex flex-col gap-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Recent Trips</h2>
            <Link to="/trips" className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors">View All</Link>
          </div>
          <div className="flex overflow-x-auto hide-scrollbar gap-md md:grid md:grid-cols-2 snap-x snap-mandatory">
            {recentTrips.length === 0 ? (
              <div className="col-span-2 text-center py-xl bg-surface-container-low rounded-xl border border-outline-variant">
                <p className="font-body-md text-on-surface-variant mb-2">No trips planned.</p>
                <Link to="/create" className="text-primary hover:underline font-label-md">Create your first trip</Link>
              </div>
            ) : (
              recentTrips.map((trip) => (
                <Link key={trip.id} to={`/trips/${trip.id}`} className="min-w-[280px] md:min-w-0 bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden snap-center flex flex-col cursor-pointer group hover:border-primary transition-colors">
                  <div className="h-32 bg-surface-variant relative overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-surface-variant to-surface flex items-center justify-center text-[3rem] font-bold text-on-surface group-hover:scale-105 transition-transform duration-500">
                      {trip.name?.charAt(0).toUpperCase() || "T"}
                    </div>
                    <div className="absolute top-3 right-3 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-1 rounded text-label-md font-label-md text-on-surface">{trip.status}</div>
                  </div>
                  <div className="p-md flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{trip.name}</h3>
                      <p className="font-body-sm text-body-sm text-secondary flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {trip.startDate} - {trip.endDate}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <section className="px-margin-mobile md:px-margin-desktop mb-lg">
        <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant p-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Upcoming alerts</h2>
              <p className="text-secondary text-body-sm mt-1">{alerts.length} alert{alerts.length === 1 ? "" : "s"} generated from your upcoming trips.</p>
            </div>
            <span className={`inline-flex rounded-full px-3 py-1 text-label-sm ${notificationsEnabled ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
              {notificationsEnabled ? "Notifications enabled" : "Notifications disabled"}
            </span>
          </div>

          {notificationsEnabled ? (
            alerts.length > 0 ? (
              <ul className="space-y-3">
                {alerts.slice(0, 3).map((note) => (
                  <li key={note.id} className="rounded-3xl border border-outline-variant p-md bg-background">
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
              <p className="text-body-md text-secondary">No active trip alerts yet. Create a trip with a start date within the next 30 days to see reminders and updates.</p>
            )
          ) : (
            <div className="rounded-3xl bg-error-container/25 border border-error/20 p-lg text-error">
              Notifications are disabled. Go to your notifications settings to turn them on and receive reminders for upcoming trips.
            </div>
          )}
        </div>
      </section>

      <div className="bg-surface-container-low py-xl border-t border-outline-variant">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex items-center justify-between mb-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface">Recommended Cities</h2>
            <Compass className="w-6 h-6 text-secondary" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {[
              { name: "London", country: "United Kingdom", price: "₹₹₹", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXbwsPko3Cld3adBAadFGl1zGhPPnQj_-XZwthFaT0v2FfENbc9UTL576mvJFF3UOkbBylQ46HN5pigNVbdWbP3TB1xuOqqnFIKhkAoplp5TlfYaGZfiiAfqTcpetbTOdepeJ6vIWu3EkAvcCY1r-itn8e6izfkGFqjauTElrb5XZRi9RERF5UX8SONhHpm71TBxDLHnPVUw4Rp7DNFc_Cc2_hw36e24VzWutrVVlqntNvCD_XDriRXYEVIbcW6MJ1NvwX5ByJhNVL" },
              { name: "Rome", country: "Italy", price: "₹₹", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWUahjqGgnpdMtbq2SoDApemoGpecVLiASb64T21AFjTZ0ipq_kEd3F3Kp8wzCAjtdcXsYfjIdy1Me0xN9sOkZEplqQphZf-YbatrWwu9_TljhOByI6KQAH9Y5aqEpxK1Io9wIojKioTxg9OmwEdGfcScmDW8TbPdXm7UwvKbBhOD8V5F_sVocXhPbT7meI0bIEzxiPFZJa2l0yPyxVtudtd9hIpppfW-PkwZn6_BqaQ1mfrj8q0JO6SZjoL4-qj2fXosd8OosZGu6" },
              { name: "Kyoto", country: "Japan", price: "₹₹₹", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOFOizAZdYQrOIVgsQQZitHs5-kb4q4ek0KjyzM5Uhd3HUkaxbCPMWe35lJTlywFbNJ2GKpYyFYUkdaGTOrb8YvchigbMtG6YDIQEmShdWCTR85xqg1HJA4quG17MKi4kU_rE2kGfTViONsSsHz_TFgZKRhk1MhjkKLjEiU7OEsTa_Kyi_PoRLPy55OKO9ND0DHwT5uG9qMPAC29rhJopKL13uRonVYJaOnk2_bJdIzYhouw82JV7nu6AcRZCFlgg7hYZ8F4QylvwX" },
            ].map((city) => (
              <div key={city.name} className="bg-surface-container-lowest border border-surface-variant rounded-xl p-3 flex items-center gap-md hover:border-primary transition-colors cursor-pointer">
                <div className="w-16 h-16 rounded-lg bg-surface-variant overflow-hidden flex-shrink-0">
                  <img src={city.img} alt={city.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{city.name}</h3>
                  <p className="font-body-sm text-body-sm text-secondary">{city.country}</p>
                </div>
                <div className="bg-surface-container px-2 py-1 rounded-full font-label-md text-label-md text-secondary">
                  {city.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
