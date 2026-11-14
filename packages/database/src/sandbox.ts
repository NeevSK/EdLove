/**
 * Ephemeral AI Agent Database Sandbox SPI
 *
 * Implements Copy-on-Write database branching for autonomous AI agent
 * testbeds, experiment isolation, and ephemeral evaluation sandboxes.
 *
 * Supported engines:
 * 1. Neon Serverless Postgres (CoW branching via Neon Management API)
 * 2. In-Memory Mock Provider (Deterministic fallback for local testing & CI)
 */

import { createZenStackDb } from './client.js';

export interface SandboxBranch {
  id: string;
  name: string;
  projectId: string;
  parentId?: string;
  createdAt: string;
  expiresAt?: string;
  connectionString?: string;
}

export interface CreateBranchOptions {
  name?: string;
  parentBranchId?: string;
  ttlMinutes?: number;
}

export interface ISandboxDatabasePort {
  readonly providerName: string;

  /**
   * Spawns an isolated Copy-on-Write branch for an AI agent run or testbed.
   */
  createBranch(options?: CreateBranchOptions): Promise<SandboxBranch>;

  /**
   * Retrieves the connection string for a sandbox branch.
   */
  getBranchConnectionString(branchId: string): Promise<string>;

  /**
   * Deallocates and drops an ephemeral branch.
   */
  deleteBranch(branchId: string): Promise<void>;

  /**
   * Creates an authenticated ZenStack client bounded to the ephemeral sandbox branch.
   */
  createSandboxClient(branchId: string, user: { id: string }): Promise<ReturnType<typeof createZenStackDb>>;
}

/**
 * Neon Management API Copy-on-Write Provider
 */
export class NeonSandboxProvider implements ISandboxDatabasePort {
  readonly providerName = 'neon';
  private readonly apiKey: string;
  private readonly projectId: string;
  private readonly baseUrl: string;

  constructor(options?: { apiKey?: string; projectId?: string; baseUrl?: string }) {
    this.apiKey = options?.apiKey || process.env.NEON_API_KEY || '';
    this.projectId = options?.projectId || process.env.NEON_PROJECT_ID || '';
    this.baseUrl = options?.baseUrl || 'https://console.neon.tech/api/v2';

    if (!this.apiKey || !this.projectId) {
      console.warn(
        '[NeonSandboxProvider] NEON_API_KEY or NEON_PROJECT_ID missing. Calls will fail unless mocked.',
      );
    }
  }

  private async request<T>(path: string, method: string = 'GET', body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`[NeonSandboxProvider] HTTP ${res.status} on ${method} ${path}: ${errText}`);
    }

    return res.json() as Promise<T>;
  }

  async createBranch(options: CreateBranchOptions = {}): Promise<SandboxBranch> {
    const branchName =
      options.name || `ai-agent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const payload: Record<string, unknown> = {
      branch: {
        name: branchName,
        parent_id: options.parentBranchId,
      },
      endpoints: [
        {
          type: 'read_write',
        },
      ],
    };

    const response = await this.request<{
      branch: { id: string; name: string; project_id: string; parent_id?: string; created_at: string };
      connection_uris?: Array<{ connection_uri: string }>;
    }>(`/projects/${this.projectId}/branches`, 'POST', payload);

    const expiresAt = options.ttlMinutes
      ? new Date(Date.now() + options.ttlMinutes * 60 * 1000).toISOString()
      : undefined;

    return {
      id: response.branch.id,
      name: response.branch.name,
      projectId: response.branch.project_id,
      parentId: response.branch.parent_id,
      createdAt: response.branch.created_at,
      expiresAt,
      connectionString: response.connection_uris?.[0]?.connection_uri,
    };
  }

  async getBranchConnectionString(branchId: string): Promise<string> {
    const response = await this.request<{
      endpoints: Array<{ host: string; id: string }>;
    }>(`/projects/${this.projectId}/branches/${branchId}/endpoints`);

    const endpoint = response.endpoints?.[0];
    if (!endpoint) {
      throw new Error(`[NeonSandboxProvider] No active endpoint found for branch: ${branchId}`);
    }

    // Neon endpoint URI schema
    const role = process.env.NEON_DATABASE_USER || 'neondb_owner';
    const dbName = process.env.NEON_DATABASE_NAME || 'neondb';
    return `postgres://${role}@${endpoint.host}/${dbName}?sslmode=require`;
  }

  async deleteBranch(branchId: string): Promise<void> {
    await this.request(`/projects/${this.projectId}/branches/${branchId}`, 'DELETE');
  }

  async createSandboxClient(branchId: string, user: { id: string }): Promise<ReturnType<typeof createZenStackDb>> {
    const connectionString = await this.getBranchConnectionString(branchId);
    return createZenStackDb(user, connectionString);
  }
}

/**
 * Deterministic In-Memory Mock Provider (For Local Testing, Fast CI & Dev)
 */
export class MockSandboxProvider implements ISandboxDatabasePort {
  readonly providerName = 'mock';
  private branches = new Map<string, SandboxBranch>();

  async createBranch(options: CreateBranchOptions = {}): Promise<SandboxBranch> {
    const id = `mock-branch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const name = options.name || id;
    const now = new Date();
    const expiresAt = options.ttlMinutes
      ? new Date(now.getTime() + options.ttlMinutes * 60 * 1000).toISOString()
      : undefined;

    const branch: SandboxBranch = {
      id,
      name,
      projectId: 'mock-polymath-project',
      parentId: options.parentBranchId || 'main',
      createdAt: now.toISOString(),
      expiresAt,
      connectionString: `postgres://localhost:5432/${name}?sslmode=disable`,
    };

    this.branches.set(id, branch);
    return branch;
  }

  async getBranchConnectionString(branchId: string): Promise<string> {
    const branch = this.branches.get(branchId);
    if (!branch) {
      throw new Error(`[MockSandboxProvider] Branch not found: ${branchId}`);
    }
    return branch.connectionString || `postgres://localhost:5432/${branch.name}`;
  }

  async deleteBranch(branchId: string): Promise<void> {
    if (!this.branches.has(branchId)) {
      throw new Error(`[MockSandboxProvider] Cannot delete non-existent branch: ${branchId}`);
    }
    this.branches.delete(branchId);
  }

  async createSandboxClient(branchId: string, user: { id: string }): Promise<ReturnType<typeof createZenStackDb>> {
    const connStr = await this.getBranchConnectionString(branchId);
    return createZenStackDb(user, connStr);
  }

  // Test inspection helper
  getActiveBranchCount(): number {
    return this.branches.size;
  }
}

/**
 * Resolves the active sandbox database provider.
 * Automatically chooses Neon when Doppler credentials exist, otherwise Mock.
 */
export function getSandboxDatabaseProvider(forceMock = false): ISandboxDatabasePort {
  if (forceMock) {
    return new MockSandboxProvider();
  }
  if (process.env.NEON_API_KEY && process.env.NEON_PROJECT_ID) {
    return new NeonSandboxProvider();
  }
  return new MockSandboxProvider();
}
