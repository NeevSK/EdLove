# Document Powerhouse Architecture

## Overview
Offline-first, cross-platform document processing engine supporting PDF, EPUB, Office formats, images, and spreadsheets with annotations, conversion, OCR, and cloud fallbacks.

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DOCUMENT POWERHOUSE APP                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ LAYER 1: CORE ENGINE (Offline-First, Zero-Cost, MIT/Apache)                │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┬───────────┐ │
│  │ PDF Engine   │ EPUB Engine  │ Office Data  │ Image/OCR     │ Utils     │ │
│  │ ──────────── │ ──────────── │ ──────────── │ ────────────  │ ────────  │ │
│  │ pdfjs-dist   │ foliate-js   │ SheetJS      │ tesseract.js  │ pdf-lib   │ │
│  │ (render,     │ (EPUB, FB2,  │ (XLSX, CSV,  │ (WebWorker)   │ (gen,     │ │
│  │  select,     │  MOBI, CBZ)  │  ODS)        │               │  merge,   │ │
│  │  text)       │               │               │               │  split,   │ │
│  │              │               │               │               │  form)    │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┴───────────┘ │
│  Storage: SQLite (expo-sqlite) + MMKV → PowerSync sync                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ LAYER 2: WEBVIEW READER (In-App, Cross-Platform)                           │
│  react-native-webview + Custom HTML                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ foliate-js (EPUB/FB2/MOBI/CBZ)  │  pdfjs-dist (PDF)                │  │
│  │ pdf-lib (edit/merge/split)      │  SheetJS (spreadsheet grid)       │  │
│  │ Annotation Bridge → Layer 1 SQLite                                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│ LAYER 3: CLOUD FALLBACKS (Network Required, User-Initiated)               │
│  ┌──────────────┬──────────────────┬─────────────────┬──────────────────┐  │
│  │ Google Docs  │ Microsoft Graph  │ Adobe PDF       │ OnlyOffice       │  │
│  │ API          │ (Graph API)      │ Services API    │ Self-hosted      │  │
│  │ Convert/Export│ Full O365       │ OCR/Sign/Convert│ Full Office+Collab│  │
│  └──────────────┴──────────────────┴─────────────────┴──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tier 1 Dependencies (Complete Inventory)

### Core PDF/EPUB Engine
| Package | Version | Purpose | Platform | Expo 57/58 |
|---------|---------|---------|----------|------------|
| `pdfjs-dist` | ^4.8+ | PDF rendering, text selection, search | WebView | ✅ |
| `foliate-js` | git+https://github.com/johnfactotum/foliate-js | EPUB/FB2/MOBI/CBZ/PDF | WebView | ✅ |
| `pdf-lib` | ^1.17+ | PDF generate, merge, split, forms | All (JS) | ✅ |
| `epubcfi` | (in foliate-js) | CFI navigation | WebView | ✅ |

### Spreadsheet Engine
| Package | Version | Purpose | Platform |
|---------|---------|---------|----------|
| `sheetjs` / `xlsx` | ^0.18+ | Read/write XLSX, CSV, ODS, parse data | All (JS) |
| `@sheetjs/uhtml` | optional | Simple grid renderer | WebView |

### Image/OCR Processing
| Package | Version | Purpose | Platform |
|---------|---------|---------|----------|
| `tesseract.js` | ^5.1+ | OCR (WebWorker, offline after model) | WebView/Worker |
| `pdf-lib` | ^1.17+ | Image → PDF (embed JPG/PNG) | All (JS) |
| `expo-image-manipulator` | ^12+ | Resize/compress before PDF | Native |

### Compression/Containers
| Package | Version | Purpose |
|---------|---------|---------|
| `zip.js` | ^2.7+ | EPUB/CBZ container reading (random access) |
| `fflate` | ^0.8+ | DEFLATE/zlib (font decompression, zip) |

### Storage & Sync
| Package | Version | Purpose |
|---------|---------|---------|
| `expo-sqlite` | ~14.0 | SQLite database (annotations, progress) |
| `react-native-mmkv` | ^3.0+ | Fast key-value (settings, cache) |
| `@powersync/react-native` | ^0.4+ | SQLite → cloud sync (optional) |

### UI/Navigation (Expo 57/58 Compatible)
| Package | Version | Notes |
|---------|---------|-------|
| `expo-router` | ~4.0 | File-based routing |
| `react-native-webview` | ^13.10+ | WebView for reader |
| `expo-file-system` | ~17+ | File access |
| `expo-media-library` | ~16+ | Save PDFs to gallery |
| `expo-document-picker` | ~12+ | Pick documents |
| `expo-sharing` | ~12+ | Share PDFs |
| `expo-media-downloader` | custom | Download with progress |

### Platform Compatibility Matrix

