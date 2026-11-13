import { defineAction, fail } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

export default defineAction({
  description:
    "Cancel a food listing that has no accepted portions yet. Only AVAILABLE listings can be cancelled.",
  schema: z.object({
    id: z.string().min(1).describe("Listing id"),
  }),
  run: async ({ id }) => {
    const db = getDb();
    const [row] = await db
      .update(schema.foodListings)
      .set({ status: "CANCELLED", updatedAt: new Date().toISOString() })
      .where(
        and(
          eq(schema.foodListings.id, id),
          eq(schema.foodListings.status, "AVAILABLE"),
        ),
      )
      .returning();
    if (!row) {
      fail("This listing cannot be cancelled in its current state.", {
        statusCode: 409,
      });
    }
    return row;
  },
});
