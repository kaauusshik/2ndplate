import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  IconSearch,
  IconFilter,
  IconFlame,
  IconSparkles,
  IconMinus,
  IconPlus,
  IconHeart,
  IconCheck,
  IconClock,
  IconUser,
  IconCalendarEvent,
  IconLeaf,
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
import { Input } from "@/components/ui/input";
import {
  CATEGORY_LABELS,
  DEMO_BASE,
  DEMO_NGO_ADDRESS,
  DEMO_NGO_NAME,
  DESTINATION_TIER_META,
  type DonationRow,
  type Listing,
  type FoodDestinationTier,
  distanceKm,
  isOpenForAcceptance,
  useNow,
  useListingsData,
  useDonationsData,
  useNgoDemandsData,
  useSecondPlateActions,
} from "@/lib/second-plate";
import { cn } from "@/lib/utils";
import {
  EmptyState,
  ErrorState,
  ListingCard,
  LoadingState,
  StatusBadge,
  errorMessage,
} from "./primitives";

type Filters = {
  search: string;
  maxKm: number;
  category: string;
  destinationTier: "all" | FoodDestinationTier;
  vegOnly: boolean;
  minPortions: number;
  withinHours: number;
};

const DEFAULT_FILTERS: Filters = {
  search: "",
  maxKm: 25,
  category: "all",
  destinationTier: "all",
  vegOnly: false,
  minPortions: 1,
  withinHours: 24,
};

export function NgoView({ tab }: { tab: string }) {
  const listings = useListingsData();
  const donations = useDonationsData();

  if (tab === "mine") {
    if (donations.isLoading) return <LoadingState label="Loading claims…" />;
    if (donations.error) return <ErrorState message={errorMessage(donations.error)} />;
    return <MyDonations rows={(donations.data ?? []) as DonationRow[]} />;
  }

  if (listings.isLoading) return <LoadingState label="Scanning nearby surplus food…" />;
  if (listings.error) return <ErrorState message={errorMessage(listings.error)} />;
  return <Discover listings={(listings.data ?? []) as Listing[]} />;
}

