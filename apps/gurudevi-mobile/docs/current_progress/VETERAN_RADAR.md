# 🦅 Senior Architect & Veteran Dev's Radar
**Critical Insights for Gurudevi Production Readiness**

**Date:** February 10, 2026
**Role:** Senior Solution Architect / Veteran Developer Perspective

---

## 1. The "Veteran" Reality Check
As a veteran architect, here is what is on my radar before we "ship it." These are the high-level risks that often sink apps during their first 1000 users.

### 🛡️ Radar Item 1: The "Connectivity Mirage" (Hybrid Persistence)
- **The Risk:** Sri Lankan networks are unreliable. A 100ms API call on your dev machine is a 10s "timed out" error in a village school. 
- **The Native Risk:** `react-native-mmkv` is lightning fast but being a native JSI module, it can fail on some iOS devices or in specialized Expo environments.
- **Veteran Advice:** Use **Hybrid Persistence**. MMKV is our primary engine (for speed), but we must fall back to **AsyncStorage** (for guaranteed persistence) if MMKV fails to initialize. **Never** use In-Memory as the only fallback in production.
- **Action:** Refactor `src/lib/storage.ts` to implement this fail-safe wrapper. Integrated with "Stale-While-Revalidate" patterns using TanStack Query.

### 🧟 Radar Item 2: The "Zombie State" (Consistent Loading)
- **The Risk:** User clicks a button → nothing happens for 5s → they click it 10 more times.
- **Veteran Advice:** Every single button in Gurudevi must have a `loading` state. No "flying blind."
- **Action:** Universal `SanctuaryButton` update to handle loading props automatically.

### 🧩 Radar Item 3: "Asset Bloat" (The Cloudinary Hybrid)
- **The Risk:** A teacher uploads a 100MB 4K video of a lesson. 50 students try to download it on a 2GB monthly data plan.
- **Veteran Advice:** Use Cloudinary to **enforce** "auto-transcoding" to lower resolutions by default.
- **Action:** Set up Cloudinary upload presets to convert all videos to web-optimized formats.

---

## 2. Universal Error Handling Strategy
*Addressing the "failed notifications" spam and fragmented logic.*

### 2.1 The "Quiet Sanctuary" Goal
In a "Sanctuary" themed app, errors shouldn't be loud or annoying. They should be helpful and calm.

### 2.2 Proposed Implementation Layers:

#### **Layer 1: The Global Interceptor (The Filter)**
Instead of catching errors in every file, we use a global interceptor in `supabase.ts` and `api/` logic.
- **Fatal Errors:** (No internet, Auth expired) → Show a **full-screen state**.
- **Silent Retries:** (Temporary network dip) → Retry 3 times *without* telling the user.
- **User Action Errors:** (Invalid input) → Show a **SanctuaryToast**.

#### **Layer 2: The Unified Error UI Palette**
Replace raw `Alert.alert` with:
- **`SanctuaryToast`**: For non-blocking "oops" (e.g., "Note didn't save, retrying...").
- **`ErrorMessage`**: For inline form validation (keeps context).
- **`InAppNotification`**: A new, less intrusive bar at the top for system news.

### 2.3 Universal API Handler (Standardized)
We will refactor API modules to use a wrapper:
```typescript
const executeRequest = async (fn, errorMessage) => {
  try {
    return await fn();
  } catch (e) {
    handleUniversalError(e, errorMessage);
    throw e;
  }
}
```

---

## 3. High-Priority "Radar" Checklist

| Item | Maturity Level | Architect's Note |
| :--- | :--- | :--- |
| **Atomic Design** | 🟡 Medium | Some components are getting too large. Need to split `AuthScreen`. |
| **State Persistence** | 🔴 Low | App "forgets" things on reload. Need MMKV hydration. |
| **Deep Links** | 🟡 Medium | Critical for "Viral" Teacher invites. Must test with local proxy. |
| **Haptics** | ✅ High | Already used in some places. Keeps app "premium." |
| **Data Saver** | 🔴 Low | Placeholder only. Need real implementation of "No Image" mode. |

---

## 4. Veteran's Final Recommendation
"Fix the build Errors (TSC) first, but *do not* start build features until **PostHog** and the **Unified Error Handler** are in place. If you build features without tracking, you are building in the dark."

**Status:** Strategic Radar document created.  
**Location:** `Docs v 3.0/current_progress/VETERAN_RADAR.md`
