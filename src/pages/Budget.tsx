import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Settings, TrendingUp, Calendar, Hotel, Train, Utensils, Ticket, Loader2, Check } from "lucide-react";
import { getLocalTrip, updateLocalTrip } from "@/lib/localTrips";
import { Trip } from "@/lib/types";

export default function Budget() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  useEffect(() => {
    if (!tripId) return;
    
    const fetchTrip = () => {
      const data = getLocalTrip(tripId);
      if (data) {
        setTrip(data);
      } else {
        setTrip(null);
      }
      setLoading(false);
    };

    fetchTrip();
    window.addEventListener("local-trips-updated", fetchTrip);
    return () => window.removeEventListener("local-trips-updated", fetchTrip);
  }, [tripId]);

  const budget = trip?.budget || { stay: 0, transport: 0, food: 0, activities: 0 };
  const totalBudget = Object.values(budget).reduce((a, b) => a + b, 0);

  // Quick days calculation
  const getDays = () => {
    if (!trip?.startDate || !trip?.endDate) return 1;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 1;
  };
  const days = getDays();

  const handleSave = (key: keyof typeof budget) => {
    if (!tripId) return;
    const val = parseInt(editValue) || 0;
    try {
      updateLocalTrip(tripId, {
        budget: {
          ...budget,
          [key]: val
        }
      });
      setEditingCat(null);
    } catch (err) {
      console.error("Failed to update budget", err);
    }
  };

  const categories = [
    { id: "stay", name: "Stay", amount: budget.stay, icon: Hotel, color: "primary", percentage: totalBudget ? Math.round((budget.stay / totalBudget) * 100) : 0 },
    { id: "transport", name: "Transport", amount: budget.transport, icon: Train, color: "primary", percentage: totalBudget ? Math.round((budget.transport / totalBudget) * 100) : 0 },
    { id: "food", name: "Food", amount: budget.food, icon: Utensils, color: "primary", percentage: totalBudget ? Math.round((budget.food / totalBudget) * 100) : 0 },
    { id: "activities", name: "Activities", amount: budget.activities, icon: Ticket, color: "primary", percentage: totalBudget ? Math.round((budget.activities / totalBudget) * 100) : 0 },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-full pt-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!trip) return <div className="text-center pt-32">Trip not found</div>;

  return (
    <main className="flex-1 w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-lg pb-24 md:pb-xl flex flex-col gap-lg">
      <header className="flex items-center justify-between mb-sm">
        <div className="flex items-center gap-sm">
          <Link to={`/trips/${tripId}`} className="text-primary hover:bg-surface-container-low p-2 rounded-full transition-colors flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-headline-md text-headline-md text-on-surface">{trip.name} Budget</h1>
        </div>
        <button className="text-secondary hover:text-primary transition-colors flex items-center justify-center p-2">
          <Settings className="w-6 h-6" />
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-md">
              <h2 className="font-body-lg text-body-lg text-on-surface-variant">Total Estimated Cost</h2>
              <span className="bg-surface-container-low text-on-surface px-3 py-1 rounded-full font-label-md text-label-md border border-outline-variant flex items-center gap-xs">
                <TrendingUp className="w-4 h-4" /> On Track
              </span>
            </div>
            <div className="font-headline-lg text-[48px] leading-[56px] font-bold text-primary mb-sm">
              ₹{totalBudget.toLocaleString('en-IN')}
            </div>
            <p className="font-body-md text-body-md text-secondary">
              Estimated total for {days} days.
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-primary mb-md">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-body-md text-body-md text-on-surface-variant mb-xs">Average cost per day</h3>
          <div className="font-headline-md text-headline-md text-on-surface">
            ₹{Math.round(totalBudget / days).toLocaleString('en-IN')}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-md mt-sm">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-sm">Budget Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isEditing = editingCat === cat.id;

            return (
              <div 
                key={cat.id} 
                onClick={() => {
                  if (!isEditing) {
                    setEditingCat(cat.id);
                    setEditValue((cat.amount || "").toString());
                  }
                }}
                className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-sm hover:border-primary transition-colors ${!isEditing ? 'cursor-pointer' : ''} group`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-headline-sm text-headline-sm text-on-surface">{cat.name}</span>
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                       <span className="text-secondary font-headline-sm text-headline-sm">₹</span>
                       <input 
                         type="number"
                         value={editValue}
                         onChange={e => setEditValue(e.target.value)}
                         className="w-20 bg-surface-container-low border border-outline-variant rounded px-2 py-1 outline-none text-right font-headline-sm"
                         autoFocus
                       />
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleSave(cat.id as keyof typeof budget); }}
                         className="p-1 bg-primary text-on-primary rounded hover:bg-primary-container"
                       >
                          <Check className="w-4 h-4"/>
                       </button>
                    </div>
                  ) : (
                    <span className="font-headline-sm text-headline-sm text-on-surface">₹{cat.amount.toLocaleString('en-IN')}</span>
                  )}
                </div>
                <div className="flex flex-col gap-xs mt-sm">
                  <div className="flex justify-between font-label-md text-label-md text-secondary">
                    <span>{cat.percentage}% of budget</span>
                    <span>₹{cat.amount.toLocaleString('en-IN')} / ₹{totalBudget.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${cat.percentage}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
