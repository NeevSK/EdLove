# Agent Briefing Framework: Offline-First vs Offline-Capable Discernment
## Feature-Level Decision Trees & Guided Implementation Prompts

---

## PART 0: THE CORE DISTINCTION (Remind Agent)

**Before any coding, agent must understand:**

```
OFFLINE-FIRST:
  ✓ Device is source of truth (during offline)
  ✓ User can work completely offline
  ✓ Mutations happen locally first, sync later
  ✓ Server eventually catches up
  ✓ Example: Teacher creates lesson offline
  
OFFLINE-CAPABLE:
  ✓ Server is primary source of truth
  ✓ Device caches for graceful degradation
  ✓ User can READ offline (cached), but NOT write
  ✓ Mutations require online
  ✓ Example: Student reads cached lesson (offline), can't create new

KEY DIFFERENCE:
  Offline-first = user works offline, device queues changes
  Offline-capable = user reads offline, writes only online
```

---

## PART 1: PRE-CODING DISCOVERY QUESTIONS FOR AGENT

**Before agent writes a single line, ask these questions in order:**

### STEP 1: Identify the Feature

```
PROMPT TO AGENT:

"You're building [FEATURE_NAME].

Before we code, we need to understand the offline strategy.

First: describe the user journey for this feature.
- Who uses it? (Teacher? Student? Principal?)
- What's their primary action? (Create? Read? Update? Delete?)
- When do they do this? (During lesson? Before? After?)

Example:
  'Teacher records attendance during class.
   User action: mark student present/absent.
   When: while class is happening (might be offline or online).'"

AGENT RESPONDS: [Describes the user journey clearly]

YOUR CHECK:
  - Can you picture the user doing this?
  - Is the action clear (create/read/update/delete)?
  - Do you know the context (when, where, why)?
```

### STEP 2: Offline Feasibility

```
PROMPT TO AGENT:

"Now: Is it physically possible for this feature to work offline?

Answer YES or NO to each:

A) Can the user PERFORM this action without network?
   Example:
     Attendance: YES (user can mark students present/absent without internet)
     Leaderboard: NO (needs to fetch live scores from server)

B) Can the result be STORED locally until sync?
   Example:
     Attendance: YES (store in SQLite, sync when online)
     Real-time chat: PARTIAL (can queue messages, but user can't see others' responses)

C) Is there an ACCEPTABLE DELAY between action and sync?
   Example:
     Attendance: YES (5 minutes delay is fine)
     Live exam: NO (student needs real-time feedback)

AGENT MUST ANSWER ALL THREE."

AGENT RESPONDS: [Answers A, B, C with reasoning]

YOUR CHECK:
  - If all three are YES: Offline-first is possible
  - If any is NO: Offline-capable only
  - If B is PARTIAL or C has caveat: Hybrid (see PART 2)
```

### STEP 3: User Expectation

```
PROMPT TO AGENT:

"What does the USER expect?

D) Would a typical user expect to work offline for this feature?
   Example:
     Attendance: YES (teacher expects to work during class, might lose signal)
     Community post: NO (user expects to browse, can wait to post)

E) Is offline access a NICE-TO-HAVE or a NEED-TO-HAVE?
   Example:
     Task creation: NEED (field workers must work offline)
     Leaderboard: NICE (can wait until online)

AGENT MUST ANSWER BOTH."

AGENT RESPONDS: [Answers D, E with user perspective]

YOUR CHECK:
  - NEED-TO-HAVE + feasible = Offline-first
  - NICE-TO-HAVE + feasible = Offline-capable
  - Not feasible = Online-only
```

### STEP 4: Data Conflict Risk

