import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

export type Role = "provider" | "ngo" | "volunteer";

export const ROLE_LABELS: Record<Role, string> = {
  provider: "Provider",
  ngo: "NGO",
  volunteer: "Volunteer",
};

export const DEMO_NGO_NAME = "Kalinga Shelter Trust (Demo)";
export const DEMO_NGO_ADDRESS = "Demo shelter, Bhubaneswar (demo location)";
export const DEMO_VOLUNTEER_NAME = "Demo Volunteer";
// Fixed demo base point for distance ranking. It is not the device's live location.
export const DEMO_BASE = { latitude: 20.2961, longitude: 85.8245 };

export const DEFAULT_LOCATION = { latitude: 20.2961, longitude: 85.8245 };

export type Listing = {
  id: string;
  isDemo: boolean;
  providerName: string;
  providerType: string;
  title: string;
  category: string;
  isVegetarian: boolean;
  description: string;
  portionsTotal: number;
  portionsRemaining: number;
  weightKg: number | null;
  preparedAt: string;
  collectBy: string;
  storageInfo: string;
  temperatureInfo: string;
  allergens: string;
  pickupAddress: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type Donation = {
  id: string;
  isDemo: boolean;
  listingId: string;
  ngoName: string;
  deliveryAddress: string;
  portions: number;
  status: string;
  volunteerName: string | null;
  acceptedAt: string;
  assignedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DonationRow = { donation: Donation; listing: Listing };

export const LISTING_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  ACCEPTED: "Fully accepted",
  PICKED_UP: "Picked up",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

export const DONATION_STATUS_LABELS: Record<string, string> = {
  ACCEPTED: "Accepted",
  VOLUNTEER_ASSIGNED: "Volunteer assigned",
  PICKED_UP: "Picked up",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const CATEGORY_LABELS: Record<string, string> = {
  cooked_meal: "Cooked meal",
  bakery: "Bakery",
  produce: "Fresh produce",
  packaged: "Packaged food",
};

export const PROVIDER_TYPE_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  hotel: "Hotel",
  canteen: "Canteen",
  hostel: "Hostel",
  event: "Event organiser",
};

export const SAFETY_CHECKLIST = [
  "Food was prepared within the declared preparation time",
  "Food is packed in clean, sealed, food-grade containers",
  "Storage and temperature were kept as declared",
  "Allergens were declared correctly",
  "Food shows no spoilage, odour, or contamination",
];

export function isOpenForAcceptance(listing: Listing, now: number) {
  return (
    listing.status === "AVAILABLE" &&
    listing.portionsRemaining > 0 &&
    Date.parse(listing.collectBy) > now
  );
}

export function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function formatRemaining(collectBy: string, now: number) {
  const ms = Date.parse(collectBy) - now;
  if (ms <= 0) return "Deadline passed";
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

const ROLE_KEY = "second-plate-demo-role";
const roleListeners = new Set<() => void>();

function subscribeRole(callback: () => void) {
  roleListeners.add(callback);
  return () => {
    roleListeners.delete(callback);
  };
}

function readRole(): Role {
  const value = window.localStorage.getItem(ROLE_KEY);
  return value === "ngo" || value === "volunteer" ? value : "provider";
}

export function useDemoRole() {
  const role = useSyncExternalStore(
    subscribeRole,
    readRole,
    () => "provider" as Role,
  );
  const setRole = useCallback((next: Role) => {
    window.localStorage.setItem(ROLE_KEY, next);
    roleListeners.forEach((listener) => listener());
  }, []);
  return [role, setRole] as const;
}
