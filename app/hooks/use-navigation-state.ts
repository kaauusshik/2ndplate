import {
  appBasePath,
  appPathFromLocalRoute,
} from "@agent-native/core/client/api-path";
import { useAgentRouteState } from "@agent-native/core/client/navigation";

import { TAB_ID } from "@/lib/tab-id";

export interface NavigationState {
  view?: string;
  path?: string;
  publicPath?: string;
  threadId?: string;
}

export function useNavigationState() {
  useAgentRouteState<NavigationState>({
    browserTabId: TAB_ID,
    requestSource: TAB_ID,
    getNavigationState: ({ pathname }) => ({
      view: viewForPath(pathname),
      path: pathname,
      publicPath: appPathFromLocalRoute(pathname),
    }),
    getCommandPath: commandPathForNavigation,
  });
}

export function pathForCommand(command: { view?: string; threadId?: string }): string {
  if (command.view === "home") return "/home";
  if (command.view === "chat" || command.view === "ask") {
    return command.threadId ? `/chat/${command.threadId}` : "/chat";
  }
  return "/";
}

export function navigationStateForPath(path: string): NavigationState & { threadId?: string } {
  const isChat = path.startsWith("/chat/");
  const threadId = isChat ? path.slice("/chat/".length) : undefined;
  return {
    view: isChat ? "chat" : "home",
    path,
    publicPath: appPathFromLocalRoute(path),
    ...(threadId ? { threadId } : {}),
  };
}

export function commandPathForNavigation(command: NavigationState): string {
  if (command?.view === "chat" && command.threadId && !command.path) {
    return `/chat/${command.threadId}`;
  }
  const fallbackPath = pathForView(command?.view);
  const path = typeof command?.path === "string" ? command.path : "";
  if (!path) return fallbackPath;

  const basePath = appBasePath();
  if (!basePath) return path;

  const suffixIndex = path.search(/[?#]/);
  const pathname = suffixIndex === -1 ? path : path.slice(0, suffixIndex);
  const suffix = suffixIndex === -1 ? "" : path.slice(suffixIndex);

  // If path is duplicated under base like "/chat/chat/thread-one" or "/chat/settings/app"
  if (pathname.startsWith(`${basePath}/chat/`) || pathname.startsWith(`${basePath}/settings/`)) {
    return `${pathname.slice(basePath.length)}${suffix}`;
  }

  const publicPath =
    typeof command?.publicPath === "string" ? command.publicPath : "";
  const publicPathSuffixIndex = publicPath.search(/[?#]/);
  const declaredPublicPath =
    publicPathSuffixIndex === -1
      ? publicPath
      : publicPath.slice(0, publicPathSuffixIndex);
  const publicViewPath = appPathFromLocalRoute(pathForView(command?.view));
  if (
    matchesPathPrefix(pathname, basePath) &&
    (matchesPathPrefix(pathname, publicViewPath) ||
      (declaredPublicPath && declaredPublicPath === pathname))
  ) {
    return `${pathname.slice(basePath.length) || "/"}${suffix}`;
  }
  return path;
}

function matchesPathPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function viewForPath(pathname: string): string {
  if (pathname === "/") return "home";
  return "home";
}

function pathForView(view?: string): string {
  switch (view) {
    case "home":
      return "/";
    default:
      return "/";
  }
}
