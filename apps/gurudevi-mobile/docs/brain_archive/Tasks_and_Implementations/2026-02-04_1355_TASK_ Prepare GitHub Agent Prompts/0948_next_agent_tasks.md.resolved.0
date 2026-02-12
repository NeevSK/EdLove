# NEXT AGENT TASKS - STRATEGIC ROADMAP

## 📊 CURRENT STATUS

### **✅ COMPLETED BY AGENT** (7 components):
- SanctuaryCard
- LotusTextInput, LotusDropdown
- LotusPetalFAB
- GradeEntryForm, GradebookTable, ReportCard
- Grade types + grading utilities

### **🎯 READY TO BUILD NEXT**:

---

## 🚀 BATCH 1: COMPLETE UI FOUNDATION (High Priority)

**Estimated Cost**: ~8-12 premium requests  
**Time to build**: Agent works in background (~30 min)  
**Prerequisites**: None (can start now!)

### **1. LotusButton Component** (2 requests)
```
Missing from original 5 prompts!
Build at: src/components/LotusButton.tsx
Reference: Planning/agent_mode_prompts.md - Prompt 1
```

**Why**: GradeEntryForm and others import this - CRITICAL!

### **2. BreathingLoader Component** (2 requests)
```
Build at: src/components/BreathingLoader.tsx
Pulsing circle loader (scale 0.8 ↔ 1.0, 1.5s cycle)
Used for: Save states, data loading
Reference: DESIGN_SYSTEM.md section 9.3
```

### **3. EmptyState Component** (2 requests)
```
Build at: src/components/EmptyState.tsx
Gentle empty states with icon, title, description, action button
Reference: DESIGN_SYSTEM.md section 9.4
```

### **4. ErrorMessage Component** (2 requests)
```
Build at: src/components/ErrorMessage.tsx
Three types: gentle, warning, severe
Reference: DESIGN_SYSTEM.md section 9.5
```

---

## 🌸 BATCH 2: SELF SECTION - WELLBEING FEATURES (Medium Priority)

**Estimated Cost**: ~15-20 premium requests  
**Prerequisites**: Batch 1 components

### **5. Mood Check-In Screen** (4-5 requests)
```
Build at: src/screens/MoodCheckInScreen.tsx
Features:
- Mood selector (5 moods: peaceful, energized, tired, anxious, grateful)
- Optional text reflection
- Time-based greeting
- Save to Supabase
Components needed: LotusButton, SanctuaryCard, LotusTextInput
```

### **6. Fire Journaling Screen** (4-5 requests)
```
Build at: src/screens/FireJournalScreen.tsx
Features:
- Timed writing session (5/10/15 min)
- No editing (stream of consciousness)
- Optional prompts
- Save entries to Supabase
```

### **7. Breathing Exercise Screen** (3-4 requests)
```
Build at: src/screens/BreathingExerciseScreen.tsx
Features:
- 4-7-8 breathing pattern
- Visual breathing circle (expand/contract)
- Optional sound cues
- Track completed sessions
```

### **8. Leadership Reflection (Principals)** (3-4 requests)
```
Build at: src/screens/LeadershipReflectionScreen.tsx
Role-gated: Principals only
Features:
- Weekly reflection prompts
- School-wide insights
- Team sentiment tracking
```

---

## 📚 BATCH 3: CLASSROOM FEATURES (Medium Priority)

**Estimated Cost**: ~12-16 requests  
**Prerequisites**: Database schema for classrooms

### **9. Classroom CRUD Screens** (5-6 requests)
```
Build:
- src/screens/CreateClassroomScreen.tsx
- src/screens/EditClassroomScreen.tsx
- src/screens/ClassroomDetailScreen.tsx

Features:
- Create/edit classroom
- Add students (roster)
- Set grading mode dropdown
- Archive classroom
```

### **10. Attendance Tracker** (4-5 requests)
```
Build at: src/components/AttendanceTracker.tsx
Features:
- Daily attendance grid
- Swipe gestures (present/absent/late)
- Monthly calendar view
- Sync to Supabase
```

