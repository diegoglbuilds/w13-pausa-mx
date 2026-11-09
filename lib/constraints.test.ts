import { logEvent, readEvents } from "./analytics";
import { feedbackSchema } from "./finance";
import { beforeEach, describe, expect, it } from "vitest";

beforeEach(() => localStorage.clear());
describe("event and feedback boundaries", () => {
  it.each([["yes", "feedback_helpful_yes"], ["maybe", "feedback_helpful_maybe"], ["no", "feedback_helpful_no"]] as const)("records %s as its category event", (category, eventName) => {
    expect(logEvent(eventName, "feedback", { category })).toBe(true);
    expect(readEvents()[0].eventName).toBe(eventName);
  });
  it("accepts 280 character feedback and rejects longer comments", () => {
    expect(feedbackSchema.safeParse({ helpfulness: "yes", comment: "x".repeat(280) }).success).toBe(true);
    expect(feedbackSchema.safeParse({ helpfulness: "yes", comment: "x".repeat(281) }).success).toBe(false);
  });
});
