import { contextSchema, type PurchaseContext } from "./finance";

export function parseContext(raw: unknown): PurchaseContext | null {
  const result = contextSchema.safeParse(raw);
  return result.success ? result.data : null;
}
