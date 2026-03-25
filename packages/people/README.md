# @repo/people

## Purpose
`@repo/people` is the human identity and human-administration domain inside a school. It exists for the person layer of the ecology: who belongs, who is placed where, and which staff-facing human processes are attached to that membership.

This package should describe humans in school context, especially:
- **Institutional Duty (The "Member")**
- Staff presence, attendance, and leave management
- School-wide ecosystem 'Pulse' (health metrics)
- People directory and human-administration
- Memberships and institutional placements
- Teacher/Staff professional identity and self-service
- Guardian-ready human relationship foundations

## Domain Lens
If `classroom` is the learning cell and `admin` is the institutional shell, `people` is the human layer moving through those structures.

Philosophy to engineering:
- `Policentric`: human identity should not be swallowed by classroom or governance packages
- `Holarchic`: a person can exist across school, section, grade, classroom, and work-role scopes
- `Cybernetic`: staff-facing feedback and self-service loops belong near the humans who generate and receive them
- `Autopoietic`: membership and human-process invariants should be protected here, not scattered across screens
- `Impedance matching`: teacher-facing and staff-facing flows may render differently on web/mobile, but their contracts should remain shared

## Owns
- **Institutional Duty**
- Staff presence pulses, check-in/out, and leave operations
- School-wide ecosystem health metrics (School Pulse)
- Directory and human lookup inside a school
- School memberships and professional placements
- Teacher/Staff professional identity surfaces
- Human-facing components that classroom or admin may consume
- Future guardian/person relationship foundations

## Does Not Own
- lessons, assignments, submissions, student pedagogy, or classroom delivery
- institutional governance, hierarchy, official approvals, or school-wide reporting shell
- official forms, letters, and school documents
- deep non-academic job-system modeling for workforce operations
- platform-wide policy contracts that belong in `@repo/core`

## Collaborates With
- `@repo/core`
  - uses shared contracts such as `Membership`, `TenantContext`, `TenantKind`, `PlatformRole`, `SchoolRole`, and `WorkRole`
  - should rely on shared capability checks rather than local authority shortcuts
- `@repo/classroom`
  - classroom may consume people-owned teacher/staff widgets
  - people should not absorb pedagogy itself
- `@repo/admin`
  - admin may orchestrate people information for principals and institutional use
  - official governance still belongs in admin, even when humans are involved
- `@repo/workforce`
  - workforce should later build on people identity and membership foundations
  - workforce should not replace the generic human layer

## Typical Examples
- a teacher opening a personal admin portal for leave and related self-service actions
- a principal viewing staff presence through people-owned staff summaries
- a school directory listing teachers and staff placements
- future guardian linkage foundations for a student record

## Current Reality / Boundary Drift
This package is active, but still maturing.

Examples of current reality:
- `src/staff.ts` already owns staff operations and staff-facing summaries
- `src/feedback.ts` and teacher modal components now hold teacher feedback/admin modal flows that previously leaked through classroom
- `src/components/StudentPulseSection.tsx` lives here today
  - current status: tolerated because it serves principal/student-facing human insight
  - direction: keep reviewing whether each student-facing insight is truly “people” or should return to `classroom` if it becomes clearly pedagogical

Remaining ambiguity to document honestly:
- some staff and principal surfaces are still jointly shaped by `people` and `admin`
- guardian work is not yet a full product domain, only a future-compatible foundation

## Future Direction
- strengthen people as the home for school human identity and staff-facing human processes
- keep extracting human admin concerns out of `classroom`
- prepare for guardian/parent relationships without turning `people` into a grab-bag for all school workflows
- align future `workforce` on top of people identity rather than duplicating it

## Rules for Contributors
- If the main question is “who is this person in the school, where do they belong, and what human process affects them?”, it likely belongs here.
- If the main question is “what is being taught or learned in class?”, it belongs in `@repo/classroom`.
- If the main question is “what is the institution officially governing or approving?”, it belongs in `@repo/admin`.
- If the main question is “what non-academic job or operational duty structure is being modeled?”, it belongs in `@repo/workforce`.
- Reuse `Membership`, `SchoolRole`, `WorkRole`, `TenantContext`, and capability APIs from `@repo/core`.
- Avoid turning teacher/staff UX needs into classroom ownership just because teachers use the classroom tab.

Decision checklist:
- Is this about a person as a human/member/staff identity?
- Is this a staff-facing self-service or human-administration flow?
- Is this describing placement, membership, or person-to-school relationship?
- If it is about teaching/learning or official governance, should another package own it instead?
