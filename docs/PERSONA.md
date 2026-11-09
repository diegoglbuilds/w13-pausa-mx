# Week 13 Persona Test

## Test status

- **Status:** Synthetic persona walkthrough; Mariana is fictional and this is not user research.
- **Browser automation available:** No.
- **Screenshots actually available:** No screenshots were captured or used.
- **Testing method:** Inspected the rendered React component structure and Spanish UI copy, followed state handlers and validation, reviewed deterministic finance and local analytics code, and checked existing Vitest/Testing Library coverage. After the change, ran a targeted disclosure regression test and repeated the source walkthrough.
- No clicks, timings, visual observations, production behavior, user quotes, or real-user reactions are claimed. Likelihood and severity below are design judgments from this source review, not observed user data.

## Persona

**Mariana — fictional / synthetic, age 26.** She shops online, has used MSI, has stable but limited disposable income, understands monthly payments better than total commitment, sometimes checks her banking app, and does not keep a budget spreadsheet. She dislikes long forms, is cautious about financial data, doubts “AI says you can afford it,” and would use her calculator and banking app if Pausa MX feels slower.

## Walkthrough

Likelihood is a qualitative hypothesis, not a measured rate. “Continue” means progress to the next state; “return” means voluntary use before another purchase.

| State | Expectation | Interpretation | Hesitation / confusion | MONEY implication | Continue / return | Severity |
|---|---|---|---|---|---|---|
| Landing | See quickly whether this helps before checkout. | “Decide before buying,” buyer control, and transparent calculation are apparent. | “Ver el compromiso completo” can overstate visibility because unseen obligations and fees remain unknown; the calculator comparison is explicit but differentiation is still unproven. | Must show a useful consequence beyond arithmetic without implying a complete financial picture. | Continue: likely if already considering installments. Return: uncertain. | Medium |
| Privacy / no-bank disclosure | Know whether account linking or sensitive history is required. | No bank, account, or bank data connection is requested; entries remain in this browser. | “Lo que ingresas se queda en este navegador” does not explain that financial inputs are in current page state rather than analytics storage. The distinction is not explicit. | Trust supports first use, but accurate storage boundaries matter for repeat use. | Continue: likely. Return: uncertain. | Medium |
| Quick Check / price | Enter only what is needed. | Price and installment count are the core fields; monthly payment is optional. | Mariana may wonder why a known monthly installment is useful if price and count already give an estimate. | Low entry cost is the main route to beat a calculator. | Continue: likely if values are available. Return: uncertain. | Low |
| Installment count | State duration of the commitment. | A bounded count is required. | No explanation on the field itself for why count matters, though the outcome uses months. | Small cognitive cost; it enables duration context. | Continue: likely. Return: uncertain. | Low |
| Optional monthly payment | Use the actual payment if known. | Blank means estimated price ÷ count and is labeled as an estimate. | Actual MSI payment may differ due to rounding, down payment, or fees; the app does not ask about those details. | Honest estimate is useful, but must not be confused with a verified payment schedule. | Continue: likely. Return: uncertain. | Medium |
| Validation errors | Learn what to correct. | Price must be positive and count is capped at 120. | Error appears after submit; source review cannot establish screen-reader or visual prominence. | Bad validation could block a quick check; existing tests cover the error copy and transition. | Continue: likely after correction. Return: neutral. | Low |
| First consequence | See an immediate monthly consequence before budget work. | New monthly payment, duration, total estimate, and unknowns appear before context. | “Total estimado” is a projected sum of installment payment × count, not necessarily total purchase cost where fees/down payment differ. | Useful early result, but precision and coverage need careful interpretation. | Continue: likely; can select “Esto me basta.” Return: uncertain. | Medium |
| Total and monthly impact | Understand commitment in terms she recognizes. | Added monthly amount is emphasized and total estimated cost is also shown. | Total is secondary for a persona who thinks monthly-first; the value of adding it must be tested with real shoppers. | May improve consequence awareness, but no evidence yet of decision change. | Continue: likely. Return: uncertain. | Low |
| Missing / unknown information | Know what the app cannot see. | Unknown fees and other obligations are named; fee amounts remain outside math. | “No conocemos tus otras obligaciones” is clear but leaves Mariana to decide whether to check her banking app/calendar. | Transparency protects against false assurance; the user still does reconciliation work. | Continue: likely if uncertainty is acceptable. Return: uncertain. | Medium |
| “Agregar contexto” | Decide whether more detail is worth entering. | The context screen says inputs are optional and can change the result. | Four fields may feel like a budget form; “Agregar contexto” does not preview why each field matters. | Extra data can distinguish the tool, but adds friction and sensitive entry. | Continue: possible; abandon risk rises. Return: uncertain. | Medium |
| Skip context | Keep moving without disclosing expenses. | “Esto me basta” or “Omitir contexto” reaches an orientative result with unknowns. | Optionality is explicit; however, “Omitir contexto” resets context values if she returns to that screen after entering them. | Clear skip protects buyer control; unexpected reset could make her distrust editing. | Continue: likely. Return: uncertain. | Medium |
| Commitments and essential expenses | Decide whether to share monthly obligations. | Inputs are presented as optional; copy says essentials are not used to qualify her. | “¿Por qué necesitas saber mis gastos?” The tool compares totals to her self-set maximum, so these fields can feel sensitive without a per-field explanation of their effect. | More context may add value, but data entry and privacy cost can exceed calculator benefit. | Continue: uncertain. Return: uncertain. | Medium |
| Monthly maximum | Set her own comparison threshold. | A user-defined maximum drives the status; it is not an external approval. | If she does not know a comfortable limit, she cannot get a meaningful comparison and could read the status as advice. | Buyer-set threshold preserves agency, but requires a judgment she may not have ready. | Continue: uncertain. Return: uncertain. | Medium |
| Fees | Say unknown, none, or known. | “No lo sé todavía” is allowed and fees stay outside the calculation. | “Hay comisiones” has no amount field, so the displayed total cannot include them. | Good uncertainty handling; arithmetic remains incomplete. | Continue: likely. Return: uncertain. | Low |
| Updated result / status | Understand what changed and what the status means. | Result uses her maximum and submitted context; missing maximum leaves “Revisa antes de comprar.” | “Espera” may sound directive despite the disclaimer. Status threshold (`>120%` of max) is not explained in UI. | Could be read as permission or advice; threatens trust and buyer control. | Continue: uncertain. Return: uncertain. | High |
| Buyer control / continue anyway | Retain control over purchase. | Copy says she decides and the app does not block; continuation stays available. | “Continuar de todos modos” can imply disagreement with the app’s “Espera” status. The event is recorded, a fact previously only visible in the collapsed analytics panel. | Agency is present, but the analytics event could surprise a privacy-conscious shopper. | Continue: likely; return: uncertain. | Medium |
| Feedback yes / maybe / no | Answer whether it helped. | Three categories are available, comment is optional and bounded. | Selecting a category immediately logs it; no explicit “skip” button, though response is described as optional and “Terminar” is available. | Useful learning signal, but category counts are not evidence of willingness to pay or changed decisions. | Continue: likely; return: uncertain. | Low |
| Feedback comment / skip | Share a short note or finish. | Comment is optional, max 280 characters, and not logged in analytics. | Placeholder discourages personal data; no separate “Omitir” control may be less obvious than simply ending. | Low overhead, though collecting comments adds trust cost. | Continue: likely; return: uncertain. | Low |
| Analytics disclosure / panel | Know what is stored and control it. | Local aggregate panel provides sessions, completion, context, continuation, and feedback counts; clear removes events. | Before fix, the panel was collapsed, explanatory text English-only, and did not tell her that continuing anyway is recorded. | Hidden/unclear tracking harms trust and can make observed funnel metrics feel covert. | Continue: uncertain; return: at risk. | High |
| Clear analytics | Remove usage history without losing current inputs. | Clear button removes only the analytics key; form values remain React state. | No confirmation or undo; but the action is explicit and local. | Control helps trust; aggregate counts disappear as expected. | Continue: likely. Return: neutral. | Low |
| End / return | Decide whether to use this before another purchase. | “Terminar” resets the visible flow to Quick Check; no account required. | No proof the tool saves enough effort versus calculator + banking app; no real return intent or willingness-to-pay evidence. | The central MONEY hypothesis remains unvalidated. | Return: unknown; willingness to pay: unknown. | High |