```
PROMPT TO AGENT:

"Could CONFLICTS happen?

F) Can MULTIPLE PEOPLE write to the same data?
   Example:
     Attendance: NO (only teacher marks attendance)
     Shared document: YES (multiple teachers edit same doc)

G) If conflicts happen, is DATA LOSS acceptable?
   Example:
     Attendance: NO (can't lose attendance records)
     Comment: MAYBE (worst case: comment posted twice)

H) How would you RESOLVE conflicts?
   Example:
     Attendance: LWW (last teacher's mark wins)
     Shared doc: CRDT or manual merge

AGENT MUST ANSWER ALL THREE."

AGENT RESPONDS: [Answers F, G, H with conflict strategy]

YOUR CHECK:
  - Conflicts likely + data loss unacceptable = Need robust conflict resolution
  - No conflicts = Simpler offline-first
  - Conflicts acceptable + LWW works = LWW is fine
```

---

## PART 2: DECISION MATRIX (Agent Uses This)

**Once agent answers STEP 1-4, use this matrix:**

### Matrix: Feature → Strategy

| Feature | Feasible | User Expects | Conflicts | → Strategy |
|---------|----------|--------------|-----------|-----------|
| **Attendance** | YES | NEED | NO | **Offline-First** |
| **Lesson Plan** | YES | NEED | MAYBE | **Offline-First + LWW** |
| **Real-time Chat** | PARTIAL | NEED | NO | **Online-First, Queue offline** |
| **Leaderboard** | NO | NICE | NO | **Online-Only** |
| **Student Notes** | YES | NEED | NO | **Offline-First** |
| **Grading** | YES | NEED | MAYBE | **Offline-First + LWW** |
| **Community Post** | NO | NICE | NO | **Online-Only** |
| **Customer List** | YES | NICE | NO | **Offline-Capable** |

---

## PART 3: IMPLEMENTATION STRATEGY PER DECISION

Once the strategy is chosen, here's how to code it:

### STRATEGY 1: Offline-First (No Conflicts)

```
PROMPT TO AGENT:

"This feature is OFFLINE-FIRST with no conflicts.

Implementation checklist:

1. DATA LAYER:
   - Create SQLite table for this data
   - Table schema: id, data_fields, created_at, updated_at, pending_sync, sync_error
   - Primary key: id (UUID)

2. HOOK LAYER:
   - Create useFeatureName hook
   - Hook fetches from SQLite first (offline)
   - Hook fetches from server second (online)
   - Hook invalidates on mutation
   - Hook has offline detection (isOnline flag)

3. MUTATION LAYER:
   - useMutationFeatureName for writes
   - Write to SQLite immediately (optimistic)
   - Queue in PowerSync
   - On success: mark pending_sync = false
   - On error: show error, keep pending_sync = true
   - User can retry later

4. UI LAYER:
   - Show 'Offline' badge if offline
   - Don't disable UI (user can still work)
   - Show 'Syncing...' while syncing
   - Show 'Sync failed' if error (with retry button)

5. CACHING:
   - React Query key: ['feature', userId, workspaceId]
   - Stale time: Infinity (offline is source of truth)
   - Invalidate on: mutation success

Example implementation for 'Attendance':

// Table: attendance
CREATE TABLE attendance (
  id TEXT PRIMARY KEY,
  classroom_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  status TEXT NOT NULL, -- 'present', 'absent', 'late'
  recorded_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  pending_sync BOOLEAN DEFAULT true,
  sync_error TEXT NULL
);

// Hook: useAttendanceRecord
export function useAttendanceRecord(classroomId: string) {
  const { isOnline } = useDeviceState();
  
  return useQuery({
    queryKey: ['attendance', classroomId],
    queryFn: async () => {
      if (isOnline) {
        // Fetch from server
        const data = await fetch(`/api/attendance/${classroomId}`);
        // Persist to SQLite
        await database.attendance.upsert(data);
        return data;
      } else {
        // Offline: fetch from SQLite
        return database.attendance.findByClassroom(classroomId);
      }
    },
    staleTime: Infinity,
  });
}

// Mutation: useRecordAttendance
export function useRecordAttendance() {
  const { isOnline } = useDeviceState();
  const db = useDatabase();
  
  return useMutation({
    mutationFn: async (data) => {
      // Step 1: Write to SQLite immediately
      const record = await db.attendance.create({
        ...data,
        pending_sync: true,
      });
      
      // Step 2: If online, sync to server immediately
      if (isOnline) {
        try {
          await fetch('/api/attendance', {
            method: 'POST',
            body: JSON.stringify(data),
          });
          
          // Mark as synced
          await db.attendance.update(record.id, { pending_sync: false });
        } catch (err) {
          // Keep pending_sync = true, will retry later
          await db.attendance.update(record.id, { 
            sync_error: err.message 
          });
        }
      }
      
      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance']);
    },
  });
}
```