function Discover({ listings }: { listings: Listing[] }) {
  const now = useNow();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const ranked = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return listings
      .filter((listing) => isOpenForAcceptance(listing, now))
      .map((listing) => {
        const km = distanceKm(DEMO_BASE, listing);
        const hoursLeft = (Date.parse(listing.collectBy) - now) / 3_600_000;
        return { listing, km, hoursLeft };
      })
      .filter(({ listing, km, hoursLeft }) => {
        if (q) {
          const matchTitle = listing.title.toLowerCase().includes(q);
          const matchProvider = listing.providerName.toLowerCase().includes(q);
          const matchDesc = listing.description.toLowerCase().includes(q);
          if (!matchTitle && !matchProvider && !matchDesc) return false;
        }
        return (
          km <= filters.maxKm &&
          (filters.category === "all" || listing.category === filters.category) &&
          (filters.destinationTier === "all" || (listing.destinationTier ?? "people") === filters.destinationTier) &&
          (!filters.vegOnly || listing.isVegetarian) &&
          listing.portionsRemaining >= filters.minPortions &&
          hoursLeft <= filters.withinHours
        );
      })
      .sort((a, b) => a.km + a.hoursLeft * 0.5 - (b.km + b.hoursLeft * 0.5));
  }, [listings, now, filters]);

  const categories = [
    { id: "all", label: "All Food" },
    { id: "cooked_meal", label: "🍲 Cooked Meals" },
    { id: "bakery", label: "🥐 Bakery" },
    { id: "produce", label: "🥦 Produce" },
    { id: "packaged", label: "📦 Packaged" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <section className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
              Discover Surplus Food
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time available donations ranked by distance from <strong>{DEMO_NGO_NAME}</strong> and urgency.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            {ranked.length} Available Near You
          </span>
        </div>
      </section>

      {/* Urgent Food Demand Broadcast Banner */}
      <section className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-card p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <IconFlame size={22} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Facing an Evening Food Deficit? Broadcast an Urgent Demand
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
              Specify your shelter&rsquo;s required meals and target deadline (e.g. <em>&ldquo;Need 50 meals by 9:00 PM&rdquo;</em>). Local restaurants and banquet halls receive direct alerts to pledge food.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/demands">
            <Button className="rounded-2xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold gap-1.5 shadow-xs text-xs">
              <IconPlus size={16} />
              Broadcast Demand
            </Button>
          </Link>
          <Link to="/events">
            <Button variant="outline" className="rounded-2xl text-xs font-semibold gap-1.5">
              <IconCalendarEvent size={15} />
              Solidarity Drives
            </Button>
          </Link>
        </div>
      </section>

      {/* Search & Category Pills */}
      <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search dishes, providers, or ingredients (e.g. Biryani, Bakery, Rice)..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-9 h-10 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2">
            <FilterSelect
              label="Distance"
              value={String(filters.maxKm)}
              onChange={(v) => setFilters({ ...filters, maxKm: Number(v) })}
              options={[
                ["5", "Within 5 km"],
                ["10", "Within 10 km"],
                ["25", "Within 25 km"],
              ]}
            />
            <FilterSelect
              label="Expires In"
              value={String(filters.withinHours)}
              onChange={(v) => setFilters({ ...filters, withinHours: Number(v) })}
              options={[
                ["2", "Next 2 hrs (Urgent)"],
                ["6", "Next 6 hrs"],
                ["24", "Next 24 hrs"],
              ]}
            />
          </div>
        </div>

        {/* Quick category pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilters({ ...filters, category: cat.id })}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                filters.category === cat.id
                  ? "bg-primary text-primary-foreground shadow-2xs scale-102"
                  : "bg-secondary/70 text-secondary-foreground hover:bg-secondary border border-border/50",
              )}
            >
              {cat.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setFilters({ ...filters, vegOnly: !filters.vegOnly })}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-all ml-auto",
              filters.vegOnly
                ? "bg-emerald-600 text-white shadow-2xs"
                : "border border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            🌱 Veg Only
          </button>
        </div>

        {/* Destination Channel Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-2 border-t border-border/50">
          <span className="text-[11px] font-bold text-muted-foreground mr-1 shrink-0">Channel:</span>
          <button
            type="button"
            onClick={() => setFilters({ ...filters, destinationTier: "all" })}
            className={cn(
              "rounded-full px-3 py-1 font-semibold transition-all border shrink-0",
              filters.destinationTier === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/70 text-muted-foreground hover:text-foreground",
            )}
          >
            All Channels
          </button>
          {(["people", "animals", "compost"] as FoodDestinationTier[]).map((tierKey) => {
            const meta = DESTINATION_TIER_META[tierKey];
            const isSelected = filters.destinationTier === tierKey;
            return (
              <button
                key={tierKey}
                type="button"
                onClick={() => setFilters({ ...filters, destinationTier: tierKey })}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold transition-all border shrink-0",
                  isSelected
                    ? cn(meta.bgTone, meta.textTone, meta.borderTone, "ring-2 ring-primary/20 font-bold")
                    : "border-border/70 text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{meta.icon}</span>
                <span>{meta.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Listings Grid */}
      {ranked.length === 0 ? (
        <EmptyState
          title="No surplus food matching your criteria"
          body="Try clearing your search or expanding the distance filter. You can also click 'Load Fresh Demo Data' in the banner to generate sample batches."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {ranked.map(({ listing, km, hoursLeft }) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              distanceLabel={`${km.toFixed(1)} km`}
              reasons={matchReasons(listing, km, hoursLeft)}
              footer={<AcceptButton listing={listing} />}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function matchReasons(listing: Listing, km: number, hoursLeft: number) {
  const reasons = [`${km.toFixed(1)} km away`];
  if (hoursLeft < 2) reasons.push("⚡ Under 2h remaining");
  if (listing.portionsRemaining >= 25) reasons.push("🥘 High yield batch");
  if (listing.isVegetarian) reasons.push("Pure Veg");
  return reasons;
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      aria-label={label}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-xl border border-input bg-card px-3 text-xs font-semibold text-foreground shadow-2xs"
    >
      {options.map(([optionValue, optionLabel]) => (
        <option key={optionValue} value={optionValue}>
          {optionLabel}
        </option>
      ))}
    </select>
  );
}

function AcceptButton({ listing }: { listing: Listing }) {
  const [open, setOpen] = useState(false);
  const [portions, setPortions] = useState(listing.portionsRemaining);
  const [confirmed, setConfirmed] = useState(false);
  const actions = useSecondPlateActions();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const accept = {
    isPending,
    error,
    mutate: (params: { listingId: string; ngoName: string; deliveryAddress: string; portions: number }, opts?: { onSuccess?: () => void; onError?: (err: unknown) => void }) => {
      try {
        setIsPending(true);
        actions.acceptListing(params);
        setIsPending(false);
        opts?.onSuccess?.();
      } catch (err) {
        setIsPending(false);
        setError(err);
        opts?.onError?.(err);
      }
    },
  };

  const valid =
    Number.isInteger(portions) &&
    portions >= 1 &&
    portions <= listing.portionsRemaining;

  const handleOpen = () => {
    setPortions(listing.portionsRemaining);
    setConfirmed(false);
    setOpen(true);
  };

  const executeAccept = () => {
    accept.mutate(
      {
        listingId: listing.id,
        ngoName: DEMO_NGO_NAME,
        deliveryAddress: DEMO_NGO_ADDRESS,
        portions,
      },
      {
        onSuccess: () => {
          setConfirmed(true);
          setTimeout(() => {
            setOpen(false);
            setConfirmed(false);
          }, 1500);
        },
      },
    );
  };

  return (
    <>
      <Button
        size="sm"
        className="w-full sm:w-auto rounded-full font-bold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={handleOpen}
      >
        <IconHeart size={15} className="mr-1.5" />
        Claim {listing.portionsRemaining} Portions
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              Claim Food for Your Shelter
            </DialogTitle>
            <DialogDescription className="text-sm">
              Reserve safe surplus portions from <strong>{listing.providerName}</strong>.
            </DialogDescription>
          </DialogHeader>

          {confirmed ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
              <div className="size-14 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-bounce">
                <IconCheck size={32} />
              </div>
              <h4 className="text-lg font-bold text-foreground">Portions Reserved!</h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                A pickup mission has been queued for volunteer drivers. Track it in &apos;My Claims&apos;.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold text-foreground">
                  <span>{listing.title}</span>
                  <span className="text-primary font-bold">{listing.portionsRemaining} Available</span>
                </div>
                <p className="text-xs text-muted-foreground">{listing.pickupAddress}</p>
              </div>

              {/* Stepper & Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground flex justify-between">
                  <span>Portions to Claim</span>
                  <span className="text-primary font-semibold">Feeds ~{portions} people</span>
                </label>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-xl"
                    disabled={portions <= 1}
                    onClick={() => setPortions((p) => Math.max(1, p - 5))}
                  >
                    <IconMinus size={16} />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={listing.portionsRemaining}
                    value={portions}
                    onChange={(e) => setPortions(Math.min(listing.portionsRemaining, Math.max(1, Number(e.target.value) || 1)))}
                    className="h-10 text-center font-bold text-base rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-xl"
                    disabled={portions >= listing.portionsRemaining}
                    onClick={() => setPortions((p) => Math.min(listing.portionsRemaining, p + 5))}
                  >
                    <IconPlus size={16} />
                  </Button>
                </div>

                <div className="flex gap-2 pt-1">
                  {[10, 25, listing.portionsRemaining].filter((n, i, a) => n <= listing.portionsRemaining && a.indexOf(n) === i).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPortions(num)}
                      className={cn(
                        "flex-1 rounded-lg border py-1 text-xs font-bold transition-all",
                        portions === num
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border bg-card text-muted-foreground hover:bg-accent",
                      )}
                    >
                      {num === listing.portionsRemaining ? `All (${num})` : `${num}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground space-y-1">
                <p>📍 <strong>Delivering to:</strong> {DEMO_NGO_ADDRESS}</p>
                <p>⏰ <strong>Deadline:</strong> Must be collected before declared cutoff.</p>
              </div>

              {accept.error ? <ErrorState message={errorMessage(accept.error)} /> : null}

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={!valid || accept.isPending}
                  className="rounded-xl font-bold bg-primary text-primary-foreground"
                  onClick={executeAccept}
                >
                  {accept.isPending ? "Reserving..." : `Confirm Claim (${portions} meals)`}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function MyDonations({ rows }: { rows: DonationRow[] }) {
  const mine = rows.filter((r) => r.donation.ngoName === DEMO_NGO_NAME);
  const pending = mine.filter((r) =>
    ["ACCEPTED", "VOLUNTEER_ASSIGNED", "PICKED_UP"].includes(r.donation.status),
  );
  const completed = mine.filter((r) => r.donation.status === "DELIVERED");
  const other = mine.filter((r) => r.donation.status === "CANCELLED");
  const portionsReceived = completed.reduce((sum, r) => sum + r.donation.portions, 0);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
          Shelter Claims & Deliveries
        </h1>
        <p className="text-sm text-muted-foreground">
          Track in-flight pickups and historic meal deliveries for <strong>{DEMO_NGO_NAME}</strong>.
        </p>

        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Portions Received</p>
            <p className="text-2xl font-black text-primary mt-1">{portionsReceived}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
            <p className="text-xs font-semibold text-muted-foreground uppercase">In-Transit / Queued</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pending.length}</p>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-border bg-card p-4 shadow-2xs">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Completed Rescues</p>
            <p className="text-2xl font-black text-foreground mt-1">{completed.length}</p>
          </div>
        </div>
      </section>

      <Group title="In-Transit & Queued Pickups" rows={pending} empty="No active pickups in transit right now." />
      <Group title="Delivered to Shelter" rows={completed} empty="No completed deliveries yet." />
      {other.length > 0 ? <Group title="Withdrawn Claims" rows={other} empty="" /> : null}
    </div>
  );
}

function Group({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: DonationRow[];
  empty: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">
        {title} <span className="text-muted-foreground text-sm font-semibold">({rows.length})</span>
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">{empty}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {rows.map(({ donation, listing }) => (
            <li
              key={donation.id}
              className="card-hover-lift flex flex-col justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-2xs"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-foreground">{listing.title}</p>
                  <StatusBadge status={donation.status} donation />
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {donation.portions} portions · From {listing.providerName}
                </p>
                {donation.volunteerName && (
                  <p className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <IconUser size={13} /> Driver: {donation.volunteerName}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                <span className="text-muted-foreground">Pickup: {listing.pickupAddress}</span>
                {donation.status === "ACCEPTED" ? (
                  <CancelAcceptance donationId={donation.id} />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CancelAcceptance({ donationId }: { donationId: string }) {
  const [open, setOpen] = useState(false);
  const actions = useSecondPlateActions();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const update = {
    isPending,
    error,
    mutate: (params: { donationId: string; step?: "assign" | "pickup" | "deliver" | "cancel"; status?: string }, opts?: { onSuccess?: () => void; onError?: (err: unknown) => void }) => {
      try {
        setIsPending(true);
        actions.updateDonationStatus(params);
        setIsPending(false);
        opts?.onSuccess?.();
      } catch (err) {
        setIsPending(false);
        setError(err);
        opts?.onError?.(err);
      }
    },
  };
  return (
    <>
      <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-destructive" onClick={() => setOpen(true)}>
        Withdraw
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Withdraw this acceptance?</DialogTitle>
            <DialogDescription>
              The reserved portions will immediately return to the open network for other shelters.
            </DialogDescription>
          </DialogHeader>
          {update.error ? <ErrorState message={errorMessage(update.error)} /> : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
              Keep Claim
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl font-bold"
              disabled={update.isPending}
              onClick={() =>
                update.mutate(
                  { donationId, step: "cancel" },
                  { onSuccess: () => setOpen(false) },
                )
              }
            >
              Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
