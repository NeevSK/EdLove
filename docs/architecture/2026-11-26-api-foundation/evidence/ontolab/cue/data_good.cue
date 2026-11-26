package gurudevi
persons: nimal: display_name: "Nimal"
persons: sita: display_name: "Sita"
institutions: royal: name: "Royal College"
bonds: b1: {person: "nimal", institution: "royal", capacity: "teacher", state: "ended",
	valid_from: "2024-01-09T18:30:00Z", valid_to: "2025-12-30T18:30:00Z", recorded_at: "2024-01-09T04:30:00Z"}
authorities: a1: {granted_by: "b1", power: "mark", valid_from: "2024-01-09T18:30:00Z", valid_to: "2025-12-30T18:30:00Z", recorded_at: "2024-01-09T04:30:00Z"}
enrollments: e1: {person: "sita", institution: "royal", state: "active", grade: 10, academic_year: 2026,
	valid_from: "2026-01-04T18:30:00Z", recorded_at: "2026-01-05T03:30:00Z"}
