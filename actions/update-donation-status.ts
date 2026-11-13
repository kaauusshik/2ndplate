import { defineAction, fail } from "@agent-native/core/action";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

const transitions = {
  assign: { from: "ACCEPTED", to: "VOLUNTEER_ASSIGNED" },
  pickup: { from: "VOLUNTEER_ASSIGNED", to: "PICKED_UP" },
  deliver: { from: "PICKED_UP", to: "DELIVERED" },
  cancel: { from: "ACCEPTED", to: "CANCELLED" },
} as const;

export default defineAction({
  description:
    "Move a donation through the flow: assign a volunteer, mark picked up, mark delivered, or cancel an unstarted donation (which returns its portions to the listing).",
  schema: z.object({
    donationId: z.string().min(1),
    step: z.enum(["assign", "pickup", "deliver", "cancel"]),
    volunteerName: z.string().min(2).max(120).optional(),
  }),
  run: async ({ donationId, step, volunteerName }) => {
    if (step === "assign" && !volunteerName) {
      fail("A volunteer name is required to assign a delivery.", {
        statusCode: 400,
      });
    }
    const transition = transitions[step];
    const now = new Date().toISOString();
    const db = getDb();

    return db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(schema.donations)
        .where(eq(schema.donations.id, donationId));
      if (!current) fail("Donation not found.", { statusCode: 404 });
      if (current.status !== transition.from) {
        fail(`This donation is ${current.status}, so it cannot be ${step}d.`, {
          statusCode: 409,
        });
      }

      const [donation] = await tx
        .update(schema.donations)
        .set({
          status: transition.to,
          ...(step === "assign" ? { volunteerName, assignedAt: now } : {}),
          ...(step === "pickup" ? { pickedUpAt: now } : {}),
          ...(step === "deliver" ? { deliveredAt: now } : {}),
          updatedAt: now,
        })
        .where(
          and(
            eq(schema.donations.id, donationId),
            eq(schema.donations.status, transition.from),
          ),
        )
        .returning();
      if (!donation) {
        fail("This donation was changed by someone else. Please refresh.", {
          statusCode: 409,
        });
      }

      if (step === "cancel") {
        await tx
          .update(schema.foodListings)
          .set({
            portionsRemaining: sql`${schema.foodListings.portionsRemaining} + ${current.portions}`,
            status: "AVAILABLE",
            updatedAt: now,
          })
          .where(eq(schema.foodListings.id, current.listingId));
      } else if (step === "pickup" || step === "deliver") {
        await tx
          .update(schema.foodListings)
          .set({
            status: step === "pickup" ? "PICKED_UP" : "DELIVERED",
            updatedAt: now,
          })
          .where(eq(schema.foodListings.id, current.listingId));
      }

      return donation;
    });
  },
});
