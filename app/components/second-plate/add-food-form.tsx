import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  IconSparkles,
  IconCheck,
  IconClock,
  IconLeaf,
  IconBuildingStore,
  IconShieldCheck,
  IconToolsKitchen2,
  IconBread,
  IconSalad,
  IconCarrot,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CATEGORY_LABELS,
  DEFAULT_LOCATION,
  PROVIDER_TYPE_LABELS,
  SAFETY_CHECKLIST,
  DESTINATION_TIER_META,
  type FoodDestinationTier,
  toLocalInputValue,
  useSecondPlateActions,
} from "@/lib/second-plate";
import { ErrorState, errorMessage } from "./primitives";
import { cn } from "@/lib/utils";

type FormState = {
  providerName: string;
  providerType: string;
  title: string;
  category: string;
  destinationTier: FoodDestinationTier;
  allowAlternativeRouting: boolean;
  isVegetarian: boolean;
  description: string;
  portions: string;
  weightKg: string;
  preparedAt: string;
  collectBy: string;
  storageInfo: string;
  temperatureInfo: string;
  allergens: string;
  pickupAddress: string;
  latitude: string;
  longitude: string;
  contactPhone: string;
};

function initialState(): FormState {
  const now = new Date();
  const collect = new Date(now.getTime() + 4 * 3_600_000);
  return {
    providerName: "Grand Palace Kitchen & Banquet",
    providerType: "restaurant",
    title: "",
    category: "cooked_meal",
    destinationTier: "people",
    allowAlternativeRouting: true,
    isVegetarian: true,
    description: "",
    portions: "40",
    weightKg: "12",
    preparedAt: toLocalInputValue(now),
    collectBy: toLocalInputValue(collect),
    storageInfo: "Sealed food-grade stainless containers",
    temperatureInfo: "Hot-held above 65°C continuously",
    allergens: "Contains dairy (ghee, paneer)",
    pickupAddress: "Janpath Road, Saheed Nagar, Bhubaneswar",
    latitude: String(DEFAULT_LOCATION.latitude),
    longitude: String(DEFAULT_LOCATION.longitude),
    contactPhone: "+91 98765 43210",
  };
}

