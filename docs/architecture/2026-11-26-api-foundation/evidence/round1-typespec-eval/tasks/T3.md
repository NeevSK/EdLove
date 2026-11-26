# Task T3 (People, cross-domain): add operation `people.guardians.link`

HTTP: `POST /people/guardians/link`, JSON body. Cedar action: `People::LinkGuardian`.

Input (unknown fields anywhere, including inside `relationship`, must be rejected with 400):
- `studentId`: string, `guardianId`: string
- `relationship`: one of (discriminated by `kind`; anything else → 400)
  - `{ kind: "parent" }`
  - `{ kind: "legal_guardian", courtOrderRef: string }`
  - `{ kind: "other", description: string }` (description required)

Behaviour (use `db.people`, `db.guardianLinks`, `nextId` from `shared/domain.ts`):
- `studentId` must be a person with kind "student", `guardianId` a person with kind "guardian"; otherwise `NOT_FOUND` (404).
- Student with `locked: true` → `FORBIDDEN` (403).
- Already linked (key `${studentId}:${guardianId}` in `db.guardianLinks`) → `CONFLICT` (409).
- Otherwise store the link (linkId from `nextId('link')`) and return it.

Output: `{ linkId: string, studentId: string, guardianId: string, relationship: <as given>, verified: false }`.
