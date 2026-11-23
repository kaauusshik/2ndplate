import { useState } from "react";
import { Link } from "react-router";
import {
  IconFlame,
  IconPlus,
  IconHeartHandshake,
  IconClock,
  IconMapPin,
  IconCheck,
  IconBuilding,
  IconAlertCircle,
  IconChevronRight,
  IconSparkles,
} from "@tabler/icons-react";

import { AppShell } from "@/components/second-plate/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type NgoDemand,
  useNgoDemandsData,
  useSecondPlateActions,
  useDemoRole,
  DEMO_NGO_NAME,
  formatDateTime,
} from "@/lib/second-plate";
import { cn } from "@/lib/utils";

export function meta() {
  return [
    { title: "Urgent NGO Food Demands · SECOND PLATE" },
    {
      name: "description",
      content: "NGOs broadcast urgent meal requirements by target deadlines and donors pledge food directly.",
    },
  ];
}

export default function DemandsRoute() {
  const demandsData = useNgoDemandsData();
  const actions = useSecondPlateActions();
  const [role] = useDemoRole();

  const [filter, setFilter] = useState<"all" | "open" | "fulfilled">("all");
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<NgoDemand | null>(null);

  // New demand form state
  const [newDemand, setNewDemand] = useState({
    ngoName: role === "ngo" ? DEMO_NGO_NAME : "Kalinga Shelter Trust",
    foodType: "Dal, Steamed Rice & Mixed Vegetables",
    portionsNeeded: "50",
    deadlineTime: "9:00 PM tonight",
    urgency: "high" as "critical" | "high" | "normal",
    location: "Station Square Night Shelter, Bhubaneswar",
    purpose: "Dinner distribution for homeless workers and street dwellers",
  });

  // Pledge form state
  const [pledgeForm, setPledgeForm] = useState({
    donorName: role === "provider" ? "Royal Heritage Grand Banquet" : "Community Donor Kitchen",
    portions: "20",
    note: "Packed in insulated thermal boxes, ready for pickup.",
  });

  const demands = demandsData.data ?? [];
  const filteredDemands = demands.filter((d) => {
    if (filter === "open") return d.status === "OPEN";
    if (filter === "fulfilled") return d.status === "FULFILLED";
    return true;
  });

  const handleCreateDemand = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(newDemand.portionsNeeded, 10);
    if (isNaN(count) || count <= 0) return;

    actions.createNgoDemand({
      ngoName: newDemand.ngoName.trim(),
      foodType: newDemand.foodType.trim(),
      portionsNeeded: count,
      deadlineTime: newDemand.deadlineTime.trim(),
      urgency: newDemand.urgency,
      location: newDemand.location.trim(),
      purpose: newDemand.purpose.trim(),
    });

    setIsPostOpen(false);
  };

  const handlePledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDemand) return;
    const count = parseInt(pledgeForm.portions, 10);
    if (isNaN(count) || count <= 0) return;

    actions.pledgeToDemand({
      demandId: selectedDemand.id,
      donorName: pledgeForm.donorName.trim(),
      portions: count,
      note: pledgeForm.note.trim() || undefined,
    });

    setSelectedDemand(null);
  };

  const totalPortionsNeeded = demands.reduce((acc, d) => acc + d.portionsNeeded, 0);
  const totalPortionsPledged = demands.reduce((acc, d) => acc + d.portionsPledged, 0);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-emerald-950 p-6 md:p-8 text-white shadow-xl border border-amber-500/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
                <IconFlame size={14} className="text-amber-400" />
                Live NGO Food Demand Broadcast Board
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
                Urgent Food Requests & Donor Response
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                When shelters face an evening deficit, NGOs broadcast exact portion requirements and cutoff deadlines (e.g., <strong>&ldquo;Need 50 meals by 9:00 PM&rdquo;</strong>). Donors respond in real time to pledge excess food.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Button
                onClick={() => setIsPostOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-2xl shadow-lg gap-2"
              >
                <IconPlus size={18} />
                Broadcast Food Demand
              </Button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10 text-xs">
            <div className="rounded-2xl bg-white/5 p-3 backdrop-blur-xs">
              <p className="text-slate-400">Total Demand</p>
              <p className="text-xl font-black text-amber-400">{totalPortionsNeeded} meals</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-3 backdrop-blur-xs">
              <p className="text-slate-400">Pledged by Donors</p>
              <p className="text-xl font-black text-emerald-400">{totalPortionsPledged} meals</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-3 backdrop-blur-xs">
              <p className="text-slate-400">Fulfillment Rate</p>
              <p className="text-xl font-black text-white">
                {totalPortionsNeeded > 0
                  ? Math.round((totalPortionsPledged / totalPortionsNeeded) * 100)
                  : 100}
                %
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 p-3 backdrop-blur-xs">
              <p className="text-slate-400">Active Broadcasts</p>
              <p className="text-xl font-black text-amber-300">
                {demands.filter((d) => d.status === "OPEN").length} open
              </p>
            </div>
          </div>
        </section>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 text-xs">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "rounded-full px-3 py-1 font-semibold transition-colors",
                filter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              All Requests ({demands.length})
            </button>
            <button
              onClick={() => setFilter("open")}
              className={cn(
                "rounded-full px-3 py-1 font-semibold transition-colors",
                filter === "open" ? "bg-amber-500 text-amber-950 font-bold" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Open & Urgent ({demands.filter((d) => d.status === "OPEN").length})
            </button>
            <button
              onClick={() => setFilter("fulfilled")}
              className={cn(
                "rounded-full px-3 py-1 font-semibold transition-colors",
                filter === "fulfilled" ? "bg-emerald-600 text-white font-bold" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Fulfilled ({demands.filter((d) => d.status === "FULFILLED").length})
            </button>
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
            Live broadcast synched across kitchens & shelters
          </div>
        </div>

        {/* Demand Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDemands.map((demand) => {
            const isFulfilled = demand.status === "FULFILLED";
            const percent = Math.min(
              100,
              Math.round((demand.portionsPledged / Math.max(1, demand.portionsNeeded)) * 100),
            );
            const remainingNeeded = Math.max(0, demand.portionsNeeded - demand.portionsPledged);

            return (
              <article
                key={demand.id}
                className={cn(
                  "relative flex flex-col justify-between rounded-3xl border p-5 shadow-xs transition-all",
                  isFulfilled
                    ? "border-emerald-500/30 bg-card/60 opacity-90"
                    : "border-border/90 bg-card hover:border-amber-500/50 hover:shadow-md",
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <IconBuilding size={16} />
                        </span>
                        <h2 className="text-base font-bold text-foreground">{demand.ngoName}</h2>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                        <IconMapPin size={13} className="shrink-0" />
                        {demand.location}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-bold border",
                          demand.urgency === "critical"
                            ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse"
                            : demand.urgency === "high"
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                              : "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
                        )}
                      >
                        {demand.urgency.toUpperCase()}
                      </span>
                      {isFulfilled ? (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          ✓ Fulfilled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          <IconClock size={12} /> {demand.deadlineTime}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Requirements Box */}
                  <div className="rounded-2xl bg-secondary/50 p-3 text-xs space-y-1 border border-border/40">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">Requested Food:</span>
                      <span className="font-semibold text-primary">{demand.foodType}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground italic">
                      &ldquo;{demand.purpose}&rdquo;
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">
                        {demand.portionsPledged} of {demand.portionsNeeded} portions pledged
                      </span>
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {percent}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isFulfilled
                            ? "bg-emerald-500"
                            : percent > 50
                              ? "bg-amber-500"
                              : "bg-amber-600",
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    {!isFulfilled && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                        Still needed: <strong>{remainingNeeded} meals</strong> by {demand.deadlineTime}
                      </p>
                    )}
                  </div>

                  {/* Pledges List */}
                  {demand.pledges.length > 0 && (
                    <div className="pt-2 border-t border-border/50 text-xs space-y-1.5">
                      <p className="font-bold text-muted-foreground text-[11px] uppercase tracking-wider">
                        Donor Pledges ({demand.pledges.length})
                      </p>
                      <div className="space-y-1">
                        {demand.pledges.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between rounded-xl bg-card/80 px-2.5 py-1.5 border border-border/60 text-[11px]"
                          >
                            <span className="font-semibold text-foreground">
                              {p.donorName}
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              +{p.portions} portions
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-muted-foreground">
                    Posted {formatDateTime(demand.createdAt)}
                  </span>
                  {!isFulfilled ? (
                    <Button
                      size="sm"
                      onClick={() => setSelectedDemand(demand)}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 text-xs shadow-xs"
                    >
                      <IconHeartHandshake size={14} />
                      Pledge Food
                    </Button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <IconCheck size={14} /> Demand Fully Met
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {filteredDemands.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <IconHeartHandshake size={40} className="mx-auto text-muted-foreground mb-2" />
            <h3 className="text-base font-bold text-foreground">No demands in this view</h3>
            <p className="text-xs text-muted-foreground mt-1">
              NGOs can click &ldquo;Broadcast Food Demand&rdquo; to publish an urgent meal need.
            </p>
          </div>
        )}

        {/* Post Demand Modal */}
        <Dialog open={isPostOpen} onOpenChange={setIsPostOpen}>
          <DialogContent className="max-w-lg rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <IconFlame size={20} className="text-amber-500" />
                Broadcast Urgent Food Demand
              </DialogTitle>
              <DialogDescription className="text-xs">
                Post an exact meal requirement and deadline so nearby restaurants and caterers can fulfill it before closing.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateDemand} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Organization / Shelter Name</label>
                <Input
                  value={newDemand.ngoName}
                  onChange={(e) => setNewDemand({ ...newDemand, ngoName: e.target.value })}
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Portions Needed</label>
                  <Input
                    type="number"
                    min="1"
                    value={newDemand.portionsNeeded}
                    onChange={(e) => setNewDemand({ ...newDemand, portionsNeeded: e.target.value })}
                    className="rounded-xl font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Needed By (Time/Deadline)</label>
                  <Input
                    value={newDemand.deadlineTime}
                    placeholder="e.g. 9:00 PM tonight"
                    onChange={(e) => setNewDemand({ ...newDemand, deadlineTime: e.target.value })}
                    className="rounded-xl font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Food Type / Diet Requirements</label>
                <Input
                  value={newDemand.foodType}
                  placeholder="e.g. Dal, Warm Rice, Roti, or Packaged Groceries"
                  onChange={(e) => setNewDemand({ ...newDemand, foodType: e.target.value })}
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Urgency Level</label>
                  <select
                    value={newDemand.urgency}
                    onChange={(e) =>
                      setNewDemand({
                        ...newDemand,
                        urgency: e.target.value as "critical" | "high" | "normal",
                      })
                    }
                    className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-semibold"
                  >
                    <option value="critical">Critical (Immediate necessity)</option>
                    <option value="high">High (Evening distribution)</option>
                    <option value="normal">Normal (Scheduled need)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Shelter / Drop Location</label>
                  <Input
                    value={newDemand.location}
                    onChange={(e) => setNewDemand({ ...newDemand, location: e.target.value })}
                    className="rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Purpose / Beneficiaries</label>
                <Textarea
                  value={newDemand.purpose}
                  onChange={(e) => setNewDemand({ ...newDemand, purpose: e.target.value })}
                  placeholder="e.g. Homeless evening dinner, child home snacks, hospital patient family meals"
                  className="rounded-xl text-xs"
                  rows={2}
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPostOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold">
                  Publish Broadcast
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Pledge Modal */}
        <Dialog open={!!selectedDemand} onOpenChange={(open) => !open && setSelectedDemand(null)}>
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <IconHeartHandshake size={20} className="text-emerald-500" />
                Pledge Food to {selectedDemand?.ngoName}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Fulfill part or all of their request for <strong>{selectedDemand?.portionsNeeded} portions</strong> of {selectedDemand?.foodType} by <strong>{selectedDemand?.deadlineTime}</strong>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handlePledge} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Your Kitchen / Donor Name</label>
                <Input
                  value={pledgeForm.donorName}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, donorName: e.target.value })}
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Portions You Can Supply</label>
                <Input
                  type="number"
                  min="1"
                  max={selectedDemand ? selectedDemand.portionsNeeded - selectedDemand.portionsPledged : 500}
                  value={pledgeForm.portions}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, portions: e.target.value })}
                  className="rounded-xl font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Preparation & Packaging Note</label>
                <Input
                  value={pledgeForm.note}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, note: e.target.value })}
                  placeholder="e.g. Ready hot in thermal containers, pickup by 8:45 PM"
                  className="rounded-xl"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedDemand(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                  Confirm Food Pledge
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
