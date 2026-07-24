# 🧘 MISSION 01: The Self (Wellbeing)

**Role**: You are a React Native expert specializing in "Sanctuary UI" (Animations, Reanimated, Gluestack).
**Context**: App Name "Gurudevi". We are building the "Self" tab, which is a personal refuge for teachers/students.

---

## ✅ MISSION 02: Teacher Workbench - COMPLETED

The Teacher Workbench mission has been completed. The following components have been implemented:

1. **AttendanceSheet.tsx** - Fast, swipe-based attendance marking interface
   - Swipe Right: Present (Green Check)
   - Swipe Left: Absent (Red X) 
   - Long Press: Late (Yellow Clock)
   - Default state: All students marked as Present
   - Search functionality for quick lookup
   - Real-time statistics display
   
2. **ContentLibrary.tsx** - Resource management screen for teachers
   - Grid view of resource cards (PDFs, Links, Notes)
   - FAB (Floating Action Button) for adding new resources
   - Pin to Top functionality
   - Resource type categorization with icons
   
3. **GroupManager.tsx** - Student grouping component
   - Create temporary student groups for activities
   - Multi-select checklist for assigning students to groups
   - Edit and delete group functionality
   - Visual group indicators with color coding

All components follow the Gurudevi design system using Theme.ts and are ready for integration.

---

## 🎯 Objective
Build the 3 core features of the "Self" screen.
1.  **Mood & Rhythm**: Daily lotus-slider input.
2.  **Shadow Agent**: A "Quiet Drawer" (not a chatbot) for reflection and assistant.
3.  **Fire Journal**: "Burn" negative thoughts.

---

## 🛠️ Architectural Constraints
*   **Navigation**: You are working inside `src/screens/SelfStack/`.
*   **Database**: Use `mood_logs` and `fire_journal` tables (Schema defined below).
*   **Theme**: Strict usage of `src/constants/Theme.ts`.
    *   Primary: `Theme.colors.sanctuarySaffron`
    *   Bg: `Theme.colors.voidIndigo`
*   **Tech**: 
    *   `react-native-reanimated` (for Fire/drawer animations).
    *   `@gluestack-ui/themed` (for layout).

---

## 📋 Task Checklist

### 🔶 Task A: Mood Check-in Component
**File**: `src/components/self/MoodLotus.tsx` (Create New)
**Specs**:
- **Visual**: A slider (1-5).
    - 1 = Closed Bud (Dark)
    - 5 = Full Bloom Lotus (Glowing)
- **Action**: On change, hit Supabase `mood_logs`.
- **Privacy**: This data is strictly private. RLS handles it, but UI should feel private.

### 🔶 Task B: Shadow Agent (The Quiet Drawer)
**File**: `src/components/self/ShadowAgentDrawer.tsx` (Create New)
**Specs**:
- **Trigger**: A subtle glowing orb in the bottom-right corner of Self Screen.
- **Interaction**: Tap -> Opens a **Half-Screen Bottom Sheet**.
- **UI**: 
    - Dark, minimal text area.
    - Text appears slowly (fade-in words), not instantly.
    - "Thought Seed": Display a random question like "What is heavy today?"
- **Note**: This is NOT a chatbot connected to an API yet. Just the UI/UX.

### 🔶 Task C: Fire Journal
**File**: `src/components/self/FireJournal.tsx` (Create New)
**Specs**:
- **Input**: Large text area or "Voice" button.
- **Action**: "Burn" button.
- **Animation**: 
    - Use `Reanimated` layout transitions.
    - When burned, the text field should distort (opacity/scale) and vanish up like smoke.
- **Data**: Save to `fire_journal` with `is_burned = true`.

---

## 🗄️ Database Context (Reference Only)
```sql
CREATE TABLE mood_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  mood_score INTEGER,
  created_at TIMESTAMPTZ
);

CREATE TABLE fire_journal (
  id UUID PRIMARY KEY,
  content_preview TEXT,
  is_burned BOOLEAN DEFAULT false
);
```
