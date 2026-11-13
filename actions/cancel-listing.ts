import { defineAction, fail } from "@agent-native/core/action";
import { z } from "zod";

import { inMemoryStore } from "../server/in-memory-db.js";

export default defineAction({
  description:
    "Cancel a food listing that has no accepted portions yet. Only AVAILABLE listings can be cancelled.",
  schema: z.object({
    id: z.string().min(1).describe("Listing id"),
  }),
  run: async ({ id }) => {
    const listing = inMemoryStore.getListing(id);
    if (!listing || listing.status !== "AVAILABLE") {
      fail("This listing cannot be cancelled in its current state.", {
        statusCode: 409,
      });
    }
    const updated = inMemoryStore.updateListing(id, { status: "CANCELLED" });
    return updated;
  },
});