AGENT CHECKLIST:
  [ ] SQLite table created
  [ ] Hook uses SQLite first
  [ ] Mutation writes to SQLite immediately
  [ ] pending_sync tracked
  [ ] PowerSync watches table
  [ ] UI shows offline/syncing status
  [ ] Errors shown (not silent)
"
```

---

### STRATEGY 2: Offline-First + Conflict Resolution (LWW)

```
PROMPT TO AGENT:

"This feature is OFFLINE-FIRST with MULTIPLE WRITERS.
Use Last-Write-Wins (LWW) for conflict resolution.

Implementation checklist:

1. DATA LAYER:
   - Add: updated_at TIMESTAMP (when this was last written)
   - Add: updated_by UUID (who wrote it)
   - Add: version INTEGER (for conflict detection)
   - PowerSync uses updated_at for LWW

2. CONFLICT DETECTION:
   - When syncing: check if server version > local version
   - If server newer: use server version (LWW)
   - If local newer: keep local version
   - Show user if conflict was resolved

3. MUTATION LAYER:
   - Add idempotency_key (UUID per mutation)
   - Prevents duplicate records on retry
   - Server validates idempotency_key

4. UI LAYER:
   - Show 'Syncing...' while syncing
   - Show 'Conflict detected' if LWW loses user's data
   - Offer 'Undo' or 'View server version' option
   - Don't silently lose data

5. CACHING:
   - React Query key includes version: ['feature', id, version]
   - Invalidate on mutation (version changes)

Example implementation for 'Lesson Plan' (multiple teachers edit):

// Table: lesson_plans
CREATE TABLE lesson_plans (
  id TEXT PRIMARY KEY,
  classroom_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL,  -- ← For LWW
  updated_by UUID NOT NULL,        -- ← Who updated
  version INTEGER DEFAULT 1,       -- ← For conflict detection
  pending_sync BOOLEAN DEFAULT true,
  sync_error TEXT NULL
);

// Mutation: useUpdateLessonPlan
export function useUpdateLessonPlan() {
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const idempotencyKey = uuidv4();
      const now = new Date();
      
      // Write to SQLite with timestamp
      const updated = await db.lessonPlans.update(id, {
        ...updates,
        updated_at: now,
        updated_by: currentUser.id,
        version: (old.version || 0) + 1,
        pending_sync: true,
        idempotency_key, // For server dedup
      });
      
      // If online: sync to server
      if (isOnline) {
        try {
          const response = await fetch(`/api/lesson-plans/${id}`, {
            method: 'PATCH',
            headers: {
              'Idempotency-Key': idempotencyKey,
            },
            body: JSON.stringify({
              ...updates,
              updated_at: now,
            }),
          });
          
          const serverVersion = await response.json();
          
          // LWW: compare timestamps
          if (serverVersion.updated_at > now) {
            // Server is newer: use server version
            await db.lessonPlans.update(id, {
              ...serverVersion,
              version: serverVersion.version,
            });
            
            // Notify user of conflict
            return {
              ...updated,
              conflictDetected: true,
              message: 'Another teacher updated this. Showing their version.',
            };
          } else {
            // Local is newer: keep local
            await db.lessonPlans.update(id, { pending_sync: false });
          }
        } catch (err) {
          await db.lessonPlans.update(id, { sync_error: err.message });
        }
      }
      
      return updated;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries(['lessonPlan', id]);
      
      if (result.conflictDetected) {
        showNotification({
          type: 'warning',
          title: 'Conflict detected',
          message: result.message,
          actions: [
            { label: 'Undo', onPress: handleUndo },
            { label: 'Keep', onPress: () => {} },
          ],
        });
      }
    },
  });
}
```

AGENT CHECKLIST:
  [ ] updated_at timestamp tracked
  [ ] updated_by user tracked
  [ ] version number incremented
  [ ] Idempotency key generated
  [ ] LWW comparison logic: server.updated_at vs local.updated_at
  [ ] Conflict detected? Show to user
  [ ] Mutation includes timestamp
  [ ] PowerSync configured for LWW
  [ ] Undo/view option for conflicts
"
```

