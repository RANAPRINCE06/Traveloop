import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Users, Edit2, Share2, PlaneLanding, MapPin, Clock, Camera, PlusCircle, ArrowLeft, Loader2 } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trip } from "@/lib/types";

export default function TripItinerary() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) return;
    
    const unsubscribe = onSnapshot(doc(db, "trips", tripId), (doc) => {
      if (doc.exists()) {
        setTrip({ id: doc.id, ...doc.data() } as Trip);
      } else {
        setTrip(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tripId]);

  if (loading) {
    return <div className="flex justify-center items-center h-full pt-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center pt-32 text-center">
        <h2 className="font-headline-lg text-on-surface mb-2">Trip Not Found</h2>
        <Link to="/trips" className="text-primary hover:underline flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back to My Trips</Link>
      </div>
    );
  }

  return (
    <main className="flex-1 w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-lg pb-24 md:pb-0">
      <section className="mb-xl">
        <Link to="/trips" className="inline-flex items-center gap-2 text-secondary hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Trips
        </Link>
        <div
          className="w-full h-[200px] md:h-[300px] rounded-xl overflow-hidden mb-lg relative bg-surface-container-high border border-outline-variant"
          style={{
            backgroundImage: `url('${trip.image || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop"}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-on-background/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-lg text-on-primary">
            <div className="flex items-center gap-sm mb-xs">
              <span className="bg-surface-container-highest/30 backdrop-blur-md px-2 py-1 rounded-full font-label-md text-label-md border border-outline/30 text-on-primary">{trip.status}</span>
              <span className="bg-surface-container-highest/30 backdrop-blur-md px-2 py-1 rounded-full font-label-md text-label-md border border-outline/30 text-on-primary">{trip.cities} Cities</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg">{trip.name}</h1>
            <p className="font-body-md text-body-md opacity-90">{trip.startDate} - {trip.endDate}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
          <div className="flex items-center gap-sm text-secondary font-body-sm text-body-sm">
            <Users className="w-[18px] h-[18px]" />
            <span>Only you</span>
          </div>
          <div className="flex flex-wrap items-center gap-sm w-full sm:w-auto">
            <Link to={`/trips/${trip.id}/budget`} className="flex-1 sm:flex-none flex items-center justify-center gap-xs px-4 py-2 bg-surface text-secondary border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors">
              Budget
            </Link>
            <Link to={`/trips/${trip.id}/packing`} className="flex-1 sm:flex-none flex items-center justify-center gap-xs px-4 py-2 bg-surface text-secondary border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors">
              Packing List
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-[800px] mx-auto w-full">
        <div className="flex items-center justify-between mb-md">
          <h2 className="font-headline-md text-headline-md text-on-surface">Itinerary</h2>
        </div>
        <div className="bg-surface-container-low border border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center text-center">
            <p className="font-body-md text-body-md text-secondary mb-sm">{trip.description || "Start planning your daily activities!"}</p>
            <Link to={`/trips/${trip.id}/search`} className="inline-flex items-center gap-2 text-primary hover:underline font-label-md">
              <PlusCircle className="w-5 h-5"/> Find Activities
            </Link>
        </div>
      </section>
    </main>
  );
}
