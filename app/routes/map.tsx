import { AppShell } from "@/components/second-plate/app-shell";
import { MapView } from "@/components/second-plate/map-view";

export function meta() {
  return [{ title: "Map · SECOND PLATE" }];
}

export default function MapRoute() {
  return (
    <AppShell>
      <MapView />
    </AppShell>
  );
}