## Confusion Log

| State | Confusion | Severity | MONEY threat | Candidate fix |
|---|---|---|---|---|
| Landing | “Compromiso completo” can imply all obligations and costs are known. | Medium | Overclaim can damage trust when unknowns appear. | Say “nuevo compromiso mensual y total estimado.” |
| Privacy | Browser-local financial inputs versus logged analytics are not clearly distinguished. | Medium | User may avoid entry or repeat use. | Clarify the specific local analytics boundary near its control. |
| Optional payment | Estimated equal installments may differ from provider schedule. | Medium | Calculator result may be mistaken for exact quote. | Keep estimate label; validate actual schedule with users. |
| First consequence | Total excludes fees and may not include down payment effects. | Medium | The key consequence can be incomplete. | Keep “estimado/sin comisiones” adjacent and gather actual confusion. |
| Context | Four fields feel like homework and ask sensitive expense data. | Medium | More effort reduces completion and free-substitute advantage. | Keep optional; explain each field’s effect in user sessions before changing scope. |
| Skip/context revisit | Skip action resets entered context if used after entry. | Medium | Lost effort creates frustration and abandonment. | Preserve entries if skip is used, unless user explicitly clears them. |
| Result status | “Espera” and the 120% threshold can sound like app advice. | High | False permission/denial undermines buyer control. | Explain status is a comparison to the user's own limit; test wording with people. |
| Continue | “Continuar de todos modos” is counted in local analytics. | Medium | Hidden event recording creates a trust cost. | Disclose event categories before panel open and make deletion easy to find. |
| Feedback | No explicit skip button despite optional prompt. | Low | Small friction at the end of the flow. | Consider visible “Omitir” only if testing finds hesitation. |
| Analytics | Event types and deletion controls were hidden behind a collapsed panel; disclosure was English-only. | High | Privacy concern can suppress use and corrupt voluntary measurement. | Show concise Spanish event/storage/deletion disclosure beside the toggle. |
| Value / return / payment | No evidence of repeat use, meaningful decision change, or payer. | High | No demonstrated economic value or 10:1 case. | Conduct target-user sessions and compare time/value against their free substitute. |

