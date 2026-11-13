import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

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
  const [now, setNow] = useState(() => (typeof Date !== "undefined" ? Date.now() : 0));
  useEffect(() => {
    setNow(Date.now());
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
  if (typeof window === "undefined") return "provider";
  try {
    const value = window.localStorage?.getItem(ROLE_KEY);
    return value === "ngo" || value === "volunteer" ? value : "provider";
  } catch {
    return "provider";
  }
}

export function useDemoRole() {
  const role = useSyncExternalStore(
    subscribeRole,
    readRole,
    () => "provider" as Role,
  );
  const setRole = useCallback((next: Role) => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage?.setItem(ROLE_KEY, next);
      }
    } catch {
      // ignore
    }
    roleListeners.forEach((listener) => listener());
  }, []);
  return [role, setRole] as const;
}

// -----------------------------------------------------------------------------
// Zero-Sync Client Demo Data Store
// -----------------------------------------------------------------------------

export function getInitialDemoListings(): Listing[] {
  const now = typeof Date !== "undefined" ? Date.now() : 1731520000000;
  return [
    {
      id: "demo-listing-1",
      isDemo: true,
      providerName: "Royal Heritage Grand Banquet",
      providerType: "event",
      title: "Dal Makhani, Jeera Rice & Paneer Butter Masala",
      category: "cooked_meal",
      isVegetarian: true,
      description: "Fresh surplus from dinner reception, packed in heavy-duty food-grade insulated thermal containers. Never self-served.",
      portionsTotal: 65,
      portionsRemaining: 45,
      weightKg: 22.5,
      preparedAt: new Date(now - 90 * 60_000).toISOString(),
      collectBy: new Date(now + 4 * 3_600_000).toISOString(),
      storageInfo: "Stored in sealed stainless steel hot containers at >65°C.",
      temperatureInfo: "Hot-held above 65°C continuously since prep.",
      allergens: "Contains dairy (ghee, butter, paneer).",
      pickupAddress: "Janpath Road, Saheed Nagar, Bhubaneswar",
      latitude: 20.2985,
      longitude: 85.8310,
      contactPhone: "+91 98765 43210",
      status: "AVAILABLE",
      createdAt: new Date(now - 90 * 60_000).toISOString(),
      updatedAt: new Date(now - 30 * 60_000).toISOString(),
    },
    {
      id: "demo-listing-2",
      isDemo: true,
      providerName: "Mayfair Artisan Bakery & Confectionery",
      providerType: "restaurant",
      title: "Fresh Baked Butter Croissants & Multi-grain Artisan Loaves",
      category: "bakery",
      isVegetarian: true,
      description: "Surplus baked goods made this afternoon. Packaged in moisture-resistant kraft bakery bags.",
      portionsTotal: 35,
      portionsRemaining: 25,
      weightKg: 8.5,
      preparedAt: new Date(now - 120 * 60_000).toISOString(),
      collectBy: new Date(now + 2 * 3_600_000 + 45 * 60_000).toISOString(),
      storageInfo: "Ambient dry bakery storage, climate controlled at 22°C.",
      temperatureInfo: "Cool ambient holding, below 24°C.",
      allergens: "Contains gluten, dairy, traces of sesame.",
      pickupAddress: "8-B Jaydev Vihar Square, Bhubaneswar",
      latitude: 20.3021,
      longitude: 85.8234,
      contactPhone: "+91 94370 11223",
      status: "AVAILABLE",
      createdAt: new Date(now - 120 * 60_000).toISOString(),
      updatedAt: new Date(now - 45 * 60_000).toISOString(),
    },
    {
      id: "demo-listing-3",
      isDemo: true,
      providerName: "Infocity Tech Park Corporate Canteen",
      providerType: "canteen",
      title: "Steamed Idlis, Crispy Medu Vadas & Mixed Veg Sambhar",
      category: "cooked_meal",
      isVegetarian: true,
      description: "Prepared for evening corporate shifts. Maintained under certified thermal bain-marie holding.",
      portionsTotal: 50,
      portionsRemaining: 50,
      weightKg: 15.0,
      preparedAt: new Date(now - 45 * 60_000).toISOString(),
      collectBy: new Date(now + 3 * 3_600_000).toISOString(),
      storageInfo: "Continuous hot-hold insulated Cambro carriers.",
      temperatureInfo: "Thermal probe verified at 71°C.",
      allergens: "Contains mustard seeds (tempering), coconut.",
      pickupAddress: "Tower 2 Ground Floor Canteen, Infocity, Patia, Bhubaneswar",
      latitude: 20.3540,
      longitude: 85.8152,
      contactPhone: "+91 97760 99887",
      status: "AVAILABLE",
      createdAt: new Date(now - 45 * 60_000).toISOString(),
      updatedAt: new Date(now - 45 * 60_000).toISOString(),
    },
    {
      id: "demo-listing-4",
      isDemo: true,
      providerName: "Utkal Wholesale Agri Mandi",
      providerType: "canteen",
      title: "Grade-A Surplus Spinach, Ripe Tomatoes & Cluster Beans",
      category: "produce",
      isVegetarian: true,
      description: "Unsold crisp produce crate surplus. Inspected and sorted, free from bruising.",
      portionsTotal: 80,
      portionsRemaining: 80,
      weightKg: 32.0,
      preparedAt: new Date(now - 180 * 60_000).toISOString(),
      collectBy: new Date(now + 7 * 3_600_000).toISOString(),
      storageInfo: "Ventilated vegetable crates in cool produce shade.",
      temperatureInfo: "Ambient cool shade storage.",
      allergens: "None (fresh unadulterated produce).",
      pickupAddress: "Wholesale Mandi Gate 3, Unit-4, Bhouma Nagar, Bhubaneswar",
      latitude: 20.2789,
      longitude: 85.8385,
      contactPhone: "+91 91240 55667",
      status: "AVAILABLE",
      createdAt: new Date(now - 180 * 60_000).toISOString(),
      updatedAt: new Date(now - 180 * 60_000).toISOString(),
    },
    {
      id: "demo-listing-5",
      isDemo: true,
      providerName: "Kalinga Spice Kitchen",
      providerType: "restaurant",
      title: "Aromatic Hyderabadi Dum Biryani with Veg Salan",
      category: "cooked_meal",
      isVegetarian: true,
      description: "Fresh evening surplus dispatched to Kalinga Shelter Trust.",
      portionsTotal: 40,
      portionsRemaining: 0,
      weightKg: 16.0,
      preparedAt: new Date(now - 24 * 3_600_000).toISOString(),
      collectBy: new Date(now - 20 * 3_600_000).toISOString(),
      storageInfo: "Thermal container",
      temperatureInfo: "Hot held",
      allergens: "Contains spices, dairy",
      pickupAddress: "Master Canteen Square, Station Square, Bhubaneswar",
      latitude: 20.2685,
      longitude: 85.8420,
      contactPhone: "+91 98610 33445",
      status: "DELIVERED",
      createdAt: new Date(now - 24 * 3_600_000).toISOString(),
      updatedAt: new Date(now - 18 * 3_600_000).toISOString(),
    },
  ];
}

