import { useState } from "react";
import { Link } from "react-router";
import {
  IconLeaf,
  IconArrowRight,
  IconHeart,
  IconBolt,
  IconSparkles,
  IconCheck,
  IconScale,
  IconShieldCheck,
} from "@tabler/icons-react";

import { AppShell } from "@/components/second-plate/app-shell";
import { Button } from "@/components/ui/button";
import { DESTINATION_TIER_META, type FoodDestinationTier } from "@/lib/second-plate";
import { cn } from "@/lib/utils";

export function meta() {
  return [
    { title: "Our Vision: 100% Zero-Landfill Food Ecosystem · SECOND PLATE" },
    {
      name: "description",
      content: "3-tier circular surplus lifecycle: People & NGOs (if fresh), Animal Feed, and Compost or Biogas.",
    },
  ];
}

export default function VisionRoute() {
  const [dailySurplusKg, setDailySurplusKg] = useState(250);

  // Cascade calculations
  const humanPortions = Math.round(dailySurplusKg * 0.65 * 2.5); // 65% of weight to meals (400g/portion)
  const animalFeedKg = Math.round(dailySurplusKg * 0.22); // 22% to animals
  const compostBiogasKg = Math.round(dailySurplusKg * 0.13); // 13% to biogas/compost
  const biogasM3 = (compostBiogasKg * 0.2).toFixed(1);
  const landfillKg = 0; // The Second Plate Guarantee!

  return (
    <AppShell>
      <div className="space-y-12">
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#08231a] via-[#0d3326] to-[#04130e] p-8 md:p-12 text-white shadow-2xl border border-emerald-500/20">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1 text-xs font-bold text-emerald-300">
              <span className="text-sm">🔄</span>
              The Second Plate Circular Food Charter
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Our Vision: Zero Food Lost. Zero Food to Landfills.
            </h1>
            <p className="text-base text-emerald-100/80 leading-relaxed max-w-2xl">
              Even when surplus cannot connect to a nearby NGO, it never goes into the trash. We operate an automated 3-tier cascade: <strong>1. Directly to People (if fresh)</strong>, <strong>2. To Animal Feed & Shelters</strong>, and <strong>3. To Compost or Clean Biogas</strong>.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/add">
                <Button className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-5 shadow-lg">
                  Publish Surplus Now
                </Button>
              </Link>
              <Link to="/demands">
                <Button variant="outline" className="rounded-2xl border-white/20 text-white hover:bg-white/10 font-bold px-5">
                  View Urgent NGO Demands
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 3-Tier Architecture Breakdown */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-primary">
              Core Platform Architecture
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-foreground">
              The 3 Sub-Parts of Food Rescue
            </h2>
            <p className="text-sm text-muted-foreground">
              A hierarchical fallback model guaranteeing every kilogram finds its highest and best purpose.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tier 1 */}
            <article className="relative rounded-3xl border-2 border-emerald-500/30 bg-card p-6 shadow-xs flex flex-col justify-between gap-6 hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">👥</span>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300">
                    Tier 1 (Priority)
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    NGO / Directly to People
                  </h3>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    &ldquo;If and only if it is fresh&rdquo;
                  </p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Hot banquet surpluses, corporate canteens, and morning bakery batches maintained within strict FSSAI temperature windows. Delivered directly to verified shelters, children&rsquo;s homes, and street-level community meal centers.
                </p>

                <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <IconCheck size={14} className="text-emerald-500 shrink-0" />
                    <span>Thermal probe certified (&gt;65°C hot, &lt;4°C cold)</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <IconCheck size={14} className="text-emerald-500 shrink-0" />
                    <span>Food-grade sealed containers</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <IconCheck size={14} className="text-emerald-500 shrink-0" />
                    <span>Zero self-serve cross contamination</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-500/10 p-3 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Primary Goal: Eliminate Hunger
              </div>
            </article>

            {/* Tier 2 */}
            <article className="relative rounded-3xl border-2 border-amber-500/30 bg-card p-6 shadow-xs flex flex-col justify-between gap-6 hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">🐾</span>
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-black text-amber-700 dark:text-amber-400">
                    Tier 2 (Fallback)
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    Animals & Gaushalas
                  </h3>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    Wholesome feed for cattle & animal shelters
                  </p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When human consumption cutoff is reached, or for clean surplus such as day-old bran loaves, grain porridges, and crisp vegetable greens that are safe and nutritious for animals.
                </p>

                <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <IconCheck size={14} className="text-amber-500 shrink-0" />
                    <span>Registered Gaushala & dairy cattle feed</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <IconCheck size={14} className="text-amber-500 shrink-0" />
                    <span>Street animal rescue feeder collectives</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <IconCheck size={14} className="text-amber-500 shrink-0" />
                    <span>Free of harmful alliums, chocolate or toxic spices</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-amber-500/10 p-3 text-center text-xs font-bold text-amber-700 dark:text-amber-400">
                Compassion for All Living Beings
              </div>
            </article>

            {/* Tier 3 */}
            <article className="relative rounded-3xl border-2 border-teal-500/30 bg-card p-6 shadow-xs flex flex-col justify-between gap-6 hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">♻️</span>
                  <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-black text-teal-700 dark:text-teal-300">
                    Tier 3 (Circular)
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    Compost & Biogas
                  </h3>
                  <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                    &ldquo;Compost nahale Biogas&rdquo; (Clean renewable energy)
                  </p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Inedible kitchen trimmings, melon rinds, vegetable peels, and over-ripe biomass diverted to localized bio-methanation digesters or organic composting units instead of rotting in municipal dumps.
                </p>

                <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <IconCheck size={14} className="text-teal-500 shrink-0" />
                    <span>Decentralized biomethanation cooking gas</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <IconCheck size={14} className="text-teal-500 shrink-0" />
                    <span>Aerobic microbial soil composting</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <IconCheck size={14} className="text-teal-500 shrink-0" />
                    <span>100% Methane emission prevention</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-teal-500/10 p-3 text-center text-xs font-bold text-teal-700 dark:text-teal-300">
                Zero Waste & Renewable Energy
              </div>
            </article>
          </div>
        </section>

        {/* Interactive Cascade Simulator */}
        <section className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary mb-2">
                <IconScale size={14} />
                Live Circular Simulation
              </div>
              <h3 className="text-xl md:text-2xl font-black text-foreground">
                Simulate City Food Cascade
              </h3>
              <p className="text-xs text-muted-foreground">
                Adjust daily surplus volume to see how Second Plate guarantees 0% landfill diversion.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-secondary/60 p-3 rounded-2xl border border-border">
              <span className="text-xs font-bold text-muted-foreground">Daily Surplus:</span>
              <span className="text-xl font-black text-primary">{dailySurplusKg} kg</span>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min={50}
              max={1000}
              step={25}
              value={dailySurplusKg}
              onChange={(e) => setDailySurplusKg(parseInt(e.target.value, 10))}
              className="w-full accent-primary h-2 rounded-lg cursor-pointer bg-secondary"
            />
            <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
              <span>50 kg (Small Neighborhood)</span>
              <span>500 kg (Commercial Ward)</span>
              <span>1,000 kg (Metro Hub)</span>
            </div>
          </div>

          {/* Flow Diagram */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center space-y-1">
              <span className="text-2xl">👥</span>
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                Tier 1: People
              </p>
              <p className="text-2xl font-black text-foreground">{humanPortions}</p>
              <p className="text-[10px] text-muted-foreground">Nutritious meals served</p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-center space-y-1">
              <span className="text-2xl">🐾</span>
              <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                Tier 2: Animals
              </p>
              <p className="text-2xl font-black text-foreground">{animalFeedKg} kg</p>
              <p className="text-[10px] text-muted-foreground">Gaushala & shelter feed</p>
            </div>

            <div className="rounded-2xl border border-teal-500/30 bg-teal-500/5 p-4 text-center space-y-1">
              <span className="text-2xl">♻️</span>
              <p className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase">
                Tier 3: Biogas & Soil
              </p>
              <p className="text-2xl font-black text-foreground">{compostBiogasKg} kg</p>
              <p className="text-[10px] text-muted-foreground">{biogasM3} m³ clean fuel</p>
            </div>

            <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-4 text-center space-y-1">
              <span className="text-2xl">🛡️</span>
              <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                Landfill Waste
              </p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">0 kg</p>
              <p className="text-[10px] text-muted-foreground">100% Zero-Landfill Promise</p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
