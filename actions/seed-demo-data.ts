import { defineAction } from "@agent-native/core/action";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

export default defineAction({
  description:
    "Seed fresh realistic demo listings, active pickups, and historical rescues across all three roles.",
  schema: z.object({
    mode: z.enum(["append", "refresh"]).default("append"),
  }),
  run: async ({ mode }) => {
    const db = getDb();
    const now = new Date();

    if (mode === "refresh") {
      // Clean up past demo rows
      await db.delete(schema.donations).where(eq(schema.donations.isDemo, true));
      await db.delete(schema.foodListings).where(eq(schema.foodListings.isDemo, true));
    }

    const demoListingsData = [
      {
        id: `demo-${crypto.randomUUID().slice(0, 8)}`,
        isDemo: true,
        providerName: "Royal Heritage Grand Banquet",
        providerType: "event",
        title: "Dal Makhani, Jeera Rice & Paneer Butter Masala",
        category: "cooked_meal",
        isVegetarian: true,
        description: "Fresh surplus from dinner reception, sealed in heavy-duty food-grade insulated pans. Never self-served.",
        portionsTotal: 65,
        portionsRemaining: 45,
        weightKg: 22.5,
        preparedAt: new Date(now.getTime() - 90 * 60_000).toISOString(),
        collectBy: new Date(now.getTime() + 4 * 3_600_000).toISOString(),
        storageInfo: "Stored in sealed stainless steel hot containers at >65°C.",
        temperatureInfo: "Hot-held above 65°C continuously since prep.",
        allergens: "Contains dairy (ghee, butter, paneer).",
        pickupAddress: "Janpath Road, Saheed Nagar, Bhubaneswar",
        latitude: 20.2985,
        longitude: 85.8310,
        contactPhone: "+91 98765 43210",
        status: "AVAILABLE",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: `demo-${crypto.randomUUID().slice(0, 8)}`,
        isDemo: true,
        providerName: "Artisan Hearth Bakery & Cafe",
        providerType: "restaurant",
        title: "Artisanal Sourdough, Baguettes & Multigrain Loaves",
        category: "bakery",
        isVegetarian: true,
        description: "Fresh morning bake unsold by closing time. Packaged individually in craft paper sleeves.",
        portionsTotal: 40,
        portionsRemaining: 40,
        weightKg: 14.0,
        preparedAt: new Date(now.getTime() - 4 * 3_600_000).toISOString(),
        collectBy: new Date(now.getTime() + 8 * 3_600_000).toISOString(),
        storageInfo: "Ambient dry bakery storage, clean crates.",
        temperatureInfo: "Room temperature 22°C.",
        allergens: "Contains gluten (wheat).",
        pickupAddress: "Master Canteen Square, Bhubaneswar",
        latitude: 20.2670,
        longitude: 85.8390,
        contactPhone: "+91 94321 09876",
        status: "AVAILABLE",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: `demo-${crypto.randomUUID().slice(0, 8)}`,
        isDemo: true,
        providerName: "Kalinga Farmers Fresh Co-op",
        providerType: "canteen",
        title: "Crate of Crisp Spinach, Cucumbers & Cherry Tomatoes",
        category: "produce",
        isVegetarian: true,
        description: "Grade-A surplus harvested this morning. Rinsed and chilled in vented plastic crates.",
        portionsTotal: 50,
        portionsRemaining: 50,
        weightKg: 20.0,
        preparedAt: new Date(now.getTime() - 5 * 3_600_000).toISOString(),
        collectBy: new Date(now.getTime() + 12 * 3_600_000).toISOString(),
        storageInfo: "Cold room stored at 6°C.",
        temperatureInfo: "Refrigerated cold chain maintained.",
        allergens: "None (fresh raw vegetables).",
        pickupAddress: "IRC Village, Nayapalli, Bhubaneswar",
        latitude: 20.3015,
        longitude: 85.8175,
        contactPhone: "+91 91234 56780",
        status: "AVAILABLE",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: `demo-${crypto.randomUUID().slice(0, 8)}`,
        isDemo: true,
        providerName: "Sunrise Tech Park Canteen",
        providerType: "canteen",
        title: "South Indian Idli, Medu Vada, Sambar & Coconut Chutney",
        category: "cooked_meal",
        isVegetarian: true,
        description: "Breakfast surplus packed directly from the steam counters into thermal delivery boxes.",
        portionsTotal: 50,
        portionsRemaining: 0,
        weightKg: 15.0,
        preparedAt: new Date(now.getTime() - 2 * 3_600_000).toISOString(),
        collectBy: new Date(now.getTime() + 90 * 60_000).toISOString(),
        storageInfo: "Thermal hot boxes.",
        temperatureInfo: "Hot held at 68°C.",
        allergens: "Contains coconut, mustard seeds.",
        pickupAddress: "Infocity, Chandrasekharpur, Bhubaneswar",
        latitude: 20.3580,
        longitude: 85.8140,
        contactPhone: "+91 90123 45678",
        status: "ACCEPTED",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ];

    const insertedListings = await db
      .insert(schema.foodListings)
      .values(demoListingsData)
      .returning();

    if (insertedListings.length === 0) {
      return { success: false, listingsCreated: 0, donationsCreated: 0 };
    }

    // Create an active donation waiting for volunteer, and an active delivery for volunteer
    const listingWaitingVolunteer = insertedListings[0];
    const listingForDelivery = insertedListings[3] ?? insertedListings[0];

    if (!listingWaitingVolunteer || !listingForDelivery) {
      return { success: true, listingsCreated: insertedListings.length, donationsCreated: 0 };
    }

    const demoDonations = [
      {
        id: `demo-dn-${crypto.randomUUID().slice(0, 8)}`,
        isDemo: true,
        listingId: listingWaitingVolunteer.id,
        ngoName: "Kalinga Shelter Trust (Demo)",
        deliveryAddress: "Shelter Home 3, Unit-4, Bhubaneswar",
        portions: 20,
        status: "ACCEPTED", // Waiting for volunteer to assign
        volunteerName: null,
        acceptedAt: new Date(now.getTime() - 25 * 60_000).toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: `demo-dn-${crypto.randomUUID().slice(0, 8)}`,
        isDemo: true,
        listingId: listingForDelivery.id,
        ngoName: "Asha Children Home",
        deliveryAddress: "Niladri Vihar, Bhubaneswar",
        portions: 50,
        status: "VOLUNTEER_ASSIGNED", // Currently assigned to Demo Volunteer
        volunteerName: "Demo Volunteer",
        acceptedAt: new Date(now.getTime() - 40 * 60_000).toISOString(),
        assignedAt: new Date(now.getTime() - 15 * 60_000).toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: `demo-dn-${crypto.randomUUID().slice(0, 8)}`,
        isDemo: true,
        listingId: listingWaitingVolunteer.id,
        ngoName: "Kalinga Shelter Trust (Demo)",
        deliveryAddress: "Shelter Home 1, Bhubaneswar",
        portions: 30,
        status: "DELIVERED",
        volunteerName: "Demo Volunteer",
        acceptedAt: new Date(now.getTime() - 3 * 3_600_000).toISOString(),
        assignedAt: new Date(now.getTime() - 2 * 3_600_000).toISOString(),
        pickedUpAt: new Date(now.getTime() - 90 * 60_000).toISOString(),
        deliveredAt: new Date(now.getTime() - 30 * 60_000).toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ];

    await db.insert(schema.donations).values(demoDonations);

    return {
      success: true,
      listingsCreated: insertedListings.length,
      donationsCreated: demoDonations.length,
    };
  },
});
