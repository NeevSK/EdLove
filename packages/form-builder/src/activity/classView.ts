/**
 * The teacher's view of one activity across a class: for each question, how many answered,
 * how many got it right, and the most common wrong answers. Seeing which wrong answers are
 * common is what let teachers in the ASSISTments trials aim their next lesson at a
 * misconception instead of reteaching everything.
 *
 * Computed when read, from attempts the teacher may see (those inside their relations). It is
 * never stored and names no one: it says what the class answered, not who is behind.
 */

export interface AttemptForView {
  /** Each answered part's response, as given. */
  readonly responses: ReadonlyMap<string, unknown>;
  /** Each marked part's result. Unmarked parts (a poll, an open answer) are left out. */
  readonly correct: ReadonlyMap<string, boolean>;
  /** Parts answered with help (from the journal), so the view can tell "right alone" apart. */
  readonly helped?: ReadonlySet<string>;
}

export interface PartView {
  readonly part: string;
  readonly answered: number;
  readonly right: number;
  readonly rightAlone: number;
  /** The most common wrong answers, most frequent first, with how many gave each. */
  readonly commonWrong: readonly { readonly response: string; readonly count: number }[];
}

const keyOf = (response: unknown): string =>
  Array.isArray(response) ? [...response].map(String).sort().join(' + ') : String(response).trim();

/** One row per question, in the order `parts` lists them. `top` caps the wrong answers shown. */
export function classView(
  attempts: readonly AttemptForView[],
  parts: readonly string[],
  top = 3,
): readonly PartView[] {
  return parts.map((part) => {
    let answered = 0;
    let right = 0;
    let rightAlone = 0;
    const wrong = new Map<string, number>();
    for (const attempt of attempts) {
      if (!attempt.responses.has(part)) continue;
      answered += 1;
      const isRight = attempt.correct.get(part);
      if (isRight === true) {
        right += 1;
        if (!attempt.helped?.has(part)) rightAlone += 1;
      } else if (isRight === false) {
        const key = keyOf(attempt.responses.get(part));
        wrong.set(key, (wrong.get(key) ?? 0) + 1);
      }
    }
    const commonWrong = [...wrong.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, top)
      .map(([response, count]) => ({ response, count }));
    return { part, answered, right, rightAlone, commonWrong };
  });
}
