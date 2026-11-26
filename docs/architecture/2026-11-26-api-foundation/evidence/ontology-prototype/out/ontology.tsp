import "../lib/gurudevi.tsp";
using Gurudevi;
namespace Ontology;

enum AssignmentStage { draft, published, closed }
enum Capacity { student, teacher, tutor, marker, guardian, principal, section_head, grade_head, founder, platform_staff }
enum BondState { invited, active, ended, kept }
/** One human, one account for a whole life. The root of everything. Owner: self. */
model Person {
  id: Id;
  displayName?: string;
  bornOn?: plainDate;
}
/**  Owner: institution. */
model School {
  handle?: string;
  timeZone?: string;
  id: Id;
  name: string;
}
/**  Owner: institution. */
model Classroom {
  schoolId: Id;
  id: Id;
  name: string;
}
/**  Owner: family. */
model Family {
  id: Id;
  name: string;
}
/** How a person joins an entity, in one capacity. Owner: institution. */
model Bond {
  id: Id;
  personId: Id;
  entityId: Id;
  capacity: Capacity;
  state: BondState;
  validFrom?: offsetDateTime;
  validTo?: offsetDateTime;
}
/** Bond: invited -> active. Generated from its lifecycle; the area decides inputs and errors. */
@command @ownerOnly
op bond_accept(id: Id): Bond | NotFound | Problem<"INVALID_TRANSITION">;
/** Bond: invited -> ended. Generated from its lifecycle; the area decides inputs and errors. */
@command @ownerOnly
op bond_decline(id: Id): Bond | NotFound | Problem<"INVALID_TRANSITION">;
/** Bond: active -> ended. Generated from its lifecycle; the area decides inputs and errors. */
@command @requiresBond("ENTITY", #["principal", "founder"])
op bond_end(id: Id): Bond | NotFound | Problem<"INVALID_TRANSITION">;
/** Bond: ended -> kept. Generated from its lifecycle; the area decides inputs and errors. */
@command @system
op bond_keep(id: Id): Bond | NotFound | Problem<"INVALID_TRANSITION">;
/** Work a teacher sets for a classroom. Owner: institution. */
model Assignment {
  id: Id;
  classroomId: Id;
  title: string;
  dueAt?: offsetDateTime;
  maxScore: Decimal;
  stage: AssignmentStage;
}
/** Assignment: draft -> published. Generated from its lifecycle; the area decides inputs and errors. */
@command @requiresBond("CLASSROOM", #["teacher"])
op assignment_publish(id: Id): Assignment | NotFound | Problem<"INVALID_TRANSITION">;
/** Assignment: published -> closed. Generated from its lifecycle; the area decides inputs and errors. */
@command @requiresBond("CLASSROOM", #["teacher"])
op assignment_close(id: Id): Assignment | NotFound | Problem<"INVALID_TRANSITION">;
/** Assignment: closed -> published. Generated from its lifecycle; the area decides inputs and errors. */
@command @requiresBond("CLASSROOM", #["teacher"])
op assignment_reopen(id: Id): Assignment | NotFound | Problem<"INVALID_TRANSITION">;
/** A student's answer to an assignment. The student is its author. Owner: institution. */
model Submission {
  id: Id;
  assignmentId: Id;
  studentId: Id;
  submittedAt: offsetDateTime;
  answer: string;
}
