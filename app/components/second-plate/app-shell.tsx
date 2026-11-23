import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  IconBuilding,
  IconChartBar,
  IconHeart,
  IconHome,
  IconListDetails,
  IconMap,
  IconPlus,
  IconTruck,
  IconUser,
  IconSearch,
  IconHistory,
  IconFlame,
  IconCalendarEvent,
  IconLeaf,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { useDemoRole, ROLE_LABELS, type Role } from "@/lib/second-plate";
import { SecondPlateMark } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { LiveTicker } from "./live-ticker";

type NavItem = {
  label: string;
  href: string;
  icon: typeof IconHome;
};

const NAV: Record<Role, NavItem[]> = {
  provider: [
    { label: "Dashboard", href: "/", icon: IconHome },
    { label: "Add Food", href: "/add", icon: IconPlus },
    { label: "Urgent Demands", href: "/demands", icon: IconFlame },
    { label: "Solidarity Events", href: "/events", icon: IconCalendarEvent },
    { label: "Zero-Waste Vision", href: "/vision", icon: IconLeaf },
    { label: "Impact", href: "/impact", icon: IconChartBar },
  ],
  ngo: [
    { label: "Discover", href: "/", icon: IconSearch },
    { label: "Urgent Demands", href: "/demands", icon: IconFlame },
    { label: "Map View", href: "/map", icon: IconMap },
    { label: "Solidarity Events", href: "/events", icon: IconCalendarEvent },
    { label: "Zero-Waste Vision", href: "/vision", icon: IconLeaf },
    { label: "Impact", href: "/impact", icon: IconChartBar },
  ],
  volunteer: [
    { label: "Tasks", href: "/", icon: IconTruck },
    { label: "Urgent Demands", href: "/demands", icon: IconFlame },
    { label: "Nearby Map", href: "/map", icon: IconMap },
    { label: "Solidarity Events", href: "/events", icon: IconCalendarEvent },
    { label: "Zero-Waste Vision", href: "/vision", icon: IconLeaf },
    { label: "Impact", href: "/impact", icon: IconChartBar },
  ],
};

const MOBILE_NAV: Record<Role, NavItem[]> = {
  provider: [
    { label: "Home", href: "/", icon: IconHome },
    { label: "Add Food", href: "/add", icon: IconPlus },
    { label: "Demands", href: "/demands", icon: IconFlame },
    { label: "Events", href: "/events", icon: IconCalendarEvent },
    { label: "Vision", href: "/vision", icon: IconLeaf },
  ],
  ngo: [
    { label: "Discover", href: "/", icon: IconSearch },
    { label: "Demands", href: "/demands", icon: IconFlame },
    { label: "Map", href: "/map", icon: IconMap },
    { label: "Events", href: "/events", icon: IconCalendarEvent },
    { label: "Vision", href: "/vision", icon: IconLeaf },
  ],
  volunteer: [
    { label: "Tasks", href: "/", icon: IconTruck },
    { label: "Demands", href: "/demands", icon: IconFlame },
    { label: "Map", href: "/map", icon: IconMap },
    { label: "Events", href: "/events", icon: IconCalendarEvent },
    { label: "Vision", href: "/vision", icon: IconLeaf },
  ],
};

const ROLE_ICONS: Record<Role, typeof IconBuilding> = {
  provider: IconBuilding,
  ngo: IconHeart,
  volunteer: IconTruck,
};

export function AppShell({ children }: { children: ReactNode }) {
  const [rawRole, setRole] = useDemoRole();
  const role: Role = rawRole === "ngo" || rawRole === "volunteer" ? rawRole : "provider";
  const navigate = useNavigate();
  const location = useLocation();
  const here = `${location.pathname}${location.search}`;
  const items = NAV[role] ?? NAV.provider;
  const mobileItems = MOBILE_NAV[role] ?? MOBILE_NAV.provider;

  const switchRole = (next: Role) => {
    setRole(next);
    navigate("/");
  };

  return (
    <div className="flex min-h-full w-full flex-col bg-background text-foreground transition-colors duration-200">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link to="/" className="group flex items-center gap-3">
              <div className="relative flex items-center justify-center rounded-xl bg-primary/10 p-1.5 transition-transform duration-200 group-hover:scale-105">
                <SecondPlateMark className="h-7 w-7 text-primary" />
                <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black tracking-wider text-foreground">
                    SECOND PLATE
                  </p>
                  <span className="hidden sm:inline-block rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-primary uppercase">
                    PROD
                  </span>
                </div>
                <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Rescue Food · Share Hope
                </p>
              </div>
            </Link>

            <nav
              aria-label="Desktop navigation"
              className="hidden items-center gap-1 md:flex"
            >
              {items.map((item) => {
                const Icon = item.icon;
                const active = here === item.href;
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                      active
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:bg-accent/80 hover:text-foreground",
                    )}
                  >
                    <Icon size={14} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Interactive Role Switcher */}
            <div
              role="radiogroup"
              aria-label="Demo role selector"
              className="flex items-center rounded-full border border-border/80 bg-card p-1 shadow-2xs"
            >
              {(Object.keys(ROLE_LABELS) as Role[]).map((value) => {
                const Icon = ROLE_ICONS[value];
                const isSelected = role === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => switchRole(value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-2xs scale-102"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    )}
                  >
                    <Icon size={13} />
                    <span className="hidden sm:inline">{ROLE_LABELS[value]}</span>
                  </button>
                );
              })}
            </div>

            {/* Dark / Light Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:pb-12">
        <LiveTicker />
        {children}
        <footer className="mt-14 border-t border-border/60 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p className="max-w-2xl leading-relaxed">
              <strong>SECOND PLATE Platform:</strong> Connecting food donors, shelters & volunteers in real-time.
              Surplus is certified under local FSSAI handling guidelines. Collection timers represent safe holding declarations.
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-[11px] font-medium border border-border">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Active Hub: Bhubaneswar
              </span>
            </div>
          </div>
        </footer>
      </main>

      <nav
        aria-label="Primary navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden shadow-lg"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5 py-1">
          {mobileItems.map((item) => {
            const Icon = item.icon;
            const active = here === item.href;
            return (
              <li key={item.label}>
                <Link
                  to={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1 py-1.5 text-[10px] font-semibold transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full transition-all",
                      active ? "bg-primary/15 text-primary scale-110" : "",
                    )}
                  >
                    <Icon size={19} stroke={active ? 2.3 : 1.8} />
                  </div>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function RoleGate({
  allowed,
  children,
}: {
  allowed: Role;
  children: ReactNode;
}) {
  const [role, setRole] = useDemoRole();
  if (role === allowed) return <>{children}</>;
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-lg">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <IconBuilding size={30} />
      </div>
      <h3 className="text-lg font-bold text-foreground">Role Restricted</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        This screen is tailored for the <strong>{ROLE_LABELS[allowed]}</strong> portal.
      </p>
      <button
        type="button"
        onClick={() => setRole(allowed)}
        className="mt-5 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-transform active:scale-98"
      >
        Switch to {ROLE_LABELS[allowed]} View
      </button>
    </div>
  );
}
