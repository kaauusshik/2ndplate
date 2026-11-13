import { defineAction } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

type Totals = {
  portions: number;
  weightKg: number;
  completedDonations: number;
  activeProviders: number;
  ngosReceiving: number;
  volunteerDeliveries: number;
};

const emptyTotals = (): Totals => ({
  portions: 0,
  weightKg: 0,
  completedDonations: 0,
  activeProviders: 0,
  ngosReceiving: 0,
  volunteerDeliveries: 0,
});

export default defineAction({
  description:
    "Platform impact computed from delivered donations, split into real activity and demo data. Never hardcoded.",
  schema: z.object({}),
  http: { method: "GET" },
  run: async () => {
    const db = getDb();
    const delivered = await db
      .select({ donation: schema.donations, listing: schema.foodListings })
      .from(schema.donations)
      .innerJoin(
        schema.foodListings,
        eq(schema.donations.listingId, schema.foodListings.id),
      )
      .where(eq(schema.donations.status, "DELIVERED"));

    const providers = await db
      .select({
        name: schema.foodListings.providerName,
        isDemo: schema.foodListings.isDemo,
      })
      .from(schema.foodListings);

    const totals = { real: emptyTotals(), demo: emptyTotals() };
    const ngos = { real: new Set<string>(), demo: new Set<string>() };
    const providerSets = { real: new Set<string>(), demo: new Set<string>() };
    const daily = new Map<
      string,
      { day: string; real: number; demo: number }
    >();

    for (const { donation, listing } of delivered) {
      const scope = donation.isDemo ? "demo" : "real";
      const t = totals[scope];
      t.portions += donation.portions;
      t.weightKg += listing.weightKg ? listing.weightKg * (donation.portions / listing.portionsTotal) : 0;
      t.completedDonations += 1;
      if (donation.volunteerName) t.volunteerDeliveries += 1;
      ngos[scope].add(donation.ngoName);

      const day = (donation.deliveredAt ?? donation.updatedAt).slice(0, 10);
      const bucket = daily.get(day) ?? { day, real: 0, demo: 0 };
      bucket[scope] += donation.portions;
      daily.set(day, bucket);
    }

    for (const provider of providers) {
      providerSets[provider.isDemo ? "demo" : "real"].add(provider.name);
    }

    totals.real.ngosReceiving = ngos.real.size;
    totals.demo.ngosReceiving = ngos.demo.size;
    totals.real.activeProviders = providerSets.real.size;
    totals.demo.activeProviders = providerSets.demo.size;
    totals.real.weightKg = Math.round(totals.real.weightKg * 10) / 10;
    totals.demo.weightKg = Math.round(totals.demo.weightKg * 10) / 10;

    return {
      real: totals.real,
      demo: totals.demo,
      daily: [...daily.values()].sort((a, b) => a.day.localeCompare(b.day)),
    };
  },
});
