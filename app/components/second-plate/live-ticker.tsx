import { useState } from "react";
import { useActionMutation } from "@agent-native/core/client/hooks";
import {
  IconFlame,
  IconSparkles,
  IconRefresh,
  IconBolt,
  IconCheck,
} from "@tabler/icons-react";

export function LiveTicker() {
  const seed = useActionMutation("seed-demo-data");
  const [seededNotice, setSeededNotice] = useState(false);

  const handleSeed = () => {
    seed.mutate(
      { mode: "append" },
      {
        onSuccess: () => {
          setSeededNotice(true);
          setTimeout(() => setSeededNotice(false), 4000);
        },
      },
    );
  };

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2.5 backdrop-blur-xs">
      <div className="flex items-center gap-2.5 overflow-hidden text-xs">
        <span className="flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 font-semibold text-primary">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          LIVE NETWORK
        </span>
        <div className="hidden sm:flex items-center gap-4 text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <IconFlame size={14} className="text-amber-500" />
            <strong className="font-semibold text-foreground">Zero Waste:</strong> Safe surplus dispatched under 2h
          </span>
          <span className="text-border">|</span>
          <span className="inline-flex items-center gap-1">
            <IconBolt size={14} className="text-emerald-500" />
            FSSAI compliant handling declaration active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {seededNotice ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <IconCheck size={15} /> Added 4 Fresh Listings & Tasks!
          </span>
        ) : (
          <button
            type="button"
            disabled={seed.isPending}
            onClick={handleSeed}
            title="Populate fresh demo listings, pickups, and completed rescues"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-card px-3 py-1 text-xs font-medium text-primary shadow-2xs transition-all hover:bg-primary hover:text-primary-foreground hover:scale-102 active:scale-98 disabled:opacity-50"
          >
            {seed.isPending ? (
              <IconRefresh size={13} className="animate-spin" />
            ) : (
              <IconSparkles size={13} className="text-amber-500" />
            )}
            <span>{seed.isPending ? "Seeding..." : "✨ Load Fresh Demo Data"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
