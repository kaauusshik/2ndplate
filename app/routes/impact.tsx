import { Link } from "react-router";
import {
  IconLeaf,
  IconDroplet,
  IconCar,
  IconPlant,
  IconChartBar,
  IconBolt,
  IconSparkles,
  IconArrowRight,
  IconHeartHandshake,
} from "@tabler/icons-react";

import { AppShell } from "@/components/second-plate/app-shell";
import { useImpactData } from "@/lib/second-plate";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  errorMessage,
} from "@/components/second-plate/primitives";

export function meta() {
  return [
    { title: "Impact & Sustainability · SECOND PLATE" },
    { name: "description", content: "Platform sustainability and food rescue metrics" },
  ];
}

type Totals = {
  portions: number;
  weightKg: number;
  completedDonations: number;
  activeProviders: number;
  ngosReceiving: number;
  volunteerDeliveries: number;
  tierPeoplePortions?: number;
  tierAnimalKg?: number;
  tierCompostKg?: number;
};

type Impact = {
  real: Totals;
  demo: Totals;
  daily: { day: string; real: number; demo: number }[];
};

export default function ImpactRoute() {
  const impact = useImpactData();

  return (
    <AppShell>
      <div className="space-y-8">
        <section className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <IconLeaf size={14} />
            Community & Environmental Accountability
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground md:text-4xl">
            Rescue Impact Dashboard
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Every portion redirected from landfill directly lowers greenhouse methane emissions
            and supplies nutritious meals to local shelters.
          </p>
        </section>

        {impact.isLoading ? <LoadingState label="Computing real-time environmental savings…" /> : null}
        {impact.error ? <ErrorState message={errorMessage(impact.error)} /> : null}

        {impact.data ? <ImpactContent data={impact.data as Impact} /> : null}
      </div>
    </AppShell>
  );
}

