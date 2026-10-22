import { bench, describe } from 'vitest';
import { check } from '../index';

describe('Cedar WASM Authorization PDP', () => {
  const contributor = {
    type: 'member',
    id: 'author-1',
    attributes: { capacity: 'member', school_id: 'school-1' },
  };

  const req = {
    principal: contributor,
    action: 'create',
    resource: {
      type: 'EditorialSubmission',
      id: 'submission-1',
      attributes: { submitter_id: 'author-1' },
    },
  };

  bench('evaluates single principal action permission', () => {
    check(req);
  });
});