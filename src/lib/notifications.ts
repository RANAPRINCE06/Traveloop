import { Trip } from "@/lib/types";

type NotificationType = "Reminder" | "Travel Update" | "Payment Reminder" | "Trip Alert";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  tripName: string;
  startDate: string;
}

export const getNotificationStorageKey = (uid: string | null) => `traveloop-notifications-${uid || "guest"}`;

export const getDaysUntil = (dateString: string) => {
  const today = new Date();
  const target = new Date(dateString);
  const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const utcTarget = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.ceil((utcTarget - utcToday) / (1000 * 60 * 60 * 24));
};

export const buildNotifications = (trips: Trip[]) => {
  const items: NotificationItem[] = [];

  trips.forEach((trip) => {
    if (!trip.startDate || !trip.id) return;

    const daysUntil = getDaysUntil(trip.startDate);
    if (daysUntil < 0 || daysUntil > 30) return;

    const titleBase = `${trip.name} (${trip.startDate})`;

    if (daysUntil <= 30) {
      items.push({
        id: `${trip.id}-alert-${daysUntil}`,
        type: "Trip Alert",
        title: `Trip alert for ${trip.name}`,
        message: `Get ready: your trip starts ${daysUntil === 0 ? "today" : `in ${daysUntil} days`}.`,
        tripName: trip.name,
        startDate: trip.startDate,
      });
    }

    if (daysUntil <= 14) {
      items.push({
        id: `${trip.id}-payment-${daysUntil}`,
        type: "Payment Reminder",
        title: `Payment reminder for ${trip.name}`,
        message: `Review any payments or bookings for ${titleBase} before departure.`,
        tripName: trip.name,
        startDate: trip.startDate,
      });
    }

    if (daysUntil <= 7) {
      items.push({
        id: `${trip.id}-update-${daysUntil}`,
        type: "Travel Update",
        title: `Travel update for ${trip.name}`,
        message: `Your travel plans are due soon — finalize itinerary and packing for ${titleBase}.`,
        tripName: trip.name,
        startDate: trip.startDate,
      });
    }

    if (daysUntil <= 2) {
      items.push({
        id: `${trip.id}-reminder-${daysUntil}`,
        type: "Reminder",
        title: `Reminder: ${trip.name} starts ${daysUntil === 0 ? "today" : `in ${daysUntil} days`}`,
        message: `Be ready for departure soon — check your packing list and travel documents.`,
        tripName: trip.name,
        startDate: trip.startDate,
      });
    }
  });

  return items.sort((a, b) => {
    const dateCompare = a.startDate.localeCompare(b.startDate);
    if (dateCompare !== 0) return dateCompare;
    return a.type.localeCompare(b.type);
  });
};

export const getNotificationSettings = (uid: string | null) => {
  const saved = localStorage.getItem(getNotificationStorageKey(uid));
  if (!saved) return { enabled: false };

  try {
    return JSON.parse(saved) as { enabled: boolean };
  } catch {
    return { enabled: false };
  }
};
