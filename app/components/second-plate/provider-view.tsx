import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { useActionMutation, useActionQuery } from "@agent-native/core/client/hooks";
import {
  IconCircleCheck,
  IconHeartHandshake,
  IconMapPin,
  IconPackage,
  IconPlus,
  IconSalad,
  IconLeaf,
  IconToolsKitchen2,
  IconTruckDelivery,
  IconSparkles,
  IconFlame,
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
  type DonationRow,
  type Listing,
  CATEGORY_LABELS,
  DONATION_STATUS_LABELS,
  formatDateTime,
} from "@/lib/second-plate";
import { cn } from "@/lib/utils";
import {
  DeadlineText,
  EmptyState,
  ErrorState,
  ListingCard,
  LoadingState,
  StatusBadge,
  errorMessage,
  formatWhen,
} from "./primitives";

export function ProviderView({ tab }: { tab: string }) {
  const listings = useActionQuery("list-listings", {});
  const donations = useActionQuery("list-donations", {});
  const [filterTab, setFilterTab] = useState<"all" | "active" | "completed">("all");

  if (listings.isLoading || donations.isLoading) {
    return <LoadingState label="Loading kitchen dashboard…" />;
  }
  if (listings.error || donations.error) {
    return (
      <ErrorState
        message={errorMessage(listings.error ?? donations.error)}
      />
    );
  }

  const allListings = (listings.data ?? []) as Listing[];
  const rows = (donations.data ?? []) as DonationRow[];

  if (tab === "donations") {
    return <DonationHistory rows={rows} />;
  }

  const active = allListings.filter((l) => l.status === "AVAILABLE");
  const inFlight = rows.filter((r) =>
    ["ACCEPTED", "VOLUNTEER_ASSIGNED", "PICKED_UP"].includes(r.donation.status),
  );
  const delivered = rows.filter((r) => r.donation.status === "DELIVERED");
  const mealsRedistributed = delivered.reduce(
    (sum, r) => sum + r.donation.portions,
    0,
  );
  const recent = [...rows]
    .sort((a, b) => b.donation.updatedAt.localeCompare(a.donation.updatedAt))
    .slice(0, 6);

  const displayedListings = allListings.filter((l) => {
    if (filterTab === "active") return l.status === "AVAILABLE";
    if (filterTab === "completed") return l.status === "DELIVERED" || l.status === "ACCEPTED";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 p-6 text-white shadow-xl md:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-emerald-500/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 right-24 size-48 rounded-full bg-emerald-400/10 blur-xl"
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-300">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Kitchen & Provider Portal
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl md:text-4xl text-white">
              {active.length > 0
                ? `${active.length} Surplus Batch${active.length === 1 ? "" : "es"} Open For Shelters`
                : "No Open Surplus Right Now"}
            </h1>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              {inFlight.length > 0
                ? `${inFlight.length} donation batch${inFlight.length === 1 ? " is" : "es are"} actively moving towards pickup by volunteer couriers.`
                : "Publish fresh banquet, bakery, or canteen surplus with declared collection cutoffs to prevent food waste."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg hover:scale-102 transition-transform"
            >
              <Link to="/add">
                <IconPlus size={18} className="mr-1" />
                Publish Surplus Food
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Stat
          icon={<IconPackage size={22} />}
          label="Open Listings"
          value={active.length}
          hint="Available for NGOs"
          tone="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        />
        <Stat
          icon={<IconTruckDelivery size={22} />}
          label="In Transit"
          value={inFlight.length}
          hint="Volunteers assigned"
          tone="bg-amber-500/15 text-amber-600 dark:text-amber-400"
        />
        <Stat
          icon={<IconCircleCheck size={22} />}
          label="Delivered"
          value={delivered.length}
          hint="Safe handovers completed"
          tone="bg-blue-500/15 text-blue-600 dark:text-blue-400"
        />
        <Stat
          icon={<IconToolsKitchen2 size={22} />}
          label="Meals Rescued"
          value={mealsRedistributed}
          hint="Portions saved from landfill"
          tone="bg-primary text-primary-foreground shadow-xs"
        />
      </section>

      {/* Listings Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Your Food Batches
            </h2>
            <p className="text-xs text-muted-foreground">
              {allListings.length} total listings · Click a batch to inspect details
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-border/80 bg-card p-1">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition-all",
                filterTab === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              All ({allListings.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("active")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition-all",
                filterTab === "active"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Available ({active.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("completed")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition-all",
                filterTab === "completed"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Claimed / Delivered
            </button>
          </div>
        </div>

        {displayedListings.length === 0 ? (
          <EmptyState
            title="No listings in this view"
            body="Publish surplus food before its collection deadline so local shelters can claim it."
            action={
              <Button asChild className="rounded-full font-bold">
                <Link to="/add">Add Your First Batch</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {displayedListings.map((listing) => (
              <ProviderListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">
          Live Dispatch Feed
        </h2>
        {recent.length === 0 ? (
          <EmptyState
            title="No activity recorded yet"
            body="Donation updates appear here as NGOs and volunteers accept and deliver surplus food."
          />
        ) : (
          <ul className="divide-y divide-border/60 overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
            {recent.map(({ donation, listing }) => (
              <li
                key={donation.id}
                className="flex items-center gap-3 p-4 text-xs hover:bg-accent/30 transition-colors"
              >
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-xs font-black text-primary"
                >
                  {initials(donation.ngoName)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-foreground text-sm">
                    {donation.ngoName}
                  </span>
                  <span className="block truncate text-muted-foreground">
                    {donation.portions} portions of <strong>{listing.title}</strong>
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge status={donation.status} donation />
                  <time className="text-[10px] text-muted-foreground">
                    {formatDateTime(donation.updatedAt)}
                  </time>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  hint: string;
  tone: string;
}) {
  return (
    <div className="card-hover-lift flex flex-col justify-between gap-3 rounded-3xl border border-border/80 bg-card p-4.5 shadow-2xs">
      <div className="flex items-center justify-between">
        <span
          className={cn("grid size-10 place-items-center rounded-2xl", tone)}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="text-[10px] font-bold text-muted-foreground uppercase">
          {hint}
        </span>
      </div>
      <div>
        <p className="text-3xl font-black tabular-nums tracking-tight text-foreground">
          {value}
        </p>
        <p className="mt-0.5 text-xs font-bold text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}

function ProviderListingCard({ listing }: { listing: Listing }) {
  const total = Math.max(listing.portionsTotal, 1);
  const claimed = listing.portionsTotal - listing.portionsRemaining;
  const claimedPct = Math.round((claimed / total) * 100);

  return (
    <article className="card-hover-lift flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs">
      <div className="flex items-start justify-between gap-3 bg-secondary/30 p-4 border-b border-border/50">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-primary shadow-2xs">
            {listing.isVegetarian ? (
              <IconLeaf size={20} aria-hidden="true" />
            ) : (
              <IconSalad size={20} aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-foreground">
              {listing.title}
            </h3>
            <p className="truncate text-xs font-semibold text-muted-foreground">
              {CATEGORY_LABELS[listing.category] ?? listing.category}
              {listing.isVegetarian ? " · Veg" : " · Non-Veg"}
            </p>
          </div>
        </div>
        <StatusBadge status={listing.status} />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4.5">
        <div>
          <div className="mb-1.5 flex items-baseline justify-between text-xs">
            <span className="font-bold text-foreground">
              {listing.portionsRemaining} portions left
            </span>
            <span className="text-muted-foreground font-semibold text-[11px]">
              {claimed} claimed ({claimedPct}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${claimedPct}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5 truncate">
            <IconMapPin size={14} className="shrink-0 text-muted-foreground" />
            <span className="truncate">{listing.pickupAddress}</span>
          </p>
          <DeadlineText collectBy={listing.collectBy} />
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-2 border-t border-border/50">
          <CancelListingButton listing={listing} />
        </div>
      </div>
    </article>
  );
}

function CancelListingButton({ listing }: { listing: Listing }) {
  const [open, setOpen] = useState(false);
  const cancel = useActionMutation("cancel-listing");
  const cancellable =
    listing.status === "AVAILABLE" &&
    listing.portionsRemaining === listing.portionsTotal;

  if (!cancellable) {
    return (
      <span className="text-[11px] font-medium text-muted-foreground italic">
        {listing.portionsRemaining < listing.portionsTotal
          ? "Portions accepted by NGO (cannot cancel)"
          : "Listing closed"}
      </span>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 rounded-full text-xs text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        Cancel Batch
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Cancel this surplus listing?</DialogTitle>
            <DialogDescription>
              {listing.title} will be removed from NGO discovery immediately.
            </DialogDescription>
          </DialogHeader>
          {cancel.error ? (
            <ErrorState message={errorMessage(cancel.error)} />
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
              Keep Listing
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl font-bold"
              disabled={cancel.isPending}
              onClick={() =>
                cancel.mutate(
                  { id: listing.id },
                  { onSuccess: () => setOpen(false) },
                )
              }
            >
              {cancel.isPending ? "Cancelling…" : "Yes, Cancel Batch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function DonationHistory({ rows }: { rows: DonationRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No donation dispatches yet"
        body="When an NGO claims a batch, its real-time journey will appear here."
      />
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
          Dispatch Log & Donated Batches
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Historical record of all food handed over to community partners.
        </p>
      </div>

      <div className="space-y-3">
        {rows.map(({ donation, listing }) => (
          <article
            key={donation.id}
            className="card-hover-lift rounded-3xl border border-border/80 bg-card p-5 shadow-2xs space-y-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-foreground">{listing.title}</h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  Partner Shelter: <strong>{donation.ngoName}</strong> · {donation.portions} portions
                </p>
              </div>
              <StatusBadge status={donation.status} donation />
            </div>
            <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <Timeline label="Accepted" value={donation.acceptedAt} />
              <Timeline label="Courier" value={donation.assignedAt} />
              <Timeline label="Picked Up" value={donation.pickedUpAt} />
              <Timeline label="Delivered" value={donation.deliveredAt} />
            </dl>
            {donation.volunteerName ? (
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Driver: {donation.volunteerName}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function Timeline({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-2xl bg-secondary/50 p-2.5">
      <dt className="text-[10px] font-bold text-muted-foreground uppercase">{label}</dt>
      <dd className="font-bold text-foreground mt-0.5">{formatWhen(value)}</dd>
    </div>
  );
}
