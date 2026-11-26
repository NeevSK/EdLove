# Task T1 (LMS): add operation `lms.attendance.mark`

HTTP: `POST /lms/attendance/mark`, JSON body. Cedar action: `Lms::MarkAttendance`.

Input (unknown fields anywhere must be rejected with 400):
- `sessionId`: string
- `marks`: array (may be empty) of `{ studentId: string, status: "present" | "absent" | "late", note?: string | null }`
  - `note` omitted = keep the student's existing note; `note: null` = clear it; a string = set it.

Behaviour (use `db.sessions` from `shared/domain.ts`):
- Unknown session → error `NOT_FOUND` (404). Session with `open: false` → `CONFLICT` (409).
- Any `studentId` not in the session's `students` → `NOT_FOUND` (404), and nothing is changed.
- Otherwise store each mark in `session.marks` (status + note), in input order.

Output: `{ sessionId: string, counts: { present: int, absent: int, late: int }, notes: Array<{ studentId: string, note: string | null }> }`
- `counts` = totals over ALL stored marks of the session after the update.
- `notes` = one entry per input mark, in input order, with the student's note after the update (`null` if none). Empty input → `notes: []`.
