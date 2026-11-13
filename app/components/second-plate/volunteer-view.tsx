import { useState } from "react";
import { useActionMutation, useActionQuery } from "@agent-native/core/client/hooks";
import {
  IconTruck,
  IconMapPin,
  IconPhone,
  IconCheck,
  IconShieldCheck,
  IconTrophy,
  IconAward,
  IconArrowRight,
  IconExternalLink,
  IconAlertCircle,
  IconPackage,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEMO_BASE,
  DEMO_NGO_ADDRESS,
  DEMO_VOLUNTEER_NAME,
  type DonationRow,
  SAFETY_CHECKLIST,
  distanceKm,
  formatDateTime,
} from "@/lib/second-plate";
import { cn } from "@/lib/utils";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
  errorMessage,
} from "./primitives";

const POINTS_PER_DELIVERY = 15;
const BADGES = [
  { threshold: 1, label: "First Rescue Hero", icon: "🌱", desc: "Completed 1st food rescue" },
  { threshold: 3, label: "Speed Courier", icon: "⚡", desc: "Delivered under safe time limits" },
  { threshold: 5, label: "Community Guardian", icon: "🛡️", desc: "5 verified safe drops" },
  { threshold: 10, label: "Zero-Waste Legend", icon: "👑", desc: "Rescued 200+ portions" },
];

export function VolunteerView({ tab }: { tab: string }) {
  const donations = useActionQuery("list-donations", {});

  if (donations.isLoading) return <LoadingState label="Fetching live rescue tasks…" />;
  if (donations.error) return <ErrorState message={errorMessage(donations.error)} />;

  const rows = (donations.data ?? []) as DonationRow[];
  if (tab === "history") return <History rows={rows} />;
  return <Tasks rows={rows} />;
}

