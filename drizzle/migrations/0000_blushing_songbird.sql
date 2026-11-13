CREATE TABLE "donations" (
	"id" text PRIMARY KEY NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL,
	"listing_id" text NOT NULL,
	"ngo_name" text NOT NULL,
	"delivery_address" text NOT NULL,
	"portions" integer NOT NULL,
	"status" text NOT NULL,
	"volunteer_name" text,
	"accepted_at" text NOT NULL,
	"assigned_at" text,
	"picked_up_at" text,
	"delivered_at" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "donations_portions_positive" CHECK ("donations"."portions" > 0)
);
--> statement-breakpoint
CREATE TABLE "food_listings" (
	"id" text PRIMARY KEY NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL,
	"provider_name" text NOT NULL,
	"provider_type" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"is_vegetarian" boolean DEFAULT true NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"portions_total" integer NOT NULL,
	"portions_remaining" integer NOT NULL,
	"weight_kg" real,
	"prepared_at" text NOT NULL,
	"collect_by" text NOT NULL,
	"storage_info" text DEFAULT '' NOT NULL,
	"temperature_info" text DEFAULT '' NOT NULL,
	"allergens" text DEFAULT '' NOT NULL,
	"pickup_address" text NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"contact_phone" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'AVAILABLE' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "food_listings_portions_total_positive" CHECK ("food_listings"."portions_total" > 0),
	CONSTRAINT "food_listings_portions_remaining_range" CHECK ("food_listings"."portions_remaining" >= 0 AND "food_listings"."portions_remaining" <= "food_listings"."portions_total")
);
--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_listing_id_food_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."food_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "donations_listing_idx" ON "donations" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "donations_status_idx" ON "donations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "food_listings_status_idx" ON "food_listings" USING btree ("status");--> statement-breakpoint
INSERT INTO "food_listings" ("id","is_demo","provider_name","provider_type","title","category","is_vegetarian","description","portions_total","portions_remaining","weight_kg","prepared_at","collect_by","storage_info","temperature_info","allergens","pickup_address","latitude","longitude","contact_phone","status","created_at","updated_at") VALUES
('demo-listing-1', true, 'Spice Route Kitchen (Demo)', 'restaurant', 'Vegetable biryani and dal', 'cooked_meal', true, 'Surplus from the lunch service, packed in sealed food-grade containers.', 30, 0, 9.0,
  to_char((now() AT TIME ZONE 'UTC') - interval '4 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  to_char((now() AT TIME ZONE 'UTC') - interval '1 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  'Kept in sealed containers, covered, stored in clean insulated boxes.', 'Hot-held at the kitchen before packing; recorded by the provider.', 'Contains dairy (ghee) and nuts (cashew).', 'Saheed Nagar, Bhubaneswar (demo location)', 20.2961, 85.8245, '', 'DELIVERED',
  to_char((now() AT TIME ZONE 'UTC') - interval '5 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'), to_char((now() AT TIME ZONE 'UTC') - interval '45 minutes', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')),
('demo-listing-2', true, 'Campus Hostel Mess (Demo)', 'hostel', 'Chapati and paneer curry', 'cooked_meal', true, 'Dinner batch prepared for residents. Not served yet.', 40, 25, 12.0,
  to_char((now() AT TIME ZONE 'UTC') - interval '1 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  to_char((now() AT TIME ZONE 'UTC') + interval '3 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  'Refrigerated after cooling. Pack in covered containers.', 'Cooled within 2 hours of cooking.', 'Contains dairy (paneer).', 'Demo hostel block, Bhubaneswar (demo location)', 20.3550, 85.8190, '', 'AVAILABLE',
  to_char((now() AT TIME ZONE 'UTC') - interval '1 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'), to_char((now() AT TIME ZONE 'UTC') - interval '1 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')),
('demo-listing-3', true, 'Festival Stall Co. (Demo)', 'event', 'Chicken puffs and samosa', 'cooked_meal', false, 'Leftovers from a community event stall.', 25, 25, 6.5,
  to_char((now() AT TIME ZONE 'UTC') - interval '2 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  to_char((now() AT TIME ZONE 'UTC') + interval '90 minutes', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  'Keep covered; refrigerate immediately on receipt.', 'Held warm for under 2 hours after preparation.', 'Contains gluten, egg.', 'Jaydev Vihar, Bhubaneswar (demo location)', 20.2850, 85.8330, '', 'AVAILABLE',
  to_char((now() AT TIME ZONE 'UTC') - interval '2 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'), to_char((now() AT TIME ZONE 'UTC') - interval '2 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')),
('demo-listing-4', true, 'Demo College Canteen', 'canteen', 'Vegetable fried rice', 'cooked_meal', true, 'Unsold stock from the canteen counter.', 20, 20, 4.0,
  to_char((now() AT TIME ZONE 'UTC') - interval '1 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  to_char((now() AT TIME ZONE 'UTC') + interval '4 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  'Store covered in a refrigerator.', 'Cooled within 2 hours of cooking.', 'Contains soy.', 'Demo college campus, Bhubaneswar (demo location)', 20.2700, 85.8430, '', 'AVAILABLE',
  to_char((now() AT TIME ZONE 'UTC') - interval '1 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'), to_char((now() AT TIME ZONE 'UTC') - interval '1 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'));
--> statement-breakpoint
INSERT INTO "donations" ("id","is_demo","listing_id","ngo_name","delivery_address","portions","status","volunteer_name","accepted_at","assigned_at","picked_up_at","delivered_at","created_at","updated_at") VALUES
('demo-donation-1', true, 'demo-listing-1', 'Kalinga Shelter Trust (Demo)', 'Demo shelter, Bhubaneswar (demo location)', 30, 'DELIVERED', 'Demo Volunteer',
  to_char((now() AT TIME ZONE 'UTC') - interval '150 minutes', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  to_char((now() AT TIME ZONE 'UTC') - interval '120 minutes', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  to_char((now() AT TIME ZONE 'UTC') - interval '75 minutes', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  to_char((now() AT TIME ZONE 'UTC') - interval '45 minutes', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  to_char((now() AT TIME ZONE 'UTC') - interval '150 minutes', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  to_char((now() AT TIME ZONE 'UTC') - interval '45 minutes', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')),
('demo-donation-2', true, 'demo-listing-2', 'Kalinga Shelter Trust (Demo)', 'Demo shelter, Bhubaneswar (demo location)', 15, 'ACCEPTED', NULL,
  to_char((now() AT TIME ZONE 'UTC') - interval '20 minutes', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  NULL, NULL, NULL,
  to_char((now() AT TIME ZONE 'UTC') - interval '20 minutes', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  to_char((now() AT TIME ZONE 'UTC') - interval '20 minutes', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'));