---

### STRATEGY 3: Online-First, Queue Offline

```
PROMPT TO AGENT:

"This feature is ONLINE-FIRST but QUEUES offline.
User can't see results offline, but actions queue for sync.

Implementation checklist:

1. DATA LAYER:
   - SQLite table with pending_sync flag
   - Queue table: { id, action, payload, timestamp, status }

2. READ BEHAVIOR:
   - Offline: show cached data with 'offline' badge
   - Don't allow mutations offline

3. WRITE BEHAVIOR:
   - Online: send immediately to server
   - Offline: queue locally, show 'Queued' badge
   - When online: sync queue, show 'Syncing...'

4. UI LAYER:
   - Disable write buttons if offline (can't send)
   - Show 'Offline' badge
   - Show 'Queued X actions' if queue has items
   - Show 'Syncing...' while syncing

5. CACHING:
   - React Query: short staleTime (data goes stale fast)
   - Invalidate on: online reconnect, mutation success

Example implementation for 'Real-time Chat':

// Table: messages (read-only cache)
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  classroom_id TEXT NOT NULL,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  cached_at TIMESTAMP DEFAULT NOW()
);

// Table: pending_messages (write queue)
CREATE TABLE pending_messages (
  id TEXT PRIMARY KEY,
  classroom_id TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'syncing', 'synced', 'failed'
  created_at TIMESTAMP DEFAULT NOW(),
  error TEXT NULL
);

// Hook: useChatMessages
export function useChatMessages(classroomId: string) {
  const { isOnline } = useDeviceState();
  
  return useQuery({
    queryKey: ['chat', classroomId],
    queryFn: async () => {
      // Always try to fetch fresh messages
      if (isOnline) {
        const fresh = await fetch(`/api/chat/${classroomId}`);
        await db.messages.upsert(fresh);
        return fresh;
      } else {
        // Offline: return cached
        return db.messages.findByClassroom(classroomId);
      }
    },
    staleTime: 10_000, // Stale after 10s (real-time critical)
    retry: 1,
  });
}

// Mutation: useSendChatMessage
export function useSendChatMessage() {
  const { isOnline } = useDeviceState();
  const db = useDatabase();
  
  return useMutation({
    mutationFn: async ({ classroomId, content }) => {
      if (!isOnline) {
        // Offline: queue locally
        const queued = await db.pendingMessages.create({
          classroom_id: classroomId,
          content,
          status: 'pending',
        });
        
        return {
          id: queued.id,
          status: 'queued',
          message: 'Message queued. Will send when online.',
        };
      }
      
      // Online: send immediately
      const response = await fetch(`/api/chat/${classroomId}`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) throw new Error('Send failed');
      
      const message = await response.json();
      await db.messages.upsert(message);
      
      return {
        id: message.id,
        status: 'sent',
        message: 'Message sent!',
      };
    },
    onSuccess: (result) => {
      if (result.status === 'sent') {
        queryClient.invalidateQueries(['chat']);
      }
    },
  });
}

// Background sync for queue
useEffect(() => {
  if (!isOnline) return;
  
  const syncQueue = async () => {
    const pending = await db.pendingMessages.findByStatus('pending');
    
    for (const message of pending) {
      try {
        await db.pendingMessages.update(message.id, { status: 'syncing' });
        
        const response = await fetch(`/api/chat/${message.classroom_id}`, {
          method: 'POST',
          body: JSON.stringify({ content: message.content }),
        });
        
        if (response.ok) {
          await db.pendingMessages.delete(message.id);
        } else {
          await db.pendingMessages.update(message.id, { 
            status: 'failed',
            error: 'Server rejected message',
          });
        }
      } catch (err) {
        await db.pendingMessages.update(message.id, { 
          status: 'failed',
          error: err.message,
        });
      }
    }
  };
  
  syncQueue();
}, [isOnline]);
```

