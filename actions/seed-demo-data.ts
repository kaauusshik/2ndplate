import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { inMemoryStore } from "../server/in-memory-db.js";

export default defineAction({
  description:
    "Seed fresh realistic demo listings, active pickups, and historical rescues across all three roles.",
  schema: z.object({
    mode: z.enum(["append", "refresh"]).default("append"),
  }),
  run: async ({ mode }) => {
    inMemoryStore.seedDemo(mode);
    return { ok: true, listingsCount: inMemoryStore.getListings().length };
  },
});
