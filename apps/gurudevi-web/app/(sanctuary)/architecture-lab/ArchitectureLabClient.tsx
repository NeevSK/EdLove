'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import toolsMetaModelData from '../architecture/toolsMetaModelData.json';

// --- Types ---
type StudioTab = 'seam-sim' | 'antipattern-arena' | 'quarantine-strangler' | 'rosetta-stone';

type ScenarioId = 'auth' | 'gradebook' | 'offline-task' | 'audit';
type ChaosMode = 'normal' | 'malformed-json' | 'db-offline' | 'expired-token';
type AdapterChoice = 'supabase' | 'sqlite' | 'mock';

interface SeamStage {
  id: number;
  name: string;
  tier: string;
  role: string;
  analogy: string;
  status: 'pending' | 'success' | 'blocked' | 'bypassed';
  description: string;
  codeSnippet: string;
}

export function ArchitectureLabClient() {
  const [activeTab, setActiveTab] = useState<StudioTab>('seam-sim');

  // ==========================================
  // STUDIO 1: SEAM SIMULATOR STATE
  // ==========================================
  const [scenario, setScenario] = useState<ScenarioId>('auth');
  const [chaosMode, setChaosMode] = useState<ChaosMode>('normal');
  const [adapterChoice, setAdapterChoice] = useState<AdapterChoice>('supabase');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [simLog, setSimLog] = useState<string[]>([]);

  // ==========================================
  // STUDIO 2: ANTI-PATTERN ARENA STATE
  // ==========================================
  const [activeBattle, setActiveBattle] = useState<'audit-manager' | 'auth-zombie' | 'context-hell' | 'server-store'>('auth-zombie');
  const [contextRenders, setContextRenders] = useState<number>(0);
  const [zustandRenders, setZustandRenders] = useState<number>(0);
  const [arenaMessage, setArenaMessage] = useState<string | null>(null);

  // ==========================================
  // STUDIO 3: QUARANTINE & STRANGLER STATE
  // ==========================================
  const [quarantineFilter, setQuarantineFilter] = useState<'all' | 'zero-app' | 'pass-through' | 'factories'>('all');
  const [isSimulatedClean, setIsSimulatedClean] = useState<boolean>(false);
  const [selectedFileForModal, setSelectedFileForModal] = useState<string | null>(null);

  // ==========================================
  // STUDIO 4: ROSETTA STONE STATE
  // ==========================================
  const [rosettaSearch, setRosettaSearch] = useState<string>('');
  const [rosettaCategory, setRosettaCategory] = useState<'all' | 'patterns' | 'modules' | 'state'>('all');
  const [expandedTerm, setExpandedTerm] = useState<string | null>('Singleton');

  // --- Dynamic Pipeline Logic for Studio 1 ---
  const stages: SeamStage[] = useMemo(() => {
    const isMalformed = chaosMode === 'malformed-json';
    const isOffline = chaosMode === 'db-offline';
    const isExpired = chaosMode === 'expired-token';

    if (scenario === 'auth') {
      return [
        {
          id: 0,
          name: 'Stage 0: Schema',
          tier: 'Tier 0 Substrate',
          role: 'Border Guard / Truth Scanner',
          analogy: 'Customs & Passport Scanner: Halts illegal payload before touching memory',
          status: isMalformed ? 'blocked' : 'success',
          description: isMalformed
            ? '❌ REJECTED: safeParse() failed! "email" must be valid email format. Halting pipeline.'
            : '✅ PASSED: CanonicalAccountIdSchema.safeParse(input) validated successfully.',
          codeSnippet: `// CanonicalAccountIdSchema.safeParse(input)\nconst parsed = z.object({\n  email: z.string().email(),\n  password: z.string().min(8)\n}).safeParse(payload);`,
        },
        {
          id: 1,
          name: 'Stage 1: Port',
          tier: 'Tier 1 Ports',
          role: 'Wall Socket Contract',
          analogy: 'Standard 3-Pin Wall Socket: Abstract interface decoupling caller from tech',
          status: isMalformed ? 'blocked' : 'success',
          description: isMalformed
            ? 'Blocked by previous stage failure.'
            : '✅ CONTRACT LOCKED: IAuthPort specifies login(credentials): Promise<AuthSession>.',
          codeSnippet: `export interface IAuthPort {\n  login(credentials: LoginRequest): Promise<AuthSession>;\n  logout(): Promise<void>;\n}`,
        },
        {
          id: 2,
          name: 'Stage 2: Adapter',
          tier: 'Tier 3 Infrastructure',
          role: 'Pluggable Cable',
          analogy: `${adapterChoice.toUpperCase()} Cable: Concrete implementation plugged into the Port`,
          status: isMalformed ? 'blocked' : isOffline && adapterChoice === 'supabase' ? 'blocked' : 'success',
          description: isMalformed
            ? 'Blocked by previous stage failure.'
            : isOffline && adapterChoice === 'supabase'
            ? '❌ NETWORK ERROR: Supabase cloud unreachable. Handing off to offline queue.'
            : `✅ DISPATCHED: Using ${adapterChoice.toUpperCase()}AuthAdapter. Auth session created.`,
          codeSnippet:
            adapterChoice === 'supabase'
              ? `export class SupabaseAuthAdapter implements IAuthPort {\n  async login(creds) { return supabase.auth.signInWithPassword(creds); }\n}`
              : adapterChoice === 'sqlite'
              ? `export class SQLiteAuthAdapter implements IAuthPort {\n  async login(creds) { return localDB.users.findUnique(creds); }\n}`
              : `export class MockAuthAdapter implements IAuthPort {\n  async login(creds) { return { user: { id: 'mock-123', email: creds.email } }; }\n}`,
        },
        {
          id: 3,
          name: 'Stage 3: Decision Gate',
          tier: 'Storage Classification',
          role: 'State Router',
          analogy: 'Server State (TanStack Query) vs. Client State (Zustand)',
          status: isMalformed || (isOffline && adapterChoice === 'supabase') ? 'blocked' : 'success',
          description:
            '✅ ROUTED TO CLIENT STORE: Auth tokens & session identity are Client-Exclusive state. Stored in useAuthStore.',
          codeSnippet: `// Storage Decision:\n// Remote data (posts, grades) -> TanStack Query / PowerSync\n// Ephemeral client auth token -> useAuthStore (Zustand)`,
        },
        {
          id: 4,
          name: 'Stage 4: Hook Facade',
          tier: 'Tier 5 Application',
          role: 'UI Selector Facade',
          analogy: 'The 1-Line Remote Control: Selects only the needed slice of state',
          status: isMalformed || (isOffline && adapterChoice === 'supabase') ? 'blocked' : 'success',
          description: '✅ SUBSCRIBED: useAuth() selector exposes { user, login } without triggering cascading renders.',
          codeSnippet: `export function useAuth() {\n  const user = useAuthStore((s) => s.user);\n  return { user, isAuthenticated: Boolean(user) };\n}`,
        },
        {
          id: 5,
          name: 'Stage 5: UI Render',
          tier: 'Tier 6 Presentation',
          role: 'Surgical Screen Painter',
          analogy: 'Screen pixels repainted surgically via useSyncExternalStore',
          status: isMalformed || (isOffline && adapterChoice === 'supabase') ? 'blocked' : 'success',
          description: isMalformed
            ? 'UI renders error alert: "Invalid email format".'
            : isOffline && adapterChoice === 'supabase'
            ? 'UI renders offline banner: "Operating in offline cached mode".'
            : '✅ UI RENDERED: <UserProfileBadge name="Alice" /> painted in 0.8ms.',
          codeSnippet: `export function UserProfileBadge() {\n  const { user } = useAuth();\n  return <div>Welcome back, {user?.name}</div>;\n}`,
        },
      ];
    }

    // Default Gradebook Scenario
    return [
      {
        id: 0,
        name: 'Stage 0: Schema',
        tier: 'Tier 0 Substrate',
        role: 'Border Guard',
        analogy: 'Customs & Inspection',
        status: isMalformed ? 'blocked' : 'success',
        description: isMalformed ? '❌ Invalid Student Grade payload' : '✅ Validated StudentGradeSchema',
        codeSnippet: `const StudentGradeSchema = z.object({ studentId: z.string(), score: z.number().min(0).max(100) });`,
      },
      {
        id: 1,
        name: 'Stage 1: Port',
        tier: 'Tier 1 Ports',
        role: 'Contract',
        analogy: 'IGradebookPort Socket',
        status: isMalformed ? 'blocked' : 'success',
        description: 'IGradebookRepository contract defined.',
        codeSnippet: `export interface IGradebookPort {\n  recordScore(studentId: string, score: number): Promise<void>;\n}`,
      },
      {
        id: 2,
        name: 'Stage 2: Adapter',
        tier: 'Tier 3 Infrastructure',
        role: 'Data Highway',
        analogy: 'Database Highway',
        status: isMalformed ? 'blocked' : 'success',
        description: `Persisting via ${adapterChoice.toUpperCase()} repository.`,
        codeSnippet: `class PowerSyncGradebookAdapter implements IGradebookPort {\n  async recordScore(id, score) { await db.insert('grades', { id, score }); }\n}`,
      },
      {
        id: 3,
        name: 'Stage 3: Decision Gate',
        tier: 'Storage Gate',
        role: 'Server State Query',
        analogy: 'TanStack Query Cache (NOT a hand-written store!)',
        status: isMalformed ? 'blocked' : 'success',
        description: '✅ ROUTED TO TANSTACK QUERY: Grades are remote server state. Caches automatically without manual store.',
        codeSnippet: `// Server State -> api.classroom.gradebook.useQuery()\n// Zero manual Zustand boilerplate!`,
      },
      {
        id: 4,
        name: 'Stage 4: Hook Facade',
        tier: 'Tier 5 Application',
        role: 'Query Hook',
        analogy: 'Query Selector',
        status: isMalformed ? 'blocked' : 'success',
        description: 'useGradebook(classId) handles caching, refetching, and error states.',
        codeSnippet: `export function useGradebook(classId: string) {\n  return api.gradebook.getGrades.useQuery({ classId });\n}`,
      },
      {
        id: 5,
        name: 'Stage 5: UI Render',
        tier: 'Tier 6 Presentation',
        role: 'Gradebook Table View',
        analogy: 'Live Data Table',
        status: isMalformed ? 'blocked' : 'success',
        description: 'Gradebook table mounted with automatic background re-sync.',
        codeSnippet: `<GradeTable data={grades} isFetching={isFetching} />`,
      },
    ];
  }, [scenario, chaosMode, adapterChoice]);

  // Rosetta Stone Terms
  const rosettaTerms = [
    {
      term: 'Singleton',
      category: 'patterns',
      etymology: 'Latin "singulus" (single, one each) + card game term (single card of a suit). Codified in GoF 1994.',
      whyJavaNeededIt: 'Java had no standalone files or global modules. To share a connection pool or session, Java forced a private constructor and a static getInstance() method.',
      modernTsReality: 'An ES Module file (*.ts) IS ALREADY A SINGLETON! Node.js & Hermes evaluate it once and cache exports. Zero class ceremony required.',
      codeSample: `// ❌ Java in TS (Ceremony):\nclass Db { private static inst: Db; static get() { return this.inst ??= new Db(); } }\n\n// ✅ Modern TS (Native Singleton):\nexport const db = new DatabaseClient();`,
    },
    {
      term: 'Factory',
      category: 'patterns',
      etymology: 'Latin "factor" (maker, doer, from facere "to make") + "-ium" (place of). An industrial assembly plant.',
      whyJavaNeededIt: 'Instantiating complex objects with 5 constructor parameters in Java was ugly and repetitive, so factories wired dependencies.',
      modernTsReality: 'In TypeScript, functions are first-class and object literals are trivial. A factory is just a 1-line function or direct export.',
      codeSample: `// ❌ Java Factory Class:\nexport class UserFactory { createUser(name) { return new User(name, ...); } }\n\n// ✅ Modern TS:\nexport const createUser = (name: string) => ({ id: crypto.randomUUID(), name });`,
    },
    {
      term: 'ES Module (ESM)',
      category: 'modules',
      etymology: 'ECMA (European Computer Manufacturers Association, est. 1961) + Latin "modulus" (small standard measure). Standardized in ES2015.',
      whyJavaNeededIt: 'Java used "package" and classpaths. JS historically had NO modules (only global window).',
      modernTsReality: 'Official browser/Node standard using "import" and "export". Eliminates global namespace pollution and guarantees file-level singletons.',
      codeSample: `import { auth } from './auth'; // Native ES Module import\nexport const session = ...; // Isolated namespace`,
    },
    {
      term: 'Manager (Legacy)',
      category: 'patterns',
      etymology: 'Latin "manus" (hand) + Italian "maneggiare" (to handle horses). Enterprise OOP catch-all suffix.',
      whyJavaNeededIt: 'Spring Boot services combined state, database queries, and business logic into a single monolithic class.',
      modernTsReality: 'A fatal anti-pattern in React! Managers hold non-reactive state that fails to trigger re-renders. Split into Store (state) + Domain Functions (logic) + Adapter (I/O).',
      codeSample: `// ❌ Java OOP Manager:\nclass AuthManager { user: User; login() { this.user = ... } }\n\n// ✅ Modern TS:\nuseAuthStore (Zustand State) + authAdapter.login() (I/O)`,
    },
    {
      term: 'Store vs. Context',
      category: 'state',
      etymology: 'Context (Latin "contextus", weaving together). Store (Zustand: German for "condition/state").',
      whyJavaNeededIt: 'N/A (React specific). React 18 used Context for state, causing "Provider Hell" and whole-subtree re-renders.',
      modernTsReality: 'React 19.3: Context is ONLY for static environmental DI (<WorldScope>, <QueryClientProvider>). Stores (Zustand) own global mutable state with surgical re-renders.',
      codeSample: `// ✅ Surgical Selector (Only re-renders when name changes):\nconst name = useAuthStore(s => s.user?.name);`,
    },
    {
      term: 'Server State vs. Client State',
      category: 'state',
      etymology: 'Client (Latin "cliens", follower/dependent) vs Server (Latin "servire", to attend to).',
      whyJavaNeededIt: 'In traditional desktop apps, all data was local. On the web, 80% of data belongs to Postgres, not the browser.',
      modernTsReality: 'Server State (classes, grades, posts) belongs in TanStack Query / PowerSync. Hand-writing 20 Zustand stores for API responses is pure redundant waste.',
      codeSample: `// Server State -> api.posts.useQuery() (Auto-cache, refetch, garbage collect)\n// Client State -> useUIStore() (Modal open/close, draft form)`,
    },
    {
      term: 'Repository vs. Adapter (The Spring Boot Triad)',
      category: 'patterns',
      etymology: 'Repository (Latin "repositorium", a place to store/replace) vs Adapter (Latin "adaptare", to fit to).',
      whyJavaNeededIt: 'Spring Data JPA invented Repositories to trick developers into pretending SQL databases are giant in-memory Java Collection<User> objects.',
      modernTsReality: 'In modern TS, we never pretend SQL is an array. I/O boundaries are Adapters (supabaseProfileAdapter); remote data is synchronized via TanStack Query (useQuery).',
      codeSample: `// ❌ Java Spring Boot Slop:\nclass ProfileRepository implements IProfileRepository { ... }\n\n// ✅ Modern TS:\nexport const profileAdapter = { getUser: ... }; // I/O\nconst { data: profile } = useProfileQuery(); // React`,
    },
  ];

  const filteredRosetta = rosettaTerms.filter((item) => {
    const matchesCat = rosettaCategory === 'all' || item.category === rosettaCategory;
    const matchesSearch =
      item.term.toLowerCase().includes(rosettaSearch.toLowerCase()) ||
      item.etymology.toLowerCase().includes(rosettaSearch.toLowerCase()) ||
      item.modernTsReality.toLowerCase().includes(rosettaSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Top contaminated managers from data or fallback
  const managersList = toolsMetaModelData.javaContaminationSummary?.topContaminatedFiles ?? [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Header & Navigation Banner */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-amber-500 to-sky-600 p-2 shadow-lg">
            <span className="text-xl">🧪</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-100">
                Architecture Lab &amp; Seam Simulator
              </h1>
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                Interactive Workbench
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive first-principles laboratory: Seam flows, anti-pattern battleground, monorepo quarantine, and etymological rosetta stone.
            </p>
          </div>
        </div>

        {/* Cross-Link back to Monorepo Architecture Tool */}
        <div className="flex items-center gap-2">
          <Link
            href="/architecture"
            className="flex items-center gap-1.5 rounded-lg border border-sky-700/80 bg-sky-950/60 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-900/80 hover:text-white transition shadow"
          >
            <span>🏛️ Monorepo Sentinels &amp; ERD</span>
            <span className="text-sky-400">→</span>
          </Link>
        </div>
      </header>

      {/* Main Studio Navigation Tabs */}
      <div className="border-b border-slate-800 bg-slate-950/80 px-6 pt-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('seam-sim')}
            className={`flex items-center gap-2 rounded-t-lg px-4 py-2 text-xs font-bold transition border-t border-x ${
              activeTab === 'seam-sim'
                ? 'bg-slate-900 text-sky-400 border-slate-700 shadow-md'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <span>✈️</span>
            <span>1. Seam Simulator</span>
            <span className="rounded bg-sky-950 px-1.5 py-0.2 text-[10px] text-sky-300 border border-sky-800">
              Pipeline
            </span>
          </button>

          <button
            onClick={() => setActiveTab('antipattern-arena')}
            className={`flex items-center gap-2 rounded-t-lg px-4 py-2 text-xs font-bold transition border-t border-x ${
              activeTab === 'antipattern-arena'
                ? 'bg-slate-900 text-amber-400 border-slate-700 shadow-md'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <span>🥊</span>
            <span>2. Anti-Pattern Arena</span>
            <span className="rounded bg-amber-950 px-1.5 py-0.2 text-[10px] text-amber-300 border border-amber-800">
              Live Battle
            </span>
          </button>

          <button
            onClick={() => setActiveTab('quarantine-strangler')}
            className={`flex items-center gap-2 rounded-t-lg px-4 py-2 text-xs font-bold transition border-t border-x ${
              activeTab === 'quarantine-strangler'
                ? 'bg-slate-900 text-red-400 border-slate-700 shadow-md'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <span>🗺️</span>
            <span>3. Quarantine &amp; Strangler</span>
            <span className="rounded bg-red-950 px-1.5 py-0.2 text-[10px] text-red-300 border border-red-800">
              30 Zombies
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rosetta-stone')}
            className={`flex items-center gap-2 rounded-t-lg px-4 py-2 text-xs font-bold transition border-t border-x ${
              activeTab === 'rosetta-stone'
                ? 'bg-slate-900 text-emerald-400 border-slate-700 shadow-md'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <span>📖</span>
            <span>4. Rosetta Stone &amp; Etymology</span>
            <span className="rounded bg-emerald-950 px-1.5 py-0.2 text-[10px] text-emerald-300 border border-emerald-800">
              First Principles
            </span>
          </button>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* ============================================================== */}
        {/* STUDIO 1: THE INTERACTIVE SEAM SIMULATOR                       */}
        {/* ============================================================== */}
        {activeTab === 'seam-sim' && (
          <div className="space-y-6">
            {/* Control Deck */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    ✈️ Live Seam Pipeline Simulator
                  </div>
                  <h2 className="text-base font-black text-slate-100 mt-0.5">
                    Step Through Clean Architecture: Airport Customs to UI Screen
                  </h2>
                </div>

                {/* Scenario Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Scenario:</span>
                  <select
                    value={scenario}
                    onChange={(e) => {
                      setScenario(e.target.value as ScenarioId);
                      setCurrentStep(0);
                    }}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="auth">🔐 User Login &amp; Token Issuance</option>
                    <option value="gradebook">📚 Classroom Gradebook Load</option>
                  </select>
                </div>
              </div>

              {/* Chaos Levers & Swappable Adapters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                {/* Chaos Injection */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚡ Chaos Lever (Test System Resilience):</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'normal', label: '✅ Normal Valid Input' },
                      { id: 'malformed-json', label: '🛑 Malformed JSON (Schema Test)' },
                      { id: 'db-offline', label: '🔌 Cloud DB Offline' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setChaosMode(item.id as ChaosMode);
                          setCurrentStep(0);
                        }}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition border ${
                          chaosMode === item.id
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Swappable Pluggable Adapter */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🔌 Pluggable Adapter (Dependency Inversion):</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'supabase', label: 'Cloud Supabase' },
                      { id: 'sqlite', label: 'Local SQLite (PowerSync)' },
                      { id: 'mock', label: 'In-Memory Mock (Fast Unit Test)' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setAdapterChoice(item.id as AdapterChoice)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition border ${
                          adapterChoice === item.id
                            ? 'bg-sky-500 text-slate-950 border-sky-400 shadow'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pipeline Stage Visualizer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {stages.map((stage, idx) => {
                const isActive = idx === currentStep;
                const isBlocked = stage.status === 'blocked';
                return (
                  <div
                    key={stage.id}
                    onClick={() => setCurrentStep(idx)}
                    className={`cursor-pointer rounded-xl p-3 border transition flex flex-col justify-between ${
                      isActive
                        ? 'border-sky-400 bg-sky-950/40 shadow-lg ring-1 ring-sky-400'
                        : isBlocked
                        ? 'border-red-900 bg-red-950/20 opacity-80'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          STAGE {idx}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                            isBlocked
                              ? 'bg-red-900 text-red-200'
                              : 'bg-emerald-900 text-emerald-200'
                          }`}
                        >
                          {isBlocked ? 'BLOCKED' : 'READY'}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-slate-200 truncate">
                        {stage.name}
                      </div>
                      <div className="text-[10px] font-mono text-sky-400">{stage.tier}</div>
                    </div>

                    <div className="text-[10px] text-slate-400 mt-2 line-clamp-2">
                      {stage.analogy}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Deep Stage Inspector */}
            {(() => {
              const activeStage = stages[currentStep] ?? stages[0];
              if (!activeStage) return null;
              return (
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-sky-900/60 px-2 py-0.5 text-xs font-mono font-bold text-sky-300 border border-sky-700">
                        Step {currentStep} of 5
                      </span>
                      <span className="font-bold text-sm text-slate-100">
                        {activeStage.name} — {activeStage.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={currentStep === 0}
                        onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                        className="rounded border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-40"
                      >
                        ← Previous
                      </button>
                      <button
                        disabled={currentStep === 5 || activeStage.status === 'blocked'}
                        onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
                        className="rounded border border-sky-600 bg-sky-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-sky-400 disabled:opacity-40"
                      >
                        Next Stage →
                      </button>
                    </div>
                  </div>

                  {/* Stage Insight Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Physical Analogy & Architectural Invariant */}
                    <div className="space-y-3">
                      <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 space-y-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                          💡 Real-World Mental Model (The &ldquo;Why&rdquo;)
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {activeStage.analogy}
                        </p>
                      </div>

                      <div
                        className={`rounded-lg p-3.5 border ${
                          activeStage.status === 'blocked'
                            ? 'bg-red-950/30 border-red-800 text-red-300'
                            : 'bg-emerald-950/20 border-emerald-800 text-emerald-300'
                        }`}
                      >
                        <div className="text-[11px] font-bold uppercase tracking-wider">
                          Pipeline Execution Status:
                        </div>
                        <p className="text-xs mt-1 leading-relaxed">{activeStage.description}</p>
                      </div>
                    </div>

                    {/* Right: Real Code Substrate */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Physical Code Substrate:</span>
                        <span className="font-mono text-sky-400 text-[10px]">TypeScript Runtime</span>
                      </div>
                      <pre className="rounded-lg bg-slate-950 p-3.5 text-xs font-mono text-slate-300 border border-slate-800 overflow-x-auto leading-relaxed">
                        <code>{activeStage.codeSnippet}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ============================================================== */}
        {/* STUDIO 2: THE ANTI-PATTERN ARENA                               */}
        {/* ============================================================== */}
        {activeTab === 'antipattern-arena' && (
          <div className="space-y-6">
            {/* Arena Header */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-3 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    🥊 The Anti-Pattern Arena
                  </div>
                  <h2 className="text-base font-black text-slate-100 mt-0.5">
                    Java OOP Contamination vs. Modern Functional TypeScript
                  </h2>
                </div>

                {/* Matchup Switcher */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'auth-zombie', label: '🧟 611-LOC AuthManager vs. Zustand' },
                    { id: 'audit-manager', label: '☕ Pass-Through AuditManager vs. Pure Port' },
                    { id: 'context-hell', label: '⚛️ React 18 Context Hell vs. Atomic Store' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setActiveBattle(m.id as any);
                        setContextRenders(0);
                        setZustandRenders(0);
                        setArenaMessage(null);
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition border ${
                        activeBattle === m.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Matchup Arena Grid */}
            {activeBattle === 'auth-zombie' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Red Corner: Java Contaminated Zombie */}
                <div className="rounded-xl border border-red-900/60 bg-red-950/20 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-red-900/60 px-2 py-0.5 text-xs font-bold text-red-300 border border-red-700">
                      ❌ Vibe Coder / Java OOP Antipattern
                    </span>
                    <span className="text-xs font-mono text-red-400 font-bold">611 LOC • 0 App Callers</span>
                  </div>

                  <div>
                    <h3 className="font-mono text-sm font-bold text-slate-100">
                      AuthManager.ts + auth.factory.ts
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Monolithic class holding imperative state. React components cannot subscribe to class field mutations without manual event emitters.
                    </p>
                  </div>

                  <pre className="rounded-lg bg-slate-950 p-3 text-[11px] font-mono text-red-300 border border-slate-800 overflow-x-auto">
{`export class AuthManager {
  private user: User | null = null;
  // ❌ Imperative mutation: React never knows!
  async login(creds) {
    this.user = await this.repo.login(creds);
    // UI SCREEN NEVER RE-RENDERS!
  }
}`}
                  </pre>

                  <div className="rounded-lg bg-slate-950 p-3 border border-red-900/40 space-y-1">
                    <div className="text-[11px] font-bold text-red-400">Why Developers Wrote It:</div>
                    <div className="text-xs text-slate-300">
                      Habitually imitating Spring Boot. Then mobile developers bypassed it because React screens were stuck on stale state!
                    </div>
                  </div>
                </div>

                {/* Green Corner: Modern TypeScript SSOT */}
                <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-emerald-900/60 px-2 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-700">
                      ✅ Senior Architect / Modern TS
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      78 LOC • 34 Active App Callers
                    </span>
                  </div>

                  <div>
                    <h3 className="font-mono text-sm font-bold text-slate-100">
                      useAuthStore.ts (Zustand)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Reactive module-scoped memory. Powered by <code>useSyncExternalStore</code> with surgical subscriptions and synchronous universal access via <code>getState()</code>.
                    </p>
                  </div>

                  <pre className="rounded-lg bg-slate-950 p-3 text-[11px] font-mono text-emerald-300 border border-slate-800 overflow-x-auto">
{`export const useAuthStore = create((set) => ({
  user: null,
  // ✅ Reactive mutation: Instant surgical UI update
  setUser: (user) => set({ user }),
}));
// Universal access outside React:
export const getToken = () => useAuthStore.getState().token;`}
                  </pre>

                  <div className="rounded-lg bg-slate-950 p-3 border border-emerald-900/40 space-y-1">
                    <div className="text-[11px] font-bold text-emerald-400">First Principles Victory:</div>
                    <div className="text-xs text-slate-300">
                      Zero provider wrappers, zero stale state bugs, and accessible anywhere in pure TypeScript (oRPC interceptors, sync workers).
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Context Hell vs. Zustand Matchup */}
            {activeBattle === 'context-hell' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-sky-400">
                      Interactive Re-Render Stress Test
                    </div>
                    <div className="text-xs text-slate-300">
                      Click &ldquo;Trigger Name Update&rdquo; to simulate a user typing or token heartbeat.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setContextRenders((c) => c + 10);
                      setZustandRenders((z) => z + 1);
                      setArenaMessage('⚡ Dispatched update: User displayName updated.');
                    }}
                    className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-400 transition shadow-lg"
                  >
                    🔥 Trigger Name Update
                  </button>
                </div>

                {arenaMessage && (
                  <div className="text-xs font-mono text-center text-amber-300 bg-amber-950/30 p-2 rounded border border-amber-800/40">
                    {arenaMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left: React 18 Context Hell */}
                  <div className="rounded-xl border border-red-900/60 bg-red-950/20 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-300">
                        ❌ React 18: Cascading Context Re-Render
                      </span>
                      <span className="rounded bg-red-900 px-2 py-0.5 text-xs font-mono text-red-200">
                        Total Re-Renders: {contextRenders}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      When any property in Context changes, <strong>all 10 child components re-render</strong>, dropping mobile frame rates!
                    </p>

                    {/* Mock Component Tree */}
                    <div className="grid grid-cols-5 gap-2 pt-2">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded border p-2 text-center text-[10px] font-mono transition-all duration-300 ${
                            contextRenders > 0
                              ? 'border-red-500 bg-red-500/20 text-red-200 scale-95'
                              : 'border-slate-800 bg-slate-950 text-slate-400'
                          }`}
                        >
                          C{i + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: React 19.3 Atomic Store */}
                  <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300">
                        ✅ React 19.3: Surgical Atomic Selector
                      </span>
                      <span className="rounded bg-emerald-900 px-2 py-0.5 text-xs font-mono text-emerald-200">
                        Total Re-Renders: {zustandRenders}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      Only Component #3 (subscribing to <code>s.user.displayName</code>) re-renders! The other 9 components skip rendering completely.
                    </p>

                    {/* Mock Component Tree */}
                    <div className="grid grid-cols-5 gap-2 pt-2">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded border p-2 text-center text-[10px] font-mono transition-all duration-300 ${
                            i === 2 && zustandRenders > 0
                              ? 'border-emerald-400 bg-emerald-500/30 text-emerald-200 scale-105'
                              : 'border-slate-800 bg-slate-950 text-slate-400'
                          }`}
                        >
                          {i === 2 ? 'C3 (User)' : `C${i + 1}`}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AuditManager Matchup */}
            {activeBattle === 'audit-manager' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="rounded-xl border border-red-900/60 bg-red-950/20 p-5 space-y-3">
                  <div className="text-xs font-bold text-red-300">
                    ❌ packages/core/.../AuditManager.ts (30 LOC)
                  </div>
                  <pre className="rounded bg-slate-950 p-3 text-xs font-mono text-red-300 border border-slate-800">
{`export class AuditManager {
  constructor(private repo: IAuditRepository) {}
  async log(entry) {
    return this.repo.log(entry); // Useless 1-line pass-through!
  }
}`}
                  </pre>
                  <p className="text-xs text-slate-400">
                    Does nothing except wrap <code>this.repo.log()</code>. Adds zero business value, doubles stack frames, and requires <code>misc.factory.ts</code> to instantiate.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-5 space-y-3">
                  <div className="text-xs font-bold text-emerald-300">
                    ✅ Functional Port Composition (2 LOC)
                  </div>
                  <pre className="rounded bg-slate-950 p-3 text-xs font-mono text-emerald-300 border border-slate-800">
{`export const recordAuditLog = (repo: IAuditRepository) => 
  (entry: AuditLogEntry) => repo.log(entry);`}
                  </pre>
                  <p className="text-xs text-slate-400">
                    Zero memory allocation overhead, tree-shakeable, and trivially testable with a mock repository.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* STUDIO 3: MONOREPO QUARANTINE & STRANGLER SIMULATOR            */}
        {/* ============================================================== */}
        {activeTab === 'quarantine-strangler' && (
          <div className="space-y-6">
            {/* Strangler Header & Simulator Toggle */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-red-400">
                    🗺️ Monorepo Accretive Quarantine
                  </div>
                  <h2 className="text-base font-black text-slate-100 mt-0.5">
                    32 Managers Audited: 30 Deadweight Zombies (94% Contamination)
                  </h2>
                </div>

                {/* THE STRANGLER SIMULATOR TOGGLE */}
                <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5">
                  <span className="text-xs font-bold text-slate-300">Simulate Clean Liquidation:</span>
                  <button
                    onClick={() => setIsSimulatedClean(!isSimulatedClean)}
                    className={`rounded px-2.5 py-1 text-xs font-black transition ${
                      isSimulatedClean
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'bg-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isSimulatedClean ? '✨ Clean Monorepo' : '🧟 Current Zombies'}
                  </button>
                </div>
              </div>

              {/* Before vs After Impact Metric */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Managers Files</div>
                  <div className="text-xl font-black text-slate-100 mt-0.5">
                    {isSimulatedClean ? '2 Active' : '32 Total'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {isSimulatedClean ? '-30 files liquidated' : '30 with 0 app callers'}
                  </div>
                </div>

                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Boilerplate LOC</div>
                  <div className="text-xl font-black text-amber-400 mt-0.5">
                    {isSimulatedClean ? '152 LOC' : '3,450 LOC'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {isSimulatedClean ? '-3,298 LOC pruned' : 'Ceremonial overhead'}
                  </div>
                </div>

                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Runtime Risk</div>
                  <div className="text-xl font-black text-emerald-400 mt-0.5">0.0%</div>
                  <div className="text-[11px] text-slate-400">Zero production apps affected</div>
                </div>

                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Preserved Dispatchers</div>
                  <div className="text-xl font-black text-sky-400 mt-0.5">Storage &amp; Telemetry</div>
                  <div className="text-[11px] text-slate-400">Legitimate platform ports</div>
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Inventory of packages/core/src/logic/managers/
                </div>
                <div className="flex gap-2">
                  {[
                    { id: 'all', label: 'All Files' },
                    { id: 'zero-app', label: '0 App Callers' },
                    { id: 'pass-through', label: 'Pass-Throughs' },
                    { id: 'factories', label: 'Factories' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setQuarantineFilter(f.id as any)}
                      className={`rounded px-2 py-1 text-[11px] font-bold transition border ${
                        quarantineFilter === f.id
                          ? 'bg-sky-500 text-slate-950 border-sky-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
                      <th className="p-3">File Name</th>
                      <th className="p-3">LOC</th>
                      <th className="p-3">Classification</th>
                      <th className="p-3 text-center">App Callers</th>
                      <th className="p-3 text-center">Core Callers</th>
                      <th className="p-3">Strangler Verdict</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {managersList
                      .filter((f) => {
                        if (isSimulatedClean && f.appCallersCount === 0) return false;
                        if (quarantineFilter === 'zero-app') return f.appCallersCount === 0;
                        if (quarantineFilter === 'pass-through') return f.classification.includes('PASS-THROUGH');
                        if (quarantineFilter === 'factories') return f.classification.includes('FACTORY');
                        return true;
                      })
                      .map((file) => {
                        const isDead = file.appCallersCount === 0;
                        return (
                          <tr key={file.file} className="hover:bg-slate-800/30 transition">
                            <td className="p-3 font-mono font-bold text-slate-200">{file.file}</td>
                            <td className="p-3 font-mono text-slate-400">{file.loc}</td>
                            <td className="p-3">
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                  file.classification.includes('PASS-THROUGH')
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : file.classification.includes('FACTORY')
                                    ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                    : file.classification.includes('ORPHANED')
                                    ? 'bg-red-950 text-red-300 border border-red-800'
                                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                }`}
                              >
                                {file.classification}
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono font-bold">
                              <span className={isDead ? 'text-red-400' : 'text-emerald-400'}>
                                {file.appCallersCount}
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono text-slate-400">
                              {file.coreCallersCount}
                            </td>
                            <td className="p-3 text-slate-300 text-[11px] max-w-sm">
                              {isDead ? '🔴 Safe to strangle under Deletion Veto.' : '🟢 Preserved.'}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setSelectedFileForModal(file.file)}
                                className="rounded px-2 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold text-[11px] transition"
                              >
                                🔍 Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick File Detail Modal */}
            {selectedFileForModal && (
              <div className="rounded-xl border border-sky-800 bg-sky-950/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-mono font-bold text-sky-300 text-sm">
                    {selectedFileForModal}
                  </div>
                  <button
                    onClick={() => setSelectedFileForModal(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ✕ Close
                  </button>
                </div>
                <p className="text-xs text-slate-300">
                  This file is located at <code>packages/core/src/logic/managers/{selectedFileForModal}</code>.
                  Inward caller count across all production apps is <strong>0</strong>.
                  It can be liquidated without breaking a single production screen.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* STUDIO 4: THE ROSETTA STONE & ETYMOLOGY EXPLORER               */}
        {/* ============================================================== */}
        {activeTab === 'rosetta-stone' && (
          <div className="space-y-6">
            {/* Rosetta Header & Search */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    📖 The Architectural Rosetta Stone
                  </div>
                  <h2 className="text-base font-black text-slate-100 mt-0.5">
                    Origins, Etymology &amp; First Principles Translation
                  </h2>
                </div>

                {/* Search Bar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rosettaSearch}
                    onChange={(e) => setRosettaSearch(e.target.value)}
                    placeholder="Search Singleton, Factory, ESM..."
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-64"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-3">
                {[
                  { id: 'all', label: 'All Terms' },
                  { id: 'patterns', label: 'OOP Patterns (GoF 1994)' },
                  { id: 'modules', label: 'ES Modules & Runtimes' },
                  { id: 'state', label: 'React 18 vs 19 State' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setRosettaCategory(c.id as any)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition border ${
                      rosettaCategory === c.id
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rosetta Terms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRosetta.map((item) => {
                const isExpanded = expandedTerm === item.term;
                return (
                  <div
                    key={item.term}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black text-slate-100">
                          {item.term}
                        </span>
                        <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800">
                          {item.category.toUpperCase()}
                        </span>
                      </div>
                      <button
                        onClick={() => setExpandedTerm(isExpanded ? null : item.term)}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
                      >
                        {isExpanded ? 'Collapse ▴' : 'Expand ▾'}
                      </button>
                    </div>

                    {/* Etymology */}
                    <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1">
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        🏛️ Etymology &amp; Historical Origin:
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.etymology}</p>
                    </div>

                    {/* Why Java Needed It */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-red-400">Why Java / OOP Used It:</div>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.whyJavaNeededIt}</p>
                    </div>

                    {/* Modern TS Reality */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-emerald-400">
                        ⚡ Modern TypeScript 2026 Reality:
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.modernTsReality}</p>
                    </div>

                    {/* Expandable Code Sample */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                          Code Comparison:
                        </div>
                        <pre className="rounded bg-slate-950 p-3 text-xs font-mono text-slate-300 border border-slate-800 overflow-x-auto leading-relaxed">
                          <code>{item.codeSample}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
