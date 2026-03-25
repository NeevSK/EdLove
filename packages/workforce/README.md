# @repo/workforce

## Purpose
`@repo/workforce` is the future non-academic and job-structure domain for school operations. It exists so Gurudevi can support a real Sri Lankan school as an operational organism, not only as a set of classrooms and principals.

This package is for the parts of school life that are not primarily pedagogy:
- office staff
- finance office
- librarian
- lab assistant
- maintenance
- transport
- canteen
- nurse
- security
- duty structures, reporting lines, and assignment models

## Domain Lens
If `people` is the human layer in general, `workforce` is the operational employment and job-structure layer beyond academic teaching roles.

Philosophy to engineering:
- `Policentric`: non-academic operations deserve their own domain, not a leftover corner of admin or people
- `Holarchic`: workforce sits inside the school institution but remains distinct from classroom pedagogy and generic human identity
- `Cybernetic`: operational duties, service reliability, and support loops belong where operational correction can happen
- `Autopoietic`: workforce should eventually defend its own invariants around job family, assignment, and reporting structure
- `Impedance matching`: institutional web tooling may be richer here later, but it should build on shared contracts and still respect mobile-safe foundations

## Owns
- future job-family modeling for non-academic school operations
- workforce positions, assignments, duty structures, and reporting lines
- non-academic staffing structures for operations, finance, wellbeing support, facilities, transport, and food service
- future service-oriented operational workflows that are neither pedagogy nor generic identity

## Does Not Own
- teacher pedagogy, student learning, assignments, or classroom attendance
- principal governance shell and institutional approval/reporting shell
- generic people directory and membership foundations
- platform-wide contracts and capability language from `@repo/core`

## Collaborates With
- `@repo/core`
  - workforce should build on shared role, tenancy, scope, and capability contracts
- `@repo/people`
  - people should remain the generic human identity and membership foundation
  - workforce should extend people for job-system depth, not replace it
- `@repo/admin`
  - admin may later host governance views over workforce operations
  - workforce should still own the underlying operational job structures

## Typical Examples
- assigning a lab assistant to support science rooms across sections
- defining an office staff reporting line or finance officer role
- tracking future operational duty structures for transport, canteen, or maintenance
- modeling school service positions that are not teacher/student/principal pedagogy flows

## Current Reality / Boundary Drift
This package is intentionally scaffolded and not yet fully active.

Grounded reality:
- current implementation is minimal and mostly exposes position/assignment types
- many real workforce concerns are still either unimplemented or temporarily implied through `people` and `admin`
- this is expected at the current stage of the product

Important note:
- the README should be treated as a forward boundary contract
- it documents where non-academic operational concerns should go as the platform expands

## Future Direction
- grow `workforce` into the home for non-academic school operations
- avoid stuffing office, finance, maintenance, and service job logic into `people` or `admin`
- use `people` for identity and membership, `admin` for institutional orchestration, and `workforce` for operational role-system depth
- keep the package intentionally narrow at first, then deepen it when real product flows arrive

## Rules for Contributors
- If this is about non-academic operational staffing, it likely belongs here.
- If this is about a generic human identity or school membership, it belongs in `@repo/people`.
- If this is about institutional governance or official reporting, it belongs in `@repo/admin`.
- If this is about teaching, learning, or classroom activity, it belongs in `@repo/classroom`.
- Build on `PlatformRole`, `SchoolRole`, `WorkRole`, `Membership`, `TenantContext`, `TenantKind`, `ScopeRef`, and capability APIs from `@repo/core`.
- Do not use `workforce` as a vague “misc school stuff” bucket.

Decision checklist:
- Is this non-academic operational staffing?
- Is this about a job family, reporting line, assignment, or duty structure rather than a generic person record?
- Would this still exist even if no classroom or lesson were involved?
- Is this extending `people` and `admin`, rather than duplicating them?
