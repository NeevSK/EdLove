# @repo/payments

## Purpose
`@repo/payments` is the fees, invoices, receipts, and payment-orchestration domain for Gurudevi.

## Owns
- payment workflow contracts and payment-specific screens
- fee collection, invoice, and receipt logic
- package-local web/native payment variants

## Does Not Own
- general ledger/accounting depth
- app shell route composition
- unrelated admin workflows

## Collaborates With
- `@repo/core` for access and shared data
- `@repo/accounting` for downstream finance alignment
- `@repo/admin` for institutional payment oversight

## Web Placement
Payment-specific `*.web.tsx` files belong here when browser UX differs for invoicing, receipts, or checkout flows.

## App Adapter Rule
The app should provide navigation adapters only; payment flows belong here.
