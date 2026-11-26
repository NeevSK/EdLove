---- MODULE OfflineMarks ----
\* A teacher marks offline on a phone; a principal ends the teacher's bond on the server.
\* Marks reach the server later. Which server rule keeps "authority never outlives its bond"
\* without throwing away marks honestly made while the bond was still active?
EXTENDS Naturals, FiniteSets
CONSTANTS Policy, MaxT          \* Policy \in {"trust_device", "check_now", "check_valid_time"}
VARIABLES clock, bondEnd, outbox, accepted, rejected
vars == <<clock, bondEnd, outbox, accepted, rejected>>
NoEnd == MaxT + 1
Init == clock = 0 /\ bondEnd = NoEnd /\ outbox = {} /\ accepted = {} /\ rejected = {}

Tick == clock < MaxT /\ clock' = clock + 1 /\ UNCHANGED <<bondEnd, outbox, accepted, rejected>>
\* principal ends the bond (on the server, now)
EndBond == bondEnd = NoEnd /\ clock < MaxT /\ bondEnd' = clock + 1 /\ clock' = clock + 1 /\ UNCHANGED <<outbox, accepted, rejected>>
\* teacher marks on the phone; the phone does not know whether the bond has ended
Mark == outbox' = outbox \cup {clock} /\ UNCHANGED <<clock, bondEnd, accepted, rejected>>
ActiveAt(t) == t < bondEnd
Allowed(t) == CASE Policy = "trust_device"     -> TRUE
                [] Policy = "check_now"        -> ActiveAt(clock)
                [] Policy = "check_valid_time" -> ActiveAt(t)
\* phone syncs one queued mark
Sync == \E t \in outbox :
          /\ outbox' = outbox \ {t}
          /\ IF Allowed(t) THEN accepted' = accepted \cup {t} /\ UNCHANGED rejected
                           ELSE rejected' = rejected \cup {t} /\ UNCHANGED accepted
          /\ UNCHANGED <<clock, bondEnd>>
Next == Tick \/ EndBond \/ Mark \/ Sync
Spec == Init /\ [][Next]_vars

\* Safety: no accepted mark was made after the bond ended
NoOrphanAuthority == \A t \in accepted : ActiveAt(t)
\* No loss: no mark honestly made while the bond was active is rejected
NoLostWork == \A t \in rejected : ~ActiveAt(t)
====
