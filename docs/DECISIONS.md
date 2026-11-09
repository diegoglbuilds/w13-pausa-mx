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
