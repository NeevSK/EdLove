import { createORPCClient, MalformedResponseError, ORPCError } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { app } from '../core/app';

const CODE_TO_STATUS: Record<string, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_SUPPORTED: 405,
  NOT_ACCEPTABLE: 406,
  TIMEOUT: 408,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,
  CLIENT_CLOSED_REQUEST: 499,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

if (!('status' in ORPCError.prototype)) {
  Object.defineProperty(ORPCError.prototype, 'status', {
    get() {
      return (this.code && CODE_TO_STATUS[this.code]) ?? 500;
    },
    enumerable: true,
    configurable: true,
  });

  const origToJSON = ORPCError.prototype.toJSON;
  ORPCError.prototype.toJSON = function () {
    const json = origToJSON ? origToJSON.call(this) : {};
    return {
      ...json,
      status: this.status,
    };
  };
}

if (!('status' in MalformedResponseError.prototype)) {
  Object.defineProperty(MalformedResponseError.prototype, 'status', {
    get() {
      return this.response?.status;
    },
    enumerable: true,
    configurable: true,
  });
}

export function createTestORPCClient(headers: Record<string, string> = {}) {
  const link = new RPCLink<Record<never, never>>({
    url: '/api',
    origin: 'http://sanctuary.test',
    headers,
    fetch: async (request, init) => app.fetch(new Request(request, init)),
  });

  const interceptorLink = {
    call: async (...args: Parameters<typeof link.call>) => {
      try {
        return await link.call(...args);
      } catch (error: any) {
        if (error && error.name === 'MalformedResponseError') {
          const json = error.response?.body?.json ?? error.response?.body;
          if (json && typeof json === 'object') {
            if (json.message) error.message = json.message;
            if (json.data !== undefined) error.data = json.data;
            if (json.code) error.code = json.code;
          }
          if (error.response?.status !== undefined) {
            Object.defineProperty(error, 'status', {
              value: error.response.status,
              enumerable: true,
              configurable: true,
            });
          }
        }
        throw error;
      }
    },
  };

  return createORPCClient<any>(interceptorLink);
}
