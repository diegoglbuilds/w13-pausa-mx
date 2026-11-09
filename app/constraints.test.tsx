import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./page";
import { aggregateEvents, logEvent, readEvents } from "@/lib/analytics";
import { calculateConsequence } from "@/lib/finance";

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

describe("buyer control and privacy constraints", () => {
  it("keeps deterministic math separate from AI or network services", () => {
    expect(calculateConsequence({ price: 2400, installments: 12, monthlyPayment: "" }).installment).toBe(200);
    render(<Home />);
    expect(screen.queryByText(/AI calcula|inteligencia artificial/)).not.toBeInTheDocument();
  });
  it("does not make purchase, retailer, or lender recommendations", () => {
    render(<Home />);
    expect(screen.queryByText(/compra recomendado|tienda recomendada|prestamista recomendado/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/capacidad de pago para terceros/i)).not.toBeInTheDocument();
  });
  it("always leaves buyer control and continuation available", () => {
    render(<Home />);
    fireEvent.change(screen.getByLabelText("Precio de compra"), { target: { value: "1200" } });
    fireEvent.click(screen.getByRole("button", { name: /Ver consecuencia/ }));
    fireEvent.click(screen.getByRole("button", { name: /Esto me basta/ }));
    expect(screen.getByText(/Pausa MX no bloquea tu compra/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Continuar de todos modos/ }));
    expect(screen.getByText(/no procesamos ni bloqueamos tu compra/)).toBeInTheDocument();
    expect(readEvents().some(event => event.eventName === "continue_anyway")).toBe(true);
  });
  it("keeps personal purchase inputs outside analytics and clears analytics only", () => {
    render(<Home />);
    fireEvent.change(screen.getByLabelText("Precio de compra"), { target: { value: "8765" } });
    fireEvent.click(screen.getByRole("button", { name: /Anal.tica de demostraci.n/ }));
    fireEvent.click(screen.getByRole("button", { name: /Borrar anal.tica local/ }));
    expect(screen.getByLabelText("Precio de compra")).toHaveValue(8765);
    expect(readEvents()).toHaveLength(0);
  });
  it("continues when storage reads and writes throw", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    render(<Home />);
    fireEvent.change(screen.getByLabelText("Precio de compra"), { target: { value: "1000" } });
    fireEvent.click(screen.getByRole("button", { name: /Ver consecuencia/ }));
    expect(screen.getByRole("heading", { name: "La primera consecuencia" })).toBeInTheDocument();
    vi.restoreAllMocks();
  });
  it("does not preserve malformed records with extra financial fields", () => {
    localStorage.setItem("pausa-mx.analytics.v1", JSON.stringify([{ eventName: "quick_check_started", timestamp: new Date().toISOString(), sessionId: "local-test-id", screen: "quick_check", price: 123 }]));
    expect(readEvents()).toEqual([]);
    logEvent("quick_check_completed", "result");
    expect(localStorage.getItem("pausa-mx.analytics.v1")).not.toContain("price");
  });
  it("aggregates sessions, completions, context rate inputs, continuations and feedback", () => {
    logEvent("quick_check_started", "quick_check");
    logEvent("quick_check_completed", "consequence");
    logEvent("context_opened", "context");
    logEvent("continue_anyway", "result");
    logEvent("feedback_helpful_yes", "feedback", { category: "yes" });
    expect(aggregateEvents()).toMatchObject({ sessions: 1, completions: 1, contextOpens: 1, continueAnyway: 1, feedback: { yes: 1, maybe: 0, no: 0 } });
  });
});
