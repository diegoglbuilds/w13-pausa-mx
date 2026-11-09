import { calculateConsequence, feedbackSchema, quickCheckSchema } from "./finance";
import { describe, expect, it } from "vitest";

describe("quick check finance", () => {
  it("validates positive price and bounded integer payment count", () => {
    expect(quickCheckSchema.safeParse({ price: 0, installments: 12, monthlyPayment: "" }).success).toBe(false);
    expect(quickCheckSchema.safeParse({ price: 100, installments: 1.5, monthlyPayment: "" }).success).toBe(false);
  });
  it("calculates the consequence if payment is unknown and keeps fee state unknown", () => {
    const result = calculateConsequence({ price: 12000, installments: 12, monthlyPayment: "" });
    expect(result.installment).toBe(1000);
    expect(result.total).toBe(12000);
    expect(result.feeState).toBe("unknown");
  });
  it("uses entered obligations and expenses with a user-set maximum", () => {
    const input = { price: 12000, installments: 12, monthlyPayment: "" } as const;
    expect(calculateConsequence(input).status).toBe("review");
    expect(calculateConsequence(input, { commitments: 0, essentials: 0, monthlyMaximum: 1500, fees: "none" }).status).toBe("within_limit");
    expect(calculateConsequence(input, { commitments: 0, essentials: 0, monthlyMaximum: 1500, fees: "unknown" }).status).toBe("review");
    expect(calculateConsequence(input, { commitments: 0, essentials: 0, monthlyMaximum: 1500, fees: "known" }).missingInput).toContain("monto quedó fuera del cálculo");
    expect(calculateConsequence(input, { commitments: 0, essentials: 700, monthlyMaximum: 1500, fees: "none" }).status).toBe("review");
  });
});

describe("bounded feedback", () => {
  it("accepts a short category and rejects overlong comments", () => {
    expect(feedbackSchema.safeParse({ helpfulness: "yes", comment: "ok" }).success).toBe(true);
    expect(feedbackSchema.safeParse({ helpfulness: "no", comment: "x".repeat(281) }).success).toBe(false);
  });
});