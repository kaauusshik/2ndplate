import type { ReactNode } from "react";
import {
  IconClock,
  IconMapPin,
  IconLeaf,
  IconSalad,
  IconToolsKitchen2,
  IconPackage,
  IconFlame,
  IconAlertTriangle,
  IconCheck,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  DONATION_STATUS_LABELS,
  LISTING_STATUS_LABELS,
  DESTINATION_TIER_META,
  formatDateTime,
  formatRemaining,
  useNow,
  type Listing,
  type FoodDestinationTier,
} from "@/lib/second-plate";

const STATUS_TONE: Record<string, string> = {
  AVAILABLE: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  ACCEPTED: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  VOLUNTEER_ASSIGNED: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  PICKED_UP: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
  DELIVERED: "bg-emerald-600 text-white border-transparent",
  CANCELLED: "bg-muted text-muted-foreground border-transparent",
  REJECTED: "bg-destructive/15 text-destructive border-destructive/20",
  EXPIRED: "bg-muted text-muted-foreground border-transparent",
};

export function StatusBadge({
  status,
  donation = false,
}: {
  status: string;
  donation?: boolean;
}) {
  const label = donation
    ? DONATION_STATUS_LABELS[status]
    : LISTING_STATUS_LABELS[status];
  return (
    <Badge
      variant="outline"
      className={cn("px-2.5 py-0.5 font-semibold text-xs rounded-full shadow-2xs", STATUS_TONE[status])}
    >
      {label ?? status}
    </Badge>
  );
}

export function DeadlineText({ collectBy }: { collectBy: string }) {
  const now = useNow();
  const ms = Date.parse(collectBy) - now;
  const expired = ms <= 0;
  const isUrgent = ms > 0 && ms <= 2 * 3_600_000;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border",
        expired
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : isUrgent
            ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 animate-pulse"
            : "border-primary/20 bg-primary/5 text-primary",
      )}
    >
      <IconClock size={13} aria-hidden="true" />
      {formatRemaining(collectBy, now)}
    </span>
  );
}

const CATEGORY_ICON: Record<string, typeof IconSalad> = {
  cooked_meal: IconToolsKitchen2,
  bakery: IconSalad,
  produce: IconLeaf,
  packaged: IconPackage,
};

export function ListingCard({
  listing,
  footer,
  distanceLabel,
  reasons,
}: {
  listing: Listing;
  footer?: ReactNode;
  distanceLabel?: string;
  reasons?: string[];
}) {
  const CatIcon = CATEGORY_ICON[listing.category] ?? IconSalad;
  const remainingPct = Math.round((listing.portionsRemaining / Math.max(1, listing.portionsTotal)) * 100);
  const now = useNow();
  const msLeft = Date.parse(listing.collectBy) - now;
  const isUrgent = msLeft > 0 && msLeft < 2 * 3_600_000;

  return (
    <article className="card-hover-lift group flex flex-col justify-between gap-3.5 rounded-2xl border border-border/80 bg-card p-4.5 shadow-xs">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <CatIcon size={16} />
              </span>
              <h3 className="truncate text-base font-bold text-foreground tracking-tight">
                {listing.title}
              </h3>
            </div>
            <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
              {listing.providerName}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <StatusBadge status={listing.status} />
            {isUrgent && listing.status === "AVAILABLE" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                <IconFlame size={12} /> Urgent
              </span>
            )}
          </div>
        </div>

        {/* Portion Remaining Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">
              {listing.portionsRemaining} portions available
            </span>
            <span className="text-muted-foreground text-[11px]">
              of {listing.portionsTotal} total
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/80">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                remainingPct > 50 ? "bg-emerald-500" : remainingPct > 20 ? "bg-amber-500" : "bg-red-500",
              )}
              style={{ width: `${remainingPct}%` }}
            />
          </div>
        </div>

        {/* Badges / Meta tags */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {/* Destination Tier Badge */}
          {(() => {
            const tierMeta = DESTINATION_TIER_META[listing.destinationTier ?? "people"];
            return (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold border",
                  tierMeta.bgTone,
                  tierMeta.textTone,
                  tierMeta.borderTone,
                )}
              >
                <span>{tierMeta.icon}</span>
                <span>{tierMeta.shortTitle}</span>
              </span>
            );
          })()}

          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border",
              listing.isVegetarian
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                : "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
            )}
          >
            {listing.isVegetarian ? <IconLeaf size={12} /> : <IconSalad size={12} />}
            {listing.isVegetarian ? "Veg" : "Non-Veg"}
          </span>

          <span className="rounded-md border border-border/70 bg-background/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {CATEGORY_LABELS[listing.category] ?? listing.category}
          </span>

          {listing.weightKg ? (
            <span className="rounded-md border border-border/70 bg-background/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {listing.weightKg} kg
            </span>
          ) : null}

          {distanceLabel ? (
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              📍 {distanceLabel}
            </span>
          ) : null}

          {listing.allowAlternativeRouting ? (
            <span
              className="inline-flex items-center gap-1 rounded-md border border-dashed border-teal-500/40 bg-teal-500/5 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:text-teal-300"
              title="If unclaimed before deadline, surplus auto-reroutes to Animal Feed or Biogas"
            >
              🔄 Circular Reroute On
            </span>
          ) : null}
        </div>

        {/* Address and Deadline row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50 text-xs">
          <p className="inline-flex items-center gap-1 text-muted-foreground truncate max-w-[260px]" title={listing.pickupAddress}>
            <IconMapPin size={14} className="shrink-0 text-muted-foreground" />
            <span className="truncate">{listing.pickupAddress}</span>
          </p>
          <DeadlineText collectBy={listing.collectBy} />
        </div>

        {reasons && reasons.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5 pt-1">
            {reasons.map((reason) => (
              <li
                key={reason}
                className="rounded-full bg-accent/80 px-2.5 py-0.5 text-[11px] font-semibold text-accent-foreground border border-border/40"
              >
                {reason}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {footer ? <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">{footer}</div> : null}
    </article>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 p-10 text-center shadow-xs">
      <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <IconLeaf size={24} />
      </div>
      <p className="text-base font-bold text-foreground">{title}</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground leading-relaxed">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-border/80 bg-card/60 p-12 text-center text-sm font-medium text-muted-foreground"
    >
      <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive"
    >
      <IconAlertTriangle size={20} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function formatWhen(iso: string | null) {
  return iso ? formatDateTime(iso) : "Not yet";
}

export function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}
