# POWERSHELL COMMAND CHEAT SHEET

## 📋 WHAT I USED TO COPY FILES

### Step 1: Create Directory
```powershell
New-Item -Path "apps\gurudevi-mobile\Docs v 3.0\Planning" -ItemType Directory -Force
```

**Breakdown**:
- `New-Item` = Create new file/folder
- `-Path` = Where to create it
- `-ItemType Directory` = Make it a folder (not file)
- `-Force` = Create parent folders if needed, don't error if exists

### Step 2: Copy Files
```powershell
Copy-Item "C:\Users\Naween\.gemini\antigravity\brain\...\lotus_fab_plan.md" "apps\gurudevi-mobile\Docs v 3.0\Planning\"
```

**Breakdown**:
- `Copy-Item` = Copy file or folder
- First argument = Source (where to copy FROM)
- Second argument = Destination (where to copy TO)

### Step 3: Git Commands
```powershell
git status                              # See what changed
git add "apps/gurudevi-mobile/Docs v 3.0/Planning/"  # Stage files
git commit -m "docs: Add planning documents"         # Commit with message
git push origin feat/gurudevi-api-layer              # Push to GitHub
```

---

## 🔧 COMMON POWERSHELL COMMANDS

### Navigation
```powershell
cd path\to\folder           # Change directory
cd ..                       # Go up one level
pwd                         # Print current directory
ls                          # List files (alias for Get-ChildItem)
```

### File Operations
```powershell
# Create file
New-Item -Path "file.txt" -ItemType File

# Create folder
New-Item -Path "folder" -ItemType Directory -Force

# Copy file
Copy-Item "source.txt" "destination.txt"

# Copy folder (recursive)
Copy-Item "sourceFolder" "destFolder" -Recurse

# Move file
Move-Item "source.txt" "destination.txt"

# Delete file
Remove-Item "file.txt"

# Delete folder (and contents)
Remove-Item "folder" -Recurse -Force
```

### View File Contents
```powershell
Get-Content "file.txt"      # View entire file
cat "file.txt"              # Shortcut (same as Get-Content)
```

---

## 📦 GIT COMMANDS

### Daily Workflow
```powershell
# See status
git status

# Stage specific file
git add path/to/file.js

# Stage all changes
git add .

# Commit
git commit -m "feat: Add new feature"

# Push to current branch
git push

# Push to specific branch
git push origin branch-name
```

### Branches
```powershell
# See all branches
git branch

# Create new branch
git checkout -b new-feature

# Switch branch
git checkout main

# Pull latest
git pull origin main
```

### Checking History
```powershell
# See recent commits
git log --oneline -10

# See what changed in last commit
git show HEAD

# See remote branches
git fetch origin
git branch -r
```

---

## 💡 TIPS

### Spaces in Paths
Use quotes when path has spaces:
```powershell
# ✅ Correct
Copy-Item "Docs v 3.0\file.md" "dest"

# ❌ Wrong
Copy-Item Docs v 3.0\file.md dest
```

### Tab Completion
- Type first few letters
- Press `Tab` to autocomplete
- Press `Tab` again to cycle options

### Command History
- `↑` arrow = Previous command
- `↓` arrow = Next command
- `Ctrl + R` = Search history

---

## 🎯 HOW OTHERS REMEMBER

### Option 1: Cheat Sheet (This File!)
- Keep this file open in VS Code
- Search when you forget (Ctrl+F)

### Option 2: AI Assistant
- Ask me "How do I copy a folder in PowerShell?"
- Ask me "Show me git push command"

### Option 3: Git Aliases
Create shortcuts in `.gitconfig`:
```ini
[alias]
    s = status
    co = checkout
    cm = commit -m
    p = push
```

Then use: `git s` instead of `git status`

### Option 4: VS Code Terminal History
- Click terminal dropdown
- See recent commands
- Click to run again

---

**You don't need to memorize!** Just reference this file when needed 🎉