### **11. Lesson Creator** (3-4 requests)
```
Build at: src/screens/CreateLessonScreen.tsx
Features:
- Title, description, grade level
- Attach resources
- Save to Classroom or Library
- Schedule lesson
```

---

## 🗄️ BATCH 4: DATABASE INTEGRATION (High Priority, But Complex)

**Estimated Cost**: ~10-15 requests  
**Prerequisites**: Supabase schema created

### **12. API Service Layer** (6-8 requests)
```
Build:
- src/services/classroomService.ts
- src/services/gradeService.ts
- src/services/attendanceService.ts
- src/services/moodService.ts

Features:
- CRUD operations for each entity
- Error handling
- TypeScript types
- Supabase client usage
```

### **13. RLS Policies** (Manual - NOT Agent)
```
Create in Supabase dashboard:
- Row-level security for multi-tenancy
- Role-based access (student/teacher/principal)

WHY NOT AGENT: Requires Supabase admin access
```

---

## 📱 BATCH 5: PROFILE & POLISH (Low Priority)

**Estimated Cost**: ~6-10 requests

### **14. ProfileScreen Split** (2-3 requests)
```
Refactor src/screens/ProfileScreen.tsx
Already in original prompts - do we need this?
Check if Agent already did it!
```

### **15. Language Switching** (2-3 requests)
```
Enhance i18n integration
Add language selector to ProfileScreen
Persist selection to AsyncStorage
```

### **16. Dark/Light Mode Toggle** (2-4 requests)
```
Implement theme switching
Add toggle to ProfileScreen > App Settings
Use React Context for theme state
```

---

## 🎯 RECOMMENDED PRIORITIZATION

### **PHASE 1: Complete Foundation** (Do THIS WEEK)
1. ✅ LotusButton (URGENT - others need it!)
2. ✅ BreathingLoader
3. ✅ EmptyState
4. ✅ ErrorMessage

**Total**: ~8 requests, gets all base components done

---

### **PHASE 2: One Feature End-to-End** (NEXT WEEK)
Pick ONE vertical slice to prove everything works:

**Option A: Mood Check-In** (Simpler, good demo)
- Build Mood Check-In screen
- Create Supabase table
- Build API service
- Test full flow (UI → DB → UI)

**Option B: Classroom Management** (More complex, core feature)
- Build Classroom CRUD
- Create Supabase tables
- Build classroom service
- Test creating classroom → adding students

**Recommendation**: **Option A** - faster win, easier to demo

---

### **PHASE 3: Expand Features** (MONTH 1)
- Add remaining Self features
- Add remaining Classroom features
- Test with real users (friends/teachers)

---

## 💰 BUDGET PLANNING

**Your capacity**: 300 premium requests/month

**Estimated usage**:
- Phase 1: ~8 requests (3% budget)
- Phase 2: ~15-20 requests (7% budget)
- Phase 3: ~40-50 requests (17% budget)

**Total for MVP**: ~60-80 requests (27% budget)

**You have PLENTY of room!** 🎉

---

## 🎨 WHAT AGENT CAN BUILD (Capabilities)

### **✅ AGENT IS GREAT AT**:
- UI components (React Native)
- TypeScript utilities
- Service layers (API calls)
- Form screens
- Animation implementations
- Multi-file features (proven!)

### **⚠️ AGENT STRUGGLES WITH**:
- Database migrations (manual)
- RLS policies (requires Supabase access)
- Complex state management (Zustand stores - needs guidance)
- Native modules (camera, permissions - needs testing)

### **❌ AGENT CAN'T DO**:
- Deploy to app stores
- Create Supabase projects
- Test on physical devices
- Design UI mockups (you decide look)

---

## 📋 NEXT IMMEDIATE ACTIONS

**TODAY**:
1. ✅ Check if LotusButton exists
2. ✅ If not, give Agent Prompt 1
3. ✅ Test one component in app (verify animations)

**THIS WEEK**:
4. Build Batch 1 (foundation components)
5. Set up Supabase schema (manually)
6. Build Mood Check-In (end-to-end test)

**THIS MONTH**:
7. Expand to all Self features
8. Add Classroom management
9. Test with 5-10 users

---

**Ready to start Batch 1?** We can give Agent all 4 prompts in parallel! 🚀
