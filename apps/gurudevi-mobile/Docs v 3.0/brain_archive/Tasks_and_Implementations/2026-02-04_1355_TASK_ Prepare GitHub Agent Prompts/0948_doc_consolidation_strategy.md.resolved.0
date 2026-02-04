# DOCUMENTATION CONSOLIDATION STRATEGY

## 🚨 THE PROBLEM

**Current state**: 13 artifacts in brain folder!
- ❌ Hard to find specific info
- ❌ Lots of overlap
- ❌ Getting overwhelming
- ❌ Phase transition approaching

**You're right!** We need better strategy.

---

## 📊 CURRENT DOCS (13 Total)

### **Planning & Strategy** (6):
1. status_and_action_plan.md
2. immediate_action_plan.md
3. grading_system_design.md
4. frontend_only_tasks.md
5. lotus_fab_plan.md
6. next_agent_tasks.md (NEW)

### **Workflow & Reference** (4):
7. github_agent_delegation_guide.md
8. agent_mode_prompts.md
9. agent_reference_guide.md
10. agent_review_walkthrough.md

### **Knowledge Base** (3):
11. powershell_cheatsheet.md
12. learnings.md
13. README.md

---

## 🎯 PROPOSED CONSOLIDATION

### **MERGE INTO 4 CORE DOCS**:

---

### **1. MASTER_PLAN.md** (The Main Reference)

**Consolidate**:
- ✅ next_agent_tasks.md (current roadmap)
- ✅ status_and_action_plan.md (phase tracking)
- ✅ immediate_action_plan.md (decisions made)

**Structure**:
```markdown
# GURUDEVI MASTER PLAN

## Project Status
- Current Phase
- Completed Features
- In Progress

## Next Steps
- Immediate priorities
- Agent task batches
- Timeline

## Key Decisions
- Architecture decisions
- Feature scope
- Approved designs

## Blockers & Questions
- Current blockers
- Unanswered questions
```

**Update frequency**: After each major milestone

---

### **2. QUICK_REFERENCE.md** (Copy-Paste Ready)

**Consolidate**:
- ✅ agent_mode_prompts.md (ready prompts)
- ✅ powershell_cheatsheet.md (commands)
- ✅ agent_reference_guide.md (how to use)

**Structure**:
```markdown
# QUICK REFERENCE

## Agent Prompts (Copy-Paste)
[All component prompts]

## Git & PowerShell Commands
[Common commands]

## How to Use Agent
[Reference syntax]

## Troubleshooting
[Common issues]
```

**Update frequency**: When new prompts added

---

### **3. SESSION_JOURNAL.md** (Living Document)

**Consolidate**:
- ✅ learnings.md (discoveries)
- ✅ agent_review_walkthrough.md (verifications)

**Structure**:
```markdown
# SESSION JOURNAL

## [Date] - [Topic]
- What we learned
- What we built
- What worked/didn't work
- Key insights

[Append new sessions at top]
```

**Update frequency**: After each work session

---

### **4. ARCHIVE/** (Old Plans)

**Move here**:
- grading_system_design.md → Already in repo Planning/
- lotus_fab_plan.md → Already in repo Planning/
- frontend_only_tasks.md → Completed, archive
- github_agent_delegation_guide.md → Keep (still relevant)

**Purpose**: Historical reference only

---

## 📋 CONSOLIDATION PLAN

### **Step 1: Create Master Plan**
```
Merge:
- next_agent_tasks.md
- status_and_action_plan.md
- immediate_action_plan.md

Result: MASTER_PLAN.md (~120 lines)
```

### **Step 2: Create Quick Reference**
```
Merge:
- agent_mode_prompts.md
- powershell_cheatsheet.md
- agent_reference_guide.md

Result: QUICK_REFERENCE.md (~200 lines)
```

### **Step 3: Create Session Journal**
```
Merge:
- learnings.md
- agent_review_walkthrough.md

Result: SESSION_JOURNAL.md (grows over time)
```

### **Step 4: Update README**
```
Update to point to 4 main docs
Add "Start Here" section
```

### **Step 5: Archive Old Docs**
```
Create Archive/ folder
Move completed/duplicated docs
```

---

## 🎯 FINAL STRUCTURE

```
brain/7e6bea3e.../
├── README.md                    # Index & "Start Here"
├── MASTER_PLAN.md              # Current roadmap & status
├── QUICK_REFERENCE.md          # Copy-paste commands & prompts
├── SESSION_JOURNAL.md          # Learnings & discoveries
├── task.md                     # Current task checklist
└── Archive/                    # Historical docs
    ├── status_and_action_plan.md
    ├── immediate_action_plan.md
    ├── frontend_only_tasks.md
    ├── agent_review_walkthrough.md
    └── ...
```

**Total active docs**: 5 (instead of 13!)

---

## 🔄 MAINTENANCE STRATEGY

### **Rule 1: One Source of Truth**
- Roadmap lives in MASTER_PLAN.md ONLY
- Don't duplicate same info in multiple files

### **Rule 2: Archive Completed Work**
- When plan executed → move to Archive/
- When prompt used → keep in QUICK_REFERENCE but mark ✅

### **Rule 3: Session Journal Pattern**
```markdown
## 2026-02-04: Agent Component Build
- Built: 7 components in parallel
- Learned: Agent handles dependencies well
- ⭐ Win: Petal FAB shape worked!
- ⚠️ Issue: LotusButton missing (fixed)
```

### **Rule 4: Quarterly Cleanup**
- Every 3 months, review all docs
- Delete truly obsolete stuff
- Update README index

---

## 💡 LONG-TERM STRATEGY

### **When Project Grows**:

**Option A: Split by Feature**
```
brain/
├── README.md
├── self-section/
│   ├── plan.md
│   ├── components.md
├── classroom-section/
│   ├── plan.md
│   ├── components.md
```

**Option B: Living Wiki**
```
Move to: apps/gurudevi-mobile/Wiki/
Use: Obsidian or Notion
Link to codebase
```

**Option C: Code Comments**
```
Delete most docs
Put planning in code comments
Use JSDoc for component docs
```

---

## ✅ IMMEDIATE ACTION

**Do now** (saves future confusion):
1. Create MASTER_PLAN.md (merge 3 docs)
2. Update README to reflect new structure
3. Archive completed plans

**Do later** (when needed):
1. Create QUICK_REFERENCE.md
2. Create SESSION_JOURNAL.md
3. Full cleanup

---

## 🎯 SUCCESS METRICS

**Before**: 13 docs, hard to find info
**After**: 4-5 docs, clear structure

**Goal**: 
- ✅ Find any info in <30 seconds
- ✅ No duplicate information
- ✅ Easy to update
- ✅ Clear what's current vs archived

---

**Want me to do the consolidation now?** Or wait until you're ready? 🎯
