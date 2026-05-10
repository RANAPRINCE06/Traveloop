export interface Trip {
  id?: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  cities: number;
  status: "Planning" | "Upcoming" | "Completed";
  image: string;
  createdAt: any;
  packingItems?: PackingItem[];
  budget?: {
    stay: number;
    transport: number;
    food: number;
    activities: number;
  };
  itinerary?: any;
}

export interface PackingItem {
  id: string;
  text: string;
  packed: boolean;
  category: string;
}
