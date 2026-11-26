// In-memory domain shared by every approach. Call reset() before each test.
export type AttendanceStatus = 'present' | 'absent' | 'late';
export type Relationship =
  | { kind: 'parent' }
  | { kind: 'legal_guardian'; courtOrderRef: string }
  | { kind: 'other'; description: string };

export const db = {
  submissions: new Map<string, { score: string; feedback: string | null }>(),
  assignments: new Map<string, Array<{ id: string; classroomId: string; title: string; dueAt: string | null; maxScore: string }>>(),
  sessions: new Map<string, { open: boolean; students: string[]; marks: Map<string, { status: AttendanceStatus; note: string | null }> }>(),
  invoices: new Map<string, { total: string; refunded: string }>(),
  refundsByKey: new Map<string, { refundId: string; invoiceId: string; amount: string; remaining: string }>(),
  people: new Map<string, { kind: 'student' | 'guardian'; locked?: boolean; legalName: string; preferredName: string | null; phone: string | null }>(),
  guardianLinks: new Map<string, { linkId: string; studentId: string; guardianId: string; relationship: Relationship }>(),
  seq: 0,
};

export function nextId(prefix: string) {
  db.seq += 1;
  return `${prefix}_${db.seq}`;
}

export function reset() {
  db.seq = 0;
  db.submissions = new Map([['s1', { score: '7.50', feedback: 'good' }]]);
  db.assignments = new Map([['c1', []], ['c2', [{ id: 'a1', classroomId: 'c2', title: 'Essay', dueAt: null, maxScore: '10.00' }]]]);
  db.sessions = new Map([
    ['sess1', { open: true, students: ['st1', 'st2', 'st3'], marks: new Map([['st1', { status: 'absent', note: 'sick' }]]) }],
    ['sess2', { open: false, students: ['st1'], marks: new Map() }],
  ]);
  db.invoices = new Map([['inv1', { total: '0.3000', refunded: '0.0000' }], ['inv2', { total: '1000.0000', refunded: '0.0000' }]]);
  db.refundsByKey = new Map();
  db.people = new Map([
    ['st1', { kind: 'student', legalName: 'Asha', preferredName: null, phone: null }],
    ['st2', { kind: 'student', legalName: 'Binu', preferredName: null, phone: null }],
    ['st3', { kind: 'student', locked: true, legalName: 'Chathu', preferredName: null, phone: null }],
    ['g1', { kind: 'guardian', legalName: 'Dilani', preferredName: null, phone: null }],
    ['g2', { kind: 'guardian', legalName: 'Eranga', preferredName: null, phone: null }],
  ]);
  db.guardianLinks = new Map([['st2:g2', { linkId: 'link_0', studentId: 'st2', guardianId: 'g2', relationship: { kind: 'parent' } }]]);
}
reset();
