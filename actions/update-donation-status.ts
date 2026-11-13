import { defineAction, fail } from "@agent-native/core/action";
import { z } from "zod";

import { inMemoryStore } from "../server/in-memory-db.js";

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

    const current = inMemoryStore.getDonation(donationId);
    if (!current) fail("Donation not found.", { statusCode: 404 });
    if (current.status !== transition.from) {
      fail(`This donation is ${current.status}, so it cannot be ${step}d.`, {
        statusCode: 409,
      });
    }

    const updates: Record<string, any> = {
      status: transition.to,
    };
    if (step === "assign" && volunteerName) {
      updates.volunteerName = volunteerName;
      updates.assignedAt = now;
    } else if (step === "pickup") {
      updates.pickedUpAt = now;
    } else if (step === "deliver") {
      updates.deliveredAt = now;
    }

    const donation = inMemoryStore.updateDonation(donationId, updates);

    const listing = inMemoryStore.getListing(current.listingId);
    if (listing) {
      if (step === "cancel") {
        inMemoryStore.updateListing(listing.id, {
          portionsRemaining: listing.portionsRemaining + current.portions,
          status: "AVAILABLE",
        });
      } else if (step === "pickup" || step === "deliver") {
        inMemoryStore.updateListing(listing.id, {
          status: step === "pickup" ? "PICKED_UP" : "DELIVERED",
        });
      }
    }

    return donation;
  },
});
