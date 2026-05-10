import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Users, Edit2, Share2, PlaneLanding, MapPin, Clock, Camera, ArrowLeft, Loader2, Calendar, Map, DollarSign, Hotel, Train, FileText, Plus, Trash2, Wallet, Utensils, Activity, CheckCircle } from "lucide-react";
import { getLocalTrip, updateLocalTrip } from "@/lib/localTrips";
import { Trip } from "@/lib/types";

export interface ItinerarySpot {
  id: string;
  name: string;
  time: string;
  cost?: string;
}

export interface ItineraryDay {
  id: string;
  date: string;
  label: string;
  spots: ItinerarySpot[];
}

export interface ItineraryData {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: string;
  budgetMode?: "Low" | "Medium" | "Luxury";
  dailyPlan?: string;
  days: ItineraryDay[];
  transportation: string;
  accommodation: string;
}

const DESTINATION_RATES: Record<string, number> = {
  "london": 2.5,
  "paris": 2.2,
  "tokyo": 1.8,
  "new york": 3.0,
  "bangkok": 0.8,
  "bali": 0.7,
  "kyoto": 1.5,
  "rome": 2.0,
  "dubai": 2.2,
  "singapore": 2.0,
  "mumbai": 1.0,
  "delhi": 0.9,
  "goa": 1.1,
  "maldives": 2.8,
  "switzerland": 3.5,
};

