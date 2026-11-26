// gurudevi_case
package fromlinkml

import "time"

@jsonschema(schema="https://json-schema.org/draft/2019-09/schema")
@jsonschema(id="https://gurudevi.lk/ontology")

// Authority
//
// A power a bond grants (mark, enrol, invite...). Never outlives
// the bond that grants it.
#Authority: close({
	granted_by!: string
	id!:         string
	power!:      #Power

	// When Gurudevi learned it (transaction time).
	recorded_at!: time.Time

	// When it became true in the world (valid time).
	valid_from!: time.Time

	// When it stopped being true in the world. Empty means still
	// true.
	valid_to?: null | time.Time
})

// Bond
//
// How a person joins an institution in one capacity. A relator;
// it exists only while both sides do.
#Bond: close({
	capacity!:    #Capacity
	id!:          string
	institution!: string
	person!:      string

	// When Gurudevi learned it (transaction time).
	recorded_at!: time.Time
	state!:       #BondState

	// When it became true in the world (valid time).
	valid_from!: time.Time

	// When it stopped being true in the world. Empty means still
	// true.
	valid_to?: null | time.Time
})

// BondState
#BondState: "invited" | "active" | "suspended" | "ended"

// Capacity
#Capacity: "student" | "teacher" | "principal" | "guardian" | "founder"

// Enrollment
//
// A bond in the student capacity, with a grade and year.
#Enrollment: close({
	academic_year?: null | int
	capacity!:      #Capacity
	grade?:         null | int & <=13 & >=1
	id!:            string
	institution!:   string
	person!:        string

	// When Gurudevi learned it (transaction time).
	recorded_at!: time.Time
	state!:       #BondState

	// When it became true in the world (valid time).
	valid_from!: time.Time

	// When it stopped being true in the world. Empty means still
	// true.
	valid_to?: null | time.Time
})

// Institution
//
// A school, tuition institute or other organisation people bond
// with.
#Institution: close({
	id!:   string
	name!: string
})

// Person
//
// One human, one account for a whole life.
#Person: close({
	display_name!: string
	id!:           string
})

// Power
#Power: "mark" | "enrol" | "invite" | "view_reports"
...
