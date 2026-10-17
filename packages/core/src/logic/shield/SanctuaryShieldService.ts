export type ShieldMode = 'family' | 'security' | 'privacy';

export interface ShieldConfig {
  mode: ShieldMode;
  enabled: boolean;
  timeoutMs?: number;
}

export interface DnsAnswer {
  name: string;
  type: number;
  data: string;
  TTL: number;
}

export interface DnsResponse {
  Status: number; // 0 = NOERROR, 3 = NXDOMAIN
  Answer?: DnsAnswer[];
}

export interface DomainSafetyResult {
  domain: string;
  isSafe: boolean;
  ipAddresses: string[];
  reason?: 'malware_or_adult_blocked' | 'nxdomain' | 'resolved';
  responseTimeMs: number;
}

export const CLOUDFLARE_DOH_ENDPOINTS: Record<ShieldMode, string> = {
  // 1.1.1.3: Blocks malware and adult content (Standard Sri Lankan School / Child baseline)
  family: 'https://family.cloudflare-dns.com/dns-query',
  // 1.1.1.2: Blocks malware only
  security: 'https://security.cloudflare-dns.com/dns-query',
  // 1.1.1.1: Standard privacy-preserving DNS (no blocking)
  privacy: 'https://cloudflare-dns.com/dns-query',
};

/**
 * ============================================================================
 * SANCTUARY SHIELD: ZERO-COST CHILD SAFETY & ENCRYPTED DNS ARCHITECTURE
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * In rural Sri Lankan schools, community learning centers, and households, students
 * and teachers frequently connect to open, unmanaged Wi-Fi networks (or mobile 4G/5G).
 * Commercial VPNs (NordVPN, ExpressVPN) cost $5-$12/month, require credit cards, and
 * drain mobile batteries with heavy background daemons.
 *
 * THE ZERO-PENNY ($0 / 0 LKR) SOLUTION:
 * Instead of routing whole-device traffic through a paid VPN server, the Sanctuary Shield
 * leverages public DNS-over-HTTPS (DoH) provided as a free public utility by Cloudflare.
 *
 * OPERATING MODES:
 * 1. 'family' (1.1.1.3): Blocks malware, phishing, and adult content automatically.
 *    Returns 0.0.0.0 for prohibited domains. This is the mandatory school/child baseline.
 * 2. 'security' (1.1.1.2): Blocks known malicious and phishing domains without adult filtering.
 * 3. 'privacy' (1.1.1.1): Standard DNS encryption without filtering.
 *
 * FUTURE EXPANSION PATHS:
 * - In-App WebView Navigation Gate: Intercept in-app browser links in the Library floor
 *   and verify with `evaluateDomainSafety(url.hostname)` before rendering.
 * - Global Fetch Interceptor: Wrap React Native `globalThis.fetch` to resolve hostnames
 *   through DoH, preventing local ISP SNI eavesdropping.
 * - Egress MASQUE Tunnel: For high-risk whistleblowing or extreme censorship, pipe
 *   DoH through an Oblivious HTTP (OHTTP) relay or Cloudflare WARP.
 */
export class SanctuaryShieldService {
  private config: ShieldConfig;

  constructor(config?: Partial<ShieldConfig>) {
    this.config = {
      mode: config?.mode ?? 'family',
      enabled: config?.enabled ?? true,
      timeoutMs: config?.timeoutMs ?? 3000,
    };
  }

  public getMode(): ShieldMode {
    return this.config.mode;
  }

  public isEnabled(): boolean {
    return this.config.enabled;
  }

  public setMode(mode: ShieldMode): void {
    this.config.mode = mode;
  }

  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Resolves a domain via Cloudflare DNS-over-HTTPS (DoH).
   */
  public async resolve(
    domain: string,
    recordType: 'A' | 'AAAA' = 'A',
    fetchFn: typeof fetch = fetch,
  ): Promise<DnsResponse> {
    const endpoint = CLOUDFLARE_DOH_ENDPOINTS[this.config.mode];
    const url = `${endpoint}?name=${encodeURIComponent(domain)}&type=${recordType}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetchFn(url, {
        headers: {
          Accept: 'application/dns-json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Cloudflare DoH returned HTTP ${response.status}`);
      }

      return (await response.json()) as DnsResponse;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Evaluates if a domain is safe under the current Sanctuary Shield policy.
   * If Cloudflare 1.1.1.3 Family blocks the domain, it returns 0.0.0.0 or NXDOMAIN.
   */
  public async evaluateDomainSafety(
    domain: string,
    fetchFn: typeof fetch = fetch,
  ): Promise<DomainSafetyResult> {
    const start = Date.now();

    try {
      const dnsRes = await this.resolve(domain, 'A', fetchFn);
      const elapsed = Date.now() - start;

      if (dnsRes.Status === 3) {
        return {
          domain,
          isSafe: false,
          ipAddresses: [],
          reason: 'nxdomain',
          responseTimeMs: elapsed,
        };
      }

      const ips = (dnsRes.Answer ?? [])
        .filter((a) => a.type === 1) // Type 1 = A record
        .map((a) => a.data);

      // Cloudflare 1.1.1.3 returns 0.0.0.0 when a domain is categorized as adult/malicious
      const isBlocked = ips.includes('0.0.0.0') || ips.length === 0;

      return {
        domain,
        isSafe: !isBlocked,
        ipAddresses: ips,
        reason: isBlocked ? 'malware_or_adult_blocked' : 'resolved',
        responseTimeMs: elapsed,
      };
    } catch {
      return {
        domain,
        isSafe: false,
        ipAddresses: [],
        reason: 'nxdomain',
        responseTimeMs: Date.now() - start,
      };
    }
  }
}
