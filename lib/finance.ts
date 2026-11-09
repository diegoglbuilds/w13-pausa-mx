import { z } from "zod";

export const quickCheckSchema = z.object({
  price: z.coerce.number().finite().min(1, "Ingresa un precio mayor a $0.").max(10_000_000, "El precio supera el límite de esta demo."),
  installments: z.coerce.number().int().min(1, "El número de pagos debe ser al menos 1.").max(120, "El máximo para esta demo es 120 pagos."),
  monthlyPayment: z.union([z.literal(""), z.coerce.number().finite().min(0.01).max(10_000_000)]).optional(),
});

export const contextSchema = z.object({
  commitments: z.coerce.number().finite().min(0).max(10_000_000),
  essentials: z.coerce.number().finite().min(0).max(10_000_000),
  monthlyMaximum: z.union([z.literal(""), z.coerce.number().finite().min(0).max(10_000_000)]).optional(),
  fees: z.enum(["unknown", "none", "known"]),
});

export type QuickCheckInput = z.infer<typeof quickCheckSchema>;
export type PurchaseContext = z.infer<typeof contextSchema>;
export type ResultStatus = "within_limit" | "review" | "wait";

export function calculateConsequence(input: QuickCheckInput, context?: PurchaseContext) {
  const installment = input.monthlyPayment === "" || input.monthlyPayment == null
    ? input.price / input.installments
    : Number(input.monthlyPayment);
  const total = installment * input.installments;
  const maximum = context?.monthlyMaximum === "" ? undefined : Number(context?.monthlyMaximum);
  let status: ResultStatus = "review";
  if (maximum !== undefined && Number.isFinite(maximum)) {
    const totalMonthly = installment + Number(context?.commitments ?? 0);
    status = totalMonthly <= maximum ? "within_limit" : totalMonthly > maximum * 1.2 ? "wait" : "review";
  }
  return {
    installment: roundMoney(installment), total: roundMoney(total), status,
    monthlyWithCommitments: roundMoney(installment + Number(context?.commitments ?? 0)),
    feeState: context?.fees ?? "unknown" as const,
    missingInput: context ? (context.fees === "unknown" ? "Las comisiones siguen sin confirmarse." : "No conocemos todos tus pagos u obligaciones.") : "No conocemos comisiones ni otros pagos mensuales.",
  };
}
function roundMoney(value: number) { return Math.round((value + Number.EPSILON) * 100) / 100; }
