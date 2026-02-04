# HOW TO USE AGENT WITH PLANNING DOCS

## ✅ DOCS NOW IN REPOSITORY

Successfully copied to GitHub repository:
```
apps/gurudevi-mobile/Docs v 3.0/Planning/
├── lotus_fab_plan.md           # Complete Lotus Petal FAB spec
├── grading_system_design.md    # Grading system (marks + GPA)
└── agent_mode_prompts.md       # Ready-to-use prompts
```

**Status**: Committed & pushed to `feat/gurudevi-api-layer` branch ✅

---

## 🤖 HOW AGENT READS REPO FILES

GitHub Copilot Agent has **full access** to your repository, including:
- All source code
- All documentation in `Docs v 3.0/`
- Planning documents
- Configuration files

**Agent uses MCP (Model Context Protocol)** to understand repository context.

---

## 📝 HOW TO REFERENCE DOCS IN PROMPTS

### Method 1: File Path Reference
```
Build the Lotus Petal FAB component.

Refer to the spec in:
apps/gurudevi-mobile/Docs v 3.0/Planning/lotus_fab_plan.md

Follow the complete implementation plan exactly.
```

### Method 2: Short Reference (Agent will find it)
```
Build the Lotus Petal FAB component.

See Planning/lotus_fab_plan.md for full spec.
```

### Method 3: Explicit Instructions + Doc
```
Build grading system with marks and GPA support.

Reference the design in Planning/grading_system_design.md:
- Use marks (0-100) as source of truth
- Convert to GPA using the conversion table
- Support teacher dropdown selection
```

---

## 🎯 EXAMPLE: LOTUS PETAL FAB PROMPT

### Simple Version (Agent finds doc automatically):
```
Build Lotus Petal FAB component at src/components/LotusPetalFAB.tsx

Follow the spec in Planning/lotus_fab_plan.md
```

### Detailed Version (with highlights):
```
Build Lotus Petal FAB component at src/components/LotusPetalFAB.tsx

Follow Planning/lotus_fab_plan.md, paying special attention to:
- Petal shape (NOT circular - use SVG path or teardrop shape)
- Breathing animation (4-second cycle, scale 0.95-1.0)
- Context-aware icons (changes per tab)
- Press animation with haptic feedback

CRITICAL: The shape must be petal-like, not a simple circle!
```

### Minimal Version (just point to doc):
```
@Planning/lotus_fab_plan.md

Build the component as specified.
```

---

## 🔄 ITERATIVE WORKFLOW

### Round 1: Initial Build
```
Build LotusPetalFAB component from Planning/lotus_fab_plan.md
```

### Round 2: If Shape is Wrong
```
The FAB is circular but should be petal-shaped.

Fix the shape using the SVG path or teardrop design from 
Planning/lotus_fab_plan.md section "Visual Design - Petal Shape"
```

### Round 3: Add Missing Features
```
Add breathing animation to LotusPetalFAB.

Use the animation spec from Planning/lotus_fab_plan.md 
section "Animations - Breathing"
```

---

## 💡 BEST PRACTICES

### DO ✅
- Reference file path directly
- Point to specific sections when needed
- Ask Agent to "follow spec exactly"
- Iterate if first attempt is incomplete

### DON'T ❌
- Copy entire doc into prompt (waste of tokens)
- Assume Agent read it if shape/behavior is wrong
- Skip verification step

---

## 🎬 QUICK START

1. **Open GitHub Copilot in VS Code**
2. **Switch to Agent Mode** (look for agent/edit mode toggle)
3. **Use simplified prompt**:
   ```
   Build Lotus Petal FAB from Planning/lotus_fab_plan.md
   ```
4. **Review proposed changes**
5. **If wrong**: Point to specific section
   ```
   The shape is wrong. See "Visual Design - Petal Shape" 
   section in Planning/lotus_fab_plan.md
   ```

---

## ✅ VERIFICATION

After Agent builds component:
1. Check if all features from plan are implemented
2. Use verification checklist in lotus_fab_plan.md
3. Test in app simulator
4. Iterate if needed

---

**The docs are now part of your codebase!** 🎉

Agent can reference them anytime you build features.
