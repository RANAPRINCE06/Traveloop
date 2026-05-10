import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, MapPin, Edit2, Trash2, Loader2 } from "lucide-react";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { Trip } from "@/lib/types";

export default function MyTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeTrips = () => {};

    const authUnsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setTrips([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "trips"),
        where("userId", "==", currentUser.uid)
      );

      unsubscribeTrips();
      unsubscribeTrips = onSnapshot(q, (snapshot) => {
        const tripsData: Trip[] = [];
        snapshot.forEach((doc) => {
          tripsData.push({ id: doc.id, ...doc.data() } as Trip);
        });
        tripsData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setTrips(tripsData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching trips:", error);
        setLoading(false);
      });
    });

    return () => {
      authUnsub();
      unsubscribeTrips();
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      try {
        await deleteDoc(doc(db, "trips", id));
      } catch (err) {
        console.error("Error deleting trip:", err);
      }
    }
  };

  return (
    <main className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full pb-24 md:pb-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between mt-lg mb-xl gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-background">My Trips</h1>
          <p className="font-body-md text-body-md text-secondary mt-xs">Manage and organize all your upcoming adventures.</p>
        </div>
        <Link
          to="/create"
          className="bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-lg hover:bg-surface-tint transition-all flex items-center justify-center gap-xs shadow-sm w-full md:w-auto"
        >
          <Plus className="w-[18px] h-[18px]" />
          Add New Trip
        </Link>
      </header>

      {loading ? (
        <div className="flex justify-center items-center py-xl">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-xl bg-surface-container-low rounded-xl border border-outline-variant">
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-4">You haven't planned any trips yet.</p>
          <Link to="/create" className="text-primary font-label-md hover:underline">Start planning now</Link>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {trips.map((trip) => (
            <article
              key={trip.id}
              className={`bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col group hover:border-primary/50 transition-colors ${
                trip.status === "Completed" ? "opacity-70" : ""
              }`}
            >
              <div className={`h-48 w-full bg-surface-variant relative overflow-hidden ${trip.status === "Completed" ? "grayscale-[50%]" : ""}`}>
                <div className="w-full h-full bg-gradient-to-br from-surface-variant to-surface flex items-center justify-center text-[4rem] font-bold text-on-surface">
                  {trip.name?.charAt(0).toUpperCase() || "T"}
                </div>
                <div className="absolute top-sm right-sm bg-surface-container-lowest/90 backdrop-blur-sm px-sm py-xs rounded-full border border-outline-variant">
                  <span className="font-label-md text-label-md text-on-surface-variant">{trip.status}</span>
                </div>
              </div>
              
              <div className="p-md flex flex-col flex-grow">
                <h2 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1">{trip.name}</h2>
                <div className="flex items-center gap-xs mt-sm text-secondary">
                  <Calendar className="w-4 h-4" />
                  <span className="font-body-sm text-body-sm">{trip.startDate} - {trip.endDate}</span>
                </div>
                <div className="flex items-center gap-xs mt-xs text-secondary mb-md">
                  <MapPin className="w-4 h-4" />
                  <span className="font-body-sm text-body-sm">{trip.cities} Cities</span>
                </div>
                
                <div className="mt-auto pt-md border-t border-outline-variant flex gap-sm">
                  <Link
                    to={`/trips/${trip.id}`}
                    className="flex-1 bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md py-sm rounded border border-outline-variant transition-colors text-center"
                  >
                    View
                  </Link>
                  <button
                    className="px-sm py-sm rounded border border-outline-variant text-secondary hover:text-primary hover:border-primary/30 transition-colors flex items-center justify-center bg-surface-container-lowest disabled:opacity-50"
                    disabled={trip.status === "Completed"}
                  >
                    <Edit2 className="w-[18px] h-[18px]" />
                  </button>
                  <button 
                    onClick={() => handleDelete(trip.id!)}
                    className="px-sm py-sm rounded border border-outline-variant text-secondary hover:text-error hover:border-error/30 transition-colors flex items-center justify-center bg-surface-container-lowest"
                  >
                    <Trash2 className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
