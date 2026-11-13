import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { inMemoryStore } from "../server/in-memory-db.js";

export default defineAction({
  description:
    "List donations with their food listing, most recently accepted first.",
  schema: z.object({}),
  http: { method: "GET" },
  run: async () => {
    return inMemoryStore
      .getDonations()
      .sort((a, b) => Date.parse(b.donation.acceptedAt) - Date.parse(a.donation.acceptedAt));
  },
});
