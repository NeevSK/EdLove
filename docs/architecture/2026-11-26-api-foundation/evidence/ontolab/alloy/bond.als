module gurudevi
-- Shared case: Person, Institution, Bond (relator), Enrollment, Authority.
abstract sig Capacity {}
one sig Student, Teacher, Principal extends Capacity {}
abstract sig Power {}
one sig Mark, Enrol extends Power {}

sig Person {}
sig Institution {}

sig Bond {
  person: one Person,
  institution: one Institution,
  capacity: one Capacity
}
var sig Active in Bond {}          -- ontogeny: which bonds are active now
sig Authority { grantedBy: one Bond, power: one Power }
var sig Held in Authority {}       -- which authorities are held now

-- which capacity may grant which power
fun grants: Capacity -> Power { Teacher -> Mark + Principal -> Enrol }

-- one active bond per person, institution and capacity
fact uniqueActive { always all disj b1, b2: Active |
  not (b1.person = b2.person and b1.institution = b2.institution and b1.capacity = b2.capacity) }

fact init { no Active and no Held }

pred accept[b: Bond] { b not in Active and Active' = Active + b and Held' = Held }
pred grant[a: Authority] {
  a not in Held and a.grantedBy in Active and a.power in a.grantedBy.capacity.grants
  Held' = Held + a and Active' = Active }
pred revoke[a: Authority] { a in Held and Held' = Held - a and Active' = Active }

-- BUGGY end: forgets the authorities the bond granted
pred endBuggy[b: Bond] { b in Active and Active' = Active - b and Held' = Held }
-- FIXED end: authorities fall with their bond (cascade)
pred endFixed[b: Bond] { b in Active and Active' = Active - b and Held' = Held - grantedBy.b }
pred stutter { Active' = Active and Held' = Held }

pred buggy { always (stutter or (some b: Bond | accept[b] or endBuggy[b]) or (some a: Authority | grant[a] or revoke[a])) }
pred fixed { always (stutter or (some b: Bond | accept[b] or endFixed[b]) or (some a: Authority | grant[a] or revoke[a])) }

-- THE question: can authority survive after the bond granting it has ended?
assert NoOrphanAuthority { always Held.grantedBy in Active }
assert OnlyAllowedPowers { always all a: Held | a.power in a.grantedBy.capacity.grants }
assert StudentsNeverMark { always no a: Held | a.grantedBy.capacity = Student and a.power = Mark }

check BuggyOrphan { buggy implies always Held.grantedBy in Active } for 3 but 6 steps
check FixedOrphan { fixed implies always Held.grantedBy in Active } for 4 but 10 steps
check FixedPowers { fixed implies always all a: Held | a.power in a.grantedBy.capacity.grants } for 4 but 10 steps
check FixedStudents { fixed implies always no a: Held | a.grantedBy.capacity = Student and a.power = Mark } for 4 but 10 steps
-- liveness-ish sanity: a teacher can actually get to mark
run CanMark { fixed and (eventually (some a: Held | a.power = Mark)) } for 3 but 6 steps
