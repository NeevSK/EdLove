# Task T2 (ERP): add operation `erp.payments.refund`

HTTP: `POST /erp/payments/refund`, JSON body, required header `idempotency-key` (missing → 400). Cedar action: `Erp::RefundPayment`.

Input (unknown fields must be rejected with 400):
- `invoiceId`: string
- `amount`: decimal string, up to 4 decimal places (e.g. "0.1", "250.5"). A JSON number must be rejected with 400.
- `reason?`: string | null (omitted and null are both accepted).

Behaviour (use `db.invoices`, `db.refundsByKey`, `nextId` from `shared/domain.ts` and `toMinor`/`fromMinor` from `shared/decimal.ts`; never use JS numbers for money):
- Unknown invoice → `NOT_FOUND` (404).
- If a refund with the same `idempotency-key` already exists, return that same stored result again without changing anything.
- remaining = total − refunded. If amount > remaining → `CONFLICT` (409).
- Otherwise add amount to `refunded`, store the result under the idempotency key, and return it.

Output: `{ refundId: string, invoiceId: string, amount: string, remaining: string }` with `amount` and `remaining` formatted by `fromMinor` (4 decimal places, e.g. "250.5000").
