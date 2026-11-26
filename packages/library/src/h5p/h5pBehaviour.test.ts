import { describe, expect, it } from 'vitest';
import { applyH5PBehaviour } from './h5pBehaviour';

// Shapes follow each library's semantics.json: question types keep `behaviour`, composites
// keep `override`, and nested questions are `{ library, params }`.
const multiChoice = {
  question: '<p>සූර්යයාට ළඟම ග්‍රහලෝකය?</p>',
  answers: [{ text: 'Mercury', correct: true }],
  behaviour: {
    enableRetry: true,
    enableSolutionsButton: true,
    enableCheckButton: true,
    randomAnswers: true,
    passPercentage: 100,
  },
};

const questionSet = {
  questions: [
    { library: 'H5P.MultiChoice 1.16', params: multiChoice },
    {
      library: 'H5P.Blanks 1.14',
      params: {
        questions: ['*Mercury*'],
        behaviour: { enableRetry: true, allowRetryIfCorrect: true },
      },
    },
  ],
  override: { checkButton: true },
};

const interactiveVideo = {
  interactiveVideo: {
    assets: {
      interactions: [
        { action: { library: 'H5P.TrueFalse 1.8', params: { behaviour: { enableRetry: true } } } },
      ],
    },
  },
  override: { preventSkippingMode: 'none', autoplay: false },
};

const exam = {
  retry: false,
  showSolutions: false,
  check: true,
  preventSkipping: 'forward',
} as const;

describe('applyH5PBehaviour', () => {
  it('turns off retry and solutions on a single question, keeping the author’s other settings', () => {
    expect(applyH5PBehaviour(multiChoice, exam)).toMatchObject({
      behaviour: {
        enableRetry: false,
        enableSolutionsButton: false,
        enableCheckButton: true,
        randomAnswers: true,
        passPercentage: 100,
      },
    });
  });

  it('reaches questions inside a question set and sets the set’s own buttons', () => {
    const played = applyH5PBehaviour(questionSet, exam) as typeof questionSet;
    expect(played.override).toEqual({
      checkButton: true,
      showSolutionButton: 'off',
      retryButton: 'off',
    });
    expect(played.questions[0]?.params.behaviour).toMatchObject({
      enableRetry: false,
      enableSolutionsButton: false,
    });
    expect(played.questions[1]?.params.behaviour).toMatchObject({
      enableRetry: false,
      allowRetryIfCorrect: false,
    });
  });

  it('stops skipping ahead in an interactive video and reaches its interactions', () => {
    const played = applyH5PBehaviour(interactiveVideo, exam) as typeof interactiveVideo;
    expect(played.override).toMatchObject({
      preventSkippingMode: 'forward',
      autoplay: false,
      retryButton: 'off',
    });
    expect(
      played.interactiveVideo.assets.interactions[0]?.action.params.behaviour.enableRetry,
    ).toBe(false);
  });

  it('leaves practice open', () => {
    const played = applyH5PBehaviour(multiChoice, {
      retry: true,
      showSolutions: true,
    }) as typeof multiChoice;
    expect(played.behaviour).toEqual(multiChoice.behaviour);
  });

  it('never changes the teacher’s content', () => {
    const before = JSON.stringify(questionSet);
    applyH5PBehaviour(questionSet, exam);
    expect(JSON.stringify(questionSet)).toBe(before);
  });

  it('adds no check button where the type never had one, and passes non-objects through', () => {
    const singleChoiceSet = { choices: [], behaviour: { autoContinue: true, enableRetry: true } };
    expect(
      'enableCheckButton' in
        (applyH5PBehaviour(singleChoiceSet, exam) as typeof singleChoiceSet).behaviour,
    ).toBe(false);
    expect(applyH5PBehaviour('text', exam)).toBe('text');
    expect(applyH5PBehaviour(null, exam)).toBe(null);
  });
});
