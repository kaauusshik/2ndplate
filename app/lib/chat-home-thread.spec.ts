// @vitest-environment happy-dom

import { isClientDraftThread } from "@agent-native/toolkit/app/chat/agentkit-chat/rail";
import { beforeEach, describe, expect, it } from "vitest";

import {
  clearChatHomeThreadId,
  consumeChatHomeThreadId,
  getChatHomeThreadId,
} from "./chat-home-thread";

describe("chat home handoff thread", () => {
  beforeEach(() => {
    const createStorage = () => {
      let store: Record<string, string> = {};
      return {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => {
          store[k] = String(v);
        },
        removeItem: (k: string) => {
          delete store[k];
        },
        clear: () => {
          store = {};
        },
      } as Storage;
    };

    Object.defineProperty(window, "localStorage", {
      value: createStorage(),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "sessionStorage", {
      value: createStorage(),
      writable: true,
      configurable: true,
    });

    clearChatHomeThreadId();
  });

  it("reuses a pending id while the home route is being handed off", () => {
    const first = getChatHomeThreadId();

    expect(first).toMatch(/^chat-/);
    expect(getChatHomeThreadId()).toBe(first);
  });

  it("allows the durable route to release the id for the next new chat", () => {
    const first = getChatHomeThreadId();

    clearChatHomeThreadId();

    expect(getChatHomeThreadId()).not.toBe(first);
  });

  it("consumes only a matching pending home handoff", () => {
    const pending = getChatHomeThreadId();

    expect(consumeChatHomeThreadId(pending)).toBe(true);
    expect(consumeChatHomeThreadId(pending)).toBe(false);
  });

  it("does not attribute a different routed thread to the pending handoff", () => {
    getChatHomeThreadId();

    expect(consumeChatHomeThreadId("chat-other")).toBe(false);
  });

  it("marks an issued id as a client draft until the server lists it", () => {
    const pending = getChatHomeThreadId();

    expect(consumeChatHomeThreadId(pending)).toBe(true);
    expect(isClientDraftThread(pending)).toBe(true);
    expect(isClientDraftThread("chat-other")).toBe(false);
  });
});
