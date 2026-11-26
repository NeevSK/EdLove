const { Project, OntoumlVerification, Ontouml2Gufo } = require('ontouml-js');
const bad = process.argv[2] === 'bad';
const p = new Project({ name: 'Gurudevi case' });
const m = p.createModel({ name: 'gurudevi' });
const Person = m.createKind('Person');
const Institution = m.createKind('Institution');
const Bond = m.createRelator('Bond');
const Enrollment = m.createSubkind('Enrollment'); Enrollment.restrictedTo = ['relator']; m.createGeneralization(Bond, Enrollment);
// roles played by a person only through a bond
const roles = {};
for (const r of ['Student', 'Teacher', 'Principal', 'Guardian']) { roles[r] = m.createRole(r); m.createGeneralization(Person, roles[r]); }
m.createMediationRelation(Enrollment, roles.Student);
m.createMediationRelation(Bond, roles.Teacher);
m.createMediationRelation(Bond, roles.Principal);
if (!bad) m.createMediationRelation(Bond, roles.Guardian);
const Member = m.createRole('MemberInstitution'); m.createGeneralization(Institution, Member);
m.createMediationRelation(Bond, Member);
// phases of a bond (its ontogeny states)
const phases = ['Invited', 'Active', 'Suspended', 'Ended'].map(n => { const c = m.createPhase(n); c.restrictedTo = ['relator']; return c; });
m.createPartitionFromClasses(Bond, phases, 'BondPhase');
// Authority: a power that inheres in the person and depends on the bond (externally dependent mode)
const Authority = m.createExtrinsicMode('Authority');
m.createCharacterizationRelation(Authority, Person);
m.createExternalDependencyRelation(Authority, Bond);
if (bad) { const X = m.createKind('Classroom'); m.createGeneralization(roles.Teacher, X); } // kind under a role: forbidden
const v = new OntoumlVerification(p).run();
console.log(`${bad ? 'BAD' : 'GOOD'} model: ${v.result.length} issue(s)`);
for (const i of v.result) console.log(' -', i.code, '|', i.title || '', '|', (i.description || '').slice(0, 140));
const g = new Ontouml2Gufo(p, { baseIri: 'https://gurudevi.lk/ontology', format: 'Turtle' }); g.run ? g.run() : g.transform();
const issues = g.getIssues(); console.log('gUFO issues:', issues.length); for (const i of issues) console.log('   *', i.code||'', (i.title||i.description||'').slice(0,110));
require('fs').writeFileSync(`case.${bad ? 'bad' : 'good'}.gufo.ttl`, g.owlCode || g.getOutput?.() || '');
