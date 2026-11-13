import { defineAction } from "@agent-native/core/action";
import { asc } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

export default defineAction({
  description:
    "List all food listings, soonest declared collection deadline first.",
  schema: z.object({}),
  http: { method: "GET" },
  run: async () => {
    const db = getDb();
    return db
      .select()
      .from(schema.foodListings)
      .orderBy(asc(schema.foodListings.collectBy));
  },
});
