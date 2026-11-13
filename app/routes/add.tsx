import { AddFoodForm } from "@/components/second-plate/add-food-form";
import { AppShell, RoleGate } from "@/components/second-plate/app-shell";

export function meta() {
  return [{ title: "Add surplus food · SECOND PLATE" }];
}

export default function AddRoute() {
  return (
    <AppShell>
      <RoleGate allowed="provider">
        <AddFoodForm />
      </RoleGate>
    </AppShell>
  );
}
