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

// -----------------------------------------------------------------------------
// 3-Tier Food Destination Architecture
// -----------------------------------------------------------------------------
// Tier 1: People & NGOs (Fresh surplus for direct human consumption & shelters)
// Tier 2: Animal Feed (Safe cooked grains, bread, produce for cattle & animal shelters)
// Tier 3: Compost & Biogas (Organic scraps & trimmings converted to clean energy & rich soil)
export type FoodDestinationTier = "people" | "animals" | "compost";

export const DESTINATION_TIER_META: Record<
  FoodDestinationTier,
  {
    tier: number;
    title: string;
    shortTitle: string;
    sublabel: string;
    badge: string;
    icon: string;
    tone: string;
    borderTone: string;
    bgTone: string;
    textTone: string;
  }
> = {
  people: {
    tier: 1,
    title: "Tier 1: People & NGOs (Direct Relief)",
    shortTitle: "Direct to People / NGO",
    sublabel: "Strictly fresh, edible meals & groceries for human consumption",
    badge: "👥 Tier 1: People / NGO (Fresh)",
    icon: "👥",
    tone: "emerald",
    borderTone: "border-emerald-500/30",
    bgTone: "bg-emerald-500/10",
    textTone: "text-emerald-700 dark:text-emerald-400",
  },
  animals: {
    tier: 2,
    title: "Tier 2: Animal Feed (Cattle & Shelters)",
    shortTitle: "Animal Feed & Gaushalas",
    sublabel: "Wholesome grains, vegetables & bread safe for cattle, stray feeders & animal shelters",
    badge: "🐾 Tier 2: Animal Feed",
    icon: "🐾",
    tone: "amber",
    borderTone: "border-amber-500/30",
    bgTone: "bg-amber-500/10",
    textTone: "text-amber-700 dark:text-amber-400",
  },
  compost: {
    tier: 3,
    title: "Tier 3: Compost & Biogas (Circular Green Energy)",
    shortTitle: "Compost & Biogas",
    sublabel: "Over-ripe scraps, peels & biomass converted to biogas fuel or organic fertilizer",
    badge: "♻️ Tier 3: Compost / Biogas",
    icon: "♻️",
    tone: "teal",
    borderTone: "border-teal-500/30",
    bgTone: "bg-teal-500/10",
    textTone: "text-teal-700 dark:text-teal-400",
  },
};

