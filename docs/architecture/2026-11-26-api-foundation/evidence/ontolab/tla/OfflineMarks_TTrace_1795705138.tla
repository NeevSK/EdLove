---- MODULE OfflineMarks_TTrace_1795705138 ----
EXTENDS Sequences, TLCExt, OfflineMarks, Toolbox, Naturals, TLC

_expression ==
    LET OfflineMarks_TEExpression == INSTANCE OfflineMarks_TEExpression
    IN OfflineMarks_TEExpression!expression
----

_trace ==
    LET OfflineMarks_TETrace == INSTANCE OfflineMarks_TETrace
    IN OfflineMarks_TETrace!trace
----

_inv ==
    ~(
        TLCGet("level") = Len(_TETrace)
        /\
        bondEnd = (1)
        /\
        rejected = ({0})
        /\
        accepted = ({})
        /\
        clock = (1)
        /\
        outbox = ({})
    )
----

_init ==
    /\ rejected = _TETrace[1].rejected
    /\ outbox = _TETrace[1].outbox
    /\ accepted = _TETrace[1].accepted
    /\ bondEnd = _TETrace[1].bondEnd
    /\ clock = _TETrace[1].clock
----

_next ==
    /\ \E i,j \in DOMAIN _TETrace:
        /\ \/ /\ j = i + 1
              /\ i = TLCGet("level")
        /\ rejected  = _TETrace[i].rejected
        /\ rejected' = _TETrace[j].rejected
        /\ outbox  = _TETrace[i].outbox
        /\ outbox' = _TETrace[j].outbox
        /\ accepted  = _TETrace[i].accepted
        /\ accepted' = _TETrace[j].accepted
        /\ bondEnd  = _TETrace[i].bondEnd
        /\ bondEnd' = _TETrace[j].bondEnd
        /\ clock  = _TETrace[i].clock
        /\ clock' = _TETrace[j].clock

\* Uncomment the ASSUME below to write the states of the error trace
\* to the given file in Json format. Note that you can pass any tuple
\* to `JsonSerialize`. For example, a sub-sequence of _TETrace.
    \* ASSUME
    \*     LET J == INSTANCE Json
    \*         IN J!JsonSerialize("OfflineMarks_TTrace_1795705138.json", _TETrace)

=============================================================================

 Note that you can extract this module `OfflineMarks_TEExpression`
  to a dedicated file to reuse `expression` (the module in the 
  dedicated `OfflineMarks_TEExpression.tla` file takes precedence 
  over the module `OfflineMarks_TEExpression` below).

---- MODULE OfflineMarks_TEExpression ----
EXTENDS Sequences, TLCExt, OfflineMarks, Toolbox, Naturals, TLC

expression == 
    [
        \* To hide variables of the `OfflineMarks` spec from the error trace,
        \* remove the variables below.  The trace will be written in the order
        \* of the fields of this record.
        rejected |-> rejected
        ,outbox |-> outbox
        ,accepted |-> accepted
        ,bondEnd |-> bondEnd
        ,clock |-> clock
        
        \* Put additional constant-, state-, and action-level expressions here:
        \* ,_stateNumber |-> _TEPosition
        \* ,_rejectedUnchanged |-> rejected = rejected'
        
        \* Format the `rejected` variable as Json value.
        \* ,_rejectedJson |->
        \*     LET J == INSTANCE Json
        \*     IN J!ToJson(rejected)
        
        \* Lastly, you may build expressions over arbitrary sets of states by
        \* leveraging the _TETrace operator.  For example, this is how to
        \* count the number of times a spec variable changed up to the current
        \* state in the trace.
        \* ,_rejectedModCount |->
        \*     LET F[s \in DOMAIN _TETrace] ==
        \*         IF s = 1 THEN 0
        \*         ELSE IF _TETrace[s].rejected # _TETrace[s-1].rejected
        \*             THEN 1 + F[s-1] ELSE F[s-1]
        \*     IN F[_TEPosition - 1]
    ]

=============================================================================



Parsing and semantic processing can take forever if the trace below is long.
 In this case, it is advised to uncomment the module below to deserialize the
 trace from a generated binary file.

\*
\*---- MODULE OfflineMarks_TETrace ----
\*EXTENDS IOUtils, OfflineMarks, TLC
\*
\*trace == IODeserialize("OfflineMarks_TTrace_1795705138.bin", TRUE)
\*
\*=============================================================================
\*

---- MODULE OfflineMarks_TETrace ----
EXTENDS OfflineMarks, TLC

trace == 
    <<
    ([bondEnd |-> 4,rejected |-> {},accepted |-> {},clock |-> 0,outbox |-> {}]),
    ([bondEnd |-> 4,rejected |-> {},accepted |-> {},clock |-> 0,outbox |-> {0}]),
    ([bondEnd |-> 1,rejected |-> {},accepted |-> {},clock |-> 1,outbox |-> {0}]),
    ([bondEnd |-> 1,rejected |-> {0},accepted |-> {},clock |-> 1,outbox |-> {}])
    >>
----


=============================================================================

---- CONFIG OfflineMarks_TTrace_1795705138 ----
CONSTANTS
    Policy = "check_now"
    MaxT = 3

INVARIANT
    _inv

CHECK_DEADLOCK
    \* CHECK_DEADLOCK off because of PROPERTY or INVARIANT above.
    FALSE

INIT
    _init

NEXT
    _next

CONSTANT
    _TETrace <- _trace

ALIAS
    _expression
=============================================================================
\* Generated on Thu Nov 26 14:58:59 UTC 2026