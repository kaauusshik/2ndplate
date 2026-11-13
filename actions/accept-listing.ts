import { defineAction, fail } from "@agent-native/core/action";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

export default defineAction({
  description:
    "Accept some portions of an available listing for an NGO. Reserves portions atomically and refuses expired or overbooked listings.",
  schema: z.object({
    listingId: z.string().min(1),
    ngoName: z.string().min(2).max(120),
    deliveryAddress: z.string().min(5).max(300),
    portions: z.number().int().min(1).max(10000),
  }),
  run: async ({ listingId, ngoName, deliveryAddress, portions }) => {
    const db = getDb();
    return db.transaction(async (tx) => {
      const [listing] = await tx
        .select()
        .from(schema.foodListings)
        .where(eq(schema.foodListings.id, listingId));
      if (!listing) fail("Listing not found.", { statusCode: 404 });
      if (listing.status !== "AVAILABLE") {
        fail("This listing is no longer available.", { statusCode: 409 });
      }
      const now = new Date();
      if (Date.parse(listing.collectBy) <= now.getTime()) {
        fail("The declared collection deadline has passed.", {
          statusCode: 409,
        });
      }
      if (portions > listing.portionsRemaining) {
        fail(`Only ${listing.portionsRemaining} portions remain.`, {
          statusCode: 409,
        });
      }

      const remainingAfter = listing.portionsRemaining - portions;
      const [updated] = await tx
        .update(schema.foodListings)
        .set({
          portionsRemaining: sql`${schema.foodListings.portionsRemaining} - ${portions}`,
          status: remainingAfter === 0 ? "ACCEPTED" : "AVAILABLE",
          updatedAt: now.toISOString(),
        })
        .where(
          and(
            eq(schema.foodListings.id, listingId),
            eq(schema.foodListings.status, "AVAILABLE"),
            gte(schema.foodListings.portionsRemaining, portions),
          ),
        )
        .returning();
      if (!updated) {
        fail("Another NGO just reserved these portions. Please refresh.", {
          statusCode: 409,
        });
      }

      const [donation] = await tx
        .insert(schema.donations)
        .values({
          id: crypto.randomUUID(),
          isDemo: listing.isDemo,
          listingId,
          ngoName: ngoName.trim(),
          deliveryAddress: deliveryAddress.trim(),
          portions,
          status: "ACCEPTED",
          acceptedAt: now.toISOString(),
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        })
        .returning();
      return { donation, listing: updated };
    });
  },
});
