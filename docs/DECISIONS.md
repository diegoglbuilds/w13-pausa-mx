# Week 13 Decisions — Pausa MX

Date: 2026-11-08

## Key decisions

- Keep the first screen to purchase price, number of payments, and an optional known monthly payment. Estimate the monthly amount as price divided by payment count when the user leaves it blank.
- Keep finance math in pure TypeScript and validate editable purchase, context, and feedback values with Zod. No LLM or server participates in the calculation.
- Treat user-entered monthly expenses, existing installments, and the user-set maximum as optional. A missing maximum leaves the result at “Revisa antes de comprar.” Unknown fees also prevent a positive “Dentro de tu límite” result; fee amounts stay outside the calculation.
- Keep the buyer in control. Pausa MX does not gate checkout, rank retailers or lenders, or share ability-to-pay data.
- Keep financial inputs in the current React session. Only allowlisted categorical usage events go to browser localStorage. Comments are bounded and never copied into the event log.
- Reject malformed stored analytics records, including records with extra fields, before aggregation or rewrite.

## What changed

- Established a mobile-first Next.js, React, TypeScript, Tailwind, Zod, Vitest, and Testing Library app in the packet-only repository.
- Added the minimum-input consequence card, optional context, three transparent result states, buyer-controlled continuation, optional feedback, and local demo analytics.
- Added storage fallbacks, malformed-data handling, aggregate analytics, and tests for the purchase, finance, feedback, and privacy boundaries.
- Matched the mockup’s compact blue cards and pause motif while following the packet’s simpler quick-check flow.

## MONEY hypothesis affected

The slice now makes the purchase-specific monthly and total commitment visible before asking for a budget. It also makes the calculator comparison explicit. This reduces required entry work in the prototype, but there is no evidence yet that it is materially faster or more useful than a calculator, banking app, calendar, or memory. No 10:1 claim is supported.

## Analytics and privacy status

Analytics are local to this browser and contain only event name, timestamp, local anonymous session ID, screen, and optional categorical feedback metadata. Purchase values, expenses, income, monthly maximum, comments, names, emails, IP-derived data, and device fingerprints are not logged. Clearing analytics leaves the current financial form state intact. No remote database, authentication, bank connection, API route, or financial persistence exists.

## Unresolved risks

- The requested real-user validation has not happened. Synthetic personas and the mockup are not user evidence.
- No deployment was performed, by instruction, so the URL of record has not been verified against this build.
- `npm audit --omit=dev` reports a high PostCSS advisory in the Next 15 dependency tree; npm's suggested automatic fix requires a Next 16 major upgrade. Assess and resolve the dependency path before production use.
- The prototype estimates equal installments when the user does not know the actual monthly payment. Fees and unseen obligations can change the real commitment.

## Tomorrow’s first move

Run five moderated sessions with target shoppers, including at least three strangers. Time the Pausa MX flow against each person’s current free substitute, record where they hesitate, and ask whether the result clarified or changed their decision. Fix the worst observed confusion before any deployment.

## Pre-Deploy Security Patch

- **Vulnerability found:** npm audit reported one high-severity PostCSS advisory group, including source-map path traversal / file disclosure (GHSA-r28c-9q8g-f849) and related advisories. It also reported Next as a moderate affected dependency because Next bundled the vulnerable PostCSS version.
- **Dependency cause:** Next 15.5.28 pinned nested `postcss` 8.4.31. The latest Next 15 patch available during this remediation (15.5.29) still pins 8.4.31. The fixed Next release supplies PostCSS 8.5.23.
- **Version change:** Next.js 15.5.28 → 16.4.5. React and React DOM stay at 19.1.1. Next’s PostCSS moves 8.4.31 → 8.5.23; the existing Tailwind/Vite PostCSS remains 8.5.32. No product behavior or finance logic changed.
- **Compatibility changes:** Node 24 satisfies Next 16’s Node >=20.9 requirement and existing React 19.1.1 satisfies Next’s peer range. Next 16 builds with Turbopack successfully. Its build made the standard `tsconfig.json` adjustments: `jsx: react-jsx` and inclusion of `.next/dev/types/**/*.ts`; generated `next-env.d.ts` types were refreshed.
- **Audit result:** `npm.cmd audit` reports 0 vulnerabilities (0 high, 0 critical).
- **Test result:** `npm.cmd test` passes, 26 tests across 5 files.
- **Build result:** `npm.cmd run build` passes on Next.js 16.4.5.
- **Unresolved security risks:** No dependency advisories are reported by the current full audit. Dependency advisories can change; rerun audit before release. No deployment or remote-data system was introduced.
- **Tomorrow's first move:** GitHub + Deploy #1.

## Mechanical Test — Post Deploy #1

- **Testing method:** Source and flow review against `docs/PACKET.md`, followed by Vitest/Testing Library regression coverage for the consequence-to-result transition. No user sessions or browser interactions are represented as observed evidence.
- **Browser automation available:** No browser automation tool is available in this environment.
- **Production browser verification available:** No. The production alias was not verified in a browser.
- **Real bug found:** `result_viewed` was logged when Quick Check first displayed the consequence card, before the result screen appeared. Reaching the result later logged the event again.
- **Why it mattered:** Abandonments at the consequence screen inflated result-view counts, and completed flows could count two result views. This compromised the MONEY funnel measurement and misrepresented what users actually saw.
- **Fix applied:** Removed the premature `result_viewed` event from Quick Check submission. The event is now emitted only by the transition that opens the result screen.
- **Regression test:** Added a UI flow test asserting zero `result_viewed` events on the consequence screen and exactly one after opening the result.
- **Remaining risks:** Production behavior remains unverified in a browser; no real-user evidence exists. Equal-installment estimates, fees, and unseen obligations remain limitations described above.
- **Next session first move:** Persona test.

## Persona Test — Post Mechanical Fix

- **Synthetic persona:** Mariana, fictional / synthetic, age 26. This walkthrough is not real-user evidence.
- **Testing method:** Reviewed React-rendered structure and copy, UI state transitions, validation, deterministic finance logic, local analytics, and existing component tests. No clicks or visual observations are claimed.
- **Browser/screenshot limitation:** Browser automation unavailable; no screenshots captured and no production browser verification.
- **Worst confusion:** Analytics disclosure was hidden inside a collapsed panel, in English, and did not state that “Continuar de todos modos” is logged locally.
- **MONEY implication:** Undisclosed-feeling analytics can reduce trust and voluntary use, and make funnel measurement less representative.
- **Design decision:** Explain recorded usage events and their local-only/no-purchase-data boundary before the panel is opened; keep review and deletion controls in the panel.
- **Exact fix:** Added always-visible Spanish disclosure beside the analytics control, including continue-anyway event, local storage, exclusion of purchase amounts/details, and review/delete path; translated the panel disclosure.
- **Re-test result:** Source walkthrough confirms the disclosure is visible before panel open. Added a component regression test for the disclosed event, data boundary, and review/delete path. Full tests/build results recorded at commit time.
- **Calculator/banking comparison:** A calculator likely wins on simple arithmetic speed. Pausa MX additionally presents monthly impact, estimated total, unknowns, optional context, and buyer-control language; no measured superiority or 10:1 evidence exists. The banking app may already supply obligations, but Pausa MX does not connect or verify them. Preference, return, and payment willingness remain unknown.
- **Remaining risk:** Context still adds manual effort, result/status wording may be interpreted as advice, and no real users have validated usefulness or willingness to pay.
- **Next session first move:** Final deploy verification and submission artifacts.
