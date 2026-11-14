#!/usr/bin/env node

/**
 * Feature Matrix Runner Generator (Light Theme, Omnichannel, Agentic MCP & Full-Stack Seam Discrepancies)
 * 
 * Compiles the single source of truth across:
 * - packages/self/src/features/featureCatalog.ts & selfRegistry.ts
 * - apps/gurudevi-mobile/src/navigation/registries/selfRegistry.ts & workspaceRegistry.ts
 * - apps/gurudevi-web/app/(sanctuary)/self/browserFeatureRegistry.ts
 * - docs/atlas/features.yaml & docs/atlas/capabilities.yaml
 * - Omnichannel (WhatsApp/Telegram) & Agentic MCP function calling interfaces
 * 
 * Features:
 * - Crisp, elegant Light Theme
 * - Triple View Modes:
 *   1. 🎴 Feature Gallery (visual cards)
 *   2. 📊 Spreadsheet Grid (dense multi-space matrix)
 *   3. 🔬 Full-Stack Seam Diagnostics (DB ↔ Schema ↔ API ↔ Client ↔ Discrepancies)
 * - 5 Execution Surfaces:
 *   📱 Mobile, 🏛️ Sanctuary Web, 🌐 Explore Atlas, 💬 Omnichannel (WhatsApp/Telegram), 🤖 AI Assistant
 * - Discrepancy Sentinel:
 *   Flags unmounted REST endpoints, ungated mocks, missing schemas, unwired screens
 * - Auto-persistence to localStorage & Export to CSV/JSON
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// =============================================================================
// 1. DATASET COMPILATION WITH FULL-STACK SEAM & DISCREPANCIES
// =============================================================================

const SELF_FEATURES = [
  {
    id: 'mood_lotus',
    name: 'Mood Lotus',
    emoji: '🪷',
    tab: 'self',
    domain: 'pulse',
    category: 'wellbeing',
    taskType: 'Wellbeing Check-in',
    roles: ['student', 'teacher', 'guardian', 'principal', 'founder', 'admin'],
    isCommon: true,
    roleWeights: { student: 90, teacher: 70, guardian: 80, principal: 50 },
    defaultZone: 'today',
    requiredCapabilities: ['read:InnerPulse'],
    statusExplore: 'wired',
    statusSanctuary: 'working',
    statusMobile: 'fully functional',
    statusOmnichannel: 'wired', // WhatsApp quick 1-5 mood pulse
    statusAgentic: 'wired', // MCP tool: log_mood_checkin
    componentPath: 'packages/self/src/components/MoodLotus.tsx',
    mobileRoute: '/self?feature=mood_lotus',
    apiProcedure: 'self.logMood, self.getMoodHistory [hono-rest / orpc]',
    schemaTable: 'MoodLog @ schema.zmodel:929 (table mood_logs)',
    seamHealth: {
      schema: 'healthy',
      api: 'warning', // Still uses some unmounted REST routes
      client: 'healthy',
      data: 'healthy',
      nav: 'healthy',
    },
    discrepancy: 'REST-UNMOUNTED',
    discrepancyNote: 'Hono REST /self/mood was unmounted in e383ef01; needs migration to self.logMood over typed oRPC.',
    notes: 'Interactive emotional state visualization over time. Native component has touch-responsive petal scaling and lotus unfold animation. Omnichannel WhatsApp text check-in planned via conversational agent.',
  },
  {
    id: 'daily_pulse',
    name: 'Daily Pulse',
    emoji: '⚡',
    tab: 'self',
    domain: 'pulse',
    category: 'wellbeing',
    taskType: 'Energy Sensing',
    roles: ['student', 'teacher', 'guardian', 'principal'],
    isCommon: true,
    roleWeights: { student: 100, teacher: 80, guardian: 60, principal: 40 },
    defaultZone: 'today',
    requiredCapabilities: ['read:InnerPulse'],
    statusExplore: 'have code',
    statusSanctuary: 'wired',
    statusMobile: 'fully functional',
    statusOmnichannel: 'wired',
    statusAgentic: 'working',
    componentPath: 'packages/self/src/components/PulseDashboard.tsx',
    mobileRoute: '/self?feature=daily_pulse',
    apiProcedure: 'self.getTodayMood, self.logMood [orpc]',
    schemaTable: 'MoodLog @ schema.zmodel:929',
    seamHealth: { schema: 'healthy', api: 'healthy', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'SEAM-CLEAN',
    discrepancyNote: 'Clean end-to-end flow with MMKV local cache fallback.',
    notes: 'Transient daily check-in measuring physical and mental energy levels. Adapts UI circadian vibe based on morning, afternoon, or evening phase.',
  },
  {
    id: 'wisdom_seeds',
    name: 'Wisdom Seeds',
    emoji: '🌱',
    tab: 'self',
    domain: 'pulse',
    category: 'wellbeing',
    taskType: 'Mindfulness & Philosophy',
    roles: ['principal', 'teacher', 'guardian', 'student'],
    isCommon: true,
    roleWeights: { principal: 90, teacher: 80, guardian: 70, student: 60 },
    defaultZone: 'today',
    requiredCapabilities: ['read:InnerPulse'],
    statusExplore: 'have code',
    statusSanctuary: 'wired',
    statusMobile: 'fully functional',
    statusOmnichannel: 'working', // Daily WhatsApp broadcast seed
    statusAgentic: 'working',
    componentPath: 'packages/self/src/components/WisdomSeeds.tsx',
    mobileRoute: '/self/wisdom/[id]',
    apiProcedure: 'daily-wisdom API, wisdom.getNotes',
    schemaTable: 'WisdomSeed / ContentSeeds (packages/core/src/api/wisdom)',
    seamHealth: { schema: 'warning', api: 'healthy', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'SCHEMA-PARTIAL',
    discrepancyNote: 'Wisdom notes currently generated via runtime markdown seeds rather than persistent Postgres table.',
    notes: 'Bite-sized aphorisms, educational philosophy, and reflective prompts. Modal presentation in mobile with deep-linked wisdom viewer.',
  },
  {
    id: 'daily_content',
    name: 'Daily Insight',
    emoji: '✨',
    tab: 'self',
    domain: 'pulse',
    category: 'wellbeing',
    taskType: 'Daily Inspiration',
    roles: ['student', 'teacher', 'guardian', 'principal', 'founder', 'admin'],
    isCommon: true,
    roleWeights: { student: 90, teacher: 80, guardian: 75, principal: 65, founder: 60, admin: 50 },
    defaultZone: 'today',
    requiredCapabilities: ['read:InnerPulse'],
    statusExplore: 'have code',
    statusSanctuary: 'wired',
    statusMobile: 'fully functional',
    statusOmnichannel: 'working',
    statusAgentic: 'have code',
    componentPath: 'packages/self/src/components/DailyContentCard.tsx',
    mobileRoute: '/self?feature=daily_content',
    apiProcedure: 'content.getDailyInsight',
    schemaTable: 'ContentFeed / DailyInsight',
    seamHealth: { schema: 'healthy', api: 'healthy', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'SEAM-CLEAN',
    discrepancyNote: 'Clean client card with fallback offline aphorisms.',
    notes: 'Context-attuned daily cards with "Did You Know" educational seeds and circadian greetings from mascot Tutii.',
  },
  {
    id: 'study_rhythm',
    name: 'Study Rhythm',
    emoji: '⏳',
    tab: 'self',
    domain: 'growth',
    category: 'growth',
    taskType: 'Study & Focus',
    roles: ['student', 'guardian'],
    isCommon: false,
    roleWeights: { student: 100, guardian: 70 },
    defaultZone: 'today',
    requiredCapabilities: ['read:StudentDashboard'],
    statusExplore: 'planned',
    statusSanctuary: 'have code',
    statusMobile: 'working',
    statusOmnichannel: 'planned',
    statusAgentic: 'have code',
    componentPath: 'packages/self/src/components/DailyRhythm.tsx',
    mobileRoute: '/self?feature=study_rhythm',
    apiProcedure: 'study.getRhythmSessions',
    schemaTable: 'StudentSession (schema.zmodel)',
    seamHealth: { schema: 'warning', api: 'warning', client: 'healthy', data: 'warning', nav: 'healthy' },
    discrepancy: 'UNGATED-MOCK',
    discrepancyNote: 'Focus timer works locally with React state; server session sync endpoint not yet wired.',
    notes: 'Focus periods and rest intervals tracker ensuring balanced learning pace. Synchronizes with classroom timetable periods.',
  },
  {
    id: 'personal_goals',
    name: 'Personal Goals',
    emoji: '🎯',
    tab: 'self',
    domain: 'growth',
    category: 'growth',
    taskType: 'Self-Tracking',
    roles: ['student', 'guardian', 'teacher'],
    isCommon: false,
    roleWeights: { student: 100, guardian: 60, teacher: 40 },
    defaultZone: 'today',
    requiredCapabilities: ['read:StudentDashboard'],
    statusExplore: 'planned',
    statusSanctuary: 'have code',
    statusMobile: 'working',
    statusOmnichannel: 'planned',
    statusAgentic: 'have code',
    componentPath: 'packages/self/src/components/StudentGoals.tsx',
    mobileRoute: '/self?feature=personal_goals',
    apiProcedure: 'student.getGoals, student.updateGoal',
    schemaTable: 'StudentGoal @ schema.zmodel',
    seamHealth: { schema: 'healthy', api: 'warning', client: 'warning', data: 'warning', nav: 'healthy' },
    discrepancy: 'UI-UNWIRED',
    discrepancyNote: 'Component exists in packages/self, but web atlas flags student-goals as UI-UNWIRED on web.',
    notes: 'Personal quest log for academic and personal intentions. UI un-wired in web atlas, working in mobile with local state.',
  },
  {
    id: 'academic_grades',
    name: 'My Grades',
    emoji: '📜',
    tab: 'self',
    domain: 'growth',
    category: 'growth',
    taskType: 'Academic Progress',
    roles: ['student', 'guardian', 'teacher'],
    isCommon: false,
    roleWeights: { student: 100, guardian: 80, teacher: 50 },
    defaultZone: 'shared',
    requiredCapabilities: ['read:StudentDashboard'],
    statusExplore: 'planned',
    statusSanctuary: 'wired',
    statusMobile: 'working',
    statusOmnichannel: 'wired', // WhatsApp grade card summary
    statusAgentic: 'wired',
    componentPath: 'packages/self/src/components/MyGradesView.tsx',
    mobileRoute: '/self?feature=academic_grades',
    apiProcedure: 'gradebook.getMyGrades [orpc-rpc:served]',
    schemaTable: 'GradeItem, GradeRecord @ schema.zmodel:350',
    seamHealth: { schema: 'healthy', api: 'healthy', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'SEAM-CLEAN',
    discrepancyNote: 'Backed by live gradebook oRPC procedure and ZenStack model.',
    notes: 'Formative mastery view presenting trendlines, qualitative rubric feedback, and competency badges rather than punitive marks.',
  },
  {
    id: 'sleep_tracker',
    name: 'Sleep Tracker',
    emoji: '💤',
    tab: 'self',
    domain: 'care',
    category: 'wellbeing',
    taskType: 'Care & Rest',
    roles: ['student', 'guardian', 'teacher'],
    isCommon: false,
    roleWeights: { student: 80, guardian: 70, teacher: 60 },
    defaultZone: 'today',
    requiredCapabilities: ['read:SelfCare'],
    statusExplore: 'planned',
    statusSanctuary: 'have code',
    statusMobile: 'working',
    statusOmnichannel: 'planned',
    statusAgentic: 'have code',
    componentPath: 'packages/self/src/components/SleepTracker.tsx',
    mobileRoute: '/self?feature=sleep_tracker',
    apiProcedure: 'self.logSleep, self.getSleepHistory',
    schemaTable: 'SleepLog @ schema.zmodel',
    seamHealth: { schema: 'warning', api: 'warning', client: 'healthy', data: 'warning', nav: 'healthy' },
    discrepancy: 'UNGATED-MOCK',
    discrepancyNote: 'Stores logs in local MMKV; backend persistence table pending migration.',
    notes: 'Bedtime and wake time logger with restorative rest score. Preferred execution phase: night.',
  },
  {
    id: 'joy_jar',
    name: 'Joy Jar',
    emoji: '🏺',
    tab: 'self',
    domain: 'care',
    category: 'wellbeing',
    taskType: 'Care & Joy',
    roles: ['student', 'guardian', 'teacher'],
    isCommon: false,
    roleWeights: { student: 90, guardian: 80, teacher: 60 },
    defaultZone: 'today',
    requiredCapabilities: ['read:SelfCare'],
    statusExplore: 'planned',
    statusSanctuary: 'have code',
    statusMobile: 'fully functional',
    statusOmnichannel: 'planned',
    statusAgentic: 'have code',
    componentPath: 'packages/self/src/components/JoyJar.tsx',
    mobileRoute: '/self?feature=joy_jar',
    apiProcedure: 'self.saveJoyMemory, self.getJoyJar',
    schemaTable: 'JoyMemory @ schema.zmodel',
    seamHealth: { schema: 'warning', api: 'warning', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'UNGATED-MOCK',
    discrepancyNote: 'Fully animated shaking glass jar with local persistent notes; backend API not deployed.',
    notes: 'Vessel collecting uplifting school memories, spontaneous laughter, and joyful breakthroughs. Interactive shaking jar animation.',
  },
  {
    id: 'gratitude_glimmers',
    name: 'Gratitude Glimmers',
    emoji: '✨',
    tab: 'self',
    domain: 'care',
    category: 'wellbeing',
    taskType: 'Care & Appreciation',
    roles: ['teacher', 'guardian', 'student'],
    isCommon: false,
    roleWeights: { teacher: 80, guardian: 80, student: 70 },
    defaultZone: 'today',
    requiredCapabilities: ['read:SelfCare'],
    statusExplore: 'planned',
    statusSanctuary: 'have code',
    statusMobile: 'fully functional',
    statusOmnichannel: 'wired',
    statusAgentic: 'have code',
    componentPath: 'packages/self/src/components/GratitudeGlimmers.tsx',
    mobileRoute: '/self?feature=gratitude_glimmers',
    apiProcedure: 'self.recordGlimmer, self.getGlimmers',
    schemaTable: 'GratitudeGlimmer @ schema.zmodel',
    seamHealth: { schema: 'warning', api: 'warning', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'UNGATED-MOCK',
    discrepancyNote: 'Local state capture working; backend persistence pending.',
    notes: 'Micro-gratitude cards capturing brief moments of peace, helpful colleagues, or student growth moments.',
  },
  {
    id: 'fire_journal',
    name: 'Fire Journal',
    emoji: '🔥',
    tab: 'self',
    domain: 'reflection',
    category: 'practice',
    taskType: 'Cathartic Journaling',
    roles: ['teacher', 'student', 'principal', 'guardian'],
    isCommon: true,
    roleWeights: { teacher: 70, student: 60, principal: 60, guardian: 50 },
    defaultZone: 'private',
    requiredCapabilities: ['read:SelfReflection'],
    statusExplore: 'wired',
    statusSanctuary: 'fully functional',
    statusMobile: 'fully functional',
    statusOmnichannel: 'have code',
    statusAgentic: 'wired',
    componentPath: 'packages/self/src/components/FireJournal.tsx',
    mobileRoute: '/self?feature=fire_journal',
    apiProcedure: 'self.burnJournal, self.getJournalHistory [orpc/hono]',
    schemaTable: 'FireJournalEntry @ schema.zmodel:944 (table fire_journal)',
    seamHealth: { schema: 'healthy', api: 'healthy', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'SEAM-CLEAN',
    discrepancyNote: 'Exemplary seam: schema, API procedure, web renderer, and mobile particle animation all operational.',
    notes: 'Zero-trace, cathartic journaling: write frustrations, stress, or worries, then trigger the flame dissolution animation to burn them into smoke.',
  },
  {
    id: 'voice_journal',
    name: 'Voice Journal',
    emoji: '🎙️',
    tab: 'self',
    domain: 'reflection',
    category: 'practice',
    taskType: 'Voice Memo Reflection',
    roles: ['teacher', 'student', 'guardian', 'principal'],
    isCommon: true,
    roleWeights: { teacher: 70, student: 60, guardian: 60, principal: 60 },
    defaultZone: 'private',
    requiredCapabilities: ['read:SelfReflection'],
    statusExplore: 'planned',
    statusSanctuary: 'have code',
    statusMobile: 'working',
    statusOmnichannel: 'wired', // WhatsApp voice note ingest
    statusAgentic: 'wired', // Whisper transcription agent
    componentPath: 'packages/self/src/components/VoiceJournaling.tsx',
    mobileRoute: '/self?feature=voice_journal',
    apiProcedure: 'self.saveVoiceNote, self.getVoiceNotes',
    schemaTable: 'VoiceJournalEntry @ schema.zmodel',
    seamHealth: { schema: 'warning', api: 'warning', client: 'healthy', data: 'warning', nav: 'healthy' },
    discrepancy: 'REST-UNMOUNTED',
    discrepancyNote: 'Audio recorded via Expo AV; backend audio blob upload endpoint not yet connected to Cloudflare R2.',
    notes: 'Spoken reflection tool with waveform visualization, whisper transcription hooks, and private audio archive.',
  },
  {
    id: 'reframe',
    name: 'Thought Reframe (CBT)',
    emoji: '💡',
    tab: 'self',
    domain: 'reflection',
    category: 'practice',
    taskType: 'Cognitive Restructuring',
    roles: ['teacher', 'student', 'guardian', 'principal'],
    isCommon: true,
    roleWeights: { teacher: 70, student: 60, guardian: 60, principal: 60 },
    defaultZone: 'private',
    requiredCapabilities: ['read:SelfReflection'],
    statusExplore: 'have code',
    statusSanctuary: 'have code',
    statusMobile: 'working',
    statusOmnichannel: 'wired', // WhatsApp conversational Socratic reframing
    statusAgentic: 'working', // Agentic CBT trap identifier
    componentPath: 'packages/self/src/components/ReframeWizard.tsx',
    mobileRoute: '/self?feature=reframe',
    apiProcedure: 'self.saveThoughtRecord, self.getThoughtRecords',
    schemaTable: 'ThoughtRecord @ schema.zmodel:958 (table thought_records)',
    seamHealth: { schema: 'healthy', api: 'warning', client: 'healthy', data: 'warning', nav: 'healthy' },
    discrepancy: 'REST-UNMOUNTED',
    discrepancyNote: 'ThoughtRecord model is in schema.zmodel:958, but sanctuary-api endpoints were marked [NO-CLIENT] in atlas.',
    notes: 'Guided CBT thought record: captures automatic negative thoughts, identifies cognitive traps (catastrophizing, all-or-nothing), and formulates balanced reframes.',
  },
  {
    id: 'tomorrow_prep',
    name: 'Tomorrow Prep',
    emoji: '🌅',
    tab: 'self',
    domain: 'reflection',
    category: 'practice',
    taskType: 'Evening Decompression',
    roles: ['teacher', 'student', 'guardian', 'principal'],
    isCommon: true,
    roleWeights: { teacher: 90, student: 70, guardian: 60, principal: 50 },
    defaultZone: 'private',
    requiredCapabilities: ['read:SelfReflection'],
    statusExplore: 'planned',
    statusSanctuary: 'have code',
    statusMobile: 'working',
    statusOmnichannel: 'wired', // Evening WhatsApp ping
    statusAgentic: 'have code',
    componentPath: 'packages/self/src/components/TomorrowPrep.tsx',
    mobileRoute: '/self?feature=tomorrow_prep',
    apiProcedure: 'self.saveTomorrowPlan',
    schemaTable: 'TomorrowPrepPlan @ schema.zmodel',
    seamHealth: { schema: 'warning', api: 'warning', client: 'healthy', data: 'warning', nav: 'healthy' },
    discrepancy: 'UNGATED-MOCK',
    discrepancyNote: 'Local state checklist works; needs sync to tomorrow timetable periods.',
    notes: 'Evening wind-down ritual: closure on today\'s achievements, preparing materials for tomorrow, and mental boundary setting.',
  },
  {
    id: 'daily_rhythm',
    name: 'Daily Rhythm',
    emoji: '⏳',
    tab: 'self',
    domain: 'working',
    category: 'professional',
    taskType: 'Teacher Working Rhythm',
    roles: ['teacher', 'principal'],
    isCommon: false,
    roleWeights: { teacher: 100, principal: 60 },
    defaultZone: 'today',
    requiredCapabilities: ['read:TeacherDashboard'],
    statusExplore: 'have code',
    statusSanctuary: 'wired',
    statusMobile: 'fully functional',
    statusOmnichannel: 'wired', // Morning schedule digest via Telegram
    statusAgentic: 'working',
    componentPath: 'packages/self/src/components/DailyRhythm.tsx',
    mobileRoute: '/self?feature=daily_rhythm',
    apiProcedure: 'timetable.getTodayPeriods [orpc]',
    schemaTable: 'ClassroomPeriod, Timetable @ schema.zmodel',
    seamHealth: { schema: 'healthy', api: 'healthy', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'SEAM-CLEAN',
    discrepancyNote: 'Connected to active timetable periods in school schedule.',
    notes: 'Teacher working rhythm showing upcoming classes, prep blocks, recess duties, and decompression gaps.',
  },
  {
    id: 'reminders',
    name: 'Reminders',
    emoji: '⏰',
    tab: 'self',
    domain: 'working',
    category: 'practice',
    taskType: 'Actionable Notes',
    roles: ['teacher', 'guardian', 'principal'],
    isCommon: false,
    roleWeights: { teacher: 100, guardian: 70, principal: 50 },
    defaultZone: 'private',
    requiredCapabilities: ['read:TeacherDashboard'],
    statusExplore: 'planned',
    statusSanctuary: 'have code',
    statusMobile: 'working',
    statusOmnichannel: 'wired', // Bot reminder dispatch
    statusAgentic: 'wired', // Agent tool: set_reminder
    componentPath: 'packages/self/src/components/RemindersManager.tsx',
    mobileRoute: '/self?feature=reminders',
    apiProcedure: 'self.getReminders, self.createReminder',
    schemaTable: 'UserReminder @ schema.zmodel',
    seamHealth: { schema: 'warning', api: 'warning', client: 'healthy', data: 'warning', nav: 'healthy' },
    discrepancy: 'UNGATED-MOCK',
    discrepancyNote: 'Mobile local notifications active; server push scheduler pending Inngest wiring.',
    notes: 'Personal task manager with smart date-sensing for upcoming classroom events, grading deadlines, and guardian calls.',
  },
  {
    id: 'decisions',
    name: 'Decision Journal',
    emoji: '⚖️',
    tab: 'self',
    domain: 'working',
    category: 'professional',
    taskType: 'Executive Discernment',
    roles: ['principal', 'founder', 'teacher'],
    isCommon: false,
    roleWeights: { principal: 100, founder: 90, teacher: 80 },
    defaultZone: 'private',
    requiredCapabilities: ['read:TeacherDashboard', 'read:PrincipalDashboard'],
    statusExplore: 'wired',
    statusSanctuary: 'fully functional',
    statusMobile: 'fully functional',
    statusOmnichannel: 'planned',
    statusAgentic: 'working', // Agent tool: record_decision
    componentPath: 'packages/self/src/components/DecisionJournalSection.tsx',
    mobileRoute: '/self?feature=decisions',
    apiProcedure: 'journal.createDecision, journal.getDecisions [orpc:served]',
    schemaTable: 'DecisionRecord @ schema.zmodel:987',
    seamHealth: { schema: 'healthy', api: 'healthy', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'SEAM-CLEAN',
    discrepancyNote: 'Verified LIVE in repository atlas with 100% typed oRPC server mount.',
    notes: 'LIVE in repository atlas! Structured documentation of crucial pedagogical & administrative decisions, recording anticipated consequences and review dates.',
  },
  {
    id: 'journey_timeline',
    name: 'Journey Overview',
    emoji: '🧭',
    tab: 'self',
    domain: 'journey',
    category: 'identity',
    taskType: 'Holistic Journey',
    roles: ['teacher', 'student', 'guardian', 'principal', 'founder', 'admin'],
    isCommon: true,
    roleWeights: { teacher: 80, student: 70, guardian: 60, principal: 50, founder: 50, admin: 40 },
    defaultZone: 'today',
    requiredCapabilities: ['read:SelfJourney'],
    statusExplore: 'wired',
    statusSanctuary: 'working',
    statusMobile: 'fully functional',
    statusOmnichannel: 'have code',
    statusAgentic: 'working',
    componentPath: 'packages/self/src/components/BaseSelfView.tsx',
    mobileRoute: '/self?feature=journey_timeline',
    apiProcedure: 'journey.getHistoryEvents [core/hooks]',
    schemaTable: 'JourneyEvent, Bond @ schema.zmodel',
    seamHealth: { schema: 'healthy', api: 'healthy', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'SEAM-CLEAN',
    discrepancyNote: 'Unified longitudinal canvas backed by useJourneyHistory hook in @repo/core.',
    notes: 'Unified longitudinal canvas integrating emotional pulses, journals, academic milestones, and spiritual growth points into a single timeline.',
  },
  {
    id: 'breath_guide',
    name: 'Breath Guide',
    emoji: '🌬️',
    tab: 'self',
    domain: 'care',
    category: 'wellbeing',
    taskType: 'Somatic Regulation',
    roles: ['student', 'teacher', 'guardian', 'principal', 'founder', 'admin'],
    isCommon: true,
    roleWeights: { student: 90, teacher: 90, guardian: 80, principal: 70 },
    defaultZone: 'today',
    requiredCapabilities: ['read:SelfCare'],
    statusExplore: 'wired',
    statusSanctuary: 'fully functional',
    statusMobile: 'fully functional',
    statusOmnichannel: 'planned',
    statusAgentic: 'have code',
    componentPath: 'packages/self/src/components/BreathGuide.tsx',
    mobileRoute: '/self?feature=breath_guide',
    apiProcedure: 'Client somatic animation / zero server dependency',
    schemaTable: 'NA (Client-only tool)',
    seamHealth: { schema: 'healthy', api: 'healthy', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'SEAM-CLEAN',
    discrepancyNote: 'Client-only pure somatic tool, registered in Next.js browserFeatureRegistry.',
    notes: 'Interactive breathing pacing widget supporting Box Breathing (4-4-4-4), 4-7-8 Relaxation, and Balanced Pranayama with rhythmic pulsing visual ring.',
  },
  {
    id: 'privacy_ledger',
    name: 'Privacy Ledger',
    emoji: '🛡️',
    tab: 'self',
    domain: 'journey',
    category: 'identity',
    taskType: 'Data Sovereignty',
    roles: ['student', 'teacher', 'guardian', 'principal', 'founder', 'admin'],
    isCommon: true,
    roleWeights: { student: 90, teacher: 90, guardian: 90, principal: 90, admin: 100 },
    defaultZone: 'today',
    requiredCapabilities: ['read:SelfJourney'],
    statusExplore: 'wired',
    statusSanctuary: 'fully functional',
    statusMobile: 'fully functional',
    statusOmnichannel: 'planned',
    statusAgentic: 'working',
    componentPath: 'packages/self/src/screens/PrivacyLedgerScreen.tsx',
    mobileRoute: '/(tabs)/profile/privacy-ledger',
    apiProcedure: 'privacy.getLedgerEvents [orpc:served]',
    schemaTable: 'PrivacyLedgerEntry @ schema.zmodel:1040',
    seamHealth: { schema: 'healthy', api: 'healthy', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'SEAM-CLEAN',
    discrepancyNote: 'LIVE in repository atlas with immutable cryptographic log.',
    notes: 'Cryptographically verifiable, zero-knowledge audit log showing exactly who accessed what data, consent grants, and revocation history.',
  },
  {
    id: 'ai_assistant',
    name: 'Sanctuary AI Assistant',
    emoji: '🤖',
    tab: 'self',
    domain: 'reflection',
    category: 'practice',
    taskType: 'AI Guidance & Socratic Partner',
    roles: ['teacher', 'student', 'principal'],
    isCommon: false,
    roleWeights: { teacher: 90, principal: 80, student: 70 },
    defaultZone: 'today',
    requiredCapabilities: ['read:SelfReflection'],
    statusExplore: 'planned',
    statusSanctuary: 'wired',
    statusMobile: 'working',
    statusOmnichannel: 'working', // Direct conversational AI bot on WhatsApp
    statusAgentic: 'fully functional', // Native WebMCP / Agentic function calling
    componentPath: 'apps/gurudevi-mobile/app/(tabs)/self/ai-assistant.tsx',
    mobileRoute: '/self/ai-assistant',
    apiProcedure: 'ai.streamAssistantResponse [orpc]',
    schemaTable: 'AIAssistantSession @ schema.zmodel',
    seamHealth: { schema: 'warning', api: 'healthy', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'SCHEMA-PARTIAL',
    discrepancyNote: 'Chat sessions stream via BYOK; long-term session persistence schema is un-migrated.',
    notes: 'BYOK-enabled Socratic study and lesson partner. Directly integrated with @repo/platform-mcp function calling tools.',
  },
  {
    id: 'thuthimal',
    name: 'Thuthimal Gratitude Gifts',
    emoji: '🌸',
    tab: 'self',
    domain: 'growth',
    category: 'growth',
    taskType: 'Gratitude Endorsement',
    roles: ['student', 'teacher', 'guardian'],
    isCommon: true,
    roleWeights: { student: 90, teacher: 90, guardian: 85 },
    defaultZone: 'shared',
    requiredCapabilities: ['read:SelfGrowth'],
    statusExplore: 'wired',
    statusSanctuary: 'fully functional',
    statusMobile: 'fully functional',
    statusOmnichannel: 'wired', // Receive Thuthimal alert on WhatsApp
    statusAgentic: 'working',
    componentPath: 'apps/gurudevi-mobile/app/thuthimal-claim.tsx',
    mobileRoute: '/thuthimal-claim',
    apiProcedure: 'thuthimal.sendGift, thuthimal.claimGift [orpc:served]',
    schemaTable: 'ThuthimalGift @ schema.zmodel',
    seamHealth: { schema: 'healthy', api: 'healthy', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'SEAM-CLEAN',
    discrepancyNote: 'LIVE in repository atlas with deep-linked claim routes.',
    notes: 'Cultural gratitude token system: learners, guardians, and educators send digital lotus flowers and personalized blessings for meaningful help.',
  },
];

const WORKSPACE_FEATURES = [
  {
    id: 'classroom_core',
    name: 'Classroom Hub',
    emoji: '🏫',
    tab: 'workspace',
    domain: 'operations',
    category: 'operations',
    taskType: 'Classroom Operations',
    roles: ['teacher', 'student'],
    isCommon: true,
    roleWeights: { teacher: 100, student: 90 },
    defaultZone: 'today',
    requiredCapabilities: ['read:Classroom'],
    statusExplore: 'wired',
    statusSanctuary: 'working',
    statusMobile: 'fully functional',
    statusOmnichannel: 'have code',
    statusAgentic: 'working',
    componentPath: 'apps/gurudevi-mobile/app/(tabs)/workspace/classroom/index.tsx',
    mobileRoute: '/workspace/classroom',
    apiProcedure: 'classroom.getClassrooms, classroom.getStudents [orpc:served]',
    schemaTable: 'Classroom @ schema.zmodel:235 (table classrooms)',
    seamHealth: { schema: 'healthy', api: 'healthy', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'SEAM-CLEAN',
    discrepancyNote: 'Active classroom queries served over typed oRPC.',
    notes: 'Central nexus for active classrooms: roster inspection, student avatars, join approvals, and teaching session management.',
  },
  {
    id: 'attendance',
    name: 'Daily Attendance',
    emoji: '📋',
    tab: 'workspace',
    domain: 'operations',
    category: 'operations',
    taskType: 'Roll Call Register',
    roles: ['teacher', 'principal', 'guardian'],
    isCommon: true,
    roleWeights: { teacher: 100, principal: 90, guardian: 80 },
    defaultZone: 'today',
    requiredCapabilities: ['manage:Attendance'],
    statusExplore: 'wired',
    statusSanctuary: 'fully functional',
    statusMobile: 'fully functional',
    statusOmnichannel: 'working', // WhatsApp absence alerts to parents
    statusAgentic: 'working', // Agent tool: take_attendance
    componentPath: 'apps/gurudevi-mobile/app/attendance.tsx',
    mobileRoute: '/attendance',
    apiProcedure: 'attendance.recordDaily, attendance.getRegister [orpc:served]',
    schemaTable: 'AttendanceRecord @ schema.zmodel:420 (table attendance_records)',
    seamHealth: { schema: 'healthy', api: 'healthy', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'SEAM-CLEAN',
    discrepancyNote: 'LIVE in repository atlas with PowerSync local-first offline registers.',
    notes: 'LIVE in repository atlas! Offline-first roll call registers, rapid tap status toggles (present/absent/late/excused), and instant PowerSync sync.',
  },
  {
    id: 'gradebook',
    name: 'Gradebook & Grading',
    emoji: '🎓',
    tab: 'workspace',
    domain: 'pedagogy',
    category: 'pedagogy',
    taskType: 'Grading & Rubrics',
    roles: ['teacher', 'student', 'guardian'],
    isCommon: true,
    roleWeights: { teacher: 100, guardian: 80, student: 80 },
    defaultZone: 'shared',
    requiredCapabilities: ['manage:Gradebook'],
    statusExplore: 'wired',
    statusSanctuary: 'working',
    statusMobile: 'fully functional',
    statusOmnichannel: 'wired',
    statusAgentic: 'working',
    componentPath: 'apps/gurudevi-mobile/app/gradebook.tsx',
    mobileRoute: '/gradebook',
    apiProcedure: 'gradebook.recordGrade, gradebook.getGrades [orpc:served]',
    schemaTable: 'GradeItem, GradeRecord @ schema.zmodel:350',
    seamHealth: { schema: 'healthy', api: 'healthy', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'SEAM-CLEAN',
    discrepancyNote: 'Live typed oRPC procedure; supports rubric marks & qualitative notes.',
    notes: 'Rubric-based assessment sheet, formative feedback comments, automated term weighting, and PDF report card publishing.',
  },
  {
    id: 'principal_workspace',
    name: 'Principal Situational Hub',
    emoji: '🏛️',
    tab: 'workspace',
    domain: 'governance',
    category: 'governance',
    taskType: 'Executive Command',
    roles: ['principal'],
    isCommon: false,
    roleWeights: { principal: 100 },
    defaultZone: 'today',
    requiredCapabilities: ['manage:School'],
    statusExplore: 'wired',
    statusSanctuary: 'working',
    statusMobile: 'fully functional',
    statusOmnichannel: 'have code',
    statusAgentic: 'working',
    componentPath: 'apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx',
    mobileRoute: '/workspace/principal',
    apiProcedure: 'admin.getMorningBrief, admin.getHierarchy [orpc:served]',
    schemaTable: 'School, Classroom, Bond @ schema.zmodel',
    seamHealth: { schema: 'healthy', api: 'healthy', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'SEAM-CLEAN',
    discrepancyNote: 'Served over admin oRPC procedures.',
    notes: 'Morning Situational Brief: overnight incidents, staff pulse, attendance anomalies, faculty leave approvals, and campus climate overview.',
  },
  {
    id: 'announcements',
    name: 'Circulars & Announcements',
    emoji: '📢',
    tab: 'workspace',
    domain: 'communications',
    category: 'communications',
    taskType: 'Broadcast Notices',
    roles: ['principal', 'teacher', 'guardian', 'student'],
    isCommon: true,
    roleWeights: { principal: 100, teacher: 90, guardian: 90, student: 80 },
    defaultZone: 'today',
    requiredCapabilities: ['manage:Announcements'],
    statusExplore: 'wired',
    statusSanctuary: 'fully functional',
    statusMobile: 'fully functional',
    statusOmnichannel: 'working', // WhatsApp institutional broadcast channel
    statusAgentic: 'working',
    componentPath: 'apps/gurudevi-web/app/(sanctuary)/workspace/notices',
    mobileRoute: '/(tabs)/notifications',
    apiProcedure: 'announcements.broadcast, announcements.getFeed [orpc:served]',
    schemaTable: 'Announcement, Notification @ schema.zmodel:490',
    seamHealth: { schema: 'healthy', api: 'healthy', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'SEAM-CLEAN',
    discrepancyNote: 'LIVE in repository atlas with read receipt telemetry.',
    notes: 'LIVE in repository atlas! Emergency alerts, administrative notices, and grade-section specific announcements with read receipts.',
  },
  {
    id: 'guardian_workspace',
    name: 'Guardian Sanctuary Bridge',
    emoji: '🏡',
    tab: 'workspace',
    domain: 'family_bridge',
    category: 'family_bridge',
    taskType: 'Home-School Attunement',
    roles: ['guardian'],
    isCommon: false,
    roleWeights: { guardian: 100 },
    defaultZone: 'today',
    requiredCapabilities: ['read:GuardianDashboard'],
    statusExplore: 'wired',
    statusSanctuary: 'working',
    statusMobile: 'fully functional',
    statusOmnichannel: 'working', // Primary WhatsApp parent interface
    statusAgentic: 'working',
    componentPath: 'apps/gurudevi-mobile/app/(tabs)/workspace/guardian.tsx',
    mobileRoute: '/workspace/guardian',
    apiProcedure: 'guardian.getFamilyLearners [orpc:served]',
    schemaTable: 'FamilyBond, GuardianProfile @ schema.zmodel:180',
    seamHealth: { schema: 'healthy', api: 'healthy', client: 'healthy', data: 'healthy', nav: 'healthy' },
    discrepancy: 'SEAM-CLEAN',
    discrepancyNote: 'Multi-learner bridge wired to PowerSync family bonds.',
    notes: 'Parent sanctuary floor: unified children overview, arrival pings, school circulars, fee receipts, and teacher direct messages.',
  },
];

const ALL_FEATURES = [...SELF_FEATURES, ...WORKSPACE_FEATURES];

// =============================================================================
// 2. HTML RUNNER TEMPLATE (LIGHT THEME, 5 SURFACES & FULL-STACK SEAM LENS)
// =============================================================================

function generateHtmlRunner(features) {
  const jsonPayload = JSON.stringify(features, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gurudevi Platform Feature Matrix & Seam Diagnostic Engine</title>
  <style>
    :root {
      --bg-canvas: #F8FAFC;
      --bg-subtle: #F1F5F9;
      --bg-surface: #FFFFFF;
      --bg-card: #FFFFFF;
      --border-subtle: #E2E8F0;
      --border-accent: #CBD5E1;
      
      --text-main: #0F172A;
      --text-muted: #475569;
      --text-dim: #94A3B8;
      
      --accent-emerald: #059669;
      --accent-violet: #7C3AED;
      --accent-amber: #D97706;
      --accent-cyan: #0891B2;
      --accent-rose: #E11D48;
      --accent-indigo: #4F46E5;

      /* Status Colors */
      --status-planned-bg: #F1F5F9;
      --status-planned-text: #475569;
      --status-planned-border: #CBD5E1;

      --status-have-code-bg: #EFF6FF;
      --status-have-code-text: #1D4ED8;
      --status-have-code-border: #BFDBFE;

      --status-wired-bg: #FFFBEB;
      --status-wired-text: #B45309;
      --status-wired-border: #FDE68A;

      --status-working-bg: #ECFEFF;
      --status-working-text: #0E7490;
      --status-working-border: #A5F3FC;

      --status-functional-bg: #ECFDF5;
      --status-functional-text: #047857;
      --status-functional-border: #A7F3D0;
      
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
      --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

      --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-canvas);
      color: var(--text-main);
      font-family: var(--font-family);
      line-height: 1.5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .ambient-glow {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 0; overflow: hidden;
    }
    .glow-orb-1 {
      position: absolute; top: -100px; left: 15%; width: 550px; height: 550px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.07) 0%, transparent 70%);
      filter: blur(80px);
    }
    .glow-orb-2 {
      position: absolute; top: 50px; right: 10%; width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(124, 58, 237, 0.06) 0%, transparent 70%);
      filter: blur(90px);
    }

    .app-container {
      position: relative; z-index: 1;
      width: 100%; max-width: 1720px;
      margin: 0 auto; padding: 24px 32px 60px;
      flex: 1; display: flex; flex-direction: column; gap: 20px;
    }

    header {
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 20px; padding-bottom: 20px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .brand-group { display: flex; align-items: center; gap: 16px; }
    .brand-badge {
      width: 48px; height: 48px; border-radius: 14px;
      background: linear-gradient(135deg, #10B981 0%, #8B5CF6 100%);
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25); color: #fff;
    }
    .brand-titles h1 { font-size: 22px; font-weight: 700; color: var(--text-main); }
    .brand-titles p { font-size: 13px; color: var(--text-muted); }

    .header-controls { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
    .primary-tab-switcher {
      display: flex; align-items: center; gap: 10px;
      background: var(--bg-surface); border: 1px solid var(--border-accent);
      padding: 6px 10px; border-radius: 12px; box-shadow: var(--shadow-sm);
    }
    .tab-label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
    .tab-select-native {
      background: var(--bg-subtle); color: var(--text-main);
      border: 1px solid var(--border-subtle); padding: 7px 14px;
      border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; outline: none;
    }

    .view-mode-toggle {
      display: flex; background: var(--bg-subtle);
      border: 1px solid var(--border-subtle); border-radius: 10px; padding: 3px;
    }
    .view-btn {
      display: flex; align-items: center; gap: 6px; padding: 6px 12px;
      font-size: 12px; font-weight: 600; color: var(--text-muted);
      border-radius: 8px; cursor: pointer; border: none; background: transparent;
      transition: all 0.15s ease;
    }
    .view-btn.active { background: #FFFFFF; color: var(--accent-emerald); box-shadow: var(--shadow-sm); }

    .header-actions { display: flex; gap: 10px; align-items: center; }
    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 14px; font-size: 12px; font-weight: 600;
      border-radius: 8px; cursor: pointer; border: 1px solid transparent; user-select: none;
    }
    .btn-secondary {
      background: var(--bg-surface); color: var(--text-muted);
      border-color: var(--border-subtle); box-shadow: var(--shadow-sm);
    }
    .btn-secondary:hover { background: var(--bg-subtle); color: var(--text-main); }

    /* KPI Summary Cards */
    .kpi-row {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;
    }
    .kpi-card {
      background: var(--bg-card); border: 1px solid var(--border-subtle);
      border-radius: 12px; padding: 14px 18px; box-shadow: var(--shadow-sm);
      display: flex; flex-direction: column; gap: 6px; position: relative; overflow: hidden;
    }
    .kpi-card::before {
      content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
      background: var(--accent-color, var(--accent-emerald));
    }
    .kpi-header {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted);
    }
    .kpi-value-row { display: flex; align-items: baseline; gap: 8px; }
    .kpi-value { font-size: 24px; font-weight: 700; color: var(--text-main); }
    .kpi-subtext { font-size: 12px; color: var(--text-dim); }
    .progress-bar-track {
      width: 100%; height: 5px; background: var(--bg-subtle);
      border-radius: 999px; overflow: hidden; margin-top: 2px;
    }
    .progress-bar-fill {
      height: 100%; background: var(--accent-color, var(--accent-emerald)); border-radius: 999px;
    }

    /* Filter Bar */
    .filter-section {
      background: var(--bg-card); border: 1px solid var(--border-subtle);
      border-radius: 12px; padding: 14px 18px; box-shadow: var(--shadow-sm);
      display: flex; flex-direction: column; gap: 12px;
    }
    .filter-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
    .search-input-wrapper { flex: 1; min-width: 220px; position: relative; }
    .search-input {
      width: 100%; background: var(--bg-subtle); border: 1px solid var(--border-subtle);
      color: var(--text-main); padding: 8px 14px 8px 34px; border-radius: 8px; font-size: 13px; outline: none;
    }
    .search-input:focus { border-color: var(--accent-emerald); background: #FFFFFF; }
    .search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text-dim); font-size: 13px; }

    .filter-item { display: flex; align-items: center; gap: 6px; }
    .filter-label { font-size: 11px; font-weight: 700; color: var(--text-muted); white-space: nowrap; }
    .filter-select {
      background: var(--bg-subtle); border: 1px solid var(--border-subtle);
      color: var(--text-main); padding: 6px 10px; border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer; outline: none;
    }
    .filter-select:focus { border-color: var(--accent-emerald); background: #FFFFFF; }
    .clear-filters-btn { margin-left: auto; font-size: 11px; color: var(--accent-rose); cursor: pointer; background: none; border: none; text-decoration: underline; }

    /* VIEW 1: GALLERY VIEW */
    .gallery-container {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px;
    }
    .feature-card {
      background: var(--bg-card); border: 1px solid var(--border-subtle);
      border-radius: 12px; padding: 18px; box-shadow: var(--shadow-sm);
      display: flex; flex-direction: column; gap: 12px; cursor: pointer;
      transition: all 0.15s ease; position: relative;
    }
    .feature-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: #CBD5E1; }
    .card-top { display: flex; align-items: flex-start; gap: 12px; }
    .card-emoji-box {
      width: 42px; height: 42px; border-radius: 10px; background: var(--bg-subtle);
      border: 1px solid var(--border-subtle); display: flex; align-items: center;
      justify-content: center; font-size: 22px; flex-shrink: 0;
    }
    .card-header-info { flex: 1; overflow: hidden; }
    .card-title { font-size: 14px; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .card-id-badge { font-size: 11px; color: var(--text-dim); font-family: monospace; }
    .card-category-row { display: flex; align-items: center; gap: 6px; }
    .card-roles { display: flex; flex-wrap: wrap; gap: 4px; }

    /* Multi-Space Status Mini-Grid */
    .card-spaces-grid {
      display: grid; grid-template-columns: 1fr; gap: 6px;
      background: var(--bg-subtle); border-radius: 8px; padding: 8px 10px; border: 1px solid var(--border-subtle);
    }
    .space-status-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .space-label { font-size: 11px; font-weight: 600; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }

    .card-footer {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 11px; color: var(--text-dim); border-top: 1px solid var(--border-subtle);
      padding-top: 10px; margin-top: auto;
    }

    /* VIEW 2 & 3: TABLES */
    .table-container {
      background: var(--bg-card); border: 1px solid var(--border-subtle);
      border-radius: 12px; overflow-x: auto; box-shadow: var(--shadow-sm);
    }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; }
    thead th {
      background: var(--bg-subtle); padding: 10px 14px; font-size: 11px; font-weight: 700;
      text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--border-subtle);
      white-space: nowrap; position: sticky; top: 0; z-index: 10;
    }
    tbody tr { border-bottom: 1px solid var(--border-subtle); transition: background-color 0.15s; cursor: pointer; }
    tbody tr:hover { background-color: var(--bg-subtle); }
    tbody td { padding: 10px 14px; vertical-align: middle; }

    .col-feature { display: flex; align-items: center; gap: 10px; min-width: 200px; }
    .feature-emoji {
      font-size: 18px; width: 32px; height: 32px; display: flex; align-items: center;
      justify-content: center; background: var(--bg-subtle); border-radius: 6px;
      border: 1px solid var(--border-subtle); flex-shrink: 0;
    }
    .feature-text h4 { font-size: 13px; font-weight: 600; color: var(--text-main); }
    .feature-text span { font-size: 10px; color: var(--text-dim); font-family: monospace; }

    /* Chips & Badges */
    .chip {
      display: inline-flex; align-items: center; padding: 2px 6px; border-radius: 4px;
      font-size: 10px; font-weight: 600; text-transform: capitalize;
    }
    .chip-wellbeing { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
    .chip-growth { background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; }
    .chip-practice { background: #FFFBEB; color: #B45309; border: 1px solid #FDE68A; }
    .chip-professional { background: #F5F3FF; color: #6D28D9; border: 1px solid #DDD6FE; }
    .chip-identity { background: #ECFEFF; color: #0E7490; border: 1px solid #A5F3FC; }
    .chip-operations { background: #FDF2F8; color: #BE185D; border: 1px solid #FBCFE8; }
    .chip-pedagogy { background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE; }
    .chip-governance { background: #FFF1F2; color: #BE123C; border: 1px solid #FECDD3; }

    .role-badge {
      font-size: 10px; font-weight: 600; padding: 1px 5px; border-radius: 4px;
      background: #F1F5F9; color: #475569; border: 1px solid #E2E8F0;
    }
    .role-badge.common { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }

    /* Discrepancy Badges */
    .badge-discrepancy {
      display: inline-flex; align-items: center; gap: 4px; padding: 3px 7px;
      border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase;
    }
    .disc-clean { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
    .disc-warning { background: #FFFBEB; color: #B45309; border: 1px solid #FDE68A; }
    .disc-error { background: #FFF1F2; color: #BE123C; border: 1px solid #FECDD3; }

    /* Status Select Pills */
    .status-select-pill {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      padding: 4px 6px; border-radius: 6px; cursor: pointer; outline: none; border: 1px solid transparent;
      width: 110px;
    }
    .status-planned { background: var(--status-planned-bg); color: var(--status-planned-text); border-color: var(--status-planned-border); }
    .status-have-code { background: var(--status-have-code-bg); color: var(--status-have-code-text); border-color: var(--status-have-code-border); }
    .status-wired { background: var(--status-wired-bg); color: var(--status-wired-text); border-color: var(--status-wired-border); }
    .status-working { background: var(--status-working-bg); color: var(--status-working-text); border-color: var(--status-working-border); }
    .status-fully-functional { background: var(--status-functional-bg); color: var(--status-functional-text); border-color: var(--status-functional-border); }

    .code-cell { font-family: monospace; font-size: 11px; color: #1D4ED8; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* Drawer */
    .drawer-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(2px);
      z-index: 100; display: none; justify-content: flex-end;
    }
    .drawer-overlay.open { display: flex; }
    .drawer {
      width: 100%; max-width: 620px; height: 100%; background: #FFFFFF;
      border-left: 1px solid var(--border-subtle); padding: 28px;
      overflow-y: auto; display: flex; flex-direction: column; gap: 18px; box-shadow: var(--shadow-xl);
    }
    .drawer-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-subtle); padding-bottom: 14px; }
    .drawer-close { background: none; border: none; color: var(--text-muted); font-size: 24px; cursor: pointer; }
    .drawer-section { display: flex; flex-direction: column; gap: 6px; }
    .drawer-section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-emerald); }
    .drawer-code-block { background: #F8FAFC; border: 1px solid var(--border-subtle); padding: 10px 12px; border-radius: 6px; font-family: monospace; font-size: 11px; color: #334155; word-break: break-all; }
    
    .drawer-surfaces-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 8px;
    }
    .drawer-surface-box {
      background: var(--bg-subtle); border: 1px solid var(--border-subtle);
      padding: 8px; border-radius: 6px; display: flex; flex-direction: column; gap: 4px;
    }
    .drawer-surface-label { font-size: 10px; font-weight: 700; color: var(--text-muted); }

    .notes-textarea {
      width: 100%; min-height: 80px; background: #F8FAFC; border: 1px solid var(--border-subtle);
      color: var(--text-main); padding: 10px; border-radius: 6px; font-family: inherit; font-size: 12px; outline: none;
    }
    .toast {
      position: fixed; bottom: 24px; right: 24px; background: #059669; color: #fff;
      padding: 10px 18px; border-radius: 8px; font-size: 12px; font-weight: 600; z-index: 200; display: none;
    }
  </style>
</head>
<body>
  <div class="ambient-glow">
    <div class="glow-orb-1"></div>
    <div class="glow-orb-2"></div>
  </div>

  <div class="app-container">
    <header>
      <div class="brand-group">
        <div class="brand-badge">⚡</div>
        <div class="brand-titles">
          <h1>Gurudevi Platform Feature Matrix & Seam Sentinel</h1>
          <p>End-to-End Seams: DB ↔ Schema ↔ API ↔ Mobile ↔ Web ↔ Omnichannel ↔ Agentic MCP</p>
        </div>
      </div>

      <div class="header-controls">
        <div class="primary-tab-switcher">
          <span class="tab-label">Domain:</span>
          <select id="mainTabSelect" class="tab-select-native" onchange="switchDomain(this.value)">
            <option value="self">🧘 Self (Personal Sanctuary & Sadhana)</option>
            <option value="workspace">🏫 Workspace (Classroom & Operations)</option>
            <option value="all">🌐 All Monorepo Domains</option>
          </select>
        </div>

        <div class="view-mode-toggle">
          <button id="viewBtnGallery" class="view-btn active" onclick="switchView('gallery')">
            🎴 Gallery
          </button>
          <button id="viewBtnTable" class="view-btn" onclick="switchView('table')">
            📊 5-Surfaces Grid
          </button>
          <button id="viewBtnDiagnostics" class="view-btn" onclick="switchView('diagnostics')">
            🔬 Seam Diagnostics
          </button>
        </div>
      </div>

      <div class="header-actions">
        <button class="btn btn-secondary" onclick="exportCSV()">📥 CSV</button>
        <button class="btn btn-secondary" onclick="exportJSON()">💾 JSON</button>
        <button class="btn btn-secondary" onclick="resetToBaseline()">↺ Baseline</button>
      </div>
    </header>

    <!-- KPI Summary Row -->
    <div class="kpi-row">
      <div class="kpi-card" style="--accent-color: var(--accent-emerald)">
        <div class="kpi-header">
          <span>Total Features</span>
          <span id="kpiDomainTag">Self</span>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-value" id="kpiTotalCount">0</span>
          <span class="kpi-subtext">in view</span>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" id="kpiTotalBar" style="width: 100%"></div>
        </div>
      </div>

      <div class="kpi-card" style="--accent-color: var(--accent-emerald)">
        <div class="kpi-header">
          <span>📱 Mobile Status</span>
          <span id="kpiMobilePercent">0%</span>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-value" id="kpiMobileReady">0</span>
          <span class="kpi-subtext">functional</span>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" id="kpiMobileBar" style="width: 0%"></div>
        </div>
      </div>

      <div class="kpi-card" style="--accent-color: var(--accent-violet)">
        <div class="kpi-header">
          <span>🏛️ Sanctuary Web</span>
          <span id="kpiSanctuaryPercent">0%</span>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-value" id="kpiSanctuaryReady">0</span>
          <span class="kpi-subtext">server/web</span>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" id="kpiSanctuaryBar" style="width: 0%; background: var(--accent-violet)"></div>
        </div>
      </div>

      <div class="kpi-card" style="--accent-color: var(--accent-cyan)">
        <div class="kpi-header">
          <span>💬 WhatsApp / Omnichannel</span>
          <span id="kpiOmniPercent">0%</span>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-value" id="kpiOmniReady">0</span>
          <span class="kpi-subtext">conversational</span>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" id="kpiOmniBar" style="width: 0%; background: var(--accent-cyan)"></div>
        </div>
      </div>

      <div class="kpi-card" style="--accent-color: var(--accent-indigo)">
        <div class="kpi-header">
          <span>🤖 Sanctuary AI & Agents</span>
          <span id="kpiAgentPercent">0%</span>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-value" id="kpiAgentReady">0</span>
          <span class="kpi-subtext">function call</span>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" id="kpiAgentBar" style="width: 0%; background: var(--accent-indigo)"></div>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input type="text" id="searchInput" class="search-input" placeholder="Search features, components, schemas, APIs, notes..." oninput="applyFilters()">
        </div>

        <div class="filter-item">
          <span class="filter-label">Role:</span>
          <select id="roleFilter" class="filter-select" onchange="applyFilters()">
            <option value="all">All Roles</option>
            <option value="common">⭐ Common / Universal</option>
            <option value="student">🎓 Student</option>
            <option value="teacher">👩‍🏫 Teacher</option>
            <option value="principal">🏛️ Principal</option>
            <option value="guardian">🏡 Guardian</option>
            <option value="founder">💡 Founder</option>
            <option value="admin">⚙️ Admin</option>
          </select>
        </div>

        <div class="filter-item">
          <span class="filter-label">Task Type:</span>
          <select id="categoryFilter" class="filter-select" onchange="applyFilters()">
            <option value="all">All Task Types</option>
            <option value="wellbeing">Wellbeing</option>
            <option value="growth">Growth</option>
            <option value="practice">Practice</option>
            <option value="professional">Professional / Working</option>
            <option value="identity">Identity</option>
            <option value="operations">Operations</option>
            <option value="pedagogy">Pedagogy</option>
            <option value="governance">Governance</option>
          </select>
        </div>

        <div class="filter-item">
          <span class="filter-label">Seam Health:</span>
          <select id="discrepancyFilter" class="filter-select" onchange="applyFilters()">
            <option value="all">All Seams</option>
            <option value="clean">✅ Seam-Clean Only</option>
            <option value="issues">⚠️ Has Discrepancies</option>
            <option value="REST-UNMOUNTED">⚠️ REST-Unmounted</option>
            <option value="UNGATED-MOCK">⚠️ Ungated Mock</option>
            <option value="UI-UNWIRED">⚠️ UI-Unwired</option>
            <option value="SCHEMA-PARTIAL">⚠️ Schema Partial</option>
          </select>
        </div>

        <button class="clear-filters-btn" onclick="clearFilters()">Reset Filters</button>
      </div>
    </div>

    <!-- Main Views -->
    <div id="galleryViewContainer" class="gallery-container"></div>

    <div id="tableViewContainer" class="table-container" style="display: none;">
      <table>
        <thead>
          <tr>
            <th style="width: 35px">#</th>
            <th>Feature / Task</th>
            <th>Type</th>
            <th>Roles</th>
            <th>📱 Mobile</th>
            <th>🏛️ Sanctuary</th>
            <th>🌐 Explore</th>
            <th>💬 WhatsApp</th>
            <th>🤖 AI Assistant</th>
            <th style="width: 60px">Inspect</th>
          </tr>
        </thead>
        <tbody id="featureTableBody"></tbody>
      </table>
    </div>

    <div id="diagnosticsViewContainer" class="table-container" style="display: none;">
      <table>
        <thead>
          <tr>
            <th style="width: 35px">#</th>
            <th>Feature / Seam</th>
            <th>DB Schema (ZModel)</th>
            <th>API Procedure</th>
            <th>Client Binding</th>
            <th>Seam Health</th>
            <th>Discrepancy Sentinel</th>
            <th style="width: 60px">Inspect</th>
          </tr>
        </thead>
        <tbody id="diagnosticsTableBody"></tbody>
      </table>
    </div>
  </div>

  <!-- Detail Slide-out Drawer -->
  <div class="drawer-overlay" id="drawerOverlay" onclick="closeDrawer(event)">
    <div class="drawer" onclick="event.stopPropagation()">
      <div class="drawer-header">
        <div class="col-feature">
          <div class="feature-emoji" id="drawerEmoji">🪷</div>
          <div class="feature-text">
            <h3 id="drawerTitle" style="font-size: 16px; font-weight: 700; color: var(--text-main);">Feature Detail</h3>
            <span id="drawerId" style="font-size: 11px; color: var(--text-dim); font-family: monospace;">id</span>
          </div>
        </div>
        <button class="drawer-close" onclick="closeDrawer()">&times;</button>
      </div>

      <!-- 5-Surfaces Interactive Status Grid in Drawer -->
      <div class="drawer-section">
        <span class="drawer-section-title">Status Across 5 Platform Surfaces</span>
        <div class="drawer-surfaces-grid">
          <div class="drawer-surface-box">
            <span class="drawer-surface-label">📱 Mobile</span>
            <div id="drawerMobileHolder"></div>
          </div>
          <div class="drawer-surface-box">
            <span class="drawer-surface-label">🏛️ Sanctuary</span>
            <div id="drawerSanctuaryHolder"></div>
          </div>
          <div class="drawer-surface-box">
            <span class="drawer-surface-label">🌐 Explore</span>
            <div id="drawerExploreHolder"></div>
          </div>
          <div class="drawer-surface-box">
            <span class="drawer-surface-label">💬 WhatsApp</span>
            <div id="drawerOmniHolder"></div>
          </div>
          <div class="drawer-surface-box">
            <span class="drawer-surface-label">🤖 AI Assistant</span>
            <div id="drawerAgentHolder"></div>
          </div>
        </div>
      </div>

      <div class="drawer-section">
        <span class="drawer-section-title">End-to-End Seam Integrity</span>
        <div class="drawer-code-block" id="drawerSeamHealth"></div>
        <div class="drawer-code-block" id="drawerDiscrepancy" style="color: #B45309;"></div>
      </div>

      <div class="drawer-section">
        <span class="drawer-section-title">Component Substrate & Route</span>
        <div class="drawer-code-block" id="drawerComponent"></div>
        <div class="drawer-code-block" id="drawerRoute"></div>
      </div>

      <div class="drawer-section">
        <span class="drawer-section-title">Backend Procedure & Schema Contract</span>
        <div class="drawer-code-block" id="drawerApi"></div>
        <div class="drawer-code-block" id="drawerSchema"></div>
      </div>

      <div class="drawer-section">
        <span class="drawer-section-title">Architectural Role Affinities</span>
        <div id="drawerRoles" class="roles-cluster" style="max-width: 100%"></div>
      </div>

      <div class="drawer-section">
        <span class="drawer-section-title">Implementation Notes & Task Backlog</span>
        <textarea id="drawerNotes" class="notes-textarea" placeholder="Add custom implementation notes, wiring steps or schema tasks..." oninput="saveCurrentFeatureNotes()"></textarea>
      </div>
    </div>
  </div>

  <div class="toast" id="toast">Saved to local storage</div>

  <script>
    const BASELINE_DATA = ${jsonPayload};
    const STORAGE_KEY = 'gurudevi_feature_matrix_v4_omnichannel';
    let featuresState = loadFeaturesState();
    let currentDomain = 'self';
    let currentViewMode = 'gallery';
    let activeDrawerFeatureId = null;

    function loadFeaturesState() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) { console.warn('Loading fallback'); }
      return JSON.parse(JSON.stringify(BASELINE_DATA));
    }

    function persistState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(featuresState));
        showToast('Saved to local storage');
      } catch (e) { console.error('Save failed:', e); }
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 2000);
    }

    function resetToBaseline() {
      if (confirm('Revert all spreadsheet changes back to repository atlas baseline?')) {
        featuresState = JSON.parse(JSON.stringify(BASELINE_DATA));
        localStorage.removeItem(STORAGE_KEY);
        render();
        showToast('Reset to atlas baseline');
      }
    }

    function switchDomain(domain) {
      currentDomain = domain;
      document.getElementById('mainTabSelect').value = domain;
      document.getElementById('kpiDomainTag').textContent = 
        domain === 'self' ? 'Self Sanctuary' : domain === 'workspace' ? 'Workspace Domain' : 'All Monorepo';
      render();
    }

    function switchView(mode) {
      currentViewMode = mode;
      document.getElementById('viewBtnGallery').classList.toggle('active', mode === 'gallery');
      document.getElementById('viewBtnTable').classList.toggle('active', mode === 'table');
      document.getElementById('viewBtnDiagnostics').classList.toggle('active', mode === 'diagnostics');
      
      document.getElementById('galleryViewContainer').style.display = mode === 'gallery' ? 'grid' : 'none';
      document.getElementById('tableViewContainer').style.display = mode === 'table' ? 'block' : 'none';
      document.getElementById('diagnosticsViewContainer').style.display = mode === 'diagnostics' ? 'block' : 'none';
      render();
    }

    function statusClass(status) {
      switch (status) {
        case 'fully functional': return 'status-fully-functional';
        case 'working': return 'status-working';
        case 'wired': return 'status-wired';
        case 'have code': return 'status-have-code';
        default: return 'status-planned';
      }
    }

    function updateFeatureStatus(id, space, newStatus, event) {
      if (event) event.stopPropagation();
      const item = featuresState.find(f => f.id === id);
      if (!item) return;

      if (space === 'mobile') item.statusMobile = newStatus;
      if (space === 'sanctuary') item.statusSanctuary = newStatus;
      if (space === 'explore') item.statusExplore = newStatus;
      if (space === 'omni') item.statusOmnichannel = newStatus;
      if (space === 'agent') item.statusAgentic = newStatus;

      persistState();
      renderKPIs();

      const elements = document.querySelectorAll(\`[data-status-for="\${space}-\${id}"]\`);
      elements.forEach(elem => {
        elem.value = newStatus;
        elem.className = \`status-select-pill \${statusClass(newStatus)}\`;
      });

      if (activeDrawerFeatureId === id) openDrawer(id);
    }

    function getFilteredFeatures() {
      const search = document.getElementById('searchInput').value.trim().toLowerCase();
      const role = document.getElementById('roleFilter').value;
      const category = document.getElementById('categoryFilter').value;
      const disc = document.getElementById('discrepancyFilter').value;

      return featuresState.filter(f => {
        if (currentDomain !== 'all' && f.tab !== currentDomain) return false;

        if (role !== 'all') {
          if (role === 'common') {
            if (!f.isCommon) return false;
          } else {
            if (!f.roles || !f.roles.includes(role)) return false;
          }
        }

        if (category !== 'all' && f.category !== category) return false;

        if (disc !== 'all') {
          if (disc === 'clean') {
            if (f.discrepancy !== 'SEAM-CLEAN') return false;
          } else if (disc === 'issues') {
            if (f.discrepancy === 'SEAM-CLEAN') return false;
          } else {
            if (f.discrepancy !== disc) return false;
          }
        }

        if (search) {
          const matchTarget = \`\${f.name} \${f.id} \${f.category} \${f.componentPath} \${f.mobileRoute} \${f.apiProcedure} \${f.notes} \${f.schemaTable} \${f.discrepancy}\`.toLowerCase();
          if (!matchTarget.includes(search)) return false;
        }

        return true;
      });
    }

    function renderKPIs() {
      const filtered = getFilteredFeatures();
      const total = filtered.length;

      document.getElementById('kpiTotalCount').textContent = total;

      const calcReady = (key) => filtered.filter(f => f[key] === 'fully functional' || f[key] === 'working' || f[key] === 'wired').length;
      
      const mobileReady = calcReady('statusMobile');
      const sanctuaryReady = calcReady('statusSanctuary');
      const omniReady = calcReady('statusOmnichannel');
      const agentReady = calcReady('statusAgentic');

      const toPct = (val) => total > 0 ? Math.round((val / total) * 100) : 0;

      document.getElementById('kpiMobilePercent').textContent = \`\${toPct(mobileReady)}%\`;
      document.getElementById('kpiMobileReady').textContent = mobileReady;
      document.getElementById('kpiMobileBar').style.width = \`\${toPct(mobileReady)}%\`;

      document.getElementById('kpiSanctuaryPercent').textContent = \`\${toPct(sanctuaryReady)}%\`;
      document.getElementById('kpiSanctuaryReady').textContent = sanctuaryReady;
      document.getElementById('kpiSanctuaryBar').style.width = \`\${toPct(sanctuaryReady)}%\`;

      document.getElementById('kpiOmniPercent').textContent = \`\${toPct(omniReady)}%\`;
      document.getElementById('kpiOmniReady').textContent = omniReady;
      document.getElementById('kpiOmniBar').style.width = \`\${toPct(omniReady)}%\`;

      document.getElementById('kpiAgentPercent').textContent = \`\${toPct(agentReady)}%\`;
      document.getElementById('kpiAgentReady').textContent = agentReady;
      document.getElementById('kpiAgentBar').style.width = \`\${toPct(agentReady)}%\`;
    }

    function createStatusSelect(id, space, currentStatus) {
      const statuses = ['planned', 'have code', 'wired', 'working', 'fully functional'];
      const options = statuses.map(s => \`<option value="\${s}" \${s === (currentStatus || 'planned') ? 'selected' : ''}>\${s}</option>\`).join('');
      return \`<select data-status-for="\${space}-\${id}" class="status-select-pill \${statusClass(currentStatus || 'planned')}" onclick="event.stopPropagation()" onchange="updateFeatureStatus('\${id}', '\${space}', this.value, event)">\${options}</select>\`;
    }

    function renderGallery() {
      const container = document.getElementById('galleryViewContainer');
      const filtered = getFilteredFeatures();

      if (filtered.length === 0) {
        container.innerHTML = \`<div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-dim); background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-subtle);">No features match the selected filters.</div>\`;
        return;
      }

      container.innerHTML = filtered.map(f => {
        const rolesHtml = (f.roles || []).map(r => 
          \`<span class="role-badge \${f.isCommon ? 'common' : ''}">\${r}</span>\`
        ).join('');

        const discClass = f.discrepancy === 'SEAM-CLEAN' ? 'disc-clean' : f.discrepancy === 'REST-UNMOUNTED' ? 'disc-error' : 'disc-warning';

        return \`
          <div class="feature-card" onclick="openDrawer('\${f.id}')">
            <div class="card-top">
              <div class="card-emoji-box">\${f.emoji || '✨'}</div>
              <div class="card-header-info">
                <div class="card-title">\${f.name}</div>
                <div class="card-id-badge">\${f.id}</div>
              </div>
              <span class="badge-discrepancy \${discClass}">\${f.discrepancy || 'SEAM-OK'}</span>
            </div>

            <div class="card-category-row">
              <span class="chip chip-\${f.category}">\${f.category}</span>
              <span style="font-size: 11px; color: var(--text-dim);">· \${f.domain}</span>
            </div>

            <div class="card-roles">\${rolesHtml}</div>

            <div class="card-spaces-grid" onclick="event.stopPropagation()">
              <div class="space-status-row">
                <span class="space-label">📱 Mobile Native</span>
                \${createStatusSelect(f.id, 'mobile', f.statusMobile)}
              </div>
              <div class="space-status-row">
                <span class="space-label">🏛️ Sanctuary Web</span>
                \${createStatusSelect(f.id, 'sanctuary', f.statusSanctuary)}
              </div>
              <div class="space-status-row">
                <span class="space-label">💬 WhatsApp / Bot</span>
                \${createStatusSelect(f.id, 'omni', f.statusOmnichannel)}
              </div>
              <div class="space-status-row">
                <span class="space-label">🤖 AI Assistant & Agents</span>
                \${createStatusSelect(f.id, 'agent', f.statusAgentic)}
              </div>
            </div>

            <div class="card-footer">
              <span class="card-route" title="\${f.mobileRoute}">\${f.mobileRoute}</span>
              <span style="font-weight: 600; color: var(--accent-emerald);">Inspect →</span>
            </div>
          </div>
        \`;
      }).join('');
    }

    function renderTable() {
      const tbody = document.getElementById('featureTableBody');
      const filtered = getFilteredFeatures();

      if (filtered.length === 0) {
        tbody.innerHTML = \`<tr><td colspan="10" style="text-align: center; padding: 40px; color: var(--text-dim);">No features match filters.</td></tr>\`;
        return;
      }

      tbody.innerHTML = filtered.map((f, idx) => {
        const rolesHtml = (f.roles || []).map(r => \`<span class="role-badge \${f.isCommon ? 'common' : ''}">\${r}</span>\`).join('');

        return \`
          <tr onclick="openDrawer('\${f.id}')">
            <td style="color: var(--text-dim); font-weight: 600;">\${idx + 1}</td>
            <td>
              <div class="col-feature">
                <div class="feature-emoji">\${f.emoji || '✨'}</div>
                <div class="feature-text">
                  <h4>\${f.name}</h4>
                  <span>\${f.id}</span>
                </div>
              </div>
            </td>
            <td><span class="chip chip-\${f.category}">\${f.category}</span></td>
            <td><div class="roles-cluster">\${rolesHtml}</div></td>
            <td>\${createStatusSelect(f.id, 'mobile', f.statusMobile)}</td>
            <td>\${createStatusSelect(f.id, 'sanctuary', f.statusSanctuary)}</td>
            <td>\${createStatusSelect(f.id, 'explore', f.statusExplore)}</td>
            <td>\${createStatusSelect(f.id, 'omni', f.statusOmnichannel)}</td>
            <td>\${createStatusSelect(f.id, 'agent', f.statusAgentic)}</td>
            <td><button class="btn btn-secondary" style="padding: 4px 8px; font-size: 11px;">View</button></td>
          </tr>
        \`;
      }).join('');
    }

    function renderDiagnostics() {
      const tbody = document.getElementById('diagnosticsTableBody');
      const filtered = getFilteredFeatures();

      if (filtered.length === 0) {
        tbody.innerHTML = \`<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--text-dim);">No features match filters.</td></tr>\`;
        return;
      }

      tbody.innerHTML = filtered.map((f, idx) => {
        const discClass = f.discrepancy === 'SEAM-CLEAN' ? 'disc-clean' : f.discrepancy === 'REST-UNMOUNTED' ? 'disc-error' : 'disc-warning';

        return \`
          <tr onclick="openDrawer('\${f.id}')">
            <td style="color: var(--text-dim); font-weight: 600;">\${idx + 1}</td>
            <td>
              <div class="col-feature">
                <div class="feature-emoji">\${f.emoji || '✨'}</div>
                <div class="feature-text">
                  <h4>\${f.name}</h4>
                  <span>\${f.id}</span>
                </div>
              </div>
            </td>
            <td><div class="code-cell" title="\${f.schemaTable}">\${(f.schemaTable || '').split(' ')[0]}</div></td>
            <td><div class="code-cell" title="\${f.apiProcedure}">\${(f.apiProcedure || '').split(' ')[0]}</div></td>
            <td><div class="code-cell" title="\${f.componentPath}">\${(f.componentPath || '').split('/').pop()}</div></td>
            <td>
              <div style="display: flex; gap: 4px; font-size: 10px;">
                <span title="Schema: \${f.seamHealth?.schema}">🗄️</span>
                <span title="API: \${f.seamHealth?.api}">⚡</span>
                <span title="Client: \${f.seamHealth?.client}">📱</span>
                <span title="Data: \${f.seamHealth?.data}">💾</span>
              </div>
            </td>
            <td>
              <span class="badge-discrepancy \${discClass}">\${f.discrepancy}</span>
              <div style="font-size: 10px; color: var(--text-dim); margin-top: 2px;">\${f.discrepancyNote || ''}</div>
            </td>
            <td><button class="btn btn-secondary" style="padding: 4px 8px; font-size: 11px;">Audit</button></td>
          </tr>
        \`;
      }).join('');
    }

    function render() {
      renderKPIs();
      if (currentViewMode === 'gallery') renderGallery();
      else if (currentViewMode === 'table') renderTable();
      else renderDiagnostics();
    }

    function applyFilters() { render(); }
    function clearFilters() {
      document.getElementById('searchInput').value = '';
      document.getElementById('roleFilter').value = 'all';
      document.getElementById('categoryFilter').value = 'all';
      document.getElementById('discrepancyFilter').value = 'all';
      render();
    }

    function openDrawer(id) {
      activeDrawerFeatureId = id;
      const f = featuresState.find(item => item.id === id);
      if (!f) return;

      document.getElementById('drawerEmoji').textContent = f.emoji || '✨';
      document.getElementById('drawerTitle').textContent = f.name;
      document.getElementById('drawerId').textContent = \`ID: \${f.id} | Domain: \${f.domain} | Category: \${f.category}\`;
      document.getElementById('drawerComponent').textContent = f.componentPath;
      document.getElementById('drawerRoute').textContent = f.mobileRoute;
      document.getElementById('drawerApi').textContent = f.apiProcedure;
      document.getElementById('drawerSchema').textContent = f.schemaTable;
      document.getElementById('drawerNotes').value = f.notes || '';

      document.getElementById('drawerSeamHealth').textContent = \`Schema: \${f.seamHealth?.schema} | API: \${f.seamHealth?.api} | Client: \${f.seamHealth?.client} | Data: \${f.seamHealth?.data}\`;
      document.getElementById('drawerDiscrepancy').textContent = \`Discrepancy: \${f.discrepancy} — \${f.discrepancyNote || 'None'}\`;

      document.getElementById('drawerMobileHolder').innerHTML = createStatusSelect(f.id, 'mobile', f.statusMobile);
      document.getElementById('drawerSanctuaryHolder').innerHTML = createStatusSelect(f.id, 'sanctuary', f.statusSanctuary);
      document.getElementById('drawerExploreHolder').innerHTML = createStatusSelect(f.id, 'explore', f.statusExplore);
      document.getElementById('drawerOmniHolder').innerHTML = createStatusSelect(f.id, 'omni', f.statusOmnichannel);
      document.getElementById('drawerAgentHolder').innerHTML = createStatusSelect(f.id, 'agent', f.statusAgentic);

      const rolesDiv = document.getElementById('drawerRoles');
      rolesDiv.innerHTML = (f.roles || []).map(r => {
        const weight = f.roleWeights && f.roleWeights[r] ? \`(\${f.roleWeights[r]})\` : '';
        return \`<span class="role-badge common" style="font-size: 11px; padding: 3px 7px;">\${r} \${weight}</span>\`;
      }).join('');

      document.getElementById('drawerOverlay').classList.add('open');
    }

    function closeDrawer(event) {
      if (!event || event.target.id === 'drawerOverlay' || event.target.className === 'drawer-close') {
        document.getElementById('drawerOverlay').classList.remove('open');
        activeDrawerFeatureId = null;
      }
    }

    function saveCurrentFeatureNotes() {
      if (!activeDrawerFeatureId) return;
      const f = featuresState.find(item => item.id === activeDrawerFeatureId);
      if (f) {
        f.notes = document.getElementById('drawerNotes').value;
        persistState();
      }
    }

    function exportCSV() {
      const headers = ['id', 'name', 'tab', 'domain', 'category', 'roles', 'statusMobile', 'statusSanctuary', 'statusExplore', 'statusOmnichannel', 'statusAgentic', 'discrepancy', 'componentPath', 'mobileRoute', 'apiProcedure', 'schemaTable', 'notes'];
      const rows = featuresState.map(f => [
        \`"\${f.id}"\`, \`"\${(f.name || '').replace(/"/g, '""')}"\`, \`"\${f.tab}"\`, \`"\${f.domain}"\`, \`"\${f.category}"\`,
        \`"\${(f.roles || []).join(';')}"\`, \`"\${f.statusMobile}"\`, \`"\${f.statusSanctuary}"\`, \`"\${f.statusExplore}"\`,
        \`"\${f.statusOmnichannel}"\`, \`"\${f.statusAgentic}"\`, \`"\${f.discrepancy}"\`, \`"\${f.componentPath}"\`,
        \`"\${f.mobileRoute}"\`, \`"\${(f.apiProcedure || '').replace(/"/g, '""')}"\`, \`"\${(f.schemaTable || '').replace(/"/g, '""')}"\`,
        \`"\${(f.notes || '').replace(/"/g, '""')}"\`
      ].join(','));

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', \`gurudevi-seam-matrix-\${currentDomain}.csv\`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    function exportJSON() {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(featuresState, null, 2));
      const link = document.createElement('a');
      link.setAttribute('href', dataStr);
      link.setAttribute('download', 'gurudevi-seam-matrix.json');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    window.onload = function() {
      switchDomain('self');
      switchView('gallery');
    };
  </script>
</body>
</html>
`;
}

// Write target files
const htmlContent = generateHtmlRunner(ALL_FEATURES);

const targetAtlasPath = path.join(ROOT, 'docs', 'atlas', 'feature-matrix-runner.html');
const targetRootPath = path.join(ROOT, 'feature-matrix-runner.html');

fs.writeFileSync(targetAtlasPath, htmlContent, 'utf8');
fs.writeFileSync(targetRootPath, htmlContent, 'utf8');

console.log(`✅ Generated Light Theme, Omnichannel, Agentic MCP & Full-Stack Seam Runner at:`);
console.log(`   1. ${targetAtlasPath}`);
console.log(`   2. ${targetRootPath}`);
