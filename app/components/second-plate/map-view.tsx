import { useState } from "react";
import { Link } from "react-router";
import {
  IconMapPin,
  IconCompass,
  IconArrowRight,
  IconRadar,
  IconClock,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import {
  DEMO_BASE,
  type DonationRow,
  type Listing,
  type FoodDestinationTier,
  DESTINATION_TIER_META,
  distanceKm,
  useDemoRole,
  useListingsData,
  useDonationsData,
} from "@/lib/second-plate";
import {
  DeadlineText,
  EmptyState,
  ErrorState,
  LoadingState,
  errorMessage,
} from "./primitives";

type Point = {
  id: string;
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  collectBy: string;
  portions: number;
  destinationTier: FoodDestinationTier;
};

const WIDTH = 640;
const HEIGHT = 440;
const PAD = 64;

export function MapView() {
  const [role] = useDemoRole();
  const listings = useListingsData();
  const donations = useDonationsData();
  const [selected, setSelected] = useState<string | null>(null);
  const isVolunteer = role === "volunteer";

  const loading = isVolunteer ? donations.isLoading : listings.isLoading;
  const error = isVolunteer ? donations.error : listings.error;
  if (loading) return <LoadingState label="Mapping food rescue radar coordinates…" />;
  if (error) return <ErrorState message={errorMessage(error)} />;

  const points: Point[] = isVolunteer
    ? ((donations.data ?? []) as DonationRow[])
        .filter((row) => row.donation.status === "ACCEPTED")
        .map(({ donation, listing }) => toPoint(listing, donation.portions, donation.ngoName))
    : ((listings.data ?? []) as Listing[])
        .filter((listing) => listing.status === "AVAILABLE")
        .map((listing) => toPoint(listing, listing.portionsRemaining, listing.providerName));

  const sorted = [...points].sort(
    (a, b) => distanceKm(DEMO_BASE, a) - distanceKm(DEMO_BASE, b),
  );
  const title = isVolunteer ? "Live Rescue Map (Pickups)" : "City Surplus Food Radar";
  const project = makeProjection(points);

  const selectedPoint = points.find((p) => p.id === selected) ?? points[0];

  return (
    <div className="space-y-6">
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <IconRadar size={18} className="animate-spin text-primary" style={{ animationDuration: "12s" }} />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">{title}</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {isVolunteer
              ? "Schematic radar showing accepted meals awaiting transport in Bhubaneswar."
              : "Geographic distribution of open surplus food batches ready for shelter pickup."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
            {points.length} Active Nodes
          </span>
        </div>
      </section>

      {points.length === 0 ? (
        <EmptyState
          title={isVolunteer ? "No active pickups on the radar" : "No surplus points plotted"}
          body={
            isVolunteer
              ? "When shelters claim donations, active pickup nodes illuminate here."
              : "Publish or seed demo listings to see live nodes across the city."
          }
        />
      ) : (
        <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
          {/* Radar Map SVG */}
          <figure className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-secondary/30 shadow-md">
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="h-auto w-full text-primary select-none"
              role="img"
              aria-label="Schematic radar map of food surplus locations"
            >
              <defs>
                <pattern id="radar-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeOpacity="0.07" />
                </pattern>
                <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width={WIDTH} height={HEIGHT} fill="url(#radar-grid)" />

              {/* Concentric radar rings centered on DEMO_BASE */}
              {(() => {
                const base = project(DEMO_BASE);
                return (
                  <g className="text-primary">
                    <circle cx={base.x} cy={base.y} r={WIDTH * 0.4} fill="url(#radar-glow)" />
                    <circle cx={base.x} cy={base.y} r={60} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeDasharray="3 3" />
                    <circle cx={base.x} cy={base.y} r={130} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeDasharray="3 3" />
                    <circle cx={base.x} cy={base.y} r={200} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />

                    {/* Connecting line to selected point */}
                    {selectedPoint && (
                      <line
                        x1={base.x}
                        y1={base.y}
                        x2={project(selectedPoint).x}
                        y2={project(selectedPoint).y}
                        stroke="currentColor"
                        strokeOpacity="0.25"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />
                    )}

                    {/* Base point marker */}
                    <circle cx={base.x} cy={base.y} r={8} className="fill-foreground shadow-lg" />
                    <circle cx={base.x} cy={base.y} r={18} className="fill-foreground/15 animate-ping" style={{ animationDuration: "3s" }} />
                    <text x={base.x + 12} y={base.y + 4} className="fill-foreground text-[11px] font-black tracking-wide">
                      HUB BASE
                    </text>
                  </g>
                );
              })()}

              {/* Plotted nodes */}
              {points.map((point, index) => {
                const { x, y } = project(point);
                const active = selected === point.id;
                return (
                  <g
                    key={point.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${point.title}, ${point.portions} portions`}
                    className="cursor-pointer outline-none group transition-transform"
                    onClick={() => setSelected(point.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setSelected(point.id);
                    }}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={active ? 26 : 18}
                      className={cn(
                        "transition-all duration-300",
                        active ? "fill-emerald-500/30" : "fill-primary/15 group-hover:fill-primary/25",
                      )}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={active ? 14 : 11}
                      className={cn(
                        "stroke-background transition-all duration-300",
                        active ? "fill-emerald-600 stroke-white stroke-2" : "fill-primary stroke-2",
                      )}
                    />
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      className="fill-white text-[10px] font-black pointer-events-none"
                    >
                      {index + 1}
                    </text>
                  </g>
                );
              })}
            </svg>

            <figcaption className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/60 bg-card/85 p-2.5 text-[11px] text-muted-foreground backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                  <span className="size-2 rounded-full bg-emerald-500" /> Surplus Location
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                  <span className="size-2 rounded-full bg-foreground" /> Dispatch Hub
                </span>
              </div>
              <span className="hidden sm:inline text-[10px] text-muted-foreground">
                Radar projection centered on central hub
              </span>
            </figcaption>
          </figure>

          {/* Node List & Details */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
              Active Surplus Radar Nodes ({sorted.length})
            </h3>
            {sorted.map((point) => {
              const active = (selected ?? points[0]?.id) === point.id;
              const km = distanceKm(DEMO_BASE, point);
              return (
                <div key={point.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(point.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all",
                      active
                        ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20 scale-101"
                        : "border-border/80 bg-card hover:bg-accent/40",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-xl text-xs font-black shadow-2xs",
                        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {points.indexOf(point) + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate text-sm font-bold text-foreground">
                        {point.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground font-medium">
                        {point.subtitle} · <strong>{point.portions} portions</strong>
                      </p>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] font-bold rounded-md bg-secondary px-1.5 py-0.5 border border-border/60">
                          {DESTINATION_TIER_META[point.destinationTier ?? "people"]?.badge ?? "👥 Tier 1"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-border/40">
                        <span className="inline-flex items-center gap-1 font-semibold text-primary">
                          <IconMapPin size={12} />
                          {km.toFixed(1)} km from base
                        </span>
                        <DeadlineText collectBy={point.collectBy} />
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function toPoint(listing: Listing, portions: number, subtitle: string): Point {
  return {
    id: listing.id,
    title: listing.title,
    subtitle,
    latitude: listing.latitude,
    longitude: listing.longitude,
    collectBy: listing.collectBy,
    portions,
    destinationTier: listing.destinationTier ?? "people",
  };
}

function makeProjection(points: Point[]) {
  const lats = [DEMO_BASE.latitude, ...points.map((p) => p.latitude)];
  const lons = [DEMO_BASE.longitude, ...points.map((p) => p.longitude)];
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const latSpan = Math.max(maxLat - Math.min(...lats), 0.02);
  const lonSpan = Math.max(Math.max(...lons) - minLon, 0.02);
  return (point: { latitude: number; longitude: number }) => ({
    x: PAD + ((point.longitude - minLon) / lonSpan) * (WIDTH - PAD * 2),
    y: PAD + ((maxLat - point.latitude) / latSpan) * (HEIGHT - PAD * 2),
  });
}
