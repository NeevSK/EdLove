# QR + OCR Implementation Audit (Deep Dive)

## Scope
This audit reviews:
1. End-to-end QR flows for account/school/classroom joining, generation, sharing, and scan handling.
2. OCR implementation quality for Sinhala/Tamil/English handwritten/printed inputs, including extensibility toward notes/charts and export/search pipelines.

---

## 1) QR implementation audit

## What is implemented well

### A. Core QR toolkit exists and is technically sound
- `@repo/scanner-kit` has a custom SVG QR generator (`QRCodeGenerator`) built on `qrcode` + `react-native-svg`, with configurable ECC level (`H` by default). This is a solid rendering approach for visual robustness across densities.
- `ScannerModal` supports both live camera scan (`expo-camera`) and gallery scan fallback (`expo-image-picker` + `jsqr` + `jpeg-js`) with optional crop-retry.

### B. Multiple QR surfaces exist in app UX
- School creation success screen renders QR blocks (`schoolId`, `join-group:<groupId>`).
- Profile identity card renders personal QR from `profile.id`.
- Principal Invite Manager includes per-invite QR trigger intent (`setQrCodeData(...)`).
- Teacher and classroom modals expose scanner entry points to join classes via QR.

---

## Where QR is incomplete / potentially non-functional

### 1. Critical: scanner result handling is not unified and partially disconnected
- `AuthScreen` mounts `ScannerModal`, but scan callback only shows toast and closes modal; no parse/route/join logic is executed.
- `showScanner` state exists but no visible trigger in current screen sections to open scanner, so path may be dead.

### 2. Critical: payload schema fragmentation
Current code implies different payload styles, without a shared schema contract:
- `join-class:<uuid>` expected by `TeacherDashboard` and `CreateClassroomModal`.
- raw school UUID rendered by school success screen.
- `join-group:<groupId>` rendered by school success screen.
- raw invite codes managed in principal flows.

But there is no centralized payload parser/router to map scanned data to actions consistently.

### 3. Critical: some generated QR values have no consumer path
- `join-group:<groupId>` is generated, but no scanner route handling for `join-group:` was found.
- raw school UUID QR is generated, but no scanner resolver for “school identity” payload pattern was found.

### 4. Likely bug: principal QR modal state is unused
- `InviteManager` stores `qrCodeData` and sets it on QR icon click, but no modal/view rendering this state was found in component return.
- Result: QR button may appear to do nothing.

### 5. Join-by-QR permission / semantics are risky
- Teacher QR join currently does `api.classrooms.update(classId, { teacher_id: user.id })` after scan.
- This overwrites teacher ownership semantics rather than creating a membership link.
- A malformed/foreign QR could assign unintended teacher ownership if authorization is insufficient at backend policy level.

### 6. Sharing is missing in practical flows
- Requirement says QR should be shareable; current UX primarily supports display + copy invite code.
- No robust QR image sharing flow was found (e.g., render-to-image + `expo-sharing` + deep-link payload), despite `expo-sharing` being installed.

---

## QR functional completeness score

Scoring dimensions (heuristic):
- Generation surfaces: 25%
- Scan surfaces: 20%
- Payload routing completeness: 25%
- End-to-end join/action correctness: 20%
- Shareability UX: 10%

Assessment:
- Generation: 18/25
- Scan surfaces: 14/20
- Routing completeness: 5/25
- E2E correctness: 8/20
- Shareability: 2/10

**QR Completeness Score: 47/100 (partially implemented, high integration risk)**

---

## 2) OCR implementation audit

## What is implemented

### A. OCR engine choice
- Uses on-device ML Kit text recognition via `@react-native-ml-kit/text-recognition`.
- Input paths: camera capture and gallery image.
- Output path: recognized full text + parsed student list candidates.

### B. Parsing layer (student register extraction)
- Heuristic parser supports:
  - delimiter rows (`|`, tab),
  - multi-space tokenization,
  - mixed-script regex for Sinhala/Tamil/Latin + digits.
- Deduplicates by student name.

### C. Intended downstream persistence exists
- API supports `bulkCreate` students, described as OCR/manual bulk-entry target.

---

## OCR weaknesses and likely accuracy constraints

### 1. No image preprocessing pipeline for difficult inputs
Current OCR path directly sends URI to recognizer; missing standard boosts:
- deskew / perspective correction,
- adaptive binarization,
- denoise,
- contrast normalization,
- region segmentation (table cell lines / text blocks).

