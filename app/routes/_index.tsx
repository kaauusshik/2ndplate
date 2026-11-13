import { useSearchParams } from "react-router";

import { AppShell } from "@/components/second-plate/app-shell";
import { NgoView } from "@/components/second-plate/ngo-view";
import { ProviderView } from "@/components/second-plate/provider-view";
import { VolunteerView } from "@/components/second-plate/volunteer-view";
import { useDemoRole } from "@/lib/second-plate";

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
  const [role] = useDemoRole();
  const [params] = useSearchParams();
  const tab = params.get("tab") ?? "";

  return (
    <AppShell>
      {role === "provider" ? <ProviderView tab={tab} /> : null}
      {role === "ngo" ? <NgoView tab={tab} /> : null}
      {role === "volunteer" ? <VolunteerView tab={tab} /> : null}
    </AppShell>
  );
}
