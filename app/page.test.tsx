import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Home from "./page";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());
describe("Pausa MX decision flow", () => {
  it("shows minimum-input quick check and bank independence", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: "Hagamos un cálculo rápido" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ver consecuencia/ })).toBeInTheDocument();
    expect(screen.getByText(/No conectamos tu banco/)).toBeInTheDocument();
  });
  it("validates price and installment count", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /Ver consecuencia/ }));
    expect(screen.getByRole("alert")).toHaveTextContent("precio mayor a $0");
    fireEvent.change(screen.getByLabelText("Precio de compra"), { target: { value: "12000" } });
    fireEvent.change(screen.getByLabelText("Número de pagos"), { target: { value: "121" } });
    fireEvent.click(screen.getByRole("button", { name: /Ver consecuencia/ }));
    expect(screen.getByRole("alert")).toHaveTextContent("máximo para esta demo es 120");
  });
  it("shows first consequence before context and keeps unknown fees visible", () => {
    render(<Home />);
    fireEvent.change(screen.getByLabelText("Precio de compra"), { target: { value: "12000" } });
    fireEvent.change(screen.getByLabelText("Número de pagos"), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: /Ver consecuencia/ }));
    expect(screen.getAllByText("$1,000.00").length).toBeGreaterThan(0);
    expect(screen.getByText(/No conocemos comisiones/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Gastos esenciales")).not.toBeInTheDocument();
    const events = JSON.parse(localStorage.getItem("pausa-mx.analytics.v1")!);
    expect(events.filter((e: {eventName:string}) => e.eventName === "result_viewed")).toHaveLength(0);
  });
  it("logs result_viewed once, only when the result screen is reached", () => {
    render(<Home />);
    fireEvent.change(screen.getByLabelText("Precio de compra"), { target: { value: "12000" } });
    fireEvent.click(screen.getByRole("button", { name: /Ver consecuencia/ }));
    expect(JSON.parse(localStorage.getItem("pausa-mx.analytics.v1")!).filter((e: {eventName:string}) => e.eventName === "result_viewed")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: /Esto me basta/ }));
    expect(JSON.parse(localStorage.getItem("pausa-mx.analytics.v1")!).filter((e: {eventName:string}) => e.eventName === "result_viewed")).toHaveLength(1);
  });
  it("logs opening optional context and can skip it", () => {
    render(<Home />);
    fireEvent.change(screen.getByLabelText("Precio de compra"), { target: { value: "12000" } });
    fireEvent.click(screen.getByRole("button", { name: /Ver consecuencia/ }));
    fireEvent.click(screen.getByRole("button", { name: /Agregar contexto/ }));
    expect(JSON.parse(localStorage.getItem("pausa-mx.analytics.v1")!).map((e: {eventName:string}) => e.eventName)).toContain("context_opened");
    fireEvent.click(screen.getByRole("button", { name: /Omitir contexto/ }));
    expect(screen.getByRole("heading", { name: "Tu compra, en perspectiva" })).toBeInTheDocument();
  });
  it("updates result from user-set monthly maximum and always allows continue", () => {
    render(<Home />);
    fireEvent.change(screen.getByLabelText("Precio de compra"), { target: { value: "12000" } });
    fireEvent.change(screen.getByLabelText("Número de pagos"), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: /Ver consecuencia/ }));
    fireEvent.click(screen.getByRole("button", { name: /Agregar contexto/ }));
    fireEvent.change(screen.getByLabelText(/m.ximo mensual/), { target: { value: "1500" } });
    fireEvent.change(screen.getByLabelText("Comisiones"), { target: { value: "none" } });
    fireEvent.click(screen.getByRole("button", { name: /Revisar resultado/ }));
    expect(screen.getByRole("heading", { name: /Dentro de tu l.mite/ })).toBeInTheDocument();
    expect(screen.getByText(/T. decides. Pausa MX no bloquea tu compra./)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continuar de todos modos/ })).toBeInTheDocument();
  });
  it("logs categorized optional feedback and exposes demo analytics", () => {
    render(<Home />);
    fireEvent.change(screen.getByLabelText("Precio de compra"), { target: { value: "12000" } });
    fireEvent.click(screen.getByRole("button", { name: /Ver consecuencia/ }));
    fireEvent.click(screen.getByRole("button", { name: /Esto me basta/ }));
    fireEvent.click(screen.getByRole("button", { name: "Más o menos" }));
    fireEvent.change(screen.getByLabelText("¿Qué faltó?"), { target: { value: "Faltó claridad" } });
    fireEvent.click(screen.getByRole("button", { name: /Enviar comentario opcional/ }));
    const events = JSON.parse(localStorage.getItem("pausa-mx.analytics.v1")!);
    expect(events.map((e: {eventName:string}) => e.eventName)).toEqual(expect.arrayContaining(["quick_check_started", "quick_check_completed", "result_viewed", "feedback_helpful_maybe", "feedback_submitted"]));
    expect(JSON.stringify(events)).not.toContain("Faltó claridad");
    fireEvent.click(screen.getByRole("button", { name: /Analítica de demostración/ }));
    expect(screen.getByText(/Not production behavioral tracking/)).toBeInTheDocument();
  });
  it("allows skipping feedback and keeps recommendation independent", () => {
    render(<Home />);
    fireEvent.change(screen.getByLabelText("Precio de compra"), { target: { value: "9000" } });
    fireEvent.click(screen.getByRole("button", { name: /Ver consecuencia/ }));
    fireEvent.click(screen.getByRole("button", { name: /Esto me basta/ }));
    expect(screen.getByRole("button", { name: /Terminar/ })).toBeInTheDocument();
    expect(screen.queryByText(/Recomendamos comprar/)).not.toBeInTheDocument();
    expect(screen.queryByText(/crédito aprobado/i)).not.toBeInTheDocument();
  });
});