AGENT CHECKLIST:
  [ ] Reads work offline (from cache)
  [ ] Writes queued if offline
  [ ] Queue table tracks status (pending/syncing/synced/failed)
  [ ] Background sync watches queue
  [ ] UI shows 'Queued' badge
  [ ] Write button disabled offline
  [ ] Errors shown for failed syncs
  [ ] Manual retry for failed messages
"
```

---

### STRATEGY 4: Online-Only

```
PROMPT TO AGENT:

"This feature is ONLINE-ONLY.
User can't work offline. Don't queue mutations.

Implementation checklist:

1. DATA LAYER:
   - SQLite: cache only (no mutation tracking)
   - No pending_sync field needed

2. READ BEHAVIOR:
   - Online: fetch fresh
   - Offline: show cached with 'offline' badge
   - Cache: short TTL (data might be stale)

3. WRITE BEHAVIOR:
   - Online: enabled
   - Offline: DISABLED (button greyed out)
   - No queuing

4. UI LAYER:
   - Disable all write buttons if offline
   - Show 'Offline' badge
   - Show message: 'Requires internet connection'

5. CACHING:
   - React Query: very short staleTime (maybe 30s)
   - Aggressive refetching

Example implementation for 'Leaderboard':

// Hook: useLeaderboard
export function useLeaderboard(classroomId: string) {
  const { isOnline } = useDeviceState();
  
  return useQuery({
    queryKey: ['leaderboard', classroomId],
    queryFn: async () => {
      const fresh = await fetch(`/api/leaderboard/${classroomId}`);
      if (fresh.ok) {
        const data = await fresh.json();
        await db.leaderboardCache.upsert(data);
        return data;
      }
      // If fetch fails, return cached (might be stale)
      return db.leaderboardCache.findByClassroom(classroomId);
    },
    staleTime: 30_000, // Very fresh (30s)
    retry: 1,
    enabled: isOnline, // Only fetch if online
  });
}

// Mutation: disabled offline
export function useUpvoteStudent() {
  const { isOnline } = useDeviceState();
  
  return useMutation({
    mutationFn: async ({ studentId }) => {
      if (!isOnline) {
        throw new Error('Requires internet connection');
      }
      
      return fetch(`/api/upvote/${studentId}`, { method: 'POST' });
    },
    onError: (error) => {
      if (error.message === 'Requires internet connection') {
        showNotification({
          title: 'Offline',
          message: 'This action requires an internet connection.',
        });
      }
    },
  });
}
```

AGENT CHECKLIST:
  [ ] Read: works offline (from cache), shows 'offline' badge
  [ ] Write: DISABLED offline (button greyed out)
  [ ] No queuing
  [ ] Short cache TTL
  [ ] Error message: 'Requires internet connection'
  [ ] No pending_sync tracking
"
```

---

## PART 4: AGENT PROMPT TEMPLATE (Copy-Paste Ready)

