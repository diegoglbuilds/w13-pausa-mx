import { calculateConsequence, quickCheckSchema } from "./finance";
import { describe, expect, it } from "vitest";

describe("quick check finance", () => {
  it("validates positive price and bounded integer payment count", () => {
    expect(quickCheckSchema.safeParse({ price: 0, installments: 12, monthlyPayment: "" }).success).toBe(false);
    expect(quickCheckSchema.safeParse({ price: 100, installments: 1.5, monthlyPayment: "" }).success).toBe(false);
  });
  it("calculates consequence without monthly payment and flags unknown fees", () => {
    const result = calculateConsequence({ price: 12000, installments: 12, monthlyPayment: "" });
    expect(result.installment).toBe(1000);
    expect(result.total).toBe(12000);
    expect(result.feeState).toBe("unknown");
  });
  it("updates status only from explicitly entered monthly maximum", () => {
    const input = { price: 12000, installments: 12, monthlyPayment: "" } as const;
    expect(calculateConsequence(input).status).toBe("review");
    expect(calculateConsequence(input, { commitments: 0, essentials: 0, monthlyMaximum: 1500, fees: "none" }).status).toBe("within_limit");
  });
});
