import { Link } from "react-router";
import { useActionQuery } from "@agent-native/core/client/hooks";
import {
  IconBuildingStore,
  IconHeartHandshake,
  IconTruck,
  IconShieldCheck,
  IconSparkles,
  IconUser,
  IconMapPin,
  IconArrowRight,
  type Icon,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  DEMO_NGO_ADDRESS,
  DEMO_NGO_NAME,
  DEMO_VOLUNTEER_NAME,
  ROLE_LABELS,
  type DonationRow,
  type Listing,
  type Role,
  useDemoRole,
} from "@/lib/second-plate";
import { ErrorState, LoadingState, errorMessage } from "./primitives";

const POINTS_PER_DELIVERY = 15;

const ROLE_ICONS: Record<Role, Icon> = {
  provider: IconBuildingStore,
  ngo: IconHeartHandshake,
  volunteer: IconTruck,
};

export function ProfileView() {
  const [rawRole, setRole] = useDemoRole();
  const role: Role = rawRole === "ngo" || rawRole === "volunteer" ? rawRole : "provider";
  const listings = useActionQuery("list-listings", {});
  const donations = useActionQuery("list-donations", {});

  if (listings.isLoading || donations.isLoading) {
    return <LoadingState label="Loading profile information…" />;
  }
  if (listings.error || donations.error) {
    return <ErrorState message={errorMessage(listings.error ?? donations.error)} />;
  }

  const allListings = (listings.data ?? []) as Listing[];
  const rows = (donations.data ?? []) as DonationRow[];
  const RoleIcon = ROLE_ICONS[role] ?? ROLE_ICONS.provider;

  const name =
    role === "provider"
      ? (allListings[0]?.providerName ?? "Spice Route Kitchen (Demo)")
      : role === "ngo"
        ? DEMO_NGO_NAME
        : DEMO_VOLUNTEER_NAME;

  const stats =
    role === "provider"
      ? [
          { label: "Surplus Batches Published", value: allListings.length },
          {
            label: "Meals Shared & Delivered",
            value: rows
              .filter((r) => r.donation.status === "DELIVERED")
              .reduce((sum, r) => sum + r.donation.portions, 0),
          },
        ]
      : role === "ngo"
        ? [
            { label: "Donation Batches Claimed", value: rows.length },
            {
              label: "Shelter Portions Received",
              value: rows
                .filter((r) => r.donation.status === "DELIVERED")
                .reduce((sum, r) => sum + r.donation.portions, 0),
            },
          ]
        : [
            {
              label: "Completed Deliveries",
              value: rows.filter(
                (r) =>
                  r.donation.status === "DELIVERED" &&
                  r.donation.volunteerName === DEMO_VOLUNTEER_NAME,
              ).length,
            },
            {
              label: "Rescue Courier XP",
              value:
                rows.filter(
                  (r) =>
                    r.donation.status === "DELIVERED" &&
                    r.donation.volunteerName === DEMO_VOLUNTEER_NAME,
                ).length * POINTS_PER_DELIVERY,
            },
          ];

  const shortcuts =
    role === "provider"
      ? [
          { label: "Publish Surplus Food", to: "/add" },
          { label: "Donation Log", to: "/?tab=donations" },
        ]
      : role === "ngo"
        ? [
            { label: "Discover Surplus Food", to: "/" },
            { label: "Shelter Claims", to: "/?tab=mine" },
          ]
        : [
            { label: "Rescue Tasks", to: "/" },
            { label: "Courier Achievements", to: "/?tab=history" },
          ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <section className="flex flex-col items-start gap-5 rounded-3xl border border-border/80 bg-card p-6 shadow-xs sm:flex-row sm:items-center">
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <RoleIcon size={32} aria-hidden="true" />
        </span>
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary uppercase">
              {ROLE_LABELS[role]} Portal
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Verified Member
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {name}
          </h1>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconMapPin size={14} />
            {role === "ngo" ? DEMO_NGO_ADDRESS : "Bhubaneswar Central Hub, Odisha"}
          </p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="card-hover-lift rounded-3xl border border-border/80 bg-card p-5 shadow-2xs space-y-1"
          >
            <p className="text-3xl font-black tabular-nums tracking-tight text-primary">
              {stat.value}
            </p>
            <p className="text-xs font-bold text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Quick shortcuts */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">Quick Action Shortcuts</h2>
        <div className="flex flex-wrap gap-2.5">
          {shortcuts.map((shortcut) => (
            <Button
              key={shortcut.to}
              asChild
              variant="outline"
              className="rounded-full font-bold shadow-2xs hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
            >
              <Link to={shortcut.to}>
                {shortcut.label} <IconArrowRight size={14} className="ml-1" />
              </Link>
            </Button>
          ))}
        </div>
      </section>

      {/* Account Info Details */}
      <section className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs">
        <dl className="divide-y divide-border/60 text-xs">
          <div className="flex justify-between items-center px-5 py-3.5">
            <dt className="text-muted-foreground font-semibold">Active Persona</dt>
            <dd className="font-bold text-foreground">{ROLE_LABELS[role]}</dd>
          </div>
          <div className="flex justify-between items-center px-5 py-3.5">
            <dt className="text-muted-foreground font-semibold">Safety Compliance</dt>
            <dd className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <IconShieldCheck size={15} /> FSSAI Certified Handling
            </dd>
          </div>
          <div className="flex justify-between items-center px-5 py-3.5">
            <dt className="text-muted-foreground font-semibold">Location Anchor</dt>
            <dd className="font-medium text-foreground">Fixed hub coordinates (Bhubaneswar Grid)</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
