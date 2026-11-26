package gurudevi
import "time"

#Capacity: "student" | "teacher" | "principal" | "guardian" | "founder"
#BondState: "invited" | "active" | "suspended" | "ended"
#Power: "mark" | "enrol" | "invite" | "view_reports"
#Instant: string & time.Time

#grants: {
	teacher: ["mark"]
	principal: ["enrol", "invite", "view_reports"]
	founder: ["enrol", "invite"]
	guardian: ["view_reports"]
	student: []
}

persons: [ID=string]: {id: ID, display_name: string & !=""}
institutions: [ID=string]: {id: ID, name: string & !=""}

#Bond: {
	id: string
	person: or([for k, _ in persons {k}])
	institution: or([for k, _ in institutions {k}])
	capacity: #Capacity
	state: #BondState
	valid_from: #Instant
	valid_to?: #Instant & >valid_from
	recorded_at: #Instant
	if state == "ended" {valid_to: #Instant}   // ended must say when
}
bonds: [ID=string]: #Bond & {id: ID}

#Enrollment: {#Bond, capacity: "student", grade: int & >=1 & <=13, academic_year: int}
enrollments: [ID=string]: #Enrollment & {id: ID}

#Authority: {
	id: string
	granted_by: string
	power: #Power
	valid_from: #Instant
	valid_to?: #Instant
	recorded_at: #Instant
}
authorities: [ID=string]: #Authority & {
	id: ID
	granted_by: _
	valid_to?: _
	let B = bonds[granted_by]
	power: or(#grants[B.capacity])          // capacity decides the powers
	valid_from: >=B.valid_from
	if B.valid_to != _|_ {valid_to: <=B.valid_to}
	if B.valid_to != _|_ && valid_to == _|_ {_orphan: "authority has no end but its bond ended" & false}   // never outlives its bond
}