const PRESETS = [
  {
    label: "🍛 Wedding Banquet Buffet",
    data: {
      providerName: "Royal Heritage Banquet",
      providerType: "event",
      title: "Dum Biryani, Dal Makhani & Roti Batch",
      category: "cooked_meal",
      destinationTier: "people" as FoodDestinationTier,
      allowAlternativeRouting: true,
      isVegetarian: true,
      portions: "60",
      weightKg: "20",
      storageInfo: "Packed directly from serving trays into sealed insulated thermal boxes.",
      temperatureInfo: "Hot-held continuously >65°C.",
      allergens: "Contains dairy (ghee, cream).",
      pickupAddress: "Janpath, Saheed Nagar, Bhubaneswar",
      contactPhone: "+91 98111 22334",
    },
  },
  {
    label: "🐾 Animal Feed & Gaushala",
    data: {
      providerName: "Jaydev Community Bakery & Dairy",
      providerType: "restaurant",
      title: "Unsold Bran Loaves & Wholesome Cooked Grains",
      category: "bakery",
      destinationTier: "animals" as FoodDestinationTier,
      allowAlternativeRouting: true,
      isVegetarian: true,
      portions: "40",
      weightKg: "18",
      storageInfo: "Clean dry bins safe for cattle and animal shelter feeders.",
      temperatureInfo: "Cool ambient dry holding.",
      allergens: "Wheat gluten",
      pickupAddress: "Plot 19, Chandrasekharpur, Bhubaneswar",
      contactPhone: "+91 94371 88990",
    },
  },
  {
    label: "♻️ Compost / Biogas Biomass",
    data: {
      providerName: "Central Kitchen Agro Processing",
      providerType: "canteen",
      title: "Clean Vegetable Trimmings & Kitchen Biomass",
      category: "produce",
      destinationTier: "compost" as FoodDestinationTier,
      allowAlternativeRouting: false,
      isVegetarian: true,
      portions: "50",
      weightKg: "35",
      storageInfo: "Aerated organic collection bins ready for biomethanation digester.",
      temperatureInfo: "Ambient organic collection.",
      allergens: "None",
      pickupAddress: "Industrial Estate, Mancheswar, Bhubaneswar",
      contactPhone: "+91 99380 44556",
    },
  },
  {
    label: "🥐 Evening Artisan Bakery",
    data: {
      providerName: "Artisan Crust Bakeshop",
      providerType: "restaurant",
      title: "Sourdough Loaves, Croissants & Multigrain Breads",
      category: "bakery",
      destinationTier: "people" as FoodDestinationTier,
      allowAlternativeRouting: true,
      isVegetarian: true,
      portions: "35",
      weightKg: "10.5",
      storageInfo: "Individually wrapped in food-grade bakery craft paper bags.",
      temperatureInfo: "Room temperature 22°C dry shelf.",
      allergens: "Contains gluten (wheat).",
      pickupAddress: "Master Canteen Square, Bhubaneswar",
      contactPhone: "+91 94333 55667",
    },
  },
  {
    label: "🥗 Corporate Canteen Lunch",
    data: {
      providerName: "Infocity Tech Hub Cafeteria",
      providerType: "canteen",
      title: "Steamed Rice, Sambhar & Vegetable Poriyal",
      category: "cooked_meal",
      isVegetarian: true,
      portions: "50",
      weightKg: "15",
      storageInfo: "Packed in sanitized food-grade stainless carriers.",
      temperatureInfo: "Cooled rapidly within 90 minutes; refrigerated at 4°C.",
      allergens: "Contains mustard seeds, coconut.",
      pickupAddress: "Infocity Road, Patia, Bhubaneswar",
      contactPhone: "+91 91222 33445",
    },
  },
  {
    label: "🥦 Organic Farm Produce",
    data: {
      providerName: "Odisha Farmers Fresh Collective",
      providerType: "canteen",
      title: "Fresh Tomatoes, Cucumbers & Spinach Greens",
      category: "produce",
      isVegetarian: true,
      portions: "45",
      weightKg: "22",
      storageInfo: "Stored in clean, sanitized, aerated produce crates.",
      temperatureInfo: "Chilled cold storage 6°C.",
      allergens: "None (fresh raw vegetables).",
      pickupAddress: "Nayapalli IRC Village, Bhubaneswar",
      contactPhone: "+91 99888 77665",
    },
  },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-bold text-foreground">
      {label}
      {children}
      {hint ? <span className="text-[11px] font-normal text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

const selectClass =
  "h-10 w-full rounded-xl border border-input bg-card px-3 text-xs font-semibold text-foreground shadow-2xs";

export function AddFoodForm() {
  const navigate = useNavigate();
  const actions = useSecondPlateActions();
  const [isPending, setIsPending] = useState(false);
  const [createError, setCreateError] = useState<unknown>(null);
  const create = {
    isPending,
    error: createError,
    mutate: (params: any, opts?: { onSuccess?: () => void }) => {
      try {
        setIsPending(true);
        actions.createListing({
          ...params,
          portionsTotal: params.portions,
          portionsRemaining: params.portions,
          weightKg: params.weightKg ?? null,
          status: "AVAILABLE",
        });
        setIsPending(false);
        opts?.onSuccess?.();
      } catch (err) {
        setIsPending(false);
        setCreateError(err);
      }
    },
  };
  const [form, setForm] = useState<FormState>(initialState);
  const [checklist, setChecklist] = useState(true);
  const [problem, setProblem] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const applyPreset = (presetData: (typeof PRESETS)[number]["data"]) => {
    const now = new Date();
    const collect = new Date(now.getTime() + 4 * 3_600_000);
    setForm((prev) => ({
      ...prev,
      ...presetData,
      preparedAt: toLocalInputValue(now),
      collectBy: toLocalInputValue(collect),
    }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setProblem(null);

    const portions = Number(form.portions);
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    const preparedMs = Date.parse(form.preparedAt);
    const collectMs = Date.parse(form.collectBy);

    if (!form.title.trim()) return setProblem("Enter the food name.");
    if (!Number.isInteger(portions) || portions < 1) {
      return setProblem("Quantity must be a whole number of meal portions.");
    }
    if (Number.isNaN(preparedMs)) return setProblem("Enter the preparation date and time.");
    if (Number.isNaN(collectMs) || collectMs <= Date.now()) {
      return setProblem("The collection deadline must be in the future.");
    }
    if (collectMs <= preparedMs) {
      return setProblem("The collection deadline must be after the preparation time.");
    }
    if (form.storageInfo.trim().length < 3) return setProblem("Describe how the food is stored.");
    if (form.temperatureInfo.trim().length < 3) return setProblem("Describe the temperature handling.");
    if (form.pickupAddress.trim().length < 5) return setProblem("Enter a pickup address.");
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      return setProblem("Latitude must be between -90 and 90.");
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return setProblem("Longitude must be between -180 and 180.");
    }
    if (form.contactPhone.trim().length < 6) return setProblem("Enter a contact phone number.");
    if (!checklist) return setProblem("Confirm the food safety checklist before publishing.");

    const weight = form.weightKg.trim() ? Number(form.weightKg) : undefined;

    create.mutate(
      {
        providerName: form.providerName.trim(),
        providerType: form.providerType as "restaurant",
        title: form.title.trim(),
        category: form.category as "cooked_meal",
        destinationTier: form.destinationTier,
        allowAlternativeRouting: form.allowAlternativeRouting,
        isVegetarian: form.isVegetarian,
        description: form.description.trim(),
        portions,
        weightKg: weight,
        preparedAt: new Date(preparedMs).toISOString(),
        collectBy: new Date(collectMs).toISOString(),
        storageInfo: form.storageInfo.trim(),
        temperatureInfo: form.temperatureInfo.trim(),
        allergens: form.allergens.trim(),
        pickupAddress: form.pickupAddress.trim(),
        latitude,
        longitude,
        contactPhone: form.contactPhone.trim(),
      },
      { onSuccess: () => navigate("/") },
    );
  };

  const estimatedMeals = Number(form.portions) || 0;
  const estimatedCo2 = Math.round((Number(form.weightKg) || estimatedMeals * 0.35) * 2.5);

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6" noValidate>
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
          Publish Surplus Food
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Declare safe surplus meals with a verified collection deadline for local NGOs & shelters.
        </p>
      </div>

      {/* 1-Click Quick Fill Presets */}
      <section className="rounded-3xl border border-primary/30 bg-primary/5 p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <IconSparkles size={16} className="text-amber-500" />
          <p className="text-xs font-bold text-foreground uppercase tracking-wider">
            1-Click Quick Fill Presets (Instant Fill)
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p.data)}
              className="flex items-center justify-center text-center p-2 rounded-xl border border-primary/20 bg-card text-[11px] font-semibold text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-2xs"
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {/* 3-Tier Surplus Destination Flow */}
      <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="text-lg">🔄</span>
              3-Tier Surplus Redirection Channel
            </h2>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Zero-Landfill Guarantee
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Designate the immediate recipient tier for this surplus based on its freshness and condition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(["people", "animals", "compost"] as FoodDestinationTier[]).map((tierKey) => {
            const meta = DESTINATION_TIER_META[tierKey];
            const isSelected = form.destinationTier === tierKey;
            return (
              <button
                key={tierKey}
                type="button"
                onClick={() => set("destinationTier", tierKey)}
                className={cn(
                  "flex flex-col text-left p-3.5 rounded-2xl border transition-all text-xs relative",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20"
                    : "border-border/70 bg-card/60 hover:bg-accent/50",
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{meta.icon}</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      meta.bgTone,
                      meta.textTone,
                    )}
                  >
                    Tier {meta.tier}
                  </span>
                </div>
                <p className="font-bold text-foreground">{meta.shortTitle}</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                  {meta.sublabel}
                </p>
              </button>
            );
          })}
        </div>

        {/* Circular Auto-Fallback Checkbox */}
        <label className="flex items-start gap-3 rounded-2xl border border-dashed border-teal-500/40 bg-teal-500/5 p-3.5 cursor-pointer hover:bg-teal-500/10 transition-colors">
          <input
            type="checkbox"
            checked={form.allowAlternativeRouting}
            onChange={(e) => set("allowAlternativeRouting", e.target.checked)}
            className="mt-0.5 size-4 rounded text-primary focus:ring-primary"
          />
          <div className="text-xs">
            <p className="font-bold text-teal-800 dark:text-teal-200 flex items-center gap-1.5">
              <span>⇄</span> Enable Circular Cascade (If unclaimed by NGO)
            </p>
            <p className="text-muted-foreground text-[11px] mt-0.5 leading-relaxed">
              If safe surplus is not accepted by a nearby NGO 1 hour before the cutoff, automatically broadcast to local animal shelters (Tier 2) or composting/biogas units (Tier 3) so zero food is lost.
            </p>
          </div>
        </label>
      </section>

      {/* Food Details */}
      <section className="grid gap-4 rounded-3xl border border-border/80 bg-card p-6 shadow-xs md:grid-cols-2">
        <h2 className="text-base font-bold text-foreground md:col-span-2 flex items-center gap-2">
          <IconToolsKitchen2 size={18} className="text-primary" />
          Food Item & Organization
        </h2>

        <Field label="Provider / Kitchen Name">
          <Input
            value={form.providerName}
            onChange={(e) => set("providerName", e.target.value)}
            className="h-10 rounded-xl"
          />
        </Field>

        <Field label="Provider Category">
          <select
            className={selectClass}
            value={form.providerType}
            onChange={(e) => set("providerType", e.target.value)}
          >
            {Object.entries(PROVIDER_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Food Name / Title">
          <Input
            value={form.title}
            placeholder="e.g. Dal Makhani, Paneer Butter Masala & Rice"
            onChange={(e) => set("title", e.target.value)}
            className="h-10 rounded-xl"
          />
        </Field>

        <Field label="Food Category">
          <select
            className={selectClass}
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Quantity (Portions)">
          <Input
            type="number"
            min={1}
            value={form.portions}
            onChange={(e) => set("portions", e.target.value)}
            className="h-10 rounded-xl font-bold"
          />
        </Field>

        <Field label="Approx. Weight (kg)">
          <Input
            type="number"
            min={0}
            step="0.5"
            value={form.weightKg}
            onChange={(e) => set("weightKg", e.target.value)}
            className="h-10 rounded-xl"
          />
        </Field>

        <label className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-secondary/30 p-3 md:col-span-2 cursor-pointer">
          <input
            type="checkbox"
            className="size-4 accent-[hsl(var(--primary))]"
            checked={form.isVegetarian}
            onChange={(e) => set("isVegetarian", e.target.checked)}
          />
          <span className="text-xs font-bold text-foreground">
            🌱 Pure Vegetarian Food
          </span>
        </label>

        <Field label="Description & Notes (Optional)" hint="Preparation details, containers used">
          <div className="md:col-span-2">
            <Textarea
              rows={2}
              value={form.description}
              placeholder="e.g. Fresh surplus from buffet dinner. Packed in sanitized containers."
              onChange={(e) => set("description", e.target.value)}
              className="rounded-xl"
            />
          </div>
        </Field>
      </section>

      {/* Timings & Food Safety */}
      <section className="grid gap-4 rounded-3xl border border-border/80 bg-card p-6 shadow-xs md:grid-cols-2">
        <h2 className="text-base font-bold text-foreground md:col-span-2 flex items-center gap-2">
          <IconClock size={18} className="text-primary" />
          Safety Timings & Handling
        </h2>

        <Field label="Prepared At (Time of Cooking)">
          <Input
            type="datetime-local"
            value={form.preparedAt}
            onChange={(e) => set("preparedAt", e.target.value)}
            className="h-10 rounded-xl"
          />
        </Field>

        <Field label="Safe Collection Deadline" hint="Listing closes after this cutoff">
          <Input
            type="datetime-local"
            value={form.collectBy}
            onChange={(e) => set("collectBy", e.target.value)}
            className="h-10 rounded-xl font-bold text-primary"
          />
        </Field>

        <Field label="Storage Method">
          <Input
            value={form.storageInfo}
            placeholder="e.g. Insulated thermal containers"
            onChange={(e) => set("storageInfo", e.target.value)}
            className="h-10 rounded-xl"
          />
        </Field>

        <Field label="Temperature Maintained">
          <Input
            value={form.temperatureInfo}
            placeholder="e.g. Hot-held above 65°C"
            onChange={(e) => set("temperatureInfo", e.target.value)}
            className="h-10 rounded-xl"
          />
        </Field>

        <Field label="Allergens Declared" hint="List nuts, dairy, gluten, or soy">
          <div className="md:col-span-2">
            <Input
              value={form.allergens}
              placeholder="e.g. Contains dairy (ghee), nuts"
              onChange={(e) => set("allergens", e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>
        </Field>
      </section>

      {/* Pickup Details */}
      <section className="grid gap-4 rounded-3xl border border-border/80 bg-card p-6 shadow-xs md:grid-cols-2">
        <h2 className="text-base font-bold text-foreground md:col-span-2 flex items-center gap-2">
          <IconBuildingStore size={18} className="text-primary" />
          Pickup Location & Contact
        </h2>

        <Field label="Pickup Address">
          <Input
            value={form.pickupAddress}
            placeholder="Street address or landmark"
            onChange={(e) => set("pickupAddress", e.target.value)}
            className="h-10 rounded-xl"
          />
        </Field>

        <Field label="Contact Phone for Driver">
          <Input
            type="tel"
            value={form.contactPhone}
            placeholder="+91 Phone number"
            onChange={(e) => set("contactPhone", e.target.value)}
            className="h-10 rounded-xl"
          />
        </Field>
      </section>

      {/* Live Estimated Environmental Impact */}
      <section className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <IconLeaf size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-foreground">Estimated Environmental Savings</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            By rescuing this food instead of disposing, you prevent landfill methane emissions.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
              ~{estimatedMeals}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Meals Shared</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
              ~{estimatedCo2} kg
            </p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">CO₂ Offset</p>
          </div>
        </div>
      </section>

      {/* Safety Declaration */}
      <section className="space-y-3 rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <IconShieldCheck size={18} className="text-primary" />
          FSSAI Safety Compliance Checklist
        </h2>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          {SAFETY_CHECKLIST.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="text-primary font-bold">✓</span> {item}
            </li>
          ))}
        </ul>
        <label className="flex items-center gap-2.5 rounded-xl bg-primary/10 p-3 text-xs font-bold text-foreground cursor-pointer">
          <input
            type="checkbox"
            className="size-4 accent-[hsl(var(--primary))]"
            checked={checklist}
            onChange={(e) => setChecklist(e.target.checked)}
          />
          <span>I certify that this food complies with safety and temperature standards</span>
        </label>
      </section>

      {problem ? <ErrorState message={problem} /> : null}
      {create.error ? <ErrorState message={errorMessage(create.error)} /> : null}

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-full px-6 font-bold"
          onClick={() => navigate("/")}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="rounded-full px-8 font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
          disabled={create.isPending}
        >
          {create.isPending ? "Publishing..." : "Publish Food Listing"}
        </Button>
      </div>
    </form>
  );
}
