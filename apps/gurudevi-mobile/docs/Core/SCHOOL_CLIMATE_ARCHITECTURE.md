# Architecture: School Climate & Environmental Psychodynamics

**Status**: Draft / Conceptualization  
**Authority**: Gurudevi Platform Governance  
**Focus**: Material vs. Human Dimensions of School Environments

---

## 1. Objective
The goal of this sensing layer is to "re-birth" the context of school environments that has been lost in official data cycles (especially post-COVID). We treat each school not as a static data point, but as a **Socioeconomic Person**—a living organism where material constraints and human dedication interact in a complex dance.

By restoring the "lost memory" of the 2013-era "Difficulty" metrics, we provide teachers and principals with a "Safe Harbor" system that understands their lived reality.

---

## 2. The Duality Model: Material vs. Human

We distinguish between two distinct but intersecting dimensions of a school:

### Dimension A: Material Index ($M$) - The "Ceiling"
This index represents the objective, physical, and logistical constraints of the school. It defines the "Ceiling" of what is possible without extraordinary human effort.

#### Key Variables:
- **Connectivity**: Internet access, WiFi availability, Cellular signal strength (4G/5G).
- **Physical Infra**: Building safety, Science Labs, Computer Labs, Library facilities.
- **Utilities**: Reliable electricity, Clean water supply, Sanitation.
- **Logistics**: Proximity to town, Public transportation frequency, Teacher commute friction.
- **Resources**: Student-Teacher ratios, School Type (1AB, 1C, Type 2, Type 3).

### Dimension B: Human Harmony ($H$) - The "Vibe"
This index represents the "Atmosphere" created by the staff, leadership, and community. It is the "Healing" factor that can transcend material difficulty.

#### Key Variables:
- **Leadership Quality**: Principal dedication, vision, and staff support.
- **Staff Harmony**: Relationship between teachers, communal motivation.
- **Student Joy**: Proxy for school culture and safety.
- **Relational Impedance**: The "friction" or toxicity levels reported in pulses.

---

## 3. Temporal Continuity (Time-Series)

The system is designed for long-term historical tracking. We do not just want to know the "current" score; we want to know the **Story of the School**.

- **The 2013 Baseline**: We ingest legacy Ministry data (Congeniality classification) as $T_0$.
- **Evolution Nodes**: Every 30-90 days, a school's climate is re-calculated based on user enrichment.
- **Narrative Context**: When a score shifts (e.g., Harmony Index drops by 20%), the system requires a "Contextual Reason" (e.g., "Change in Principal," "Facility degradation," "Local community unrest").

---

## 4. Granularity & Data Enrichment

### Registry-First Logic
The sensing layer applies to the **entire `edu_schools` registry** (~10,000 schools), not just the active platform members. This allows the system to remain "Context Aware" even for schools that have not yet joined the Sanctuary.

### User-Led Enrichment
- **Teachers**: Senses the daily "Vibe" and "Harmony."
- **Principals**: Reports on "Infrastructure Transitions" (e.g., "Lab built," "Water restored").
- **Platform**: Automatically periodically fetches external census updates to adjust the Material Index.

---

## 5. Statistical Operationalization

### The Harmony Score ($H$)
$$H = \frac{\sum_{i=1}^n Pulse_i}{n} \times w_{leadership}$$
*Calculated from the rolling average of anonymous teacher pulses, weighted by the perceived quality of leadership.*

### The Material Index ($M$)
$$M = (Infra \times 0.6) + (Connectivity \times 0.3) + (Logistics \times 0.1)$$
*A composite value where 1.0 represents a fully resourced urban school and 0.0 represents a critical support case.*

---

## 6. Privacy & Identity Strategy

We bridge the gap between **Spotlight** (recognition) and **Safe Harbor** (anonymity):
- **Anonymous Pulses**: For reporting friction, leadership issues, or toxic vibes.
- **Identified Voices**: For teachers who want to be recognized for their dedication and "Environmental Healing" contributions.
