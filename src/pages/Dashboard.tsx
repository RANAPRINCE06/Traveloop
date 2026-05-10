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
      // Sort by createdAt (which is now a number from Date.now())
      tripsData.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
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

  // Real-time budget summary derived from all trips
  const budgetSummary = useMemo(() => {
    let totalEstimated = 0;
    let totalSpent = 0;

    trips.forEach(trip => {
      // Sum up budget entries from Budget page (manual)
      if (trip.budget) {
        const b = trip.budget;
        totalSpent += (b.stay || 0) + (b.transport || 0) + (b.food || 0) + (b.activities || 0);
      }
      // Sum up estimated costs from itinerary
      if (trip.itinerary) {
        const iten = trip.itinerary;
        const modeMultiplier = iten.budgetMode === "Low" ? 0.7 : iten.budgetMode === "Luxury" ? 2.0 : 1.0;
        let nights = 0, days = 0;
        if (iten.startDate && iten.endDate) {
          const diff = Math.ceil((new Date(iten.endDate).getTime() - new Date(iten.startDate).getTime()) / (1000 * 60 * 60 * 24));
          nights = Math.max(0, diff);
          days = Math.max(1, diff + 1);
        }
        const travelers = iten.travelers || 1;
        let transportBase = iten.transportation === "Flight" ? 8000 : iten.transportation === "Train" ? 1500 : iten.transportation === "Bus" ? 800 : iten.transportation === "Car" ? 3000 : 2000;
        let stayBase = iten.accommodation === "Hotel" ? 3500 : iten.accommodation === "Hostel" ? 800 : iten.accommodation === "Airbnb" ? 2500 : iten.accommodation === "Resort" ? 8000 : 2000;
        const estTransport = transportBase * travelers * modeMultiplier;
        const estStay = stayBase * nights * modeMultiplier;
        const estFood = 600 * days * travelers * modeMultiplier;
        let estActivities = 0;
        if (iten.days) {
          iten.days.forEach((day: any) => {
            day.spots?.forEach((spot: any) => {
              if (spot.cost) {
                const n = parseFloat(spot.cost.replace(/[^0-9.]/g, ''));
                if (!isNaN(n)) estActivities += n;
              }
            });
          });
        }
        totalEstimated += Math.round(estTransport + estStay + estFood + estActivities);
      }
    });

    const spentPercent = totalEstimated > 0 ? Math.min(100, Math.round((totalSpent / totalEstimated) * 100)) : 0;
    return { totalEstimated, totalSpent, spentPercent };
  }, [trips]);

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
            {trips.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-sm py-lg">
                <Wallet className="w-10 h-10 text-outline" />
                <p className="font-body-sm text-secondary">No trips yet. Create a trip to see your budget summary.</p>
                <Link to="/create" className="text-primary font-label-md hover:underline">Plan a trip →</Link>
              </div>
            ) : (
              <>
                <div className="mb-lg">
                  <p className="font-label-md text-label-md text-secondary mb-1 uppercase tracking-wider">Total Estimated</p>
                  <p className="font-headline-lg text-headline-lg text-primary">
                    ₹{budgetSummary.totalEstimated.toLocaleString('en-IN')}
                  </p>
                  <p className="font-body-sm text-secondary mt-xs">across {trips.length} trip{trips.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="mt-auto">
                  <div className="flex justify-between font-label-md text-label-md text-secondary mb-2">
                    <span>Spent: ₹{budgetSummary.totalSpent.toLocaleString('en-IN')}</span>
                    <span>{budgetSummary.spentPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${budgetSummary.spentPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 bg-surface-container-low p-3 rounded-lg border border-surface-variant">
                    <TrendingUp className="w-5 h-5 text-tertiary-container" />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {budgetSummary.totalSpent === 0
                        ? "Add budgets to your trips to track spending."
                        : budgetSummary.spentPercent < 80
                        ? "You're on track with your budget!"
                        : "You're nearing your estimated budget."}
                    </span>
                  </div>
                </div>
              </>
            )}
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

      {/* Recommended Cities removed per request */}
    </main>
  );
}
