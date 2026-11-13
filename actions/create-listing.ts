import { defineAction, fail } from "@agent-native/core/action";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

const isoDate = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date");

export default defineAction({
  description:
    "Create a surplus food listing with a declared safe collection deadline.",
  schema: z.object({
    providerName: z.string().min(2).max(120),
    providerType: z.enum(["restaurant", "hotel", "canteen", "hostel", "event"]),
    title: z.string().min(2).max(120),
    category: z.enum(["cooked_meal", "bakery", "produce", "packaged"]),
    isVegetarian: z.boolean(),
    description: z.string().max(1000).default(""),
    portions: z.number().int().min(1).max(10000),
    weightKg: z.number().positive().max(10000).optional(),
    preparedAt: isoDate,
    collectBy: isoDate,
    storageInfo: z.string().min(3).max(500),
    temperatureInfo: z.string().min(3).max(500),
    allergens: z.string().max(500).default(""),
    pickupAddress: z.string().min(5).max(300),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    contactPhone: z.string().min(6).max(20),
  }),
  run: async (input) => {
    const now = new Date();
    if (Date.parse(input.collectBy) <= now.getTime()) {
      fail("The collection deadline must be in the future.", {
        statusCode: 400,
      });
    }
    if (Date.parse(input.collectBy) <= Date.parse(input.preparedAt)) {
      fail("The collection deadline must be after the preparation time.", {
        statusCode: 400,
      });
    }

    const db = getDb();
    const [row] = await db
      .insert(schema.foodListings)
      .values({
        id: crypto.randomUUID(),
        isDemo: false,
        providerName: input.providerName.trim(),
        providerType: input.providerType,
        title: input.title.trim(),
        category: input.category,
        isVegetarian: input.isVegetarian,
        description: input.description.trim(),
        portionsTotal: input.portions,
        portionsRemaining: input.portions,
        weightKg: input.weightKg ?? null,
        preparedAt: new Date(input.preparedAt).toISOString(),
        collectBy: new Date(input.collectBy).toISOString(),
        storageInfo: input.storageInfo.trim(),
        temperatureInfo: input.temperatureInfo.trim(),
        allergens: input.allergens.trim(),
        pickupAddress: input.pickupAddress.trim(),
        latitude: input.latitude,
        longitude: input.longitude,
        contactPhone: input.contactPhone.trim(),
        status: "AVAILABLE",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      })
      .returning();
    return row;
  },
});
