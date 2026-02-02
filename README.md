# EdLove Ecosystem

The digital sanctuary for educational transformation.

## 🌟 The Structure
This monorepo houses the two lungs of the ecosystem:

### 1. [EdLove Web](apps/edlove-web) (`apps/edlove-web`)
> **"The Paradigm Cosmos"**
- **Stack**: Astro, Svelte, Tailwind
- **Purpose**: The public portal, design philosophy, and "What Could Be".
- **Run**: `cd apps/edlove-web && pnpm dev`

### 2. [Gurudevi Mobile](apps/gurudevi-mobile) (`apps/gurudevi-mobile`)
> **"The Operational Engine"**
- **Stack**: Expo SDK 54, React Native 0.81, Gluestack, Supabase
- **Purpose**: The mobile app for teachers, students, and principals.
- **Run**: `cd apps/gurudevi-mobile && pnpm start`

---

## 🛠 Setup
1. **Install Dependencies**: `pnpm install`
2. **Start Development**:
   - Web: `pnpm --filter edlove-web dev`
   - Mobile: `pnpm --filter gurudevi-mobile start`

## 📂 Archives
- `apps/_archive-web`: Previous Next.js iteration
- `apps/_archive-api`: Previous Fastify iteration
