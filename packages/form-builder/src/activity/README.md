# Activities: modes, journals and placements

The form builder already holds the questions (`FormSchema` with rubrics) and marks them (`quiz/grade.ts`, using `@intuitui-labs/form-builder-engine` 0.3.0). This folder adds what turns one set of questions into the different things a class needs. It is pure: no React, storage or network, and no app names (`__tests__/boundary.test.ts`).

## Three separate ideas

| Idea          | Question it answers                                | Where                                    |
| ------------- | -------------------------------------------------- | ---------------------------------------- |
| **Mode**      | How is it run?                                     | `mode.ts`                                |
| **Journal**   | What happened in this attempt, and with what help? | `journal.ts`                             |
| **Placement** | Where does it sit?                                 | `videoCues.ts` (video); the others below |

Keeping them apart is what lets the same questions be a practice round on Monday, a check on Friday, a poll in a post, or three questions inside a video, without copying them.

### Modes (`mode.ts`)

Each mode is a policy with defaults (`MODE_DEFAULTS`), and any field can be overridden per activity (`resolveMode(mode, overrides)`).

|                         | practice            | check         | exam            | poll                |
| ----------------------- | ------------------- | ------------- | --------------- | ------------------- |
| Marked                  | yes                 | yes           | yes             | no                  |
| Feedback                | after each question | on submitting | after it closes | never               |
| Hints                   | yes                 | yes           | no              | no                  |
| Tries                   | unlimited           | 1             | 1               | 1 (vote can change) |
| Lockdown and time limit | no                  | no            | yes             | no                  |
| Results to participants | never               | never         | never           | after voting        |

Two defaults hold in every mode:

- **Help never lowers marks** (`assistanceAffectsMarks: false`). The engine supports hint and retry penalties; `schemaForMode` sets them to zero unless a policy turns them on.
- **No speed or streak bonuses** (`speedAndStreakBonus: false`), matching "no points, badges or streaks".

`schemaForMode(schema, policy)` never changes the authored schema. A poll keeps the questions and drops every answer key.

Telegram's "quiz" poll (one right answer, then an explanation) is a one-question `check` with feedback per question. Its normal poll is `poll`. Vote counting for community posts stays where it is (`community.getPollStatus`).

### Journal (`journal.ts`)

An attempt is a list of steps, append-only and keyed by ids made on the device:

- `answered`, `retried`;
- `help_asked`, and `helped` with the kind of help: `hint` with its rung, `worked_example`, `peer`, `teacher`, `guardian` or `ai`, plus the helper;
- `left_app`, `returned`, `time_up`.

`assistanceByPart` says, per question, whether it was answered alone, and if not, what help came before the last answer. Help looked at after answering counts as review, not assistance. `gradeInputFromJournal` gives `gradeQuiz` its inputs, so marking and the record come from the same facts. This is the source for the steps in the [assessments card](../../../../docs/architecture/domains/learning/assessments.md).

### Placements

- **On its own:** the quiz runner, as today.
- **Inside a video** (`videoCues.ts`): cues on the timeline (`atMs`, the questions, `pause`, `required`).
  - Playback ticks that cross a cue open it, even when no tick lands on it exactly.
  - A seek past an unanswered required cue stops there (`seekPastRequired`).
  - Long ticks count as seeks, going backwards is always free, and answered cues don't reopen when rewatching.
  - Every behaviour is a policy (`DEFAULT_CUE_POLICY`).
  - It works with any player: `expo-video` on mobile, `<video>` on the web.
- **Live in class** (`live.ts`, `liveTransport.ts`): the teacher's device hosts, opens a question, takes everyone's answers, closes it when time is up and reveals the counts.
  - The host holds the only state. Snapshots carry a sequence number, and deadlines travel as time remaining, so wrong device clocks still agree.
  - Answers are checked, acknowledged and idempotent. Unacknowledged answers are resent after a reconnect, and every answer is also kept in the participant's own journal for normal sync.
  - Messages stay under 200 bytes.
  - Transports are tried in order: `internet`, then `local-network` (school Wi-Fi or the teacher's own hotspot, found by mDNS, works between Android and iPhone), then `nearby` (Bluetooth and Wi-Fi Direct, only when the class is all one platform, because Google Nearby and Apple Multipeer don't connect across).
  - Candidate adapters, not yet added: `react-native-tcp-socket` 6.4.3 with `react-native-zeroconf` 0.17.7, and `expo-nearby-connections` 1.1.1 (needs Nitro Modules).
- **Not built yet:** in a post (poll), in a relation's thread (shared to one learner), and in a reading (at a place in a document).

## Learning loops on the journal

Each of these reads the journal and, like the rest of this folder, stores no judgment of the person. The evidence behind each is in the project doc `claude/learning-that-works.md`.

| File | Loop | What it does |
| --- | --- | --- |
| `calibration.ts` | Metacognition | `confidence` and `reflected` (plan, monitor, evaluate) journal steps. `calibrationOf` sorts answers into sure and right, sure and wrong, unsure but right, unsure and wrong, to reflect back to the person. |
| `review.ts`, `fsrsReview.adapter.ts` | Spacing | Grades from the journal (wrong is again; helped or unsure is hard; alone and sure is good; easy is never inferred), schedules on FSRS-7 through `ts-fsrs` 6.0.0, and offers what is due, mixed across topics. |
| `classView.ts` | The teacher's view | Per question: answered, right, right alone, and the most common wrong answers. Computed at read time; names no one. |
| `fromH5P.ts` | One journal | H5P answers become journal steps under their part; a top-level completion ends the activity. |

## Not built yet

1. **The runner reads a `ModePolicy`.** `QuizRunner` takes the policy and writes journal steps (`hintsUsed` reaches marking today but is dropped from `QuizAttempt`).
2. **The video host:** a native overlay on `expo-video` and a web overlay on `<video>`, both driving `advanceCues`.
3. **New interaction kinds the engine lacks:** ordering, matching, drag the words, mark the words, hotspot on an image. Each needs a rubric kind and a native and a web control.
4. **The live transports** in the app, behind `LiveTransport`, and the host and participant screens.
5. **The H5P converter:** `content.json` of the question types into a `FormSchema`, with the WebView player (`@repo/library/h5p`) as the fallback for everything else.

## Evidence

G1 only: `vitest run src/activity src/quiz` passes 83 tests. tsc shows no errors in these files (44 pre-existing errors elsewhere in the package). The tests prove the rules under substituted time and answers. They don't prove a real player, a device or the screens.
