import { runAuthGuard } from "@agent-native/core/server";
import { defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  const path = event.path || "";
  // In demo zero-database mode, do not block actions or public views with 401 Unauthorized
  if (
    path.startsWith("/_agent-native/actions/") ||
    path === "/" ||
    path.startsWith("/impact") ||
    path.startsWith("/map") ||
    path.startsWith("/provider") ||
    path.startsWith("/ngo") ||
    path.startsWith("/volunteer")
  ) {
    return;
  }
  return runAuthGuard(event);
});