Without these, handwritten Sinhala/Tamil and low-light/angled pages will degrade heavily.

### 2. Parser is simplistic for real handwritten registers
- No confidence scores or per-line confidence gating.
- No language-model correction pass.
- No structured table reconstruction.
- Deduplication by name can collapse different students with same name.
- Index extraction uses first digit sequence only; weak for noisy OCR tokens.

### 3. OCR UI is mostly standalone; integration appears incomplete
- `OCRScanner` exists and is exported via classroom package.
- No active in-app usage path was found for `<OCRScanner />` in current mobile/classroom screens.
- `BulkStudentCreation` exists, but usage references are absent in scanned code.

### 4. No handwritten-specialized OCR stack yet
- There is no separate handwriting model, no script-specific postprocessing for Sinhala/Tamil grapheme errors, and no benchmark harness.
- So quality claims for handwritten notes/charts cannot be production-grade today.

### 5. No chart OCR / diagram OCR pipeline
- No chart-structured OCR library or pipeline found (e.g., chart-to-data extraction models).
- For chart-like content, current generic text OCR will miss axes, legends, bars/lines semantics.

### 6. No OCR-to-editor/export/search architecture implemented
Not found in current code:
- OCR -> rich inline editor with correction history,
- export to PDF/MD/TXT/DOCX,
- OCR text indexing/search (FTS/vector hybrid),
- document ingestion queue with status/retry/audit metadata.

---

## OCR quality estimate (current)

Because no benchmark dataset is included, this is a qualitative readiness estimate:
- Printed English forms: **moderate**
- Printed Sinhala/Tamil: **low-to-moderate** (depends strongly on typography and scan quality)
- Handwritten Sinhala/Tamil registers: **low**
- Charts/tables beyond plain rows: **low**

**OCR Production Readiness Score: 34/100**

---

## 3) Recommended implementation blueprint

## A. QR architecture (high priority)
1. Define one canonical payload schema (versioned):
   - `gurudevi://qr/v1?action=join_class&classroom_id=...`
   - `...action=join_group&group_id=...`
   - `...action=claim_invite&invite_code=...`
2. Build a single QR resolver module:
   - parse + validate + route + error taxonomy.
3. Replace ad-hoc handlers in `AuthScreen`, `TeacherDashboard`, `CreateClassroomModal` with resolver.
4. Add signed payload option (HMAC/JWT) for tamper resistance.
5. Add explicit share actions:
   - “Share QR image” and “Share join link”, using render-to-image + `expo-sharing`.
6. Instrument analytics + failure telemetry for scan outcomes.

## B. OCR architecture (high priority)
1. Preprocessing stage before OCR:
   - auto-crop, deskew, denoise, binarization, contrast enhancement.
2. Two-pass recognition:
   - generic OCR + script-aware correction (Sinhala/Tamil lexicon + heuristics).
3. Structured extraction:
   - line grouping/table reconstruction; not just regex over full text.
4. Human-in-the-loop editor:
   - inline correction UI with confidence highlights.
5. Persistence + provenance:
   - store raw image hash, OCR text, parsed entities, confidence, correction history.

## C. Charts / handwriting enhancement track
- For chart OCR (axes/legend/data extraction), evaluate specialized document AI models (chart understanding family), not plain text OCR.
- For handwriting, evaluate dedicated handwriting recognition models or cloud APIs with Sinhala/Tamil testing sets.
- Build a benchmark suite with CER/WER by language + domain (registers, notes, worksheets, charts).

## D. OCR output pipelines (requested)
1. **OCR -> Inline Editor**
   - normalized blocks (heading/paragraph/table) editable in app.
2. **Export**
   - TXT/MD first, then PDF/DOCX export adapters.
3. **Search**
   - keyword FTS index now; add semantic vector search later.
4. **Review workflow**
   - draft -> reviewed -> approved states for school records.

---

## Final verdict
- QR is **present but fragmented**; several paths look incomplete or non-functional without a central resolver and payload contract.
- OCR is **prototype-level** (good foundation, insufficient for robust Sinhala/Tamil handwriting and chart extraction in production).
- Immediate next milestone should be **integration correctness** (QR routing + OCR usage wiring), then **accuracy improvements and export/search pipelines**.
