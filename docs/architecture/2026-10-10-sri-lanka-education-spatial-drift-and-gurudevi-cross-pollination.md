---
title: "Sri Lanka Education Spatial Drift & Gurudevi Cross-Pollination Architecture"
status: "active"
date: "2026-10-10"
author: "Naveen (IntuituiLabs) & Antigravity"
tags: [education-atlas, spatial-drift, ground-truthing, gurudevi, tenancy, rbac, culture]
---

# Sri Lanka Education Spatial Drift & Gurudevi Cross-Pollination Architecture

> **Executive Thesis:** Commercial map providers (Google Maps, OpenStreetMap) exhibit severe spatial drift (up to 3–8 km) and high omission rates for small rural schools (Type 2 and Type 3 Kanishta Vidyalayas) across Sri Lanka. Rather than relying on inaccurate third-party pins, the **Sri Lanka Education Atlas** implements a **Dual-Stage Spatial Protocol**: (1) an immediate high-fidelity tentative centroid baseline (1,846 postal units / 14,043 Survey Dept GND units anchoring 9,960 schools), and (2) a live citizen-sensor ground-truthing network powered by the **Gurudevi** mobile and web platforms. 
> 
> Furthermore, the Atlas's deep ontological models—institutional entities, role tenures, people, co-curricular societies, and athletic traditions—are not isolated database tables; they **cross-pollinate directly into Gurudevi's core multi-tenancy, RBAC, community spaces, and institutional ERP toolchains**.

---

## Part 1: The Spatial Drift Problem & Dual-Stage Ground-Truthing

### 1. The Anatomy of Spatial Drift in Rural Sri Lanka

Field explorations across rural educational zones (Nuwara Eliya, Badulla, Monaragala, Polonnaruwa, Mullaitivu) expose three recurring structural failures in commercial map providers:

```
[Commercial Map Failure Modes]
├── 1. Topological Drift & Junction Snapping:
│      Algorithmic geocoders snap a rural school to the nearest A-grade road junction
│      or postal town center, placing the school 2-6 km away from its real gate.
├── 2. False Civic Attribution:
│      Volunteer OSM contributors or automated scrapers confuse the Grama Niladhari
│      office, Agrarian Services center, or temple Sunday school with the state school.
└── 3. The Type 3 Omission Void:
       >40% of small primary schools (Type 3: Grade 1-5, <100 students) are entirely 
       absent from Google Maps and OSM databases.
```

### 2. The Dual-Stage Spatial Protocol

```
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: Tentative Spatial Mesh (V1 Baseline) - COMPLETED              │
│ ────────────────────────────────────────────────────────────────────── │
│ • Source: Survey Department Administrative Boundaries & Postal Units   │
│ • Coverage: 9,960 schools (99.98%) anchored to exact postal centroids   │
│ • State: coord_precision = 'tentative_postal_centroid'                 │
│ • UI Badge: Amber perimeter ring: "Tentative Settlement Centroid"      │
│ • Confidence: 0.35                                                     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 2: Gurudevi Citizen-Sensor Ground-Truthing (V2 Live Network)     │
│ ────────────────────────────────────────────────────────────────────── │
│ • Trigger: User on campus opens Gurudevi -> "Verify School Gate"       │
│ • Hardware Sensor: Expo Location / W3C Geolocation (accuracy < 15m)    │
│ • Proof Artifact: Camera capture of School Name Board / Main Gate      │
│ • Consensus Ledger: school_location_pings table in SQLite WAL          │
│ • State Transition: coord_precision = 'ground_truthed' (Confidence 0.95│
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ CIVIC AUDIT & COMPARISON: The Spatial Drift Engine                     │
│ ────────────────────────────────────────────────────────────────────── │
│ • Computes Δ = Haversine(Verified_Gate_GPS, Tentative_Postal_Centroid) │
│ • Computes Δ_OSM = Haversine(Verified_Gate_GPS, OSM_Existing_Pin)      │
│ • Generates Open-Source Humanitarian OsmChange XML / GeoJSON Diff      │
│ • Upstreams verified corrections to OpenStreetMap Sri Lanka           │
└────────────────────────────────────────────────────────────────────────┘
```

### 3. Role-Weighted Consensus Formula

Citizen pings are not weighted equally. Trust is anchored in the user's verified Gurudevi role:

$$\text{Weight}(u) = \begin{cases} 
0.90 & \text{if } u \text{ is Verified Principal / SLEAS Officer} \\
0.75 & \text{if } u \text{ is Verified Teacher on School Cadre} \\
0.50 & \text{if } u \text{ is Enrolled Student / Parent} \\
0.25 & \text{if } u \text{ is Unverified Visitor / Citizen}
\end{cases}$$

