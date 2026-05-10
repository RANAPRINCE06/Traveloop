import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export default function CreateTrip() {
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!auth.currentUser) {
      setError("You must be logged in to create a trip.");
      return;
    }
    if (!tripName || !startDate || !endDate) {
      setError("Please fill all required fields.");
      return;
    }
    
    setLoading(true);
    try {
      await addDoc(collection(db, "trips"), {
        userId: auth.currentUser.uid,
        name: tripName,
        startDate,
        endDate,
        description,
        cities: 1, // Defaulting for now
        status: "Planning",
        image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop", // placeholder
        createdAt: serverTimestamp()
      });
      navigate("/trips");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create trip.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center p-margin-mobile md:p-margin-desktop w-full pb-24 md:pb-0">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-[600px] p-lg md:p-xl shadow-sm">
        <div className="mb-lg text-center md:text-left">
          <h1 className="font-headline-md text-headline-md text-on-surface">Plan a New Adventure</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Enter the details below to start organizing your next trip.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          {error && <div className="text-error bg-error-container p-3 rounded-lg text-sm">{error}</div>}
          <div className="flex flex-col gap-xs">
            <label htmlFor="tripName" className="font-label-md text-label-md text-on-surface">Trip Name</label>
            <input
              type="text"
              id="tripName"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="e.g., Summer in Kyoto"
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-md">
            <div className="flex flex-col gap-xs flex-1">
              <label htmlFor="startDate" className="font-label-md text-label-md text-on-surface">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant rounded-lg pl-md pr-xl py-sm font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full appearance-none"
                />
                <Calendar className="absolute right-md top-1/2 -translate-y-1/2 w-5 h-5 text-outline pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-xs flex-1">
              <label htmlFor="endDate" className="font-label-md text-label-md text-on-surface">End Date</label>
              <div className="relative">
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant rounded-lg pl-md pr-xl py-sm font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full appearance-none"
                />
                <Calendar className="absolute right-md top-1/2 -translate-y-1/2 w-5 h-5 text-outline pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-xs">
            <label htmlFor="description" className="font-label-md text-label-md text-on-surface">
              Description <span className="text-outline font-normal">(Optional)</span>
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are your main goals or must-dos for this trip?"
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none w-full"
            ></textarea>
          </div>

          <div className="flex flex-col-reverse md:flex-row justify-end items-center gap-md mt-sm pt-lg border-t border-surface-variant">
            <Link to="/trips" className="font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant transition-colors py-sm px-md w-full md:w-auto text-center">
              Cancel
            </Link>
            <button disabled={loading} type="submit" className="bg-primary text-on-primary font-label-md text-label-md px-xl py-sm rounded-lg hover:bg-primary-container transition-colors w-full md:w-auto shadow-sm disabled:opacity-50">
              {loading ? "Saving..." : "Save Trip"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