function Tasks({ rows }: { rows: DonationRow[] }) {
  const open = rows.filter((r) => r.donation.status === "ACCEPTED");
  const mine = rows.filter(
    (r) =>
      r.donation.volunteerName === DEMO_VOLUNTEER_NAME &&
      ["VOLUNTEER_ASSIGNED", "PICKED_UP"].includes(r.donation.status),
  );
  const done = rows.filter(
    (r) =>
      r.donation.status === "DELIVERED" &&
      r.donation.volunteerName === DEMO_VOLUNTEER_NAME,
  );
  const points = done.length * POINTS_PER_DELIVERY;

  return (
    <div className="space-y-8">
      {/* Volunteer Hero Bar */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-300">
              <IconTrophy size={14} className="text-amber-400" />
              <span>Level 2 Courier · {DEMO_VOLUNTEER_NAME}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Volunteer Rescue Hub
            </h1>
            <p className="text-xs text-emerald-200/80 max-w-md">
              Pick up safe surplus food from verified kitchens and transport it to shelters across Bhubaneswar.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3 text-center backdrop-blur-xs min-w-[90px]">
              <p className="text-2xl font-black text-amber-300">{points}</p>
              <p className="text-[10px] font-semibold text-white/70 uppercase">XP Points</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 text-center backdrop-blur-xs min-w-[90px]">
              <p className="text-2xl font-black text-emerald-300">{done.length}</p>
              <p className="text-[10px] font-semibold text-white/70 uppercase">Delivered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Missions */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
            Your In-Flight Deliveries ({mine.length})
          </h2>
          {mine.length > 0 && (
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              In progress — keep food temperature stable
            </span>
          )}
        </div>

        {mine.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-xs text-muted-foreground">
            No deliveries in progress. Accept an open pickup below to get rolling!
          </div>
        ) : (
          mine.map((row) => <TaskCard key={row.donation.id} row={row} />)
        )}
      </section>

      {/* Available Pickups */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            Available Pickups Ready For Transport ({open.length})
          </h2>
          <span className="text-xs text-muted-foreground">
            Claimed by NGOs, awaiting volunteer driver
          </span>
        </div>

        {open.length === 0 ? (
          <EmptyState
            title="No pickups waiting for transport"
            body="When NGOs accept food portions, pickup missions appear here instantly for couriers."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {open.map((row) => (
              <TaskCard key={row.donation.id} row={row} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TaskCard({ row }: { row: DonationRow }) {
  const { donation, listing } = row;
  const pickupToDrop = distanceKm(listing, DEMO_BASE);
  const mineActive = donation.volunteerName === DEMO_VOLUNTEER_NAME;
  const isPickedUp = donation.status === "PICKED_UP";

  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    isPickedUp ? donation.deliveryAddress : listing.pickupAddress,
  )}`;

  return (
    <article className="card-hover-lift flex flex-col justify-between gap-4 rounded-3xl border border-border/80 bg-card p-5 shadow-xs">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IconPackage size={16} />
              </span>
              <h3 className="font-bold text-base text-foreground tracking-tight">
                {listing.title}
              </h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground font-medium">
              {donation.portions} portions · Donated by <strong>{listing.providerName}</strong>
            </p>
          </div>
          <StatusBadge status={donation.status} donation />
        </div>

        {/* Live Journey Progress Bar for Active Deliveries */}
        {mineActive && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 space-y-2">
            <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
              Mission Progression
            </p>
            <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-bold">
              <div className="rounded-md bg-emerald-500 text-white py-1">
                ✓ 1. Claimed
              </div>
              <div
                className={cn(
                  "rounded-md py-1 transition-colors",
                  isPickedUp
                    ? "bg-emerald-500 text-white"
                    : "bg-amber-500/20 text-amber-700 dark:text-amber-300 animate-pulse border border-amber-500/40",
                )}
              >
                {isPickedUp ? "✓ 2. Picked Up" : "● 2. En Route to Pickup"}
              </div>
              <div
                className={cn(
                  "rounded-md py-1",
                  isPickedUp
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 animate-pulse border border-amber-500/40"
                    : "bg-muted text-muted-foreground",
                )}
              >
                3. Deliver to Shelter
              </div>
            </div>
          </div>
        )}

        {/* Key Route Information */}
        <div className="grid gap-2 text-xs sm:grid-cols-2 rounded-2xl bg-secondary/40 p-3">
          <div>
            <span className="font-bold text-muted-foreground text-[10px] uppercase">
              1. Pickup Address
            </span>
            <p className="font-medium text-foreground">{listing.pickupAddress}</p>
          </div>
          <div>
            <span className="font-bold text-muted-foreground text-[10px] uppercase">
              2. Dropoff Destination (NGO)
            </span>
            <p className="font-medium text-foreground">{donation.deliveryAddress}</p>
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-muted-foreground">
            <IconPhone size={13} />
            <span>{listing.contactPhone || "+91 Contact on site"}</span>
          </div>
          <div className="pt-1 text-muted-foreground">
            <span>Route Est: ~{pickupToDrop.toFixed(1)} km</span>
          </div>
        </div>

        {/* Handling and Allergens */}
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-md border border-border/80 bg-background/60 px-2 py-0.5 text-muted-foreground">
            🌡️ {listing.temperatureInfo || "Room Temperature"}
          </span>
          <span className="rounded-md border border-border/80 bg-background/60 px-2 py-0.5 text-muted-foreground">
            📦 {listing.storageInfo || "Food-grade sealed container"}
          </span>
          {listing.allergens ? (
            <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-700 dark:text-amber-400 font-medium">
              ⚠️ {listing.allergens}
            </span>
          ) : null}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
        <a
          href={mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <IconMapPin size={14} />
          Navigate via Maps <IconExternalLink size={12} />
        </a>

        <div>
          {donation.status === "ACCEPTED" ? (
            <AssignButton donationId={donation.id} />
          ) : null}
          {donation.status === "VOLUNTEER_ASSIGNED" && mineActive ? (
            <PickupButton donationId={donation.id} />
          ) : null}
          {donation.status === "PICKED_UP" && mineActive ? (
            <DeliverButton donationId={donation.id} />
          ) : null}
        </div>
      </div>
    </article>
  );
}

function AssignButton({ donationId }: { donationId: string }) {
  const update = useActionMutation("update-donation-status");
  return (
    <Button
      size="sm"
      className="rounded-full font-bold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
      disabled={update.isPending}
      onClick={() =>
        update.mutate({
          donationId,
          step: "assign",
          volunteerName: DEMO_VOLUNTEER_NAME,
        })
      }
    >
      <IconTruck size={15} className="mr-1.5" />
      {update.isPending ? "Assigning..." : "Accept Mission (+15 XP)"}
    </Button>
  );
}

function PickupButton({ donationId }: { donationId: string }) {
  const [open, setOpen] = useState(false);
  const [checkedAll, setCheckedAll] = useState(false);
  const update = useActionMutation("update-donation-status");

  return (
    <>
      <Button
        size="sm"
        className="rounded-full font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
        onClick={() => setOpen(true)}
      >
        <IconShieldCheck size={16} className="mr-1.5" />
        Verify & Pick Up
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              FSSAI Food Safety Verification
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirm safety standards with the provider before packing into your vehicle.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <ul className="space-y-2 rounded-2xl border border-border bg-card p-3 text-xs text-muted-foreground">
              {SAFETY_CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="size-4 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <label className="flex items-center gap-2.5 rounded-xl bg-primary/10 p-3 text-xs font-bold text-foreground cursor-pointer">
              <input
                type="checkbox"
                className="size-4 accent-[hsl(var(--primary))]"
                checked={checkedAll}
                onChange={(e) => setCheckedAll(e.target.checked)}
              />
              <span>I physically verified these standards with the donor</span>
            </label>
          </div>

          {update.error ? <ErrorState message={errorMessage(update.error)} /> : null}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!checkedAll || update.isPending}
              className="rounded-xl font-bold bg-primary text-primary-foreground"
              onClick={() =>
                update.mutate(
                  { donationId, step: "pickup" },
                  { onSuccess: () => setOpen(false) },
                )
              }
            >
              {update.isPending ? "Confirming..." : "Confirm Food Picked Up"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DeliverButton({ donationId }: { donationId: string }) {
  const [open, setOpen] = useState(false);
  const update = useActionMutation("update-donation-status");

  return (
    <>
      <Button
        size="sm"
        className="rounded-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
        onClick={() => setOpen(true)}
      >
        <IconCheck size={16} className="mr-1.5" />
        Complete Delivery
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              Confirm Handover to Shelter
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirm that the surplus food has been safely handed over to the NGO staff.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl bg-secondary/50 p-4 text-xs text-foreground space-y-1">
            <p><strong>Destination:</strong> {DEMO_NGO_ADDRESS}</p>
            <p className="text-muted-foreground">You will earn <strong>+15 Rescue XP</strong> upon confirmation!</p>
          </div>

          {update.error ? <ErrorState message={errorMessage(update.error)} /> : null}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
              Not yet
            </Button>
            <Button
              className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={update.isPending}
              onClick={() =>
                update.mutate(
                  { donationId, step: "deliver" },
                  { onSuccess: () => setOpen(false) },
                )
              }
            >
              {update.isPending ? "Submitting..." : "Yes, Handed Over"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function History({ rows }: { rows: DonationRow[] }) {
  const done = rows
    .filter(
      (r) =>
        r.donation.status === "DELIVERED" &&
        r.donation.volunteerName === DEMO_VOLUNTEER_NAME,
    )
    .sort((a, b) =>
      (b.donation.deliveredAt ?? "").localeCompare(a.donation.deliveredAt ?? ""),
    );
  const points = done.length * POINTS_PER_DELIVERY;
  const earned = BADGES.filter((b) => done.length >= b.threshold);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
          Volunteer Achievements & History
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your rescue courier points, unlock achievement badges, and review completed dropoffs.
        </p>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
          <p className="text-3xl font-black text-primary">{points}</p>
          <p className="text-xs font-bold text-muted-foreground uppercase mt-1">Total XP Points</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
          <p className="text-3xl font-black text-foreground">{done.length}</p>
          <p className="text-xs font-bold text-muted-foreground uppercase mt-1">Completed Deliveries</p>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-3xl border border-border bg-card p-5 shadow-xs">
          <p className="text-3xl font-black text-amber-500">{earned.length}</p>
          <p className="text-xs font-bold text-muted-foreground uppercase mt-1">Badges Unlocked</p>
        </div>
      </section>

      {/* Badges Grid */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">Earned Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BADGES.map((b) => {
            const unlocked = done.length >= b.threshold;
            return (
              <div
                key={b.label}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all",
                  unlocked
                    ? "bg-card border-primary/40 shadow-xs"
                    : "bg-muted/40 border-border/60 opacity-50 grayscale",
                )}
              >
                <span className="text-3xl mb-1">{b.icon}</span>
                <p className="text-xs font-bold text-foreground">{b.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{b.desc}</p>
                <span
                  className={cn(
                    "mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase",
                    unlocked
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {unlocked ? "Unlocked" : `${b.threshold - done.length} left`}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Log list */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">Completed Delivery Log</h2>
        {done.length === 0 ? (
          <EmptyState
            title="No completed deliveries yet"
            body="Your completed rescue missions and timestamps will appear here once delivered."
          />
        ) : (
          <ul className="divide-y divide-border/60 rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
            {done.map(({ donation, listing }) => (
              <li
                key={donation.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 text-xs hover:bg-accent/40 transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-sm text-foreground">
                    {listing.title} ({donation.portions} portions)
                  </p>
                  <p className="text-muted-foreground">
                    From <strong>{listing.providerName}</strong> → To <strong>{donation.ngoName}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-right shrink-0">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {donation.deliveredAt ? formatDateTime(donation.deliveredAt) : ""}
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    +15 XP
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
