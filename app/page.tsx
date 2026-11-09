"use client";

import { useMemo, useState } from "react";
import { aggregateEvents, clearEvents, logEvent } from "@/lib/analytics";
import { calculateConsequence, contextSchema, feedbackSchema, quickCheckSchema, type PurchaseContext, type QuickCheckInput } from "@/lib/finance";

type Step = "quick" | "consequence" | "context" | "result";
const statusText = { within_limit: "Dentro de tu límite", review: "Revisa antes de comprar", wait: "Espera" } as const;
const money = (value: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(value);

export default function Home() {
  const [step, setStep] = useState<Step>("quick");
  const [input, setInput] = useState<QuickCheckInput>({ price: 0, installments: 1, monthlyPayment: "" });
  const [context, setContext] = useState<PurchaseContext>({ commitments: 0, essentials: 0, monthlyMaximum: "", fees: "unknown" });
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [continued, setContinued] = useState(false);
  const [comment, setComment] = useState("");
  const [debug, setDebug] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const consequence = useMemo(() => calculateConsequence(input, step === "quick" || step === "consequence" ? undefined : context), [input, context, step]);
  const aggregates = useMemo(() => aggregateEvents(), [refresh]);
  const update = (fn: () => void) => { fn(); setRefresh(n => n + 1); };
  const startCheck = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = quickCheckSchema.safeParse(input);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Revisa los datos."); return; }
    setInput(parsed.data); setError("");
    update(() => { logEvent("quick_check_started", "quick_check"); logEvent("quick_check_completed", "consequence"); });
    setStep("consequence");
  };
  const openContext = () => { update(() => logEvent("context_opened", "context")); setStep("context"); };
  const showResult = (raw: PurchaseContext = context) => {
    const parsed = contextSchema.safeParse(raw);
    if (!parsed.success) { setError("Revisa los datos opcionales."); return; }
    setContext(parsed.data); setError("");
    update(() => logEvent("result_viewed", "result"));
    setStep("result");
  };
  const chooseFeedback = (value: "yes" | "maybe" | "no") => {
    setFeedback(value);
    update(() => logEvent(`feedback_helpful_${value}`, "feedback", { category: value }));
  };
  const submitFeedback = () => {
    const parsed = feedbackSchema.safeParse({ helpfulness: feedback, comment });
    if (!parsed.success) return;
    update(() => logEvent("feedback_submitted", "feedback")); setComment(""); setFeedbackSent(true);
  };

  return <main className="page-shell">
    <header className="topbar"><a className="brand" href="#inicio" aria-label="Pausa MX inicio"><span className="brand-icon">{"\u23f8"}</span><span><strong>Pausa MX</strong><small>Decide antes de comprar</small></span></a><span className="privacy-pill">Sin conectar tu banco</span></header>
    <section className="hero" id="inicio"><div className="hero-copy"><p className="eyebrow">UNA PAUSA ANTES DEL CHECKOUT</p><h1>Antes de comprar, mira qué compromiso estás agregando.</h1><p>Una revisión clara con los datos que tú decidas compartir. No bloqueamos compras ni damos permisos.</p><div className="trust-row"><span>OK · Sin conexión bancaria</span><span>OK · Datos bajo tu control</span><span>OK · Cálculo transparente</span></div></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="pause-card"><span className="pause-mark">{"\u23f8"}</span><div><b>Haz una pausa.</b><small>Tu decisión, con más contexto.</small></div><span className="spark">{"\u2726"}</span></div><div className="mini-chip">Tu dinero · Tu decisión</div></div></section>
    <section className="workspace">
      <div className="flow-card">
        <div className="flow-head"><div><p className="eyebrow">REVISIÓN DE COMPRA · PASO {step === "quick" ? "1" : step === "consequence" ? "2" : "3"} DE 3</p><h2>{step === "quick" ? "Hagamos un cálculo rápido" : step === "consequence" ? "La primera consecuencia" : step === "context" ? "Agrega contexto si te sirve" : "Tu compra, en perspectiva"}</h2></div><span className="step-icon">{step === "quick" ? "01" : step === "consequence" ? "02" : "03"}</span></div>
        {step === "quick" && <form onSubmit={startCheck} noValidate><div className="field-grid"><label>Precio de compra <span>MXN</span><input aria-label="Precio de compra" type="number" min="1" placeholder="Ej. 12,000" value={input.price || ""} onChange={e => setInput({ ...input, price: Number(e.target.value) })}/></label><label>Número de pagos<input aria-label="Número de pagos" type="number" min="1" max="120" value={input.installments} onChange={e => setInput({ ...input, installments: Number(e.target.value) })}/></label><label className="full-field">Pago mensual <span>si ya lo conoces</span><input aria-label="Pago mensual" type="number" min="0.01" placeholder="Lo estimamos si lo dejas vacío" value={input.monthlyPayment} onChange={e => setInput({ ...input, monthlyPayment: e.target.value === "" ? "" : Number(e.target.value) })}/><small>Si no lo sabes, usamos precio ÷ número de pagos. El resultado será un estimado.</small></label></div>{error && <p className="error" role="alert">{error}</p>}<button className="primary-button" type="submit">Ver consecuencia <span>+</span></button><p className="form-note">No conectamos tu banco. Tú decides qué datos compartir.</p></form>}
        {step === "consequence" && <><div className="consequence-highlight"><span className="highlight-icon">+</span><p>Esta compra agrega <strong>{money(consequence.installment)}</strong> al mes durante <strong>{input.installments} {input.installments === 1 ? "mes" : "meses"}</strong>.</p></div><div className="stats-grid"><div><small>Total estimado, sin comisiones</small><strong>{money(consequence.total)}</strong></div><div><small>Pago mensual {input.monthlyPayment === "" ? "estimado" : "indicado"}</small><strong>{money(consequence.installment)}</strong></div></div><p className="unknown-note"><span>+</span><span><b>Lo que todavía no sabemos</b>{consequence.missingInput}</span></p><div className="button-row"><button className="primary-button" onClick={openContext}>Agregar contexto <span>{"\u2192"}</span></button><button className="quiet-button" onClick={() => showResult()}>Esto me basta</button></div><p className="disclosure">Cálculo determinista con los datos que ingresaste. No conocemos tus otras obligaciones.</p></>}
        {step === "context" && <><p className="section-intro">Estos datos son opcionales. Agregarlos puede cambiar el resultado.</p><div className="field-grid"><label>Otros pagos mensuales<input aria-label="Otros pagos mensuales" type="number" min="0" value={context.commitments || ""} placeholder="$0" onChange={e => setContext({ ...context, commitments: Number(e.target.value) })}/></label><label>Gastos esenciales<input aria-label="Gastos esenciales" type="number" min="0" value={context.essentials || ""} placeholder="$0" onChange={e => setContext({ ...context, essentials: Number(e.target.value) })}/></label><label>Tu máximo mensual<input aria-label="Tu máximo mensual" type="number" min="0" value={context.monthlyMaximum} placeholder="Opcional" onChange={e => setContext({ ...context, monthlyMaximum: e.target.value === "" ? "" : Number(e.target.value) })}/></label><label>Comisiones<select aria-label="Comisiones" value={context.fees} onChange={e => setContext({ ...context, fees: e.target.value as PurchaseContext["fees"] })}><option value="unknown">No lo sé todavía</option><option value="none">Sin comisiones</option><option value="known">Hay comisiones</option></select></label></div>{error && <p className="error" role="alert">{error}</p>}<div className="button-row"><button className="primary-button" onClick={() => showResult()}>Revisar resultado <span>+</span></button><button className="quiet-button" onClick={() => showResult({ commitments: 0, essentials: 0, monthlyMaximum: "", fees: "unknown" })}>Omitir contexto</button></div><p className="disclosure">Tus gastos esenciales no se usan para calificarte. El resultado es orientativo.</p></>}
        {step === "result" && <><div className={`result-banner status-${consequence.status}`}><span className="result-dot">+</span><div><small>CON TU MÁXIMO MENSUAL</small><h3>{statusText[consequence.status]}</h3><p>{consequence.status === "within_limit" ? "El pago indicado queda dentro del máximo que tú fijaste." : consequence.status === "wait" ? "El total de pagos indicado rebasa el máximo que tú fijaste." : "Falta información para comparar esta compra con tu límite."}</p></div></div><div className="stats-grid"><div><small>Nuevo pago mensual</small><strong>{money(consequence.installment)}</strong></div><div><small>Pagos y gastos mensuales con este compromiso</small><strong>{money(consequence.monthlyWithCommitments)}</strong></div><div><small>Total estimado, sin comisiones</small><strong>{money(consequence.total)}</strong></div><div><small>Comisiones fuera del cálculo</small><strong className="small-value">{context.fees === "none" ? "Sin comisiones" : context.fees === "known" ? "Hay comisiones" : "Desconocidas"}</strong></div></div><p className="unknown-note"><span>+</span><span><b>Visibilidad incompleta</b>{consequence.missingInput} No conocemos todos tus pagos ni podemos confirmar lo que puedes pagar.</span></p><div className="buyer-control"><span>+</span><b>Tú decides. Pausa MX no bloquea tu compra.</b></div><div className="button-row"><button className="primary-button" onClick={() => { update(() => logEvent("continue_anyway", "result")); setContinued(true); }}>Continuar de todos modos <span>{"\u2192"}</span></button><button className="quiet-button" onClick={() => setStep("quick")}>Editar datos</button></div>{continued && <p className="disclosure">Puedes continuar fuera de Pausa MX; no procesamos ni bloqueamos tu compra.</p>}<Feedback onChoose={chooseFeedback} feedback={feedback} comment={comment} setComment={setComment} submit={submitFeedback} feedbackSent={feedbackSent}/><button className="text-button" onClick={() => { setStep("quick"); setFeedback(""); setFeedbackSent(false); setContinued(false); }}>Terminar</button></>}
      </div>
      <aside className="side-column"><div className="value-card"><span className="value-icon">+</span><p className="eyebrow">¿POR QUÉ PAUSA?</p><h3>No intenta reemplazar tu calculadora.</h3><p>Te ayuda a ver el compromiso completo antes de comprar.</p><div className="value-divider"/><small>Tu compra. Tu ritmo. Tu decisión.</small></div><div className="privacy-card"><span>+</span><div><b>Privacidad primero</b><p>Lo que ingresas se queda en este navegador. No pedimos cuenta ni datos bancarios.</p></div></div><button className="analytics-toggle" onClick={() => setShowAnalytics(!showAnalytics)} aria-expanded={showAnalytics}>Analítica de demostración <span>{showAnalytics ? "-" : "+"}</span></button>{showAnalytics && <div className="analytics-card"><p>Demo analytics stored locally in this browser. Not production behavioral tracking.</p><div className="analytics-grid"><span>Sesiones<strong>{aggregates.sessions}</strong></span><span>Completadas<strong>{aggregates.completions}</strong></span><span>Contexto<strong>{aggregates.contextOpens} · {aggregates.completions ? Math.round(aggregates.contextOpens / aggregates.completions * 100) : 0}%</strong></span><span>Continuaron<strong>{aggregates.continueAnyway}</strong></span><span>Feedback Sí<strong>{aggregates.feedback.yes}</strong></span><span>Más o menos<strong>{aggregates.feedback.maybe}</strong></span><span>Feedback No<strong>{aggregates.feedback.no}</strong></span></div><button className="text-button" onClick={() => { clearEvents(); setRefresh(n => n + 1); }}>Borrar analítica local</button></div>}<button className="debug-toggle" onClick={() => setDebug(!debug)} aria-pressed={debug}>Modo de demostración {debug ? "activado" : "desactivado"}</button>{debug && <p className="sim-label">Valores ingresados por ti. No usamos ejemplos financieros simulados.</p>}</aside>
    </section>
    <footer className="footer"><span>PAUSA MX <i>·</i> Una decisión más clara empieza con una pausa.</span><span>No es permiso ni una evaluación de capacidad de pago.</span></footer>
  </main>;
}

function Feedback({ onChoose, feedback, comment, setComment, submit, feedbackSent }: { onChoose: (value: "yes" | "maybe" | "no") => void; feedback: string; comment: string; setComment: (value: string) => void; submit: () => void; feedbackSent: boolean }) {
  return <section className="feedback-box"><h4>¿Te ayudó a decidir?</h4><p>Tu respuesta es opcional y se guarda solo en esta demo local.</p><div className="feedback-options">{([["yes", "Sí"], ["maybe", "Más o menos"], ["no", "No"]] as const).map(([value, label]) => <button key={value} className={feedback === value ? "selected" : ""} onClick={() => onChoose(value)}>{label}</button>)}</div>{feedbackSent && <p className="feedback-confirmation">Gracias. Tu respuesta se registró en esta sesión local.</p>}{feedback && <><label className="comment-label">¿Qué faltó? <span>opcional</span><textarea aria-label="¿Qué faltó?" maxLength={280} value={comment} onChange={e => setComment(e.target.value)} placeholder="Hasta 280 caracteres; no incluyas datos personales."/><small>{comment.length}/280</small></label><button className="quiet-button" onClick={submit}>Enviar comentario opcional</button></>}</section>;
}
