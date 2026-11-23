import { useState } from "react";
import { Link } from "react-router";
import {
  IconCalendarEvent,
  IconHeartHandshake,
  IconSparkles,
  IconCheck,
  IconBuilding,
  IconUsers,
  IconLeaf,
  IconArrowRight,
  IconPlus,
} from "@tabler/icons-react";

import { AppShell } from "@/components/second-plate/app-shell";
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
  type SolidarityEvent,
  useSolidarityEventsData,
  useSecondPlateActions,
  useDemoRole,
} from "@/lib/second-plate";
import { cn } from "@/lib/utils";

export function meta() {
  return [
    { title: "Solidarity Events & World Food Day · SECOND PLATE" },
    {
      name: "description",
      content: "Annual organized events created by donors specially for NGOs, including World Food Day (Oct 16).",
    },
  ];
}

export default function EventsRoute() {
  const eventsData = useSolidarityEventsData();
  const actions = useSecondPlateActions();
  const [role] = useDemoRole();

  const [selectedEvent, setSelectedEvent] = useState<SolidarityEvent | null>(null);
  const [pledgeMeals, setPledgeMeals] = useState("100");
  const [donorName, setDonorName] = useState(
    role === "provider" ? "Royal Heritage Grand Banquet" : "Community Partner Restaurant",
  );
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const events = eventsData.data ?? [];

  const handlePledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    const count = parseInt(pledgeMeals, 10);
    if (isNaN(count) || count <= 0) return;

    actions.pledgeToEvent({
      eventId: selectedEvent.id,
      donorName: donorName.trim(),
      portions: count,
    });

    setSelectedEvent(null);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 p-6 md:p-8 text-white shadow-xl border border-emerald-500/20">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
              <IconCalendarEvent size={14} className="text-emerald-400" />
              Annual Solidarity Campaigns & Donor Coalition Drives
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
              Organized Donor Events for NGOs
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Beyond day-to-day surplus, hospitality leaders and food providers coordinate city-wide collective drives for verified shelters — headlined by the annual <strong>October 16 World Food Day Solidarity Mega-Drive</strong>.
            </p>
          </div>
        </section>

        {showSuccessToast && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/15 p-4 text-emerald-800 dark:text-emerald-200 text-sm font-bold flex items-center gap-2 animate-bounce">
            <IconCheck size={18} />
            Thank you! Your meal pledge has been registered for the solidarity drive.
          </div>
        )}

        {/* Flagship Event: World Food Day */}
        {events.length > 0 && (() => {
          const flagship = events[0];
          if (!flagship) return null;
          const percent = Math.min(
            100,
            Math.round((flagship.pledgedMeals / Math.max(1, flagship.targetMeals)) * 100),
          );

          return (
            <section className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-card to-secondary/30 p-6 md:p-8 shadow-lg">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-border/80">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white uppercase tracking-wider">
                      ★ {flagship.badge}
                    </span>
                    <span className="text-xs font-bold text-primary">Annual Movement</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-foreground">
                    {flagship.title}
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                    {flagship.description}
                  </p>
                </div>

                <Button
                  onClick={() => setSelectedEvent(flagship)}
                  className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-6 text-sm shadow-md gap-2 shrink-0"
                >
                  <IconHeartHandshake size={20} />
                  Pledge Meals to World Food Day
                </Button>
              </div>

              {/* Progress & Stats */}
              <div className="mt-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-bold text-foreground">
                    Pledged: <span className="text-emerald-600 dark:text-emerald-400 font-black">{flagship.pledgedMeals.toLocaleString()}</span> / {flagship.targetMeals.toLocaleString()} meals
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">{percent}% Goal Reached</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Partners & Donors */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/60 text-xs">
                <div>
                  <h3 className="font-bold text-foreground mb-2 flex items-center gap-1.5">
                    <IconBuilding size={15} className="text-primary" />
                    Participating Donor Kitchens ({flagship.participatingDonors.length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {flagship.participatingDonors.map((d) => (
                      <span
                        key={d}
                        className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-foreground mb-2 flex items-center gap-1.5">
                    <IconUsers size={15} className="text-emerald-500" />
                    Beneficiary Partner NGOs ({flagship.partnerNgos.length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {flagship.partnerNgos.map((ngo) => (
                      <span
                        key={ngo}
                        className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300"
                      >
                        {ngo}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* Other Recurring Drives */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-foreground">
              Ongoing & Seasonal Solidarity Drives
            </h2>
            <p className="text-xs text-muted-foreground">
              Targeted food rescue missions across animal welfare and renewable energy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.slice(1).map((event) => {
              const percent = Math.min(
                100,
                Math.round((event.pledgedMeals / Math.max(1, event.targetMeals)) * 100),
              );

              return (
                <article
                  key={event.id}
                  className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {event.badge}
                      </span>
                      <span className="text-[11px] font-semibold text-primary">{event.dateLabel}</span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground">{event.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">
                          {event.pledgedMeals.toLocaleString()} / {event.targetMeals.toLocaleString()} meals
                        </span>
                        <span className="text-[11px] text-muted-foreground">{percent}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      Organized by {event.organizer}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedEvent(event)}
                      className="rounded-xl font-bold text-xs gap-1"
                    >
                      Pledge Meals
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Pledge Modal */}
        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <IconHeartHandshake size={20} className="text-emerald-500" />
                Pledge to {selectedEvent?.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Commit surplus meal preparation or bulk produce packs to support this community movement.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handlePledge} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Donor / Restaurant Name</label>
                <Input
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Number of Meals to Pledge</label>
                <Input
                  type="number"
                  min="10"
                  step="10"
                  value={pledgeMeals}
                  onChange={(e) => setPledgeMeals(e.target.value)}
                  className="rounded-xl font-bold"
                  required
                />
              </div>

              <div className="rounded-2xl bg-secondary/50 p-3 text-xs text-muted-foreground">
                <p>
                  Pledges are logged in the public coalition registry and coordinated with transport volunteers for smooth distribution to partner NGOs.
                </p>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                  Confirm Event Pledge
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
