import { communityContract } from './community.contract';
import { z } from 'zod';

export const communityORPCContract = {
  ...communityContract,
  getComments: {
    method: 'get',
    path: '/community/posts/:postId/comments',
    request: {
      query: z.object({ postId: z.string().uuid() }),
    },
  },
  createComment: {
    method: 'post',
    path: '/community/posts/:postId/comments',
    request: {
      body: z.object({ postId: z.string().uuid(), content: z.string(), isAnonymous: z.boolean().optional() }),
    },
  },
  deleteComment: {
    method: 'delete',
    path: '/community/comments/:commentId',
    request: {
      body: z.object({ commentId: z.string().uuid() }),
    },
  },
  toggleCommentUpvote: {
    method: 'post',
    path: '/community/comments/:commentId/upvote',
    request: {
      body: z.object({ commentId: z.string().uuid() }),
    },
  },
  markOfficialAnswer: {
    method: 'post',
    path: '/community/comments/:commentId/official',
    request: {
      body: z.object({ commentId: z.string().uuid() }),
    },
  },
  getPollStatus: {
    method: 'get',
    path: '/community/posts/:postId/poll',
    request: {
      query: z.object({ postId: z.string().uuid() }),
    },
  },
  voteInPoll: {
    method: 'post',
    path: '/community/posts/:postId/poll/vote',
    request: {
      body: z.object({ postId: z.string().uuid(), optionId: z.string().uuid() }),
    },
  },
  reportContent: {
    method: 'post',
    path: '/community/posts/:postId/report',
    request: {
      body: z.object({ postId: z.string().uuid(), reason: z.string(), reportTarget: z.string() }),
    },
  },
};
