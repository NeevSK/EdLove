# Localization Strategy: EdLove (Sinhala & Tamil)

## Strategy Overview: "Scalable Sovereignty"
To support localized content (Sinhala/Tamil) without aggressive manual overhead, we will use a **Routing-First** approach with **AI-Assisted Translation**.

---

## 1. Technical Architecture (Astro i18n)

We will use Astro's native `i18n` routing.

### Config Updates (`astro.config.mjs`)
Define supported locales and default behavior.

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'si', 'ta'], // English, Sinhala, Tamil
    routing: {
      prefixDefaultLocale: false // /about -> English, /si/about -> Sinhala
    }
  }
});
```

### Folder Structure
Move current pages into locale folders or use dynamic routing.

```
src/
  pages/
    index.astro       // English Home
    about.astro       // English About
    si/
      index.astro     // Sinhala Home
      about.astro     // Sinhala About
    ta/
      index.astro     // Tamil Home
      about.astro     // Tamil About
```

---

## 2. Content Management (The UI Dictionary)

For UI elements (Buttons, Nav, Footer), use a type-safe UI dictionary.

**`src/i18n/ui.ts`**
```typescript
export const languages = {
  en: 'English',
  si: 'සිංහල',
  ta: 'தமிழ்',
};

export const ui = {
  en: {
    'nav.home': 'Home',
    'nav.cosmos': 'Cosmos',
    'footer.privacy': 'Privacy',
  },
  si: {
    'nav.home': 'මුල් පිටුව',
    'nav.cosmos': 'විශ්වය',
    'footer.privacy': 'පෞද්ගලිකත්වය',
  },
  ta: {
    'nav.home': 'முகப்பு',
    'nav.cosmos': 'அண்டம்',
    'footer.privacy': 'தனியுரிமை',
  },
};
```

---

## 3. The "Generative Bridge" Workflow

Instead of hiring manual translators immediately, we use a refined AI workflow:

1.  **Extract**: Agent reads `en` file content.
2.  **Translate**: Agent translates content to `si` and `ta` preserving Markdown structure.
3.  **Review**: A human (or Native Speaker) verifies critical terms (e.g., "Sanctuary" -> "Arana" or "Punya Bhumi" depending on context).

### Recommended Tooling
-   **Microsoft Translator API** (Low cost, good Asian language support).
-   **i18next** (Standard industry library, works well with Astro).

---

## 4. Immediate Next Steps

1.  [ ] **Install** `i18next` and `@astrojs/i18next`.
2.  [ ] **Create** `src/i18n/ui.ts` for strictly the Navigation and Footer first.
3.  [ ] **Generate** `/si` and `/ta` routes for the Homepage only as a Pilot.
