import { AppShell } from "@/components/second-plate/app-shell";
import { ProfileView } from "@/components/second-plate/profile-view";

export function meta() {
  return [{ title: "Profile · SECOND PLATE" }];
}

export default function ProfileRoute() {
  return (
    <AppShell>
      <ProfileView />
    </AppShell>
  );
}
