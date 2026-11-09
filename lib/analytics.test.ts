import { aggregateEvents, logEvent, readEvents } from "./analytics";
import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => { localStorage.clear(); });
describe("local analytics", () => {
  it("accepts known events with timestamp and anonymous local session", () => {
    expect(logEvent("quick_check_started", "quick_check")).toBe(true);
    const [event] = readEvents();
    expect(event.timestamp).toBeTruthy();
    expect(event.sessionId).toMatch(/^[a-z0-9-]{8,64}$/i);
  });
  it("rejects unknown names and financial metadata", () => {
    expect(logEvent("unknown", "quick_check")).toBe(false);
    expect(logEvent("quick_check_started", "quick_check", { category: "yes", price: 2 } as never)).toBe(false);
    expect(readEvents()).toHaveLength(0);
  });
  it("ignores malformed stored values and aggregates allowed events", () => {
    localStorage.setItem("pausa-mx.analytics.v1", "broken");
    expect(readEvents()).toEqual([]);
    logEvent("quick_check_started", "quick_check");
    logEvent("quick_check_completed", "result");
    expect(aggregateEvents().completions).toBe(1);
  });
  it("fails gracefully when localStorage throws", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("disabled"); });
    const writeSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("disabled"); });
    expect(readEvents()).toEqual([]);
    expect(logEvent("quick_check_started", "quick_check")).toBe(false);
    spy.mockRestore();
    writeSpy.mockRestore();
  });
});