export type Listing = {
  id: string;
  isDemo: boolean;
  providerName: string;
  providerType: string;
  title: string;
  category: string;
  destinationTier: FoodDestinationTier;
  allowAlternativeRouting: boolean;
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

// -----------------------------------------------------------------------------
// NGO Food Demands & Donor Pledge System
// -----------------------------------------------------------------------------
export type DemandPledge = {
  id: string;
  donorName: string;
  portions: number;
  pledgedAt: string;
  note?: string | undefined;
};

export type NgoDemand = {
  id: string;
  isDemo: boolean;
  ngoName: string;
  foodType: string;
  portionsNeeded: number;
  portionsPledged: number;
  deadlineTime: string; // e.g. "9:00 PM tonight" or ISO timestamp
  urgency: "critical" | "high" | "normal";
  location: string;
  purpose: string;
  status: "OPEN" | "FULFILLED";
  pledges: DemandPledge[];
  createdAt: string;
};

// -----------------------------------------------------------------------------
// Organized Events & World Food Day Drives
// -----------------------------------------------------------------------------
export type SolidarityEvent = {
  id: string;
  title: string;
  dateLabel: string;
  organizer: string;
  theme: string;
  description: string;
  targetMeals: number;
  pledgedMeals: number;
  partnerNgos: string[];
  participatingDonors: string[];
  isAnnual: boolean;
  badge: string;
};

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
      destinationTier: "people",
      allowAlternativeRouting: true,
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
      destinationTier: "people",
      allowAlternativeRouting: true,
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
      destinationTier: "people",
      allowAlternativeRouting: true,
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
      destinationTier: "animals",
      allowAlternativeRouting: true,
      isVegetarian: true,
      description: "Surplus fresh greens, ripe squash and bean pods. Checked and ideal for cattle feed and local Gaushalas.",
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
      destinationTier: "people",
      allowAlternativeRouting: false,
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
    {
      id: "demo-listing-6",
      isDemo: true,
      providerName: "Jaydev Community Bakery & Dairy",
      providerType: "restaurant",
      title: "Wholesome Day-Old Bran Loaves & Cracked Grain Porridge",
      category: "bakery",
      destinationTier: "animals",
      allowAlternativeRouting: true,
      isVegetarian: true,
      description: "Unsold plain wheat bran loaves and cooked grain mash. Strictly safe and nutritious for Gaushala cows and animal shelter feeders.",
      portionsTotal: 40,
      portionsRemaining: 35,
      weightKg: 18.0,
      preparedAt: new Date(now - 200 * 60_000).toISOString(),
      collectBy: new Date(now + 5 * 3_600_000).toISOString(),
      storageInfo: "Dry ventilated bins, clean food grade containers.",
      temperatureInfo: "Cool ambient",
      allergens: "Wheat gluten",
      pickupAddress: "Plot 19, Chandrasekharpur, Bhubaneswar",
      latitude: 20.3245,
      longitude: 85.8190,
      contactPhone: "+91 94371 88990",
      status: "AVAILABLE",
      createdAt: new Date(now - 200 * 60_000).toISOString(),
      updatedAt: new Date(now - 60 * 60_000).toISOString(),
    },
    {
      id: "demo-listing-7",
      isDemo: true,
      providerName: "Central Agro Processing Kitchen",
      providerType: "canteen",
      title: "Organic Vegetable Trimmings & Kitchen Biomass",
      category: "produce",
      destinationTier: "compost",
      allowAlternativeRouting: false,
      isVegetarian: true,
      description: "Clean vegetable trimmings, squash rinds, and grain chaff suitable for localized biomethanation biogas digester or aerobic organic compost.",
      portionsTotal: 60,
      portionsRemaining: 60,
      weightKg: 42.0,
      preparedAt: new Date(now - 150 * 60_000).toISOString(),
      collectBy: new Date(now + 8 * 3_600_000).toISOString(),
      storageInfo: "Aerated organic green collection bins.",
      temperatureInfo: "Ambient compost collection",
      allergens: "None",
      pickupAddress: "Industrial Estate Block 4, Mancheswar, Bhubaneswar",
      latitude: 20.3120,
      longitude: 85.8560,
      contactPhone: "+91 99380 44556",
      status: "AVAILABLE",
      createdAt: new Date(now - 150 * 60_000).toISOString(),
      updatedAt: new Date(now - 150 * 60_000).toISOString(),
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

export function getInitialDemoDemands(): NgoDemand[] {
  const now = typeof Date !== "undefined" ? Date.now() : 1731520000000;
  return [
    {
      id: "demand-1",
      isDemo: true,
      ngoName: "Kalinga Shelter Trust (Demo)",
      foodType: "Dal, Steamed Rice & Mixed Sabzi",
      portionsNeeded: 50,
      portionsPledged: 20,
      deadlineTime: "9:00 PM tonight",
      urgency: "high",
      location: "Station Square Night Shelter, Bhubaneswar",
      purpose: "Emergency evening dinner distribution for homeless daily-wage earners",
      status: "OPEN",
      pledges: [
        {
          id: "pledge-1",
          donorName: "Royal Heritage Grand Banquet",
          portions: 20,
          pledgedAt: new Date(now - 30 * 60_000).toISOString(),
          note: "Dispatching via insulated thermo carrier",
        },
      ],
      createdAt: new Date(now - 60 * 60_000).toISOString(),
    },
    {
      id: "demand-2",
      isDemo: true,
      ngoName: "Ashraya Child & Women Care Trust",
      foodType: "Nutritious Fruit Baskets, Bread & Milk",
      portionsNeeded: 35,
      portionsPledged: 35,
      deadlineTime: "7:30 PM today",
      urgency: "normal",
      location: "Plot 42, Baramunda Housing Colony, Bhubaneswar",
      purpose: "Evening wholesome nutritious snacks for 35 children",
      status: "FULFILLED",
      pledges: [
        {
          id: "pledge-2",
          donorName: "Mayfair Artisan Bakery",
          portions: 35,
          pledgedAt: new Date(now - 90 * 60_000).toISOString(),
          note: "Fresh loaves and fruit packs ready for pickup",
        },
      ],
      createdAt: new Date(now - 120 * 60_000).toISOString(),
    },
    {
      id: "demand-3",
      isDemo: true,
      ngoName: "Capital Patient Attendant Seva",
      foodType: "Khichdi / Upma / Chapati with Dal",
      portionsNeeded: 75,
      portionsPledged: 25,
      deadlineTime: "9:30 PM tonight",
      urgency: "critical",
      location: "Capital Hospital Gate 2 Relief Tent, Unit-6",
      purpose: "Hot meal support for poor family members attending hospital ICU patients",
      status: "OPEN",
      pledges: [
        {
          id: "pledge-3",
          donorName: "Kalinga Spice Kitchen",
          portions: 25,
          pledgedAt: new Date(now - 15 * 60_000).toISOString(),
          note: "Warm khichdi freshly packed in 25 insulated boxes",
        },
      ],
      createdAt: new Date(now - 45 * 60_000).toISOString(),
    },
  ];
}

export function getInitialDemoEvents(): SolidarityEvent[] {
  return [
    {
      id: "event-world-food-day",
      title: "World Food Day Solidarity Mega-Drive",
      dateLabel: "October 16 · Annual Flagship Drive",
      organizer: "Bhubaneswar Hotel & Restaurant Coalition × Second Plate",
      theme: "Leave NO ONE Behind — Zero Hunger, Zero Landfill Waste",
      description: "An annual collective movement where 45+ premier restaurants, banquet halls, and caterers mobilize excess gourmet and staple meals specifically for verified community kitchens and shelters across the city.",
      targetMeals: 10000,
      pledgedMeals: 7650,
      partnerNgos: [
        "Kalinga Shelter Trust",
        "Ashraya Child & Women Care",
        "Vastram & Aahar Seva",
        "Jan Seva Samiti",
        "Sneha Gaushala Federation",
      ],
      participatingDonors: [
        "Royal Heritage Grand Banquet",
        "Mayfair Artisan Bakery",
        "Infocity Tech Park Corporate Canteen",
        "Crown Kitchens",
        "Swosti Premium",
        "Kalinga Spice Kitchen",
      ],
      isAnnual: true,
      badge: "October 16 · World Food Day",
    },
    {
      id: "event-animal-gaushala",
      title: "Paws & Pastures: Gaushala & Animal Rescue Feed",
      dateLabel: "Every Sunday · Ongoing Collective",
      organizer: "Second Plate Animal Welfare Wing",
      theme: "Nutritious Food for Every Living Being",
      description: "Connecting wholesome unsold bread, vegetable greens, and grains directly to local animal shelters, stray animal rescue teams, and registered Gaushalas.",
      targetMeals: 2500,
      pledgedMeals: 1980,
      partnerNgos: [
        "Bhubaneswar Gaushala Trust",
        "Paws of Hope Animal Hospital",
        "Street Animal Feeder Collective",
      ],
      participatingDonors: [
        "Jaydev Community Bakery",
        "Utkal Wholesale Agri Mandi",
        "Infocity Tech Park Canteen",
      ],
      isAnnual: false,
      badge: "Weekly Animal Outreach",
    },
    {
      id: "event-biogas-compost",
      title: "Green Earth Biogas & Circular Biomass Campaign",
      dateLabel: "Nov 25 - Dec 2 · City Green Drive",
      organizer: "Municipal Circular Bio-Energy Hub",
      theme: "From Inedible Scraps to Renewable Cooking Gas",
      description: "Redirecting 10 tonnes of inedible kitchen scraps, trimmings, and crop biomass to decentralized biomethanation digesters, producing clean cooking biogas for community shelters.",
      targetMeals: 5000,
      pledgedMeals: 4320,
      partnerNgos: [
        "BMC Decentralized Bio-Methanation Plant",
        "Utkal Organic Green Composting Alliance",
      ],
      participatingDonors: [
        "Central Agro Processing Kitchen",
        "Royal Heritage Banquets",
        "KIIT Food Court",
      ],
      isAnnual: true,
      badge: "Renewable Energy & Compost",
    },
  ];
}

type StoreState = {
  listings: Listing[];
  donations: Donation[];
  demands: NgoDemand[];
  events: SolidarityEvent[];
};

const STORE_KEY = "second-plate-client-store-v3";

function loadSavedStore(): StoreState {
  if (typeof window === "undefined") {
    return {
      listings: getInitialDemoListings(),
      donations: getInitialDemoDonations(),
      demands: getInitialDemoDemands(),
      events: getInitialDemoEvents(),
    };
  }
  try {
    const raw = window.localStorage?.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        Array.isArray(parsed?.listings) &&
        Array.isArray(parsed?.donations) &&
        Array.isArray(parsed?.demands) &&
        Array.isArray(parsed?.events)
      ) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return {
    listings: getInitialDemoListings(),
    donations: getInitialDemoDonations(),
    demands: getInitialDemoDemands(),
    events: getInitialDemoEvents(),
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
  createListing(
    input: Omit<Listing, "id" | "isDemo" | "createdAt" | "updatedAt"> & { isDemo?: boolean },
  ) {
    const now = new Date().toISOString();
    const newListing: Listing = {
      ...input,
      id: `listing-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      destinationTier: input.destinationTier ?? "people",
      allowAlternativeRouting: input.allowAlternativeRouting ?? true,
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
      ...clientState,
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
      ...clientState,
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
        l.id === listingId ? { ...l, status: "CANCELLED", updatedAt: now } : l,
      ),
    };
    persistStore();
  },

  // ---------------------------------------------------------------------------
  // Demand Actions
  // ---------------------------------------------------------------------------
  createNgoDemand(input: {
    ngoName: string;
    foodType: string;
    portionsNeeded: number;
    deadlineTime: string;
    urgency: "critical" | "high" | "normal";
    location: string;
    purpose: string;
  }) {
    const now = new Date().toISOString();
    const newDemand: NgoDemand = {
      id: `demand-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      isDemo: true,
      ngoName: input.ngoName,
      foodType: input.foodType,
      portionsNeeded: input.portionsNeeded,
      portionsPledged: 0,
      deadlineTime: input.deadlineTime,
      urgency: input.urgency,
      location: input.location,
      purpose: input.purpose,
      status: "OPEN",
      pledges: [],
      createdAt: now,
    };
    clientState = {
      ...clientState,
      demands: [newDemand, ...clientState.demands],
    };
    persistStore();
    return newDemand;
  },

  pledgeToDemand({
    demandId,
    donorName,
    portions,
    note,
  }: {
    demandId: string;
    donorName: string;
    portions: number;
    note?: string | undefined;
  }) {
    const demand = clientState.demands.find((d) => d.id === demandId);
    if (!demand) throw new Error("Demand not found");
    const now = new Date().toISOString();

    const newPledge: DemandPledge = {
      id: `pledge-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      donorName,
      portions,
      pledgedAt: now,
      note,
    };

    const newTotalPledged = demand.portionsPledged + portions;
    const isFulfilled = newTotalPledged >= demand.portionsNeeded;

    const updatedDemand: NgoDemand = {
      ...demand,
      portionsPledged: newTotalPledged,
      status: isFulfilled ? "FULFILLED" : demand.status,
      pledges: [newPledge, ...demand.pledges],
    };

    clientState = {
      ...clientState,
      demands: clientState.demands.map((d) => (d.id === demandId ? updatedDemand : d)),
    };
    persistStore();
    return updatedDemand;
  },

  // ---------------------------------------------------------------------------
  // Event Actions
  // ---------------------------------------------------------------------------
  pledgeToEvent({
    eventId,
    donorName,
    portions,
  }: {
    eventId: string;
    donorName: string;
    portions: number;
  }) {
    const event = clientState.events.find((e) => e.id === eventId);
    if (!event) throw new Error("Event not found");

    const updatedDonors = event.participatingDonors.includes(donorName)
      ? event.participatingDonors
      : [donorName, ...event.participatingDonors];

    const updatedEvent: SolidarityEvent = {
      ...event,
      pledgedMeals: event.pledgedMeals + portions,
      participatingDonors: updatedDonors,
    };

    clientState = {
      ...clientState,
      events: clientState.events.map((e) => (e.id === eventId ? updatedEvent : e)),
    };
    persistStore();
    return updatedEvent;
  },

  seedDemoData(mode: "append" | "refresh" = "append") {
    if (mode === "refresh") {
      clientState = {
        listings: getInitialDemoListings(),
        donations: getInitialDemoDonations(),
        demands: getInitialDemoDemands(),
        events: getInitialDemoEvents(),
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
      demands: getInitialDemoDemands(),
      events: getInitialDemoEvents(),
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

export function useNgoDemandsData() {
  const store = useSecondPlateStore();
  return {
    data: store.demands,
    isLoading: false,
    isError: false,
    error: null,
    refetch: () => {},
  };
}

export function useSolidarityEventsData() {
  const store = useSecondPlateStore();
  return {
    data: store.events,
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
      tierPeoplePortions: 0,
      tierAnimalKg: 0,
      tierCompostKg: 0,
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
      const tier = listing?.destinationTier ?? "people";
      const fraction = listing?.portionsTotal && listing.portionsTotal > 0
        ? donation.portions / listing.portionsTotal
        : 1;
      const donationWeight = listing?.weightKg ? listing.weightKg * fraction : donation.portions * 0.4;

      if (tier === "people") {
        t.tierPeoplePortions += donation.portions;
      } else if (tier === "animals") {
        t.tierAnimalKg += donationWeight;
      } else if (tier === "compost") {
        t.tierCompostKg += donationWeight;
      }

      if (listing?.weightKg && listing.portionsTotal > 0) {
        t.weightKg += listing.weightKg * fraction;
      } else {
        t.weightKg += donationWeight;
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
    totals.real.tierAnimalKg = Math.round(totals.real.tierAnimalKg * 10) / 10;
    totals.demo.tierAnimalKg = Math.round(totals.demo.tierAnimalKg * 10) / 10;
    totals.real.tierCompostKg = Math.round(totals.real.tierCompostKg * 10) / 10;
    totals.demo.tierCompostKg = Math.round(totals.demo.tierCompostKg * 10) / 10;

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