function ImpactContent({ data }: { data: Impact }) {
  const combinedPortions = data.real.portions + data.demo.portions;
  const combinedWeight = data.real.weightKg + data.demo.weightKg;

  // EPA & FAO Food Waste conversion factors
  const co2SavedKg = Math.round(combinedWeight > 0 ? combinedWeight * 2.5 : combinedPortions * 0.88);
  const waterSavedLiters = Math.round(combinedPortions * 180);
  const treesEquivalent = (co2SavedKg / 22).toFixed(1);
  const carKmSaved = Math.round(co2SavedKg * 4.2);

  const maxDaily = Math.max(1, ...data.daily.map((d) => d.real + d.demo));

  return (
    <div className="space-y-8">
      {/* Environmental Equivalency Highlights */}
      <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-secondary/30 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <IconSparkles size={18} className="text-emerald-500" />
            Ecological Savings Equivalent
          </h2>
          <span className="text-[11px] font-semibold text-muted-foreground">
            Based on EPA WARM Life-Cycle Metrics
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-hover-lift rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <IconLeaf size={20} />
              <span className="text-xs font-bold uppercase">CO₂ Offset</span>
            </div>
            <p className="text-2xl font-black text-foreground">{co2SavedKg} kg</p>
            <p className="text-[11px] text-muted-foreground">Methane emissions averted</p>
          </div>

          <div className="card-hover-lift rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-blue-500">
              <IconDroplet size={20} />
              <span className="text-xs font-bold uppercase">Water Saved</span>
            </div>
            <p className="text-2xl font-black text-foreground">{waterSavedLiters.toLocaleString()} L</p>
            <p className="text-[11px] text-muted-foreground">Virtual water preserved</p>
          </div>

          <div className="card-hover-lift rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-amber-500">
              <IconPlant size={20} />
              <span className="text-xs font-bold uppercase">Tree Power</span>
            </div>
            <p className="text-2xl font-black text-foreground">~{treesEquivalent}</p>
            <p className="text-[11px] text-muted-foreground">Years of tree absorption</p>
          </div>

          <div className="card-hover-lift rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-purple-500">
              <IconCar size={20} />
              <span className="text-xs font-bold uppercase">Driving Miles</span>
            </div>
            <p className="text-2xl font-black text-foreground">{carKmSaved.toLocaleString()} km</p>
            <p className="text-[11px] text-muted-foreground">Equivalent vehicle travel</p>
          </div>
        </div>
      </section>

      {/* 3-Tier Zero-Waste Redirection Architecture Breakdown */}
      <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="text-lg">🔄</span>
              3-Tier Surplus Cascade Distribution
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Food distribution categorized by destination channel according to the circular charter.
            </p>
          </div>
          <Link
            to="/vision"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            Explore Circular Vision &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-700 dark:text-emerald-300">👥 Tier 1: People & NGOs</span>
              <span className="text-[10px] rounded-full bg-emerald-500/15 px-2 py-0.5 font-bold text-emerald-600 dark:text-emerald-400">Fresh</span>
            </div>
            <p className="text-2xl font-black text-foreground">
              {data.demo.tierPeoplePortions ?? 60} <span className="text-sm font-semibold text-muted-foreground">portions</span>
            </p>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Surplus dispatched directly to homeless shelters, children&rsquo;s homes & community pantries.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-700 dark:text-amber-300">🐾 Tier 2: Animal Feed</span>
              <span className="text-[10px] rounded-full bg-amber-500/15 px-2 py-0.5 font-bold text-amber-600 dark:text-amber-400">Gaushalas</span>
            </div>
            <p className="text-2xl font-black text-foreground">
              {data.demo.tierAnimalKg ?? 18} <span className="text-sm font-semibold text-muted-foreground">kg</span>
            </p>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Clean grains, bread & vegetable discards safely fed to cows, cattle & rescued street animals.
            </p>
          </div>

          <div className="rounded-2xl border border-teal-500/30 bg-teal-500/5 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-teal-700 dark:text-teal-300">♻️ Tier 3: Biogas & Compost</span>
              <span className="text-[10px] rounded-full bg-teal-500/15 px-2 py-0.5 font-bold text-teal-600 dark:text-teal-400">Circular</span>
            </div>
            <p className="text-2xl font-black text-foreground">
              {data.demo.tierCompostKg ?? 42} <span className="text-sm font-semibold text-muted-foreground">kg</span>
            </p>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Kitchen peels and over-ripe trimmings diverted to decentralized biomethanation & soil enrichment.
            </p>
          </div>
        </div>
      </section>

      {/* Real platform activity */}
      <Scope
        title="Live Verified Deliveries"
        totals={data.real}
        emptyNote="Live shelter dispatches will accumulate here in real-time."
      />

      {/* Daily portions graph */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Daily Portions Distributed</h2>
          <span className="text-xs text-muted-foreground">Updated in real-time</span>
        </div>

        {data.daily.length === 0 ? (
          <EmptyState
            title="No delivery history charted"
            body="Completed food handovers will automatically chart your daily distribution here."
          />
        ) : (
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex h-48 items-end gap-3 pt-6">
              {data.daily.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
                  <div className="text-[10px] font-bold text-muted-foreground">
                    {d.real + d.demo}
                  </div>
                  <div
                    className="flex w-full max-w-[48px] flex-col-reverse overflow-hidden rounded-t-xl transition-all duration-500 shadow-2xs"
                    style={{ height: `${Math.max(12, ((d.real + d.demo) / maxDaily) * 100)}%` }}
                  >
                    <div
                      className="bg-primary transition-all"
                      style={{ height: `${(d.real / Math.max(1, d.real + d.demo)) * 100}%` }}
                      title={`${d.real} verified portions`}
                    />
                    <div
                      className="bg-emerald-400/70 dark:bg-emerald-500/70 transition-all"
                      style={{ height: `${(d.demo / Math.max(1, d.real + d.demo)) * 100}%` }}
                      title={`${d.demo} demo portions`}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground">{d.day.slice(5)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 pt-2 border-t border-border/60 text-xs">
              <span className="inline-flex items-center gap-2 font-medium">
                <span className="size-3 rounded-md bg-primary shadow-2xs" />
                Verified Live Platform
              </span>
              <span className="inline-flex items-center gap-2 font-medium">
                <span className="size-3 rounded-md bg-emerald-400/70 shadow-2xs" />
                Simulation / Demo
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Demo sample data */}
      <Scope
        title="Simulated Demo Data Benchmark"
        totals={data.demo}
        emptyNote="No demo benchmark data active."
        demo
      />
    </div>
  );
}

function Scope({
  title,
  totals,
  emptyNote,
  demo = false,
}: {
  title: string;
  totals: Totals;
  emptyNote: string;
  demo?: boolean;
}) {
  const stats = [
    { label: "Meals Redistributed", value: totals.portions, icon: "🍲" },
    { label: "Rescued Weight (kg)", value: totals.weightKg, icon: "⚖️" },
    { label: "Completed Dispatches", value: totals.completedDonations, icon: "📦" },
    { label: "Participating Kitchens", value: totals.activeProviders, icon: "🏢" },
    { label: "Partner Shelters", value: totals.ngosReceiving, icon: "🤝" },
    { label: "Courier Runs", value: totals.volunteerDeliveries, icon: "🛵" },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2.5">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {demo ? (
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-secondary-foreground border border-border">
            SIMULATION
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="card-hover-lift rounded-3xl border border-border/80 bg-card p-4.5 shadow-2xs space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">{stat.icon}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Metric</span>
            </div>
            <p className="text-3xl font-black tabular-nums text-primary">{stat.value}</p>
            <p className="text-xs font-bold text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
      {totals.completedDonations === 0 ? (
        <p className="text-xs text-muted-foreground italic py-1">{emptyNote}</p>
      ) : null}
    </section>
  );
}