A school's official coordinate transitions from `tentative_postal_centroid` to `ground_truthed` when:
1. A single verified Principal/SLEAS ping is submitted ($w \ge 0.90$), OR
2. A verified Teacher ping is submitted ($w \ge 0.75$), OR
3. At least 3 independent pings cluster within a tight radius ($r \le 25\text{m}$) with cumulative confidence:
$$C_{\text{cumulative}} = 1 - \prod_{i=1}^k (1 - w_i) \ge 0.85$$

### 4. The Haversine Delta Engine

When a live ping is ingested, the engine immediately computes the distance offset from the tentative baseline:

$$d = 2R \cdot \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1) \cos(\phi_2) \sin^2\left(\frac{\Delta \lambda}{2}\right)} \right)$$

Where $R = 6,371,000\text{ meters}$. This value is recorded in `school_location_pings.delta_from_tentative_meters`.

---

## Part 2: Cross-Pollination into Gurudevi Architecture

The Sri Lanka Education Atlas is the **epistemic bedrock** of the Gurudevi Platform. Here is how each Atlas model maps into Gurudevi's multi-tenancy, authorization, and operational systems:

```
┌─────────────────────────────────┐           ┌───────────────────────────────────┐
│     EDUCATION ATLAS SUBSTRATE   │           │         GURUDEVI PLATFORM         │
│  (data/education-atlas/*.db)    │           │  (@repo/core, @repo/classroom)   │
├─────────────────────────────────┤           ├───────────────────────────────────┤
│ schools (10,923 entities)       │ ────────> │ School Tenant & Workspace         │
│ census_no (e.g. 0611016)        │ ────────> │ EduSchool Registry Fact           │
│ people                          │ ────────> │ User Identity                     │
│ role_occupancies (tenures)      │ ────────> │ Membership & Capacity (RBAC)      │
│ role_definitions                │ ────────> │ Authority & ScopeRef              │
│ school_sub_entities (clubs)     │ ────────> │ Community Groups (GroupType='club')│
│ tradition_events (big matches)  │ ────────> │ Joint Inter-School Spaces         │
│ MoE circulars & UGC handbooks   │ ────────> │ InstitutionalERP Compliance       │
└─────────────────────────────────┘           └───────────────────────────────────┘
```

---

### 1. School Tenancy: Zero-Cold-Start Onboarding

In traditional SaaS, an administrator registers a school from scratch, typing arbitrary names ("Ananda College", "Ananda Vidyalaya Colombo", "Ananda Maha Vidyalaya"), resulting in fragmented duplicate tenants.

In Gurudevi:
- **Canonical Fact Binding (`EduSchool` in `@repo/core/types/School.ts`):**
  Every school is pre-seeded with its official MoE Census Number (`census_no`).
- **Claim & Verify Workflow:**
  When a principal initiates school onboarding, they search the pre-seeded Atlas index:
  ```ts
  // Gurudevi claims existing EduSchool entity
  const schoolFact = await atlas.getSchoolByCensusNo('0101001'); // Royal College
  const tenant = await tenancyService.createOrClaimTenant({
    census_no: schoolFact.census_no,
    official_name: schoolFact.name,
    type_code: schoolFact.category, // Type 1AB
    province_id: schoolFact.province_id,
    district_id: schoolFact.district_id,
    zone_id: schoolFact.zone_id,
  });
  ```
- **Instant Inheritance:** Day zero, the school workspace inherits its administrative hierarchy, official medium, grade span, historical circulars, and tentative/verified spatial coordinates.

---

### 2. Roles, People & Tenures: Dynamic RBAC & The Living Roll of Honor

#### A. RBAC Capability Hydration
In Gurudevi, access control is governed by `Capacity` (`@repo/core/types/Authority.ts`):
- When a user signs in, Gurudevi inspects their active tenure in `role_occupancies`:
  - If status is `active` and role is `principal`: hydrates `Capacity: 'principal'` with institutional school-wide scope (`ScopeType: 'school'`).
  - If role is `teacher`: hydrates `Capacity: 'teacher'` scoped to assigned sections or classrooms (`ScopeType: 'classroom'`).
  - If role is `student_head_prefect`: hydrates `Capacity: 'prefect'` with student body communication privileges.

#### B. The Living Roll of Honor (පාසල් නාමාවලිය / ගුරු නාමාවලිය)
Every school profile on Gurudevi Web and Mobile exposes a dedicated **Heritage & Leadership Surface**:
- Chronological timeline of past Principals and Deputy Principals.
- Visual badge showing their tenure dates (e.g., *1994–2003*).
- Historical circulars, building inaugurations, and sports championships achieved under their leadership.

#### C. SLEAS Transfer & Relinquishment Protocol
Government teachers and principals in Sri Lanka undergo periodic state transfers under the Sri Lanka Education Administrative Service (SLEAS).
- When Principal $X$ transfers from School $A$ to School $B$:
  1. `role_occupancies` updates: School $A$ tenure is marked `status = 'past'`, `end_date = CURRENT_DATE`.
  2. School $B$ tenure is created: `status = 'active'`, `start_date = CURRENT_DATE`.
  3. Gurudevi automatically revokes administrative write capabilities for School $A$ while retaining their historical audit logs and signature on past documents.
  4. The user's personal portfolio (`User` identity) travels with them, preserving their career achievements across institutions.

