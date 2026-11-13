export type InMemoryListing = {
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

export type InMemoryDonation = {
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

function getInitialListings(): InMemoryListing[] {
  const now = Date.now();
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

function getInitialDonations(): InMemoryDonation[] {
  const now = Date.now();
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

// Global in-memory singleton state
declare global {
  // eslint-disable-next-line no-var
  var __secondPlateListings: InMemoryListing[] | undefined;
  // eslint-disable-next-line no-var
  var __secondPlateDonations: InMemoryDonation[] | undefined;
}

if (!globalThis.__secondPlateListings) {
  globalThis.__secondPlateListings = getInitialListings();
}
if (!globalThis.__secondPlateDonations) {
  globalThis.__secondPlateDonations = getInitialDonations();
}

export const inMemoryStore = {
  getListings(): InMemoryListing[] {
    return [...(globalThis.__secondPlateListings ?? [])];
  },

  getListing(id: string): InMemoryListing | undefined {
    return globalThis.__secondPlateListings?.find((l) => l.id === id);
  },

  addListing(listing: InMemoryListing): InMemoryListing {
    globalThis.__secondPlateListings = [listing, ...(globalThis.__secondPlateListings ?? [])];
    return listing;
  },

  updateListing(id: string, updates: Partial<InMemoryListing>): InMemoryListing | undefined {
    const list = globalThis.__secondPlateListings ?? [];
    const index = list.findIndex((l) => l.id === id);
    if (index === -1) return undefined;
    const current = list[index];
    if (!current) return undefined;
    const updated: InMemoryListing = {
      ...current,
      ...updates,
      id: current.id,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    return updated;
  },

  getDonations(): { donation: InMemoryDonation; listing: InMemoryListing }[] {
    const listings = globalThis.__secondPlateListings ?? [];
    const donations = globalThis.__secondPlateDonations ?? [];
    const result: { donation: InMemoryDonation; listing: InMemoryListing }[] = [];

    for (const donation of donations) {
      const listing = listings.find((l) => l.id === donation.listingId);
      if (listing) {
        result.push({ donation, listing });
      }
    }
    return result;
  },

  getDonation(id: string): InMemoryDonation | undefined {
    return globalThis.__secondPlateDonations?.find((d) => d.id === id);
  },

  addDonation(donation: InMemoryDonation): InMemoryDonation {
    globalThis.__secondPlateDonations = [donation, ...(globalThis.__secondPlateDonations ?? [])];
    return donation;
  },

  updateDonation(id: string, updates: Partial<InMemoryDonation>): InMemoryDonation | undefined {
    const list = globalThis.__secondPlateDonations ?? [];
    const index = list.findIndex((d) => d.id === id);
    if (index === -1) return undefined;
    const current = list[index];
    if (!current) return undefined;
    const updated: InMemoryDonation = {
      ...current,
      ...updates,
      id: current.id,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    return updated;
  },

  seedDemo(mode: "append" | "refresh") {
    if (mode === "refresh") {
      globalThis.__secondPlateListings = getInitialListings();
      globalThis.__secondPlateDonations = getInitialDonations();
      return;
    }
    const fresh = getInitialListings().map((l) => ({
      ...l,
      id: `seed-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    globalThis.__secondPlateListings = [...fresh, ...(globalThis.__secondPlateListings ?? [])];
  },
};
