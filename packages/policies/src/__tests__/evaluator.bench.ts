import { test } from 'vitest';
import { check } from '../index';

test('Cedar WASM Authorization PDP', async ({ bench }) => {
  const contributor = {
    type: 'member',
    id: 'author-1',
    attributes: { capacity: 'member' },
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

  await bench('evaluates single principal action permission', { time: 500 }, () => {
    check(req);
  }).run();
});