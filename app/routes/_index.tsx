import { useSearchParams } from "react-router";

import { AppShell } from "@/components/second-plate/app-shell";
import { NgoView } from "@/components/second-plate/ngo-view";
import { ProviderView } from "@/components/second-plate/provider-view";
import { VolunteerView } from "@/components/second-plate/volunteer-view";
import { useDemoRole, type Role } from "@/lib/second-plate";

export function meta() {
  return [
    { title: "SECOND PLATE · Rescue Food. Share Hope." },
    {
      name: "description",
      content: "Redistribute safe surplus food before its collection deadline.",
    },
  ];
}

export default function HomeRoute() {
  const [rawRole] = useDemoRole();
  const role: Role = rawRole === "ngo" || rawRole === "volunteer" ? rawRole : "provider";
  const [params] = useSearchParams();
  const tab = params.get("tab") ?? "";

  return (
    <AppShell>
      {role === "ngo" ? (
        <NgoView tab={tab} />
      ) : role === "volunteer" ? (
        <VolunteerView tab={tab} />
      ) : (
        <ProviderView tab={tab} />
      )}
    </AppShell>
  );
}