export default function TripItinerary() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  const [itineraryData, setItineraryData] = useState<ItineraryData | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [formData, setFormData] = useState<ItineraryData>({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 1,
    budget: "",
    budgetMode: "Medium",
    dailyPlan: "",
    days: [],
    transportation: "Flight",
    accommodation: "Hotel",
  });
  const [formError, setFormError] = useState("");
  const [activeDayId, setActiveDayId] = useState<string>("");
  const [savedDays, setSavedDays] = useState<Record<string, boolean>>({});

  const generateDays = (start: string, end: string): ItineraryDay[] => {
    if (!start || !end) return [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days: ItineraryDay[] = [];
    let currentDate = new Date(startDate);
    let dayCount = 1;

    while (currentDate <= endDate) {
      days.push({
        id: `day-${dayCount}`,
        date: currentDate.toISOString().split('T')[0],
        label: `Day ${dayCount}`,
        spots: []
      });
      currentDate.setDate(currentDate.getDate() + 1);
      dayCount++;
    }
    return days;
  };

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      setFormData(prev => {
        const newDays = generateDays(prev.startDate, prev.endDate);
        const mergedDays = newDays.map(newDay => {
          const existingDay = prev.days?.find(d => d.date === newDay.date);
          return existingDay ? { ...newDay, spots: existingDay.spots } : newDay;
        });
        
        if (mergedDays.length > 0 && !activeDayId) {
          setActiveDayId(mergedDays[0].id);
        }
        
        return { ...prev, days: mergedDays };
      });
    }
  }, [formData.startDate, formData.endDate]);

  const calculateBudget = (data: ItineraryData) => {
    let nights = 0;
    let days = 0;
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      nights = Math.max(0, diffDays);
      days = Math.max(1, diffDays + 1);
    } else {
      days = data.days?.length || 1;
      nights = Math.max(0, days - 1);
    }

    const dest = data.destination.toLowerCase();
    let destMultiplier = 1.0;
    
    // Find matching destination rate
    for (const [key, rate] of Object.entries(DESTINATION_RATES)) {
      if (dest.includes(key)) {
        destMultiplier = rate;
        break;
      }
    }

    const modeMultiplier = data.budgetMode === "Low" ? 0.7 : data.budgetMode === "Luxury" ? 2.0 : 1.0;
    const finalMultiplier = destMultiplier * modeMultiplier;

    // Base costs in INR (Indian Rupees)
    let transportBase = 0;
    if (data.transportation === "Flight") transportBase = 8000;   // ~₹8,000 per person
    else if (data.transportation === "Train") transportBase = 1500; // ~₹1,500 per person
    else if (data.transportation === "Bus") transportBase = 800;   // ~₹800 per person
    else if (data.transportation === "Car") transportBase = 3000;  // ~₹3,000 fuel/rental
    else transportBase = 2000;
    const transportCost = transportBase * data.travelers * finalMultiplier;

    let stayBase = 0;
    if (data.accommodation === "Hotel") stayBase = 3500;   // ~₹3,500/night
    else if (data.accommodation === "Hostel") stayBase = 800;    // ~₹800/night
    else if (data.accommodation === "Airbnb") stayBase = 2500;   // ~₹2,500/night
    else if (data.accommodation === "Resort") stayBase = 8000;   // ~₹8,000/night
    else stayBase = 2000;
    
    const stayCost = stayBase * nights * finalMultiplier;
    const foodCost = 600 * days * data.travelers * finalMultiplier; // ~₹600/day/person

    let activitiesCost = 0;
    if (data.days) {
      data.days.forEach(day => {
        if (day.spots) {
          day.spots.forEach(spot => {
            if (spot.cost) {
              const num = parseFloat(spot.cost.replace(/[^0-9.]/g, ''));
              if (!isNaN(num)) activitiesCost += num;
            }
          });
        }
      });
    }

    const total = transportCost + stayCost + foodCost + activitiesCost;
    return {
      transport: Math.round(transportCost),
      stay: Math.round(stayCost),
      food: Math.round(foodCost),
      activities: Math.round(activitiesCost),
      total: Math.round(total),
      days
    };
  };

  const estimatedBudget = calculateBudget(isEditing ? formData : (itineraryData || formData));

  const handleQuickSave = (dayId: string) => {
    if (!tripId) return;
    try {
      updateLocalTrip(tripId, { itinerary: formData });
      setItineraryData(formData);
      
      setSavedDays(prev => ({ ...prev, [dayId]: true }));
      setTimeout(() => {
        setSavedDays(prev => ({ ...prev, [dayId]: false }));
      }, 2000);
    } catch (err) {
      console.error("Quick save failed", err);
    }
  };

  const handleItinerarySubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError("");

    if (!formData.destination || !formData.startDate || !formData.endDate) {
      setFormError("Destination, Start Date, and End Date are required.");
      return;
    }

    try {
      if (tripId) {
        updateLocalTrip(tripId, { itinerary: formData });
      }
      setItineraryData(formData);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Error saving itinerary: ", err);
      setFormError("Failed to save itinerary. Please try again.");
    }
  };

  useEffect(() => {
    if (!tripId) return;

    const fetchTrip = () => {
      const tripData = getLocalTrip(tripId);
      if (tripData) {
        setTrip(tripData);
        
        if (tripData.itinerary) {
          const iten = { ...tripData.itinerary };
          if (!iten.days) iten.days = [];
          setItineraryData(iten);
          
          // Only update formData and exit edit mode if we are NOT currently editing
          // This prevents the Quick Save from kicking the user out of the editor
          setFormData(prev => {
            if (isEditing) return prev; // Keep current local changes
            return iten;
          });
          
          if (!isEditing) {
            setIsEditing(false);
          }
          
          if (iten.days.length > 0 && !activeDayId) setActiveDayId(iten.days[0].id);
        } else {
          setFormData(prev => {
            if (isEditing) return prev;
            return {
              ...prev,
              destination: prev.destination || tripData.name || "",
              startDate: prev.startDate || tripData.startDate || "",
              endDate: prev.endDate || tripData.endDate || "",
            };
          });
        }
      } else {
        setTrip(null);
      }
      setLoading(false);
    };

    fetchTrip();
    window.addEventListener("local-trips-updated", fetchTrip);
    return () => window.removeEventListener("local-trips-updated", fetchTrip);
  }, [tripId, isEditing]);

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
        <div className="w-full rounded-xl overflow-hidden mb-lg relative bg-surface-container-high border border-outline-variant p-lg md:p-xl">
          <div className="flex items-center gap-sm mb-xs">
            <span className="bg-surface-container-lowest/80 px-2 py-1 rounded-full font-label-md text-label-md border border-outline-variant text-on-surface-variant">{trip.status}</span>
            <span className="bg-surface-container-lowest/80 px-2 py-1 rounded-full font-label-md text-label-md border border-outline-variant text-on-surface-variant">{trip.cities} Cities</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">{trip.name}</h1>
          <p className="font-body-md text-body-md text-secondary">{trip.startDate} - {trip.endDate}</p>
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
        {isEditing ? (
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-lg shadow-sm">
            <form onSubmit={handleItinerarySubmit} className="flex flex-col gap-md">
              {formError && <div className="text-error bg-error-container p-3 rounded-lg text-sm">{formError}</div>}
              
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Destination</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    placeholder="Where are you going?"
                    className="bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full"
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-md">
                <div className="flex flex-col gap-xs flex-1">
                  <label className="font-label-md text-label-md text-on-surface">Start Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full appearance-none"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-xs flex-1">
                  <label className="font-label-md text-label-md text-on-surface">End Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full appearance-none"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-md">
                <div className="flex flex-col gap-xs flex-1">
                  <label className="font-label-md text-label-md text-on-surface">Number of Travelers</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={formData.travelers}
                      onChange={(e) => setFormData({...formData, travelers: parseInt(e.target.value) || 1})}
                      className="bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full"
                    />
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  </div>
                </div>
                <div className="flex flex-col gap-xs flex-1">
                  <label className="font-label-md text-label-md text-on-surface">Budget</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      placeholder="e.g., ₹2000"
                      className="bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full"
                    />
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  </div>
                </div>
                <div className="flex flex-col gap-xs flex-1">
                  <label className="font-label-md text-label-md text-on-surface">Budget Mode</label>
                  <div className="relative">
                    <select
                      value={formData.budgetMode || "Medium"}
                      onChange={(e) => setFormData({...formData, budgetMode: e.target.value as any})}
                      className="bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full appearance-none"
                    >
                      <option className="text-on-surface" value="Low">Low</option>
                      <option className="text-on-surface" value="Medium">Medium</option>
                      <option className="text-on-surface" value="Luxury">Luxury</option>
                    </select>
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-md">
                <div className="flex flex-col gap-xs flex-1">
                  <label className="font-label-md text-label-md text-on-surface">Transportation</label>
                  <div className="relative">
                    <select
                      value={formData.transportation}
                      onChange={(e) => setFormData({...formData, transportation: e.target.value})}
                      className="bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full appearance-none"
                    >
                      <option className="text-on-surface" value="Flight">Flight</option>
                      <option className="text-on-surface" value="Train">Train</option>
                      <option className="text-on-surface" value="Car">Car</option>
                      <option className="text-on-surface" value="Bus">Bus</option>
                      <option className="text-on-surface" value="Other">Other</option>
                    </select>
                    <Train className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-xs flex-1">
                  <label className="font-label-md text-label-md text-on-surface">Accommodation</label>
                  <div className="relative">
                    <select
                      value={formData.accommodation}
                      onChange={(e) => setFormData({...formData, accommodation: e.target.value})}
                      className="bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full appearance-none"
                    >
                      <option className="text-on-surface" value="Hotel">Hotel</option>
                      <option className="text-on-surface" value="Hostel">Hostel</option>
                      <option className="text-on-surface" value="Airbnb">Airbnb</option>
                      <option className="text-on-surface" value="Resort">Resort</option>
                      <option className="text-on-surface" value="Other">Other</option>
                    </select>
                    <Hotel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-xs mt-4">
                <label className="font-label-md text-label-md text-on-surface">Day-by-Day Plan</label>
                {!formData.days || formData.days.length === 0 ? (
                  <div className="text-secondary text-sm italic">Please select a Start and End Date to generate days.</div>
                ) : (
                  <div className="border border-outline-variant rounded-lg overflow-hidden bg-surface flex flex-col md:flex-row">
                    <div className="flex md:flex-col overflow-x-auto md:w-48 border-b md:border-b-0 md:border-r border-outline-variant bg-surface-container-lowest items-start">
                      {formData.days.map(day => (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => setActiveDayId(day.id)}
                          className={`w-full flex flex-col items-start px-4 py-3 text-sm transition-colors ${activeDayId === day.id ? 'bg-primary/10 text-primary font-medium border-l-4 border-primary' : 'text-secondary hover:bg-surface-container-low border-l-4 border-transparent'}`}
                        >
                          <div className="font-label-md leading-tight">{day.label}</div>
                          <div className="text-xs opacity-80 mt-1">{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 p-4 bg-surface">
                      {formData.days.map(day => (
                        <div key={day.id} className={activeDayId === day.id ? 'block' : 'hidden'}>
                          <h4 className="font-headline-sm text-on-surface mb-4">{day.label} <span className="text-secondary text-sm font-normal">({new Date(day.date).toLocaleDateString()})</span></h4>
                          
                          <div className="flex flex-col gap-3 mb-4">
                            {day.spots?.map((spot, index) => (
                              <div key={spot.id} className="flex items-start gap-2 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant">
                                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                                  <input
                                    type="time"
                                    value={spot.time}
                                    onChange={(e) => {
                                      const newDays = [...formData.days];
                                      const dayIndex = newDays.findIndex(d => d.id === day.id);
                                      newDays[dayIndex].spots[index].time = e.target.value;
                                      setFormData({...formData, days: newDays});
                                    }}
                                    className="bg-transparent border border-outline-variant rounded px-2 py-1 text-sm focus:border-primary outline-none"
                                  />
                                  <input
                                    type="text"
                                    value={spot.name}
                                    placeholder="Spot name or activity..."
                                    onChange={(e) => {
                                      const newDays = [...formData.days];
                                      const dayIndex = newDays.findIndex(d => d.id === day.id);
                                      newDays[dayIndex].spots[index].name = e.target.value;
                                      setFormData({...formData, days: newDays});
                                    }}
                                    className="bg-transparent border border-outline-variant rounded px-2 py-1 text-sm focus:border-primary outline-none flex-1"
                                  />
                                  <div className="relative w-24">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary text-sm">₹</span>
                                    <input
                                      type="text"
                                      value={spot.cost || ""}
                                      placeholder="Cost"
                                      onChange={(e) => {
                                        const newDays = [...formData.days];
                                        const dayIndex = newDays.findIndex(d => d.id === day.id);
                                        newDays[dayIndex].spots[index].cost = e.target.value;
                                        setFormData({...formData, days: newDays});
                                      }}
                                      className="bg-transparent border border-outline-variant rounded pl-5 pr-2 py-1 text-sm focus:border-primary outline-none w-full"
                                    />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newDays = [...formData.days];
                                    const dayIndex = newDays.findIndex(d => d.id === day.id);
                                    newDays[dayIndex].spots = newDays[dayIndex].spots.filter(s => s.id !== spot.id);
                                    setFormData({...formData, days: newDays});
                                  }}
                                  className="text-error hover:bg-error-container p-1 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            {(!day.spots || day.spots.length === 0) && (
                              <p className="text-secondary text-sm italic">No spots added for this day yet.</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 mt-4">
                            <button
                              type="button"
                              onClick={() => {
                                const newDays = [...formData.days];
                                const dayIndex = newDays.findIndex(d => d.id === day.id);
                                if (!newDays[dayIndex].spots) newDays[dayIndex].spots = [];
                                newDays[dayIndex].spots.push({ id: Date.now().toString(), name: "", time: "09:00", cost: "" });
                                setFormData({...formData, days: newDays});
                              }}
                              className="flex items-center gap-2 text-primary font-label-sm hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors w-fit border border-primary/20"
                            >
                              <Plus className="w-4 h-4" /> Add Spot
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleQuickSave(day.id)}
                              className={`flex items-center gap-2 font-label-sm px-4 py-2 rounded-lg transition-colors border ml-auto ${
                                savedDays[day.id] 
                                  ? "bg-green-500/20 text-green-600 border-green-500/50" 
                                  : "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                              }`}
                            >
                              {savedDays[day.id] ? (
                                <><CheckCircle className="w-4 h-4" /> Saved!</>
                              ) : (
                                <><CheckCircle className="w-4 h-4" /> Save {day.label}</>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
                <h4 className="font-headline-sm text-on-surface mb-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-primary" /> Real-time Estimated Budget
                  </div>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-label-sm animate-pulse">
                    LIVE DATA
                  </span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-surface p-3 rounded-lg border border-outline-variant">
                    <div className="flex items-center gap-2 text-secondary mb-1">
                      <Train className="w-4 h-4" /> <span className="font-label-sm">Transport</span>
                    </div>
                    <p className="font-body-lg text-on-surface font-medium">₹{estimatedBudget.transport.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-surface p-3 rounded-lg border border-outline-variant">
                    <div className="flex items-center gap-2 text-secondary mb-1">
                      <Hotel className="w-4 h-4" /> <span className="font-label-sm">Stay</span>
                    </div>
                    <p className="font-body-lg text-on-surface font-medium">₹{estimatedBudget.stay.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-surface p-3 rounded-lg border border-outline-variant">
                    <div className="flex items-center gap-2 text-secondary mb-1">
                      <Utensils className="w-4 h-4" /> <span className="font-label-sm">Food</span>
                    </div>
                    <p className="font-body-lg text-on-surface font-medium">₹{estimatedBudget.food.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-surface p-3 rounded-lg border border-outline-variant">
                    <div className="flex items-center gap-2 text-secondary mb-1">
                      <Activity className="w-4 h-4" /> <span className="font-label-sm">Activities</span>
                    </div>
                    <p className="font-body-lg text-on-surface font-medium">₹{estimatedBudget.activities.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between bg-primary-container text-on-primary-container p-4 rounded-lg">
                  <div>
                    <span className="font-label-lg opacity-80">Total Estimated Budget</span>
                    <p className="font-headline-lg font-bold">₹{estimatedBudget.total.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right mt-2 sm:mt-0">
                    <span className="font-label-md opacity-80 block">Estimated per day</span>
                    <span className="font-headline-md font-medium">₹{Math.round(estimatedBudget.total / estimatedBudget.days).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-sm border-t border-surface-variant">
                <button type="submit" className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm w-full sm:w-auto">
                  Save Itinerary
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-lg shadow-sm">
            <div className="flex justify-between items-start mb-md pb-md border-b border-surface-variant">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> {itineraryData?.destination}
                </h3>
                <p className="text-secondary font-body-sm flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" /> {itineraryData?.startDate} to {itineraryData?.endDate}
                </p>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-primary hover:bg-surface-container p-2 rounded-lg transition-colors font-label-md"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-lg">
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant">
                <div className="flex items-center gap-2 text-secondary mb-1">
                  <Users className="w-4 h-4" /> <span className="font-label-sm text-label-sm">Travelers</span>
                </div>
                <p className="font-body-md text-on-surface">{itineraryData?.travelers}</p>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant">
                <div className="flex items-center gap-2 text-secondary mb-1">
                  <DollarSign className="w-4 h-4" /> <span className="font-label-sm text-label-sm">Budget</span>
                </div>
                <p className="font-body-md text-on-surface">₹{itineraryData?.budget || "N/A"}</p>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant">
                <div className="flex items-center gap-2 text-secondary mb-1">
                  <Train className="w-4 h-4" /> <span className="font-label-sm text-label-sm">Transport</span>
                </div>
                <p className="font-body-md text-on-surface">{itineraryData?.transportation}</p>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant">
                <div className="flex items-center gap-2 text-secondary mb-1">
                  <Hotel className="w-4 h-4" /> <span className="font-label-sm text-label-sm">Stay</span>
                </div>
                <p className="font-body-md text-on-surface">{itineraryData?.accommodation}</p>
              </div>
            </div>

            <div className="mt-lg bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
              <h4 className="font-headline-sm text-on-surface mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" /> Estimated Trip Budget
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-surface p-3 rounded-lg border border-outline-variant">
                  <div className="flex items-center gap-2 text-secondary mb-1">
                    <Train className="w-4 h-4" /> <span className="font-label-sm">Transport</span>
                  </div>
                  <p className="font-body-lg text-on-surface font-medium">₹{estimatedBudget.transport.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-surface p-3 rounded-lg border border-outline-variant">
                  <div className="flex items-center gap-2 text-secondary mb-1">
                    <Hotel className="w-4 h-4" /> <span className="font-label-sm">Stay</span>
                  </div>
                  <p className="font-body-lg text-on-surface font-medium">₹{estimatedBudget.stay.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-surface p-3 rounded-lg border border-outline-variant">
                  <div className="flex items-center gap-2 text-secondary mb-1">
                    <Utensils className="w-4 h-4" /> <span className="font-label-sm">Food</span>
                  </div>
                  <p className="font-body-lg text-on-surface font-medium">₹{estimatedBudget.food.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-surface p-3 rounded-lg border border-outline-variant">
                  <div className="flex items-center gap-2 text-secondary mb-1">
                    <Activity className="w-4 h-4" /> <span className="font-label-sm">Activities</span>
                  </div>
                  <p className="font-body-lg text-on-surface font-medium">₹{estimatedBudget.activities.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between bg-primary-container text-on-primary-container p-4 rounded-lg">
                <div>
                  <span className="font-label-lg opacity-80">Total Estimated Budget</span>
                  <p className="font-headline-lg font-bold">₹{estimatedBudget.total.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right mt-2 sm:mt-0">
                  <span className="font-label-md opacity-80 block">Estimated per day</span>
                  <span className="font-headline-md font-medium">₹{Math.round(estimatedBudget.total / estimatedBudget.days).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="mt-xl">
              <h4 className="font-headline-sm text-on-surface mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Day-by-Day Plan
              </h4>
              <div className="flex flex-col gap-md">
                {itineraryData?.days && itineraryData.days.length > 0 ? (
                  itineraryData.days.map((day) => (
                    <div key={day.id} className="bg-surface-container-lowest p-md rounded-lg border border-outline-variant">
                      <div className="flex items-center justify-between mb-3 border-b border-outline-variant pb-2">
                        <h5 className="font-label-lg text-primary">{day.label}</h5>
                        <span className="text-secondary text-sm">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                      </div>
                      {day.spots && day.spots.length > 0 ? (
                        <div className="flex flex-col gap-3 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-outline-variant">
                          {day.spots.map((spot, i) => (
                            <div key={spot.id} className="flex gap-4 relative">
                              <div className="w-6 h-6 rounded-full bg-primary-container border-2 border-surface flex items-center justify-center shrink-0 z-10 mt-0.5">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1 bg-surface p-2 sm:p-3 rounded-lg border border-outline-variant shadow-sm">
                                {spot.time && (
                                  <div className="font-label-sm text-primary bg-primary/10 px-2 py-1 rounded w-fit shrink-0">
                                    {spot.time}
                                  </div>
                                )}
                                <div className="font-body-md text-on-surface font-medium flex-1">{spot.name || "Untitled Spot"}</div>
                                {spot.cost && (
                                  <div className="font-label-sm text-secondary bg-surface-container-low px-2 py-1 rounded w-fit shrink-0 border border-outline-variant">
                                    ₹{spot.cost}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-secondary text-sm italic">No spots planned for this day.</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-secondary text-sm italic">
                    {itineraryData?.dailyPlan || "No specific plans or notes added."}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
