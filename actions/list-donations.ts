import { defineAction } from "@agent-native/core/action";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

export default defineAction({
  description:
    "List donations with their food listing, most recently accepted first.",
  schema: z.object({}),
  http: { method: "GET" },
  run: async () => {
    const db = getDb();
    return db
      .select({ donation: schema.donations, listing: schema.foodListings })
      .from(schema.donations)
      .innerJoin(
        schema.foodListings,
        eq(schema.donations.listingId, schema.foodListings.id),
      )
      .orderBy(desc(schema.donations.acceptedAt));
  },
});
