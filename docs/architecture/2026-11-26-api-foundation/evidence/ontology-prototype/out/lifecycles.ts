// Generated lifecycle guards. A transition not listed here cannot happen.
export const lifecycles = {
  Bond: { field: "state", start: "invited", transitions: [{ by: "accept", from: "invited", to: "active", who: ['person'] }, { by: "decline", from: "invited", to: "ended", who: ['person'] }, { by: "end", from: "active", to: "ended", who: ['person', 'principal', 'founder'] }, { by: "keep", from: "ended", to: "kept", who: ['system'] }] },
  Assignment: { field: "stage", start: "draft", transitions: [{ by: "publish", from: "draft", to: "published", who: ['teacher'] }, { by: "close", from: "published", to: "closed", who: ['teacher', 'system'] }, { by: "reopen", from: "closed", to: "published", who: ['teacher'] }] },
} as const;
