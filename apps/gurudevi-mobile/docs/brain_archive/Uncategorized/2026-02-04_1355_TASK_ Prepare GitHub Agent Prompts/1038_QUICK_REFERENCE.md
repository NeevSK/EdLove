# 🎯 QUICK REFERENCE
**Copy-paste prompts, commands, and guides**

---

## 📋 AGENT MODE PROMPTS

### **PROMPT 1: LotusButton** (Copy-paste to Agent)

```
Build a reusable button component at src/components/LotusButton.tsx

Requirements:
- Component name: LotusButton
- Use React Native Pressable
- TypeScript with strict types

Props:
interface LotusButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: any;
}

Styling:
- primary: bg sanctuarySaffron, text sacredWhite
- secondary: transparent bg, border sanctuarySaffron
- ghost: transparent bg, text dimGray  
- borderRadius: Theme.corners.comfortable
- Sizes: sm(8,16,14), md(12,24,16), lg(16,32,18)

Behavior:
- Call hapticLight() on press
- Show ActivityIndicator when loading
- Opacity 0.5 when disabled

Imports: Theme from '../constants/Theme', hapticLight from '../utils/haptics'
```

---

### **PROMPT 2: BreathingLoader** (Copy-paste to Agent)

```
Build a breathing loader component at src/components/BreathingLoader.tsx

Requirements:
- Pulsing circle animation (scale 0.8 ↔ 1.0)
- 1.5 second cycle, infinite loop
- Use react-native-reanimated

Props:
interface BreathingLoaderProps {
  size?: number; // default 50
  color?: string; // default Theme.colors.sanctuarySaffron
}

Animation:
- withRepeat(withTiming(...), -1, true)
- easing: Easing.inOut(Easing.ease)
- Use Animated.View with circular shape

Styling:
- borderRadius: size / 2 (perfect circle)
- backgroundColor: color prop
- centered in parent
```

---

### **PROMPT 3: EmptyState** (Copy-paste to Agent)

```
Build empty state component at src/components/EmptyState.tsx

Props:
interface EmptyStateProps {
  icon: any; // lucide-react-native icon
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

Layout:
- Centered VStack
- Icon (size 64, color dimGray)  
- Title (fontSize.lg, fontWeight.semibold)
- Description (fontSize.md, color dimGray)
- Optional button (LotusButton, variant ghost)

Use SanctuaryCard wrapper, elevated={false}
```

---

### **PROMPT 4: ErrorMessage** (Copy-paste to Agent)

```
Build error message component at src/components/ErrorMessage.tsx

Props:
interface ErrorMessageProps {
  message: string;
  type?: 'gentle' | 'warning' | 'severe';
  onDismiss?: () => void;
}

Types:
- gentle: bg deepIndigo, text sacredWhite, icon Info
- warning: bg warmAmber/20, text warmAmber, icon AlertTriangle  
- severe: bg emberRed/20, text emberRed, icon AlertCircle

Layout:
- HStack: icon, message text, dismiss button (X)
- padding md, borderRadius comfortable
- marginBottom md
```

---

## ⌨️ POWERSHELL COMMANDS

### **File Operations**
```powershell
# Create folder
New-Item -Path "folder" -ItemType Directory -Force

# Copy file
Copy-Item "source.txt" "dest.txt"

# Copy folder (recursive)
Copy-Item "sourceFolder" "destFolder" -Recurse

# Delete file
Remove-Item "file.txt"

# View file
Get-Content "file.txt"
cat "file.txt"  # shortcut
```

### **Navigation**
```powershell
cd path\to\folder    # Change directory
cd ..                # Up one level
pwd                  # Current directory
ls                   # List files
```

---

## 📦 GIT COMMANDS

### **Daily Workflow**
```bash
git status                          # See what changed
git add .                          # Stage all
git add path/to/file.js            # Stage specific
git commit -m "feat: Add feature"  # Commit
git push                           # Push to current branch
git push origin branch-name        # Push to specific
```

### **Branches**
```bash
git branch                  # See all branches
git checkout -b new-branch  # Create new branch
git checkout main           # Switch branch
git pull origin main        # Pull latest
```

### **History**
```bash
git log --oneline -10       # Recent commits
git show HEAD               # Last commit changes
git fetch origin            # Fetch remote
git branch -r               # Remote branches
```

---

## 📖 HOW TO USE AGENT PROMPTS

### **Method 1: Direct copy-paste**
1. Open GitHub Copilot Chat in VS Code
2. Switch to Agent Mode (agent icon)
3. Copy entire prompt from above
4. Paste and send
5. Review changes, accept or iterate

### **Method 2: Reference docs**
```
Build LotusPetalFAB component.
Reference the specs in: Docs v 3.0/Planning/lotus_fab_plan.md
Pay special attention to the petal shape (NOT circle) and breathing animation.
```

### **Method 3: Combine approaches**
```
Build mood check-in screen at src/screens/MoodCheckInScreen.tsx

Reference: Docs v 3.0/DESIGN_SYSTEM.md for colors
Reference: Planning/agent_mode_prompts.md for component usage

Critical details:
- 5 mood options: peaceful, energized, tired, anxious, grateful
- Use SanctuaryCard for each mood selection
- Save to Supabase mood_logs table
- Time-based greeting using utils/time.ts
```

---

## ⚡ AGENT TIPS

**✅ DO**:
- Reference planning docs by path
- Highlight critical details ("MUST be petal-shaped")
- Iterate if first attempt wrong
- Let Agent work in background

**❌ DON'T**:
- Give vague instructions
- Forget to specify imports
- Skip verification after build
- Make manual edits while Agent working

---

## 🔍 TROUBLESHOOTING

### **Agent asks about imports**
```
Theme: '../constants/Theme'
Haptics: '../utils/haptics'
i18n: import { useTranslation } from 'react-i18next'
UI: @gluestack-ui/themed
Icons: lucide-react-native
```

### **Agent makes wrong style**
Point to specific section:
```
The button color is wrong. Check Theme.colors.sanctuarySaffron in constants/Theme.ts, not sanctuaryOrange.
```

### **Component not working**
Check imports and verify:
```bash
npm start  # Restart app
# Check console for import errors
```

---

**See also**: [MASTER_ROADMAP.md](file:///C:/Users/Naween/.gemini/antigravity/brain/7e6bea3e-55b4-4c7d-8657-d2434a5a23a7/MASTER_ROADMAP.md) for what to build next