```
====================================================================
AGENT BRIEFING: [FEATURE_NAME]
====================================================================

CONTEXT:
  This is Gurudevi, an educational platform with offline-first architecture.
  Philosophy: student sovereignty, perspective bonds, holon integrity.

FEATURE: [FEATURE_NAME]
  User journey: [DESCRIBE USER JOURNEY]
  Primary action: [CREATE/READ/UPDATE/DELETE]
  
DISCOVERY QUESTIONS (Answer before coding):

1. Can the user perform this action without internet?
   Answer: YES / NO / PARTIAL
   Reasoning: [WHY?]

2. Can results be stored locally until sync?
   Answer: YES / NO / PARTIAL
   Reasoning: [WHY?]

3. Is offline access acceptable to the user?
   Answer: YES (NEED) / MAYBE (NICE) / NO (NOT NEEDED)
   Reasoning: [WHY?]

4. Can multiple people write to same data?
   Answer: YES / NO
   Reasoning: [WHY?]

5. If conflicts happen, is data loss acceptable?
   Answer: YES / NO / MAYBE
   Reasoning: [WHY?]

---

IMPLEMENTATION STRATEGY:
  Based on your answers, the strategy is: [OFFLINE-FIRST / OFFLINE-CAPABLE / ONLINE-FIRST+QUEUE / ONLINE-ONLY]

  See "Strategy: [X]" section in guide for detailed implementation.

---

CODE CHECKLIST:
  [ ] Follow the implementation checklist for your strategy
  [ ] SQLite schema matches guide
  [ ] Hook layer enforces strategy
  [ ] Mutation layer handles offline correctly
  [ ] UI shows correct badges/states
  [ ] Error handling: silent fails = BAD, shown errors = GOOD
  [ ] Caching: correct invalidation on mutations
  [ ] Perspective bond: user only sees their data
  [ ] Accessibility: all interactive elements labeled

---

DO NOT CODE until you've answered discovery questions.
DO NOT SKIP the UI state badges (offline, syncing, queued, errors).
DO NOT cache more data than needed (low-end devices, 2GB RAM).
DO NOT ignore conflicts if they're possible.

Ready to answer discovery questions?
```

---

## PART 5: WORKFLOW (How You Use This)

### With Agent (Conversation Flow)

```
YOU:   "Build the attendance feature"

AGENT: "I'll code attendance. Let me ask questions first..."

[Agent answers discovery questions]

YOU:   Check answers, make sure they align with Gurudevi's needs:
       - Can teachers work offline during class? YES (expected)
       - Only teacher marks attendance? YES (no conflicts)
       - Offline queuing acceptable? YES

[Agent proposes strategy]

YOU:   Review: "Offline-First + SQLite + PowerSync + No conflicts" ✓

[Agent codes using Strategy 1 checklist]

YOU:   Review against checklist:
       [ ] SQLite table created? ✓
       [ ] Hook uses SQLite first? ✓
       [ ] Mutation writes immediately? ✓
       [ ] pending_sync tracked? ✓
       [ ] UI shows 'Syncing' badge? ✓

YOU:   "Looks good. Ship it."
```

### Key Points

1. **Discovery first, code second.** Not assumptions.
2. **Agent answers questions explicitly.** Forces clarity.
3. **Strategy emerges from discovery.** Not arbitrary.
4. **Checklist validates implementation.** Catches gaps.
5. **UI state badges non-negotiable.** User always knows status.

---

## FINAL PROMPT (Copy This for Agent)

```
====================================================================
GURUDEVI DEVELOPMENT: OFFLINE STRATEGY DISCOVERY
====================================================================

FEATURE: [FEATURE_NAME]

Before you code, answer these discovery questions.
Don't assume. Answer explicitly.

1. USER JOURNEY
   Describe: Who uses this? What's their action? When/where?
   
2. OFFLINE FEASIBILITY
   A) Can user perform this action offline? YES / NO / PARTIAL
   B) Can results be stored locally? YES / NO / PARTIAL
   C) Is delayed sync acceptable? YES / NO (with reason)
   
3. USER EXPECTATION
   D) Should user expect offline support? YES / NO
   E) Is offline NEED or NICE-TO-HAVE?
   
4. CONFLICT RISK
   F) Can multiple people edit same data? YES / NO
   G) Is data loss acceptable if conflicts? YES / NO / MAYBE
   H) How resolve conflicts? (LWW / CRDT / Manual / None)

Once you answer all 8 questions, I'll assign your implementation strategy.

Ready?
```

---

## SUMMARY

This framework:

✅ **Prevents misalignment** (agent can't accidentally build online-only when you need offline-first)
✅ **Makes decisions explicit** (not hidden in code)
✅ **Provides checklists** (validation before shipping)
✅ **Scalable** (works for every feature)
✅ **Philosophy-grounded** (honors perspective bonds, holon integrity)

Use this for every feature.

The "drama" (offline-first vs offline-capable confusion) disappears because decisions are made upfront, not during coding.
