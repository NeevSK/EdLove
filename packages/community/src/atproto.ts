/**
 * ATProto / BlueSky Data Schemas & Records
 * Workspace package stub for ATProto protocol interop within @repo/community
 */

export interface ATProtoProfile {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  banner?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  indexedAt?: string;
}

export interface ATProtoFeedPost {
  uri: string;
  cid: string;
  author: ATProtoProfile;
  record: {
    $type: 'app.bsky.feed.post';
    text: string;
    createdAt: string;
    facets?: Array<{
      index: { byteStart: number; byteEnd: number };
      features: Array<{
        $type: string;
        uri?: string;
        tag?: string;
        did?: string;
      }>;
    }>;
  };
  replyCount?: number;
  repostCount?: number;
  likeCount?: number;
  indexedAt: string;
}

export class ATProtoClientStub {
  private serviceUrl: string;

  constructor(serviceUrl = 'https://bsky.social') {
    this.serviceUrl = serviceUrl;
  }

  async resolveHandle(handle: string): Promise<{ did: string }> {
    return { did: `did:plc:${handle.replace(/[^a-z0-9]/g, '')}` };
  }

  async getAuthorFeed(handleOrDid: string): Promise<ATProtoFeedPost[]> {
    return [];
  }
}
