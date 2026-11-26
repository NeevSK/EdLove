import "../lib/gurudevi.tsp";
using Gurudevi;

/** learning.assignments: work a teacher sets and a student hands in. Facts owned by the institution. */
namespace Learning.Assignments;

model Assignment {
  id: Id;
  classroomId: Id;
  title: string;
  /** null: no due date. */
  dueAt: offsetDateTime | null;
  maxScore: Decimal;
}

alias Closed = Problem<"SUBMISSIONS_CLOSED">;
alias AlreadySubmitted = Problem<"ALREADY_SUBMITTED">;

/** A teacher sets work for their classroom. Event: assignment published. */
@command @idempotent
@requiresBond("CLASSROOM", #["teacher"])
@delegable("propose")
op create(classroomId: Id, @minLength(1) @maxLength(200) title: string, dueAt?: offsetDateTime | null, maxScore: Decimal):
  Assignment | NotFound;

/** What is set in a classroom, newest first. */
@query @offline
@requiresBond("CLASSROOM", #["teacher", "student"])
@delegable("run")
op list(classroomId: Id, cursor?: string, @minValue(1) @maxValue(100) limit?: int32): Page<Assignment> | NotFound;

/** A student hands in work, from the phone even without a connection. Event: work submitted. */
@command @idempotent @offline
@requiresBond("CLASSROOM", #["student"])
@delegable("propose")
op submit(assignmentId: Id, @maxLength(20000) answer: string): { submissionId: Id; submittedAt: offsetDateTime } | NotFound | Closed | AlreadySubmitted;
