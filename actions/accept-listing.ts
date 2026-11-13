import { defineAction, fail } from "@agent-native/core/action";
import { z } from "zod";

import { inMemoryStore, type InMemoryDonation } from "../server/in-memory-db.js";

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
    const listing = inMemoryStore.getListing(listingId);
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
    const updated = inMemoryStore.updateListing(listingId, {
      portionsRemaining: remainingAfter,
      status: remainingAfter === 0 ? "ACCEPTED" : "AVAILABLE",
    });

    const donation: InMemoryDonation = {
      id: crypto.randomUUID(),
      isDemo: listing.isDemo,
      listingId,
      ngoName: ngoName.trim(),
      deliveryAddress: deliveryAddress.trim(),
      portions,
      status: "ACCEPTED",
      volunteerName: null,
      acceptedAt: now.toISOString(),
      assignedAt: null,
      pickedUpAt: null,
      deliveredAt: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    inMemoryStore.addDonation(donation);

    return { donation, listing: updated };
  },
});
