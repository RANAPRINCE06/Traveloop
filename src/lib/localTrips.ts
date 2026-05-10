import { Trip } from "./types";

const TRIPS_STORAGE_KEY = "traveloop_local_trips";

// Helper to get all trips
export const getLocalTrips = (): Trip[] => {
  try {
    const data = localStorage.getItem(TRIPS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to parse local trips", err);
  }
  return [];
};

// Helper to save all trips
export const saveLocalTrips = (trips: Trip[]) => {
  try {
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
    // Dispatch a custom event so other components can re-render if needed
    window.dispatchEvent(new Event("local-trips-updated"));
  } catch (err) {
    console.error("Failed to save local trips", err);
  }
};

// Add a new trip
export const addLocalTrip = (trip: Omit<Trip, "id">): string => {
  const trips = getLocalTrips();
  const newTrip: Trip = {
    ...trip,
    id: Date.now().toString(),
  };
  trips.push(newTrip);
  saveLocalTrips(trips);
  return newTrip.id!;
};

// Update an existing trip
export const updateLocalTrip = (id: string, updates: Partial<Trip>) => {
  const trips = getLocalTrips();
  const index = trips.findIndex(t => t.id === id);
  if (index !== -1) {
    trips[index] = { ...trips[index], ...updates };
    saveLocalTrips(trips);
  }
};

// Delete a trip
export const deleteLocalTrip = (id: string) => {
  const trips = getLocalTrips();
  const filtered = trips.filter(t => t.id !== id);
  saveLocalTrips(filtered);
};

// Get a single trip
export const getLocalTrip = (id: string): Trip | null => {
  const trips = getLocalTrips();
  return trips.find(t => t.id === id) || null;
};
