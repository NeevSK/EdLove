import "@typespec/http";
import "@typespec/openapi";
import "@typespec/openapi3";

using Http;
using OpenAPI;

@service(#{ title: "Gurudevi v1 (evaluation)" })
@server("https://api.example.invalid", "eval")
namespace Gurudevi;

// ---------- shared ----------
/** Decimal carried as a string so no precision is lost (e.g. "1234.50"). */
@pattern("^-?[0-9]+(\\.[0-9]{1,4})?$")
scalar DecimalString extends string;

/** Every error has a stable machine code; clients switch on `code`. */
@error
model ApiError<Code extends string, Status extends int32> {
  @statusCode status: Status;
  code: Code;
  message: string;
  requestId: string;
}
alias NotFound = ApiError<"NOT_FOUND", 404>;
alias Forbidden = ApiError<"FORBIDDEN", 403>;
alias Conflict = ApiError<"CONFLICT", 409>;

model Page<T> {
  items: T[];
  /** Absent on the last page. */
  nextCursor?: string;
}

// ---------- LMS ----------
model Assignment {
  id: string;
  classroomId: string;
  title: string;
  /** null = no due date (not the same as unknown). */
  dueAt: utcDateTime | null;
  maxScore: DecimalString;
}

model GradeInput {
  submissionId: string;
  score: DecimalString;
  /** Omitted = keep existing feedback; null = clear it. */
  feedback?: string | null;
}

model Grade {
  submissionId: string;
  score: DecimalString;
  feedback: string | null;
}

@route("/lms")
namespace Lms {
  @extension("x-cedar-action", "Lms::ListAssignments")
  @operationId("lms.assignments.list")
  @post @route("/assignments/list")
  op listAssignments(@body body: { classroomId: string; cursor?: string; limit?: int32 }): Page<Assignment> | NotFound | Forbidden;

  @extension("x-cedar-action", "Lms::GradeSubmission")
  @operationId("lms.submissions.grade")
  @post @route("/submissions/grade")
  op grade(@body body: GradeInput): Grade | NotFound | Forbidden | Conflict;
}

// ---------- ERP ----------
@discriminated(#{ envelope: "none", discriminatorPropertyName: "kind" })
union Payment {
  cash: { kind: "cash"; receivedBy: string },
  bank: { kind: "bank"; reference: string; bankCode: string },
}

model InvoiceLine {
  description: string;
  quantity: int32;
  unitPrice: DecimalString;
}

model InvoiceInput {
  studentId: string;
  currency: "LKR" | "USD";
  lines: InvoiceLine[];
  payment?: Payment;
}

model Invoice {
  id: string;
  total: DecimalString;
  lines: InvoiceLine[];
  payment: Payment | null;
}

@route("/erp")
namespace Erp {
  @extension("x-cedar-action", "Erp::CreateInvoice")
  @operationId("erp.invoices.create")
  @post @route("/invoices/create")
  op createInvoice(@header("idempotency-key") idempotencyKey: string, @body body: InvoiceInput): Invoice | Forbidden | Conflict;
}

// ---------- People ----------
model ProfilePatch {
  personId: string;
  /** Omitted = unchanged; null = clear. */
  preferredName?: string | null;
  phone?: string | null;
}
model Profile {
  personId: string;
  legalName: string;
  preferredName: string | null;
  phone: string | null;
  guardians: string[];
}

@discriminated(#{ envelope: "none", discriminatorPropertyName: "kind" })
union GuardianRelationship {
  parent: { kind: "parent" },
  legal_guardian: { kind: "legal_guardian"; courtOrderRef: string },
  other: { kind: "other"; description: string },
}

model GuardianLinkInput {
  studentId: string;
  guardianId: string;
  relationship: GuardianRelationship;
}

model GuardianLink {
  linkId: string;
  studentId: string;
  guardianId: string;
  relationship: GuardianRelationship;
  /** Always false until verification exists. */
  verified: false;
}

@route("/people")
namespace People {
  @extension("x-cedar-action", "People::UpdateProfile")
  @operationId("people.profiles.update")
  @post @route("/profiles/update")
  op updateProfile(@body body: ProfilePatch): Profile | NotFound | Forbidden;

  @extension("x-cedar-action", "People::LinkGuardian")
  @operationId("people.guardians.link")
  @post @route("/guardians/link")
  op linkGuardian(@body body: GuardianLinkInput): GuardianLink | NotFound | Forbidden | Conflict;
}

// ---------- Cross-domain ----------
model SignedSnapshot {
  /** Canonical JSON (RFC 8785) of the claims, exactly as signed. */
  payload: string;
  /** Ed25519 signature over `payload`, base64url. */
  signature: string;
  keyId: string;
  expiresAt: utcDateTime;
}

@route("/authority")
namespace Authority {
  @extension("x-cedar-action", "Authority::RefreshSnapshot")
  @operationId("authority.refreshSnapshot")
  @post @route("/snapshot/refresh")
  op refreshSnapshot(@body body: { bondId: string }): SignedSnapshot | NotFound | Forbidden;
}