## Calculator / Banking App Comparison

- **Which tasks are faster with calculator?** Simple price ÷ installment count and payment × count are likely faster with a calculator. No measured timing exists.
- **What does Pausa MX add beyond arithmetic?** It places monthly amount, duration, estimated total, unknown fees/obligations, a user-set comparison, and buyer-control language in one flow. The calculator can do arithmetic but does not automatically surface those caveats.
- **Does optional context create enough additional value?** Unknown. It can compare entered commitments and essentials with a user-set maximum, but the manual entry is substantial and no user evidence establishes the value.
- **Is the first consequence useful before context?** Plausibly: it gives monthly amount and estimated total without a full budget. This is a product hypothesis, not observed usefulness.
- **Does the user need too much manual input?** Minimum flow needs price/count and optionally known payment; context asks four more fields. That is lighter than a full budget but more work than one calculator operation.
- **Is analytics worth its privacy/trust cost?** Only if users understand it and the team uses aggregate counts responsibly. Local-only storage lowers exposure but does not remove the need to disclose event collection. The fix makes this more explicit.
- **Would Mariana voluntarily use it before checkout?** Unknown. The source supports a plausible quick path, but timing and preference must be tested against her actual substitute.
- **Would Mariana pay?** Unknown; no pricing or payer evidence exists.
- **Is there credible 10:1 evidence?** No. There are no measured time savings, decision changes, repeat use, willingness-to-pay data, or free-substitute comparisons.

## Worst Confusion

The analytics disclosure was the highest-impact fixable confusion in this pass. Before the change, disclosure was inside a collapsed panel, in English, and did not tell Mariana that clicking “Continuar de todos modos” creates a local event. A privacy-cautious user could interpret this as undisclosed tracking. That directly threatens trust, voluntary use, and the validity of the MONEY funnel measurements. Source inspection identified this as a real UI disclosure gap; it is not a claim that a real user experienced it.

## Fix Applied

- Added an always-visible Spanish disclosure beside the analytics panel control: the demo records usage events including continue-anyway, stores them only in this browser, excludes purchase amounts/details, and lets the user review or delete them in the panel.
- Translated the panel’s demo/local/non-production disclosure into Spanish.
- No finance math, event schema, local-only storage, or buyer choices changed.
- Added a regression test for the pre-panel disclosure, including the continue-anyway event, no financial values, and review/delete access.

## Re-test

Repeated the source walkthrough after the copy change. The event purpose, local storage boundary, excluded purchase data, and path to review/delete are now described before the panel opens. The component still records the same allowlisted categorical events locally, and the clear button remains available inside the panel. The new regression test checks these exact disclosure claims. This is source/test verification only; no browser session or production behavior was observed.

## Remaining Confusions

- “Compromiso completo” still risks overclaiming what the app can know.
- The result label “Espera” and the 120% comparison threshold need comprehension testing.
- Optional context and monthly maximum may still feel like financial homework.
- Skipping context after entering values resets those values.
- Equal-installment estimates, fee exclusions, and unseen obligations limit accuracy.
- No timing, comprehension, decision-change, return, or willingness-to-pay evidence exists; no 10:1 claim is supported.
