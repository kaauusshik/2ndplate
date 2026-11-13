import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { inMemoryStore } from "../server/in-memory-db.js";

export default defineAction({
  description:
    "List all food listings, soonest declared collection deadline first.",
  schema: z.object({}),
  http: { method: "GET" },
  run: async () => {
    return inMemoryStore
      .getListings()
      .sort((a, b) => Date.parse(a.collectBy) - Date.parse(b.collectBy));
  },
});
