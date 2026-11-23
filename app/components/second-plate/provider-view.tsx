import { useState, useMemo, type ReactNode } from "react";
import { Link } from "react-router";
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
  IconClock,
  IconSearch,
  IconThermometer,
  IconShieldCheck,
  IconArrowRight,
  IconAlertCircle,
  IconCarrot,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  type FoodDestinationTier,
  type NgoDemand,
  CATEGORY_LABELS,
  DONATION_STATUS_LABELS,
  DESTINATION_TIER_META,
  formatDateTime,
  useNow,
  useListingsData,
  useDonationsData,
  useNgoDemandsData,
  useSecondPlateActions,
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
  const listings = useListingsData();
  const donations = useDonationsData();
  const demandsData = useNgoDemandsData();
  const actions = useSecondPlateActions();

  const [filterTab, setFilterTab] = useState<"all" | "active" | "completed">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<"all" | FoodDestinationTier>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pledgeDemand, setPledgeDemand] = useState<NgoDemand | null>(null);
  const [pledgePortions, setPledgePortions] = useState("20");
  const [pledgeNote, setPledgeNote] = useState("");
  const now = useNow();

  if (listings.isLoading || donations.isLoading) {
    return <LoadingState label="Synthesizing kitchen dashboard & food network metrics…" />;
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
  const openDemands = (demandsData.data ?? []).filter((d) => d.status === "OPEN");

  if (tab === "donations") {
    return <DonationHistory rows={rows} />;
  }

  const active = allListings.filter((l) => l.status === "AVAILABLE");
  const inFlight = rows.filter((r) =>
    ["ACCEPTED", "VOLUNTEER_ASSIGNED", "PICKED_UP"].includes(r.donation.status),
  );
  const delivered = rows.filter((r) => r.donation.status === "DELIVERED");

  // Portion distribution metrics
  const openPortions = active.reduce((acc, l) => acc + l.portionsRemaining, 0);
  const inFlightPortions = inFlight.reduce((acc, d) => acc + d.donation.portions, 0);
  const deliveredPortions = delivered.reduce((acc, d) => acc + d.donation.portions, 0);
  const totalPortions = Math.max(1, openPortions + inFlightPortions + deliveredPortions);

  // Critical urgent listings (< 2h)
  const criticalListings = active.filter((l) => {
    const msLeft = Date.parse(l.collectBy) - now;
    return msLeft > 0 && msLeft <= 2 * 3_600_000;
  });

  const recent = [...rows]
    .sort((a, b) => b.donation.updatedAt.localeCompare(a.donation.updatedAt))
    .slice(0, 6);

  const displayedListings = allListings.filter((l) => {
    if (filterTab === "active" && l.status !== "AVAILABLE") return false;
    if (filterTab === "completed" && l.status !== "DELIVERED" && l.status !== "ACCEPTED") return false;
    if (categoryFilter !== "all" && l.category !== categoryFilter) return false;
    if (tierFilter !== "all" && (l.destinationTier ?? "people") !== tierFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = l.title.toLowerCase().includes(q);
      const matchDesc = l.description.toLowerCase().includes(q);
      const matchAddress = l.pickupAddress.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAddress) return false;
    }
    return true;
  });

  const handlePledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgeDemand) return;
    const count = parseInt(pledgePortions, 10);
    if (isNaN(count) || count <= 0) return;

    actions.pledgeToDemand({
      demandId: pledgeDemand.id,
      donorName: "Royal Heritage Grand Banquet",
      portions: count,
      note: pledgeNote.trim() || undefined,
    });
    setPledgeDemand(null);
  };

  return (
    <div className="space-y-8">
      {/* Unique Command Center Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c2e22] via-[#092219] to-[#04120d] p-6 text-white shadow-2xl md:p-8 border border-emerald-500/20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-emerald-500/15 blur-3xl animate-pulse"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-emerald-400/10 blur-2xl"
        />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-0.5 text-xs font-bold text-emerald-300">
                <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                Live Food Rescue Command
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200">
                <IconShieldCheck size={14} className="text-emerald-400" /> FSSAI Certified Holding
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200">
                <IconClock size={14} className="text-amber-400" /> ~38 min Avg Dispatch
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-white">
              {active.length > 0
                ? `${openPortions} Fresh Portions Ready for Dispatch`
                : "All Kitchen Surplus Dispatched & Safe"}
            </h1>

            <p className="text-sm text-emerald-100/80 leading-relaxed max-w-xl">
              Real-time synchronization between food providers, local shelter kitchens, and volunteer courier dispatchers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg hover:scale-102 transition-transform"
            >
              <Link to="/add">
                <IconPlus size={18} className="mr-1.5" />
                Publish Surplus Food
              </Link>
            </Button>
          </div>
        </div>

        {/* Unique Physical Food Flow Pipe (Physical Pipeline from Kitchen to Plate) */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md space-y-3">
          <div className="flex flex-wrap items-center justify-between text-xs font-bold">
            <span className="text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400" /> City Food Stream Pipeline
            </span>
            <span className="text-white/80">
              {openPortions + inFlightPortions + deliveredPortions} Total Portions Managed Today
            </span>
          </div>

          {/* Three-segment progress stream */}
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-black/40 p-0.5 gap-1">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${(openPortions / totalPortions) * 100}%` }}
              title={`${openPortions} portions open in kitchens`}
            />
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-700 animate-pulse"
              style={{ width: `${(inFlightPortions / totalPortions) * 100}%` }}
              title={`${inFlightPortions} portions in transit`}
            />
            <div
              className="h-full rounded-full bg-blue-400 transition-all duration-700"
              style={{ width: `${(deliveredPortions / totalPortions) * 100}%` }}
              title={`${deliveredPortions} portions delivered to shelters`}
            />
          </div>

          {/* Pipeline Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-white font-bold">{openPortions} Portions</span>
              <span className="text-emerald-200/70 text-[11px]">in Kitchens</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-amber-400 shrink-0" />
              <span className="text-white font-bold">{inFlightPortions} Portions</span>
              <span className="text-amber-200/70 text-[11px]">in Transit (Couriers)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-blue-400 shrink-0" />
              <span className="text-white font-bold">{deliveredPortions} Portions</span>
              <span className="text-blue-200/70 text-[11px]">Served at Shelters</span>
            </div>
          </div>
        </div>
      </section>

      {/* Critical Expiration Alert (if any batch has < 2h remaining) */}
      {criticalListings.length > 0 && (
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <IconFlame size={22} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                Action Recommended: {criticalListings.length} Batch Approaching Cutoff (&lt; 2 Hours)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Surplus food near its declared collection deadline is prioritized on NGO discovery to avoid waste.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold shrink-0"
            onClick={() => {
              setFilterTab("active");
              setSearchQuery(criticalListings[0]?.title ?? "");
            }}
          >
            Review Urgent Batch
          </Button>
        </section>
      )}

      {/* Urgent NGO Demands Broadcast Widget */}
      {openDemands.length > 0 && (
        <section className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-card p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <IconFlame size={18} className="animate-pulse" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Urgent NGO Food Demands ({openDemands.length} Active Tonight)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Nearby night shelters and patient attendant camps requesting specific meals before tonight&rsquo;s cutoff.
                </p>
              </div>
            </div>
            <Link
              to="/demands"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 shrink-0"
            >
              Broadcast Board &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {openDemands.slice(0, 2).map((demand) => (
              <div
                key={demand.id}
                className="flex flex-col justify-between gap-2 rounded-2xl border border-amber-500/30 bg-card p-3.5 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">{demand.ngoName}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full text-[10px]">
                      ⏰ Needed by {demand.deadlineTime}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Seeking: <strong className="text-foreground">{demand.foodType}</strong> ({demand.portionsPledged}/{demand.portionsNeeded} pledged)
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                    📍 {demand.location}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => {
                      setPledgeDemand(demand);
                      setPledgePortions(String(Math.min(25, demand.portionsNeeded - demand.portionsPledged)));
                    }}
                    className="h-7 px-3 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 gap-1 shadow-2xs"
                  >
                    <IconHeartHandshake size={14} />
                    Pledge Meals
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Unique KPI Matrix Cards */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <UniqueStatCard
          icon={<IconPackage size={22} />}
          badge="Live Batches"
          value={active.length}
          label="Available Batches"
          subtext={`${openPortions} meals ready to claim`}
          accent="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-500/10"
        />
        <UniqueStatCard
          icon={<IconTruckDelivery size={22} />}
          badge="In Motion"
          value={inFlight.length}
          label="Active Deliveries"
          subtext={`${inFlightPortions} meals en route`}
          accent="text-amber-600 dark:text-amber-400"
          bg="bg-amber-500/10"
        />
        <UniqueStatCard
          icon={<IconCircleCheck size={22} />}
          badge="Completed"
          value={delivered.length}
          label="Delivered Runs"
          subtext={`${deliveredPortions} meals received`}
          accent="text-blue-600 dark:text-blue-400"
          bg="bg-blue-500/10"
        />
        <UniqueStatCard
          icon={<IconLeaf size={22} />}
          badge="Methane Saved"
          value={`${Math.round(deliveredPortions * 0.88)} kg`}
          label="CO₂e Avoided"
          subtext="Landfill emissions offset"
          accent="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-500/10"
        />
      </section>

      {/* Filterable Batch Control Console */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <IconToolsKitchen2 size={20} className="text-primary" />
              Kitchen Surplus Inventory
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live batches, temperature records, and portion reservation status
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition-all",
                filterTab === "all"
                  ? "bg-primary text-primary-foreground shadow-2xs"
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
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Open ({active.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("completed")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition-all",
                filterTab === "completed"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Claimed / Delivered
            </button>
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-2xs">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search batches by dish, description, or pickup address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Types" },
              { id: "cooked_meal", label: "🍲 Cooked" },
              { id: "bakery", label: "🥐 Bakery" },
              { id: "produce", label: "🥦 Produce" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all",
                  categoryFilter === cat.id
                    ? "bg-secondary text-secondary-foreground font-bold border border-primary/40"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Tier Destination Channel Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          <span className="text-[11px] font-bold text-muted-foreground mr-1 shrink-0">Channel:</span>
          <button
            type="button"
            onClick={() => setTierFilter("all")}
            className={cn(
              "rounded-full px-3 py-1 font-semibold transition-all border shrink-0",
              tierFilter === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/70 text-muted-foreground hover:text-foreground",
            )}
          >
            All Channels
          </button>
          {(["people", "animals", "compost"] as FoodDestinationTier[]).map((tierKey) => {
            const meta = DESTINATION_TIER_META[tierKey];
            const isSelected = tierFilter === tierKey;
            return (
              <button
                key={tierKey}
                type="button"
                onClick={() => setTierFilter(tierKey)}
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

        {/* Listings Grid */}
        {displayedListings.length === 0 ? (
          <EmptyState
            title="No food batches match your filter"
            body="Try resetting your search query or publish a fresh surplus batch using the button above."
            action={
              <Button asChild className="rounded-full font-bold">
                <Link to="/add">Publish New Surplus Batch</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {displayedListings.map((listing) => (
              <EnhancedProviderCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* Live Operational Dispatch Feed */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Dispatch & Handover Feed
          </h2>
          <span className="text-xs text-muted-foreground">Real-time status updates</span>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            title="No activity recorded yet"
            body="Donation milestones appear here as shelters accept and couriers pick up batches."
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
                    Reserved <strong>{donation.portions} portions</strong> of {listing.title}
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

      {/* Quick Demand Pledge Modal */}
      <Dialog open={!!pledgeDemand} onOpenChange={(open) => !open && setPledgeDemand(null)}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <IconHeartHandshake size={20} className="text-amber-500" />
              Pledge Meals to {pledgeDemand?.ngoName}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Directly fulfill portions of {pledgeDemand?.foodType} needed by <strong>{pledgeDemand?.deadlineTime}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePledgeSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Portions You Can Supply</label>
              <Input
                type="number"
                min="1"
                max={pledgeDemand ? pledgeDemand.portionsNeeded - pledgeDemand.portionsPledged : 500}
                value={pledgePortions}
                onChange={(e) => setPledgePortions(e.target.value)}
                className="rounded-xl font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Note / Pickup details</label>
              <Input
                value={pledgeNote}
                onChange={(e) => setPledgeNote(e.target.value)}
                placeholder="e.g. Ready hot in insulated thermo box"
                className="rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPledgeDemand(null)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold">
                Confirm Food Pledge
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UniqueStatCard({
  icon,
  badge,
  value,
  label,
  subtext,
  accent,
  bg,
}: {
  icon: ReactNode;
  badge: string;
  value: string | number;
  label: string;
  subtext: string;
  accent: string;
  bg: string;
}) {
  return (
    <div className="card-hover-lift flex flex-col justify-between gap-3 rounded-3xl border border-border/80 bg-card p-5 shadow-2xs relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className={cn("grid size-10 place-items-center rounded-2xl", bg, accent)}>
          {icon}
        </span>
        <span className="rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
          {badge}
        </span>
      </div>

      <div className="space-y-0.5">
        <p className="text-3xl font-black tabular-nums tracking-tight text-foreground">
          {value}
        </p>
        <p className="text-xs font-bold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{subtext}</p>
      </div>
    </div>
  );
}

function EnhancedProviderCard({ listing }: { listing: Listing }) {
  const total = Math.max(listing.portionsTotal, 1);
  const claimed = listing.portionsTotal - listing.portionsRemaining;
  const claimedPct = Math.round((claimed / total) * 100);

  return (
    <article className="card-hover-lift flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs">
      <div className="flex items-start justify-between gap-3 bg-secondary/30 p-4.5 border-b border-border/50">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-card text-primary shadow-2xs">
            {listing.isVegetarian ? (
              <IconLeaf size={22} aria-hidden="true" />
            ) : (
              <IconSalad size={22} aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-foreground">
              {listing.title}
            </h3>
            <p className="truncate text-xs font-semibold text-muted-foreground">
              {CATEGORY_LABELS[listing.category] ?? listing.category}
              {listing.isVegetarian ? " · Pure Veg" : " · Non-Veg"}
            </p>
          </div>
        </div>
        <StatusBadge status={listing.status} />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4.5">
        {/* Portion Remaining Bar */}
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-bold text-foreground">
              {listing.portionsRemaining} portions available
            </span>
            <span className="text-muted-foreground font-semibold text-[11px]">
              {claimedPct}% claimed ({claimed}/{total})
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                claimedPct === 100 ? "bg-blue-500" : claimedPct > 50 ? "bg-amber-500" : "bg-emerald-500",
              )}
              style={{ width: `${claimedPct}%` }}
            />
          </div>
        </div>

        {/* Thermal & Storage Details */}
        <div className="grid grid-cols-2 gap-2 text-[11px] rounded-2xl bg-secondary/30 p-2.5">
          <div className="flex items-center gap-1.5 text-foreground truncate" title={listing.temperatureInfo}>
            <IconThermometer size={14} className="text-amber-500 shrink-0" />
            <span className="truncate">{listing.temperatureInfo || "Temp Monitored"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-foreground truncate" title={listing.storageInfo}>
            <IconShieldCheck size={14} className="text-emerald-500 shrink-0" />
            <span className="truncate">{listing.storageInfo || "Food-Grade Container"}</span>
          </div>
        </div>

        {/* Address and Deadline row */}
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5 truncate">
            <IconMapPin size={14} className="shrink-0 text-muted-foreground" />
            <span className="truncate">{listing.pickupAddress}</span>
          </p>
          <DeadlineText collectBy={listing.collectBy} />
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
          <CancelListingButton listing={listing} />
          {listing.portionsRemaining > 0 && (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Open to Shelters
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function CancelListingButton({ listing }: { listing: Listing }) {
  const [open, setOpen] = useState(false);
  const actions = useSecondPlateActions();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const cancel = {
    isPending,
    error,
    mutate: (params: { id: string }, opts?: { onSuccess?: () => void; onError?: (err: unknown) => void }) => {
      try {
        setIsPending(true);
        actions.cancelListing(params.id);
        setIsPending(false);
        opts?.onSuccess?.();
      } catch (err) {
        setIsPending(false);
        setError(err);
        opts?.onError?.(err);
      }
    },
  };
  const cancellable =
    listing.status === "AVAILABLE" &&
    listing.portionsRemaining === listing.portionsTotal;

  if (!cancellable) {
    return (
      <span className="text-[11px] font-medium text-muted-foreground italic">
        {listing.portionsRemaining < listing.portionsTotal
          ? "Portions reserved (active rescue)"
          : "Batch closed"}
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
        Withdraw Batch
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Withdraw this surplus batch?</DialogTitle>
            <DialogDescription>
              {listing.title} will be removed from shelter discovery immediately.
            </DialogDescription>
          </DialogHeader>
          {cancel.error ? (
            <ErrorState message={errorMessage(cancel.error)} />
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
              Keep Open
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
              {cancel.isPending ? "Withdrawing…" : "Yes, Withdraw"}
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
        title="No donation dispatches recorded yet"
        body="When shelters claim meals, their complete dispatch timeline will appear here."
      />
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
          Dispatch Timeline & Completed Handovers
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Audited log of food handover steps across shelter beneficiaries.
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
              <Timeline label="Reserved" value={donation.acceptedAt} />
              <Timeline label="Courier Assigned" value={donation.assignedAt} />
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