| Dependency | iOS | Android | Web | Expo Go | Dev Client |
|------------|-----|---------|-----|---------|------------|
| pdfjs-dist | ✅ | ✅ | ✅ | ✅ | ✅ |
| foliate-js | ✅ | ✅ | ✅ | ✅ | ✅ |
| pdf-lib | ✅ | ✅ | ✅ | ✅ | ✅ |
| sheetjs | ✅ | ✅ | ✅ | ✅ | ✅ |
| tesseract.js | ✅ | ✅ | ✅ | ✅ | ✅ |
| pdf-lib (gen) | ✅ | ✅ | ✅ | ✅ | ✅ |
| zip.js | ✅ | ✅ | ✅ | ✅ | ✅ |
| fflate | ✅ | ✅ | ✅ | ✅ | ✅ |
| tesseract.js | ✅ | ✅ | ✅ | ✅ | ✅ |
| expo-sqlite | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| react-native-mmkv | ✅ | ✅ | ❌ | ❌ | ✅ |
| react-native-webview | ✅ | ✅ | ✅ | ✅ | ✅ |
| expo-file-system | ✅ | ✅ | ✅ | ✅ | ✅ |

**Legend**: ✅ Full support, ⚠️ Limited (WebSQL/OPFS), ❌ Not supported

---

## Rationale for Each Choice

### Why pdfjs-dist + foliate-js over react-native-pdf?
| Factor | pdfjs-dist + foliate-js | react-native-pdf (wonday) |
|--------|------------------------|---------------------------|
| **Expo Go** | ✅ Works | ❌ Needs dev client |
| **EPUB Support** | ✅ Native (foliate-js) | ❌ PDF only |
| **Web Support** | ✅ Native | ❌ Not supported |
| **Annotations** | ✅ Custom overlay | ✅ Native (limited) |
| **Bundle Size** | ~8MB (WebView) | ~5MB (native) |
| **Offline** | ✅ Full | ✅ Full |
| **Maintenance** | Active (Mozilla + foliate) | Active (wonday) |

**Decision**: pdfjs-dist + foliate-js for **universal support** (Expo Go + Web + Native). Native module as future Tier 3.

### Why foliate-js over epub.js?
| Factor | foliate-js | epub.js |
|--------|------------|---------|
| **Formats** | EPUB, FB2, MOBI, CBZ, PDF | EPUB only |
| **Architecture** | Modular (parsers + renderers) | Monolithic |
| **PDF Support** | Experimental (via PDF.js) | None |
| **License** | MIT | BSD-3-Clause |
| **Mobile Optimized** | Yes (Foliate app) | Desktop-first |

### Why pdf-lib over pdfkit?
| Factor | pdf-lib | pdfkit |
|--------|---------|--------|
| **Platform** | Browser + Node + RN | Node only |
| **Bundle** | ~500KB (ESM) | ~2MB (CommonJS) |
| **Fonts** | Embed TTF/woff | Subset TTF |
| **Forms** | Fill + Create | Fill only |
| **React Native** | ✅ Works | ❌ Needs polyfills |

### Why SheetJS over alternatives?
| Library | Formats | Size | License | RN Support |
|---------|---------|------|---------|------------|
| SheetJS (xlsx) | XLSX, XLS, CSV, ODS, XLSB | ~500KB | Apache 2.0 | ✅ |
| exceljs | XLSX only | ~2MB | MIT | ⚠️ Polyfills |
| Handsontable | Grid only | 5MB+ | Commercial | ⚠️ Heavy |

### Why tesseract.js over native OCR?
| Factor | tesseract.js | react-native-ocr / ML Kit |
|--------|--------------|---------------------------|
| **Offline** | ✅ (after model download) | ✅ |
| **Platforms** | Web + Native | Native only |
| **Languages** | 100+ | ~50 |
| **Bundle** | ~2MB + models | Native |
| **Expo Go** | ✅ | ❌ |

---

## File Structure (Target)