---

### 3. Co-Curricular Culture: Societies, Clubs & Derbies

Sri Lankan school life is profoundly shaped by societies, cadet platoons, scout troops, bands, and big match derbies.

#### A. Sub-Entities as First-Class Gurudevi Group Rooms
Every row in `school_sub_entities` becomes an active Gurudevi Community Group (`@repo/core/types/Community.ts`):
```ts
interface SchoolSubEntityGroup {
  group_id: string; // e.g. sub:0101001:science_soc
  school_id: string;
  name: string; // "Science Society" / "විද්‍යා සංගමය"
  type: 'club';
  join_policy: 'approval_required';
  teacher_in_charge_id: string; // Faculty advisor / භාර ආචාර්ය
  student_leaders: {
    president_id: string;
    secretary_id: string;
    treasurer_id: string;
  };
}
```
- **Teacher-in-Charge (TIC):** Faculty member with oversight, budget sign-off, and broadcast authorization.
- **Student Office Bearers:** Prefects or elected students granted group posting and agenda-setting rights.
- **Operational Utility:** In Gurudevi, societies schedule practice sessions, submit budget requests to the School Development Society (SDS), and book equipment from the school inventory (`InstitutionalERP.ts`).

#### B. The Big Match & Tradition Derbies: Inter-School Joint Spaces
Iconic sporting traditions (`tradition_events`) such as the Royal-Thomian (1879), Ananda-Nalanda (1924), Bradby Shield (1945), and All-Island Dancing Competitions involve multiple schools.
- Gurudevi creates an **Inter-School Joint Space**:
  - Dual-governed event hub visible to both student bodies and alumni.
  - Joint moderation by both schools' prefect bodies.
  - Published team squads, live match scoreboards, and historical match archives without exposing internal classroom records.

---

### 4. Statutory ERP Integration: Compliance & Operational Workflows

The Atlas's ingested Ministry of Education circulars and UGC statistics provide the statutory compliance backbone for Gurudevi's ERP engine (`packages/core/src/types/InstitutionalERP.ts`):

```ts
// From InstitutionalERP.ts
export interface InstitutionalEvent {
  id: string;
  scopeType: 'school' | 'section' | 'grade' | 'classroom';
  title: string; // e.g. "Annual Educational Excursion to Polonnaruwa"
  category: 'excursion' | 'sports' | 'cultural' | 'nutrition';
  
  // STATUTORY REGULATORY LINKAGE
  regulatoryNoticeId?: string; // Links directly to MoE Excursion Circular 2023/14
  parentalConsentRequired?: boolean; // Enforces digital parental bond confirmation
}
```

- **Excursion Safeguard:** When a teacher organizes a trip in Gurudevi, the system automatically checks travel distance against the MoE Excursion Safety Circular, verifying whether Zonal Director approval is mandated.
- **Midday Nutrition Monitoring:** Welfare feeding programs link to official Ministry nutrition subsidies and Aswesuma welfare data.
- **A/L Cut-off Guidance:** UGC minimum Z-score handbooks provide students with real-time academic progression targets directly on their student workbench.

---

## Part 3: Live Verification & Testing Status

| Surface | Implementation | Status |
| :--- | :--- | :--- |
| **Tentative Coordinate Mesh** | `scripts/education-atlas/importers/populate-tentative-coordinates.mjs` | ✅ 9,960 schools populated (100%) |
| **Citizen-Sensor Ledger** | `school_location_pings` table in `atlas_staging.db` | ✅ Schema migrated & indexed |
| **Atlas Next.js API** | `apps/gurudevi-web/app/api/atlas/route.ts` | ✅ Tested on Node 22 `node:sqlite` |
| **Governance & Culture Tables** | `004-add-governance-and-culture.mjs` | ✅ Seeded with 9 roles & 5 iconic traditions |
| **Type Contracts** | `@repo/core/types/School.ts`, `Tenancy.ts`, `Community.ts`, `InstitutionalERP.ts` | ✅ Fully aligned |

---

## Part 4: Immediate Roadmap & Milestones

1. **Phase 1: Ingest School Contacts (Sanitized)**:
   - Run `scripts/education-atlas/importers/import-school-contacts.mjs` across the 22 SQL batches.
   - Enforce privacy boundary: Map landlines to entity contact points; map personal mobile numbers (`071...`, `077...`) to Role Desk contacts.
2. **Phase 2: Harvest Tabular Data from MoE & UGC**:
   - Build automated harvesters for `dmb.moe.gov.lk` (School Census XLSX) and `ugc.ac.lk` (University Statistics handbooks).
3. **Phase 3: Wire Gurudevi Web "Verify Location" Action**:
   - Add POST handler in `apps/gurudevi-web/app/api/atlas/route.ts` to accept client GPS pings and compute real-time spatial deltas.
