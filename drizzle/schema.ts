import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  real,
  text,
} from "drizzle-orm/pg-core";

export const foodListings = pgTable(
  "food_listings",
  {
    id: text("id").primaryKey(),
    isDemo: boolean("is_demo").notNull().default(false),
    providerName: text("provider_name").notNull(),
    providerType: text("provider_type").notNull(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    isVegetarian: boolean("is_vegetarian").notNull().default(true),
    description: text("description").notNull().default(""),
    portionsTotal: integer("portions_total").notNull(),
    portionsRemaining: integer("portions_remaining").notNull(),
    weightKg: real("weight_kg"),
    preparedAt: text("prepared_at").notNull(),
    collectBy: text("collect_by").notNull(),
    storageInfo: text("storage_info").notNull().default(""),
    temperatureInfo: text("temperature_info").notNull().default(""),
    allergens: text("allergens").notNull().default(""),
    pickupAddress: text("pickup_address").notNull(),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    contactPhone: text("contact_phone").notNull().default(""),
    status: text("status").notNull().default("AVAILABLE"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    check("food_listings_portions_total_positive", sql`${t.portionsTotal} > 0`),
    check(
      "food_listings_portions_remaining_range",
      sql`${t.portionsRemaining} >= 0 AND ${t.portionsRemaining} <= ${t.portionsTotal}`,
    ),
    index("food_listings_status_idx").on(t.status),
  ],
);

export const donations = pgTable(
  "donations",
  {
    id: text("id").primaryKey(),
    isDemo: boolean("is_demo").notNull().default(false),
    listingId: text("listing_id")
      .notNull()
      .references(() => foodListings.id),
    ngoName: text("ngo_name").notNull(),
    deliveryAddress: text("delivery_address").notNull(),
    portions: integer("portions").notNull(),
    status: text("status").notNull(),
    volunteerName: text("volunteer_name"),
    acceptedAt: text("accepted_at").notNull(),
    assignedAt: text("assigned_at"),
    pickedUpAt: text("picked_up_at"),
    deliveredAt: text("delivered_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    check("donations_portions_positive", sql`${t.portions} > 0`),
    index("donations_listing_idx").on(t.listingId),
    index("donations_status_idx").on(t.status),
  ],
);