export function getInitialDemoDonations(): Donation[] {
  const now = typeof Date !== "undefined" ? Date.now() : 1731520000000;
  return [
    {
      id: "demo-donation-1",
      isDemo: true,
      listingId: "demo-listing-1",
      ngoName: "Kalinga Shelter Trust (Demo)",
      deliveryAddress: "Demo shelter, Bhubaneswar (demo location)",
      portions: 20,
      status: "ACCEPTED",
      volunteerName: null,
      acceptedAt: new Date(now - 30 * 60_000).toISOString(),
      assignedAt: null,
      pickedUpAt: null,
      deliveredAt: null,
      createdAt: new Date(now - 30 * 60_000).toISOString(),
      updatedAt: new Date(now - 30 * 60_000).toISOString(),
    },
    {
      id: "demo-donation-2",
      isDemo: true,
      listingId: "demo-listing-2",
      ngoName: "Ashraya Child & Women Care Trust",
      deliveryAddress: "Plot 42, Baramunda Housing Colony, Bhubaneswar",
      portions: 10,
      status: "VOLUNTEER_ASSIGNED",
      volunteerName: "Demo Volunteer",
      acceptedAt: new Date(now - 45 * 60_000).toISOString(),
      assignedAt: new Date(now - 20 * 60_000).toISOString(),
      pickedUpAt: null,
      deliveredAt: null,
      createdAt: new Date(now - 45 * 60_000).toISOString(),
      updatedAt: new Date(now - 20 * 60_000).toISOString(),
    },
    {
      id: "demo-donation-3",
      isDemo: true,
      listingId: "demo-listing-5",
      ngoName: "Kalinga Shelter Trust (Demo)",
      deliveryAddress: "Demo shelter, Bhubaneswar (demo location)",
      portions: 40,
      status: "DELIVERED",
      volunteerName: "Demo Volunteer",
      acceptedAt: new Date(now - 22 * 3_600_000).toISOString(),
      assignedAt: new Date(now - 21 * 3_600_000).toISOString(),
      pickedUpAt: new Date(now - 20 * 3_600_000).toISOString(),
      deliveredAt: new Date(now - 18 * 3_600_000).toISOString(),
      createdAt: new Date(now - 22 * 3_600_000).toISOString(),
      updatedAt: new Date(now - 18 * 3_600_000).toISOString(),
    },
  ];
}

