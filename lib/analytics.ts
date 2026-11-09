export const EVENT_NAMES = [
  "quick_check_started", "quick_check_completed", "context_opened", "result_viewed", "continue_anyway",
  "feedback_helpful_yes", "feedback_helpful_maybe", "feedback_helpful_no", "feedback_submitted",
] as const;
export type EventName = typeof EVENT_NAMES[number];
export type Screen = "quick_check" | "consequence" | "context" | "result" | "feedback";
export type LocalEvent = { eventName: EventName; timestamp: string; sessionId: string; screen: Screen; metadata?: { category?: "yes" | "maybe" | "no" } };
const STORAGE_KEY = "pausa-mx.analytics.v1";
const SESSION_KEY = "pausa-mx.session.v1";
const allowedScreens: Screen[] = ["quick_check", "consequence", "context", "result", "feedback"];

function storage() { try { return typeof window === "undefined" ? null : window.localStorage; } catch { return null; } }
function validSession(value: unknown): value is string { return typeof value === "string" && /^[a-z0-9-]{8,64}$/i.test(value); }
export function getSessionId(): string {
  const target = storage();
  try {
    const existing = target?.getItem(SESSION_KEY);
    if (validSession(existing)) return existing;
  } catch { /* use an ephemeral id */ }
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `local-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  try { target?.setItem(SESSION_KEY, id); } catch { /* app remains usable */ }
  return id;
}
export function readEvents(): LocalEvent[] {
  try {
    const parsed: unknown = JSON.parse(storage()?.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is LocalEvent => Boolean(item && typeof item === "object" && EVENT_NAMES.includes(item.eventName) && typeof item.timestamp === "string" && validSession(item.sessionId) && allowedScreens.includes(item.screen)));
  } catch { return []; }
}
export function logEvent(eventName: string, screen: Screen, metadata?: LocalEvent["metadata"]): boolean {
  if (!(EVENT_NAMES as readonly string[]).includes(eventName) || !allowedScreens.includes(screen)) return false;
  if (metadata && (Object.keys(metadata).some(key => key !== "category") || !["yes", "maybe", "no"].includes(String(metadata.category)))) return false;
  const event: LocalEvent = { eventName: eventName as EventName, timestamp: new Date().toISOString(), sessionId: getSessionId(), screen, ...(metadata ? { metadata } : {}) };
  try {
    const target = storage();
    if (!target) return false;
    const current = readEvents();
    target.setItem(STORAGE_KEY, JSON.stringify([...current, event].slice(-500)));
    return true;
  } catch { return false; }
}
export function clearEvents() { try { storage()?.removeItem(STORAGE_KEY); } catch { /* best effort */ } }
export function aggregateEvents(events = readEvents()) {
  const sessions = new Set(events.map(event => event.sessionId));
  const count = (name: EventName) => events.filter(event => event.eventName === name).length;
  return { sessions: sessions.size, completions: count("quick_check_completed"), contextOpens: count("context_opened"), continueAnyway: count("continue_anyway"), feedback: { yes: count("feedback_helpful_yes"), maybe: count("feedback_helpful_maybe"), no: count("feedback_helpful_no") } };
}
