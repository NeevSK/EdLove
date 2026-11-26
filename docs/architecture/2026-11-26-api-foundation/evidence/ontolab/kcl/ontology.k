type Capacity = "student" | "teacher" | "principal" | "guardian" | "founder"
type BondState = "invited" | "active" | "suspended" | "ended"
type Power = "mark" | "enrol" | "invite" | "view_reports"
t = lambda s: str -> int {
    int(s[0:4] + s[5:7] + s[8:10] + s[11:13] + s[14:16] + s[17:19])
}
GRANTS = {teacher = ["mark"], principal = ["enrol", "invite", "view_reports"], founder = ["enrol", "invite"], guardian = ["view_reports"], student = []}

schema Person:
    id: str
    display_name: str
    check:
        len(display_name) > 0

schema Institution:
    id: str
    name: str

schema Bond:
    id: str
    person: Person
    institution: Institution
    capacity: Capacity
    state: BondState
    valid_from: str
    valid_to?: str
    recorded_at: str
    check:
        state != "ended" or valid_to, "An ended bond must say when it ended"
        not valid_to or t(valid_to) > t(valid_from), "valid_to is before valid_from"

schema Enrollment(Bond):
    capacity: Capacity = "student"
    grade: int
    academic_year: int
    check:
        capacity == "student", "An enrollment is always a student bond"
        1 <= grade <= 13, "grade out of range"

schema Authority:
    id: str
    granted_by: Bond
    power: Power
    valid_from: str
    valid_to?: str
    recorded_at: str
    check:
        power in GRANTS[granted_by.capacity], "This capacity cannot grant this power"
        t(valid_from) >= t(granted_by.valid_from), "Authority starts before its bond"
        not granted_by.valid_to or (valid_to and t(valid_to) <= t(granted_by.valid_to)), "Authority outlives the bond that grants it"