type StoreState = {
  listings: Listing[];
  donations: Donation[];
};

const STORE_KEY = "second-plate-client-store-v2";

function loadSavedStore(): StoreState {
  if (typeof window === "undefined") {
    return {
      listings: getInitialDemoListings(),
      donations: getInitialDemoDonations(),
    };
  }
  try {
    const raw = window.localStorage?.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.listings) && Array.isArray(parsed?.donations)) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return {
    listings: getInitialDemoListings(),
    donations: getInitialDemoDonations(),
  };
}

let clientState: StoreState = loadSavedStore();
const storeListeners = new Set<() => void>();

function notifyStore() {
  storeListeners.forEach((fn) => fn());
}

function persistStore() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage?.setItem(STORE_KEY, JSON.stringify(clientState));
    } catch {
      // ignore
    }
  }
  notifyStore();
}

function subscribeStore(callback: () => void) {
  storeListeners.add(callback);
  return () => {
    storeListeners.delete(callback);
  };
}

function getStoreSnapshot(): StoreState {
  return clientState;
}

export function useSecondPlateStore() {
  return useSyncExternalStore(subscribeStore, getStoreSnapshot, () => clientState);
}

export const secondPlateActions = {
  createListing(input: Omit<Listing, "id" | "isDemo" | "createdAt" | "updatedAt"> & { isDemo?: boolean }) {
    const now = new Date().toISOString();
    const newListing: Listing = {
      ...input,
      id: `listing-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      isDemo: input.isDemo ?? false,
      createdAt: now,
      updatedAt: now,
    };
    clientState = {
      ...clientState,
      listings: [newListing, ...clientState.listings],
    };
    persistStore();
    return newListing;
  },

  acceptListing({
    listingId,
    ngoName,
    deliveryAddress,
    portions,
  }: {
    listingId: string;
    ngoName: string;
    deliveryAddress: string;
    portions: number;
  }) {
    const listing = clientState.listings.find((l) => l.id === listingId);
    if (!listing) throw new Error("Listing not found");
    const claimed = Math.min(portions, listing.portionsRemaining);
    const remaining = listing.portionsRemaining - claimed;
    const now = new Date().toISOString();

    const updatedListing: Listing = {
      ...listing,
      portionsRemaining: remaining,
      status: remaining === 0 ? "ACCEPTED" : listing.status,
      updatedAt: now,
    };

    const newDonation: Donation = {
      id: `donation-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      isDemo: listing.isDemo,
      listingId,
      ngoName,
      deliveryAddress,
      portions: claimed,
      status: "ACCEPTED",
      volunteerName: null,
      acceptedAt: now,
      assignedAt: null,
      pickedUpAt: null,
      deliveredAt: null,
      createdAt: now,
      updatedAt: now,
    };

    clientState = {
      listings: clientState.listings.map((l) => (l.id === listingId ? updatedListing : l)),
      donations: [newDonation, ...clientState.donations],
    };
    persistStore();
    return { donation: newDonation, listing: updatedListing };
  },

  updateDonationStatus({
    donationId,
    step,
    status,
    volunteerName,
  }: {
    donationId: string;
    step?: "assign" | "pickup" | "deliver" | "cancel";
    status?: string;
    volunteerName?: string;
  }) {
    const donation = clientState.donations.find((d) => d.id === donationId);
    if (!donation) throw new Error("Donation not found");
    const now = new Date().toISOString();

    let targetStatus = status ?? donation.status;
    if (step === "assign") targetStatus = "VOLUNTEER_ASSIGNED";
    else if (step === "pickup") targetStatus = "PICKED_UP";
    else if (step === "deliver") targetStatus = "DELIVERED";
    else if (step === "cancel") targetStatus = "CANCELLED";

    const updatedDonation: Donation = {
      ...donation,
      status: targetStatus,
      volunteerName: volunteerName !== undefined ? volunteerName : donation.volunteerName,
      assignedAt: targetStatus === "VOLUNTEER_ASSIGNED" ? (donation.assignedAt ?? now) : donation.assignedAt,
      pickedUpAt: targetStatus === "PICKED_UP" ? (donation.pickedUpAt ?? now) : donation.pickedUpAt,
      deliveredAt: targetStatus === "DELIVERED" ? (donation.deliveredAt ?? now) : donation.deliveredAt,
      updatedAt: now,
    };

    let updatedListings = clientState.listings;
    if (targetStatus === "CANCELLED" && donation.status !== "CANCELLED") {
      updatedListings = clientState.listings.map((l) => {
        if (l.id === donation.listingId) {
          const newRemaining = l.portionsRemaining + donation.portions;
          return {
            ...l,
            portionsRemaining: newRemaining,
            status: "AVAILABLE",
            updatedAt: now,
          };
        }
        return l;
      });
    }

    clientState = {
      listings: updatedListings,
      donations: clientState.donations.map((d) => (d.id === donationId ? updatedDonation : d)),
    };
    persistStore();
    return updatedDonation;
  },

  cancelListing(listingId: string) {
    const now = new Date().toISOString();
    clientState = {
      ...clientState,
      listings: clientState.listings.map((l) =>
        l.id === listingId ? { ...l, status: "CANCELLED", updatedAt: now } : l
      ),
    };
    persistStore();
  },

  seedDemoData(mode: "append" | "refresh" = "append") {
    if (mode === "refresh") {
      clientState = {
        listings: getInitialDemoListings(),
        donations: getInitialDemoDonations(),
      };
      persistStore();
      return;
    }
    const fresh = getInitialDemoListings().map((l) => ({
      ...l,
      id: `seed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    clientState = {
      ...clientState,
      listings: [...fresh, ...clientState.listings],
    };
    persistStore();
  },

  resetDemoData() {
    clientState = {
      listings: getInitialDemoListings(),
      donations: getInitialDemoDonations(),
    };
    persistStore();
  },
};

export function useSecondPlateActions() {
  return secondPlateActions;
}

export function useListingsData() {
  const store = useSecondPlateStore();
  const sorted = useMemo(() => {
    return [...store.listings].sort((a, b) => Date.parse(a.collectBy) - Date.parse(b.collectBy));
  }, [store.listings]);

  return {
    data: sorted,
    isLoading: false,
    isError: false,
    error: null,
    refetch: () => {},
  };
}

export function useDonationsData() {
  const store = useSecondPlateStore();
  const rows: DonationRow[] = useMemo(() => {
    const listingMap = new Map<string, Listing>(store.listings.map((l) => [l.id, l]));
    return store.donations
      .map((donation) => {
        const listing = listingMap.get(donation.listingId);
        return listing ? { donation, listing } : null;
      })
      .filter((r): r is DonationRow => r !== null)
      .sort((a, b) => Date.parse(b.donation.createdAt) - Date.parse(a.donation.createdAt));
  }, [store.donations, store.listings]);

  return {
    data: rows,
    isLoading: false,
    isError: false,
    error: null,
    refetch: () => {},
  };
}

export function useImpactData() {
  const store = useSecondPlateStore();
  const impact = useMemo(() => {
    const listingMap = new Map<string, Listing>(store.listings.map((l) => [l.id, l]));
    const emptyTotals = () => ({
      portions: 0,
      weightKg: 0,
      completedDonations: 0,
      activeProviders: 0,
      ngosReceiving: 0,
      volunteerDeliveries: 0,
    });
    const totals = { real: emptyTotals(), demo: emptyTotals() };
    const ngos = { real: new Set<string>(), demo: new Set<string>() };
    const providerSets = { real: new Set<string>(), demo: new Set<string>() };
    const daily = new Map<string, { day: string; real: number; demo: number }>();

    for (const donation of store.donations) {
      if (donation.status !== "DELIVERED") continue;
      const listing = listingMap.get(donation.listingId);
      const scope = donation.isDemo ? "demo" : "real";
      const t = totals[scope];
      t.portions += donation.portions;
      if (listing?.weightKg && listing.portionsTotal > 0) {
        t.weightKg += listing.weightKg * (donation.portions / listing.portionsTotal);
      }
      t.completedDonations += 1;
      if (donation.volunteerName) t.volunteerDeliveries += 1;
      ngos[scope].add(donation.ngoName);

      const day = (donation.deliveredAt ?? donation.updatedAt).slice(0, 10);
      const bucket = daily.get(day) ?? { day, real: 0, demo: 0 };
      bucket[scope] += donation.portions;
      daily.set(day, bucket);
    }

    for (const p of store.listings) {
      providerSets[p.isDemo ? "demo" : "real"].add(p.providerName);
    }

    totals.real.ngosReceiving = ngos.real.size;
    totals.demo.ngosReceiving = ngos.demo.size;
    totals.real.activeProviders = providerSets.real.size;
    totals.demo.activeProviders = providerSets.demo.size;
    totals.real.weightKg = Math.round(totals.real.weightKg * 10) / 10;
    totals.demo.weightKg = Math.round(totals.demo.weightKg * 10) / 10;

    return {
      real: totals.real,
      demo: totals.demo,
      daily: [...daily.values()].sort((a, b) => a.day.localeCompare(b.day)),
    };
  }, [store.donations, store.listings]);

  return {
    data: impact,
    isLoading: false,
    isError: false,
    error: null,
    refetch: () => {},
  };
}