```
packages/library/
├── src/
│   ├── api/
│   │   ├── annotations.ts        # Highlights, notes, bookmarks, progress
│   │   ├── database.ts           # SQLite schema + CRUD
│   │   ├── pdf.ts                # pdf-lib: gen, merge, split, forms
│   │   ├── spreadsheet.ts        # SheetJS: parse, generate, grid data
│   │   ├── ocr.ts                # tesseract.js WebWorker wrapper
│   │   ├── image-to-pdf.ts       # pdf-lib + expo-image-manipulator
│   │   ├── conversion.ts         # Format conversion orchestration
│   │   ├── cloud.ts              # Google Docs / Microsoft Graph / OnlyOffice
│   │   ├── index.ts              # Barrel export
│   ├── screens/
│   │   ├── ReaderScreen.tsx      # Main WebView reader (PDF/EPUB)
│   │   ├── SpreadsheetViewer.tsx # SheetJS grid viewer
│   │   ├── PDFEditorScreen.tsx   # pdf-lib based editor
│   │   ├── OCRScreen.tsx         # tesseract.js UI
│   │   ├── ImageToPDFScreen.tsx  # Image → PDF flow
│   │   ├── CloudExportScreen.tsx # Cloud fallback UI
│   ├── components/
│   │   ├── AnnotationToolbar.tsx # Highlight/note/bookmark toolbar
│   │   ├── SpreadsheetGrid.tsx   # SheetJS grid renderer
│   │   ├── PDFToolbar.tsx        # PDF viewer controls
│   │   ├── OCRProgress.tsx       # tesseract.js progress
│   ├── hooks/
│   │   useAnnotations.ts         # Annotation state + sync
│   │   useSpreadsheet.ts         # Spreadsheet state
│   │   useOCR.ts                 # OCR state
│   ├── types/
│   │   document.ts               # Unified document types
│   │   annotations.ts            # Highlights, notes, progress, bookmarks
│   │   spreadsheet.ts            # SheetJS types + grid types
│   │   ocr.ts                    # OCR types
│   │   cloud.ts                  # Cloud fallback types
│   ├── utils/
│   │   format-detection.ts       # MIME/extension detection
│   │   cfi.ts                    # CFI utilities
│   │   pdf-utils.ts              # pdf-lib helpers
│   ├── index.ts                  # Main barrel export
│   ├── constants/
│   │   libraryRegistry.ts        # Format registry
├── package.json
├── tsconfig.json
```

---

## Implementation Checklist

### ✅ Already Done
- [x] Annotation types + database (highlights, notes, progress, bookmarks)
- [x] Annotations API (CRUD + local-first)
- [x] ReaderScreen (PDF + EPUB via pdfjs-dist + foliate-js)
- [x] Annotation toolbar (highlight, note, bookmark)
- [x] Database schema (highlights, notes, progress, bookmarks)
- [x] WebView reader with pdfjs-dist + foliate-js
- [x] i18n keys for reader (en/si/ta)

### 🔄 In Progress / Next
- [ ] **pdf-lib API** — generate, merge, split, forms
- [ ] **SheetJS integration** — parse, generate, grid viewer
- [ ] **tesseract.js** — OCR WebWorker wrapper
- [ ] **pdf-lib image → PDF** — image manipulation + embed
- [ ] **Conversion orchestration** — format detection + routing
- [ ] **Cloud fallbacks** — Google Docs / Microsoft Graph / OnlyOffice
- [ ] **Spreadsheet grid viewer** — SheetJS + custom grid
- [ ] **PDF editor screen** — pdf-lib based editing
- [ ] **OCR screen** — tesseract.js UI + progress
- [ ] **Image → PDF screen** — multi-image → single PDF
- [ ] **Cloud export screen** — fallback UI

### 📦 Dependencies to Add
```json
{
  "pdf-lib": "^1.17.1",
  "sheetjs": "^0.18.5",  // or "xlsx": "^0.18.5"
  "tesseract.js": "^5.1.0",
  "zip.js": "^2.7.5",
  "fflate": "^0.8.2",
  "expo-image-manipulator": "~12.0.0",
  "@react-native-async-storage/async-storage": "~2.1.0"
}
```

---

## Expo 57 / RN 0.86 / Expo 58 Compatibility Notes

| Concern | Status | Mitigation |
|---------|--------|------------|
| **New Architecture (Fabric)** | ✅ Compatible | All deps support Fabric |
| **React Native 0.86/0.87** | ✅ Compatible | All deps updated |
| **Expo 57 SDK** | ✅ Compatible | All deps support SDK 51+ |
| **Expo 58 (upcoming)** | ✅ Planned | Track SDK 52 migration |
| **Hermes** | ✅ Compatible | All deps Hermes-compatible |
| **Metro/Metro Bundler** | ✅ | ESM + CommonJS interop works |
| **New Arch (Fabric)** | ✅ | No native modules in Tier 1 |
| **Web Support** | ✅ | All Tier 1 deps work on Web |

---

## Quality Gates

| Gate | Command | Threshold |
|------|---------|-----------|
| TypeScript | `tsc -b packages/library` | 0 errors |
| Lint | `biome check packages/library` | 0 errors |
| Tests | `vitest run packages/library` | 100% pass |
| i18n | `node scripts/i18n/audit-keys.mjs` | Pass |
| Duplication | `jscpd packages/library --min-lines 10` | < 3% |
| Deep Imports | `check:deep-imports` | 0 violations |

---

## Next Steps

1. **Install all Tier 1 deps** (single command)
2. **Implement pdf-lib API** (generate, merge, split, forms)
3. **Implement SheetJS integration** (parse + grid viewer)
4. **Implement tesseract.js OCR** (WebWorker)
4. **Implement pdf-lib image → PDF**
5. **Implement conversion orchestration**
5. **Implement cloud fallbacks** (Google/Microsoft/OnlyOffice)
6. **Build UI screens** for each capability
6. **Run quality gates** + verify Expo 57/58 compatibility