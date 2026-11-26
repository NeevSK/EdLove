import "./decorators.js";
namespace Gurudevi;

/** Reads facts; changes nothing. */
extern dec query(target: Reflection.Operation);
/** Changes facts. */
extern dec command(target: Reflection.Operation);
/** Who may: a person holding an active bond in one of these capacities on the entity. */
extern dec requiresBond(target: Reflection.Operation, entity: valueof string, capacities: valueof string[]);
/** An agent acting for the person may call it ("run") or only prepare it for approval ("propose"). */
extern dec delegable(target: Reflection.Operation, mode: valueof "run" | "propose");
/** The phone may do it first and sync later. */
extern dec offline(target: Reflection.Operation);
/** Takes an idempotency key; the same key returns the first result. */
extern dec idempotent(target: Reflection.Operation);

@error model Problem<Code extends string> { code: Code; message?: string; }
alias NotFound = Problem<"NOT_FOUND">;
alias Conflict = Problem<"CONFLICT">;

@format("uuid") scalar Id extends string;
/** Exact decimal carried as text, e.g. "87.50". */
@pattern("^-?[0-9]+(\\.[0-9]{1,4})?$") scalar Decimal extends string;
/** A list page; an empty list is []. */
model Page<T> { items: T[]; nextCursor?: string; }
