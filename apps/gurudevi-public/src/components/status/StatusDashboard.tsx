import React, { useState, useEffect, useCallback } from 'react';
import { translator, type SupportedLocale } from '../../site';
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ShieldCheck,
  Server,
  Database,
  Activity,
  Globe2,
  FileCode2,
  Zap,
  Power,
  Flame,
  Check,
} from 'lucide-react';
import { statusApiOrigin } from '../../lib/statusApi';

interface ProbeResult {
  liveOk: boolean;
  liveLatency: number;
  readyOk: boolean;
  readyLatency: number;
  docOk: boolean;
  docLatency: number;
  timestamp: string;
}

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  status: 'operational' | 'degraded' | 'checking';
  latency?: number;
  endpoint?: string;
}

const API_BASE = statusApiOrigin(import.meta.env.PUBLIC_SANCTUARY_API_ORIGIN);

export function StatusDashboard({ locale }: { readonly locale: SupportedLocale }) {
  const t = translator(locale);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [browserPulse, setBrowserPulse] = useState(false);
  const [lastPulse, setLastPulse] = useState<Date | null>(null);
  const [wakingUp, setWakingUp] = useState(false);
  const [wakeProgress, setWakeProgress] = useState<string | null>(null);
  const [probeHistory, setProbeHistory] = useState<ProbeResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ProbeResult | null>(null);

  const wakeUpServer = useCallback(async () => {
    setWakingUp(true);
    setWakeProgress('Sending initial wake-up trigger...');
    const maxRetries = 8;
    const intervalMs = 5000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setWakeProgress(`Triggering cold container (Attempt ${attempt}/${maxRetries})...`);
        const res = await fetch(`${API_BASE}/health/live`, { cache: 'no-store' });
        if (res.ok) {
          setWakeProgress('✅ Container is warm and responding with HTTP 200!');
          await runProbe();
          setTimeout(() => {
            setWakingUp(false);
            setWakeProgress(null);
          }, 2500);
          return;
        }
      } catch {
        // Container waking up, sleep and retry
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    setWakeProgress('⚠️ Container spin-up timeout. Try probing directly.');
    setTimeout(() => {
      setWakingUp(false);
      setWakeProgress(null);
    }, 4000);
  }, []);

  const runProbe = useCallback(async () => {
    setLoading(true);
    const startLive = performance.now();
    let liveOk = false;
    let liveLatency = 0;

    try {
      const res = await fetch(`${API_BASE}/health/live`, { cache: 'no-store' });
      liveLatency = Math.round(performance.now() - startLive);
      liveOk = res.ok;
    } catch {
      liveLatency = Math.round(performance.now() - startLive);
      liveOk = false;
    }

    const startReady = performance.now();
    let readyOk = false;
    let readyLatency = 0;

    try {
      const res = await fetch(`${API_BASE}/health/ready`, { cache: 'no-store' });
      readyLatency = Math.round(performance.now() - startReady);
      readyOk = res.ok;
    } catch {
      readyLatency = Math.round(performance.now() - startReady);
      readyOk = false;
    }

    const startDoc = performance.now();
    let docOk = false;
    let docLatency = 0;

    try {
      const res = await fetch(`${API_BASE}/doc`, { cache: 'no-store' });
      docLatency = Math.round(performance.now() - startDoc);
      docOk = res.ok;
    } catch {
      docLatency = Math.round(performance.now() - startDoc);
      docOk = false;
    }

    const result: ProbeResult = {
      liveOk,
      liveLatency,
      readyOk,
      readyLatency,
      docOk,
      docLatency,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };

    setCurrentResult(result);
    setProbeHistory((prev) => [result, ...prev.slice(0, 9)]);
    setLastCheck(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    void runProbe();
  }, [runProbe]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      void runProbe();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, runProbe]);

  // Browser Keep-Alive Pulse: Pings /health/live every 5 minutes while active
  useEffect(() => {
    if (!browserPulse) return;
    const pulseInterval = setInterval(
      async () => {
        try {
          await fetch(`${API_BASE}/health/live`, { cache: 'no-store' });
          setLastPulse(new Date());
        } catch {
          /* non-fatal pulse error */
        }
      },
      5 * 60 * 1000,
    );
    return () => clearInterval(pulseInterval);
  }, [browserPulse]);

  const allOperational = currentResult?.liveOk && currentResult?.readyOk;

  const services: ServiceItem[] = [
    {
      id: 'api-core',
      name: 'Sanctuary API Edge Gateway',
      category: 'Compute & Routing',
      description: 'Hono v4 / Node.js containerized server on Render Edge (Singapore)',
      icon: <Server className="h-5 w-5 text-lotus" />,
      status:
        loading && !currentResult ? 'checking' : currentResult?.liveOk ? 'operational' : 'degraded',
      latency: currentResult?.liveLatency,
      endpoint: '/health/live',
    },
    {
      id: 'db-postgres',
      name: 'PostgreSQL Database & Pool',
      category: 'Data Storage',
      description: 'Supabase Postgres connection pooler with active rate limit schema',
      icon: <Database className="h-5 w-5 text-lotus" />,
      status:
        loading && !currentResult
          ? 'checking'
          : currentResult?.readyOk
            ? 'operational'
            : 'degraded',
      latency: currentResult?.readyLatency,
      endpoint: '/health/ready',
    },
    {
      id: 'cedar-auth',
      name: 'Cedar Authorization Engine',
      category: 'Security & Access',
      description: 'Zero-trust RBAC / ABAC policy evaluator running in-process (WASM)',
      icon: <ShieldCheck className="h-5 w-5 text-lotus" />,
      status: 'operational',
      endpoint: 'in-process',
    },
    {
      id: 'docs-scalar',
      name: 'Interactive API Docs & Schema',
      category: 'Documentation',
      description: 'OpenAPI 3.1.0 contract and Scalar developer reference portal',
      icon: <FileCode2 className="h-5 w-5 text-lotus" />,
      status:
        loading && !currentResult ? 'checking' : currentResult?.docOk ? 'operational' : 'degraded',
      latency: currentResult?.docLatency,
      endpoint: '/reference',
    },
    {
      id: 'rate-limiter',
      name: 'Rate Limiting & Threat Protection',
      category: 'Protection',
      description: 'Postgres bucket-backed rate limiting (100 req/min per IP on /api/*)',
      icon: <Activity className="h-5 w-5 text-lotus" />,
      status: 'operational',
      endpoint: 'active',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Top Banner Status Card */}
      <div className="rounded-2xl border border-line bg-paper-light p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                allOperational
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-amber-500/10 text-amber-600'
              }`}
            >
              {allOperational ? (
                <CheckCircle2 className="h-8 w-8" />
              ) : (
                <AlertCircle className="h-8 w-8" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-lotus">
                  Current State
                </span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h2 className="text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                {allOperational ? t('status.allOperational') : t('status.degraded')}
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Continuous synthetic telemetry across edge compute, storage, and policy evaluation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              type="button"
              onClick={() => runProbe()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-paper px-4 py-2 font-sans text-xs font-semibold text-ink shadow-sm transition hover:bg-paper-light disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Probe Now
            </button>
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs transition ${
                autoRefresh
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                  : 'border-line bg-paper text-ink-soft'
              }`}
            >
              Auto: {autoRefresh ? '30s' : 'Off'}
            </button>
          </div>
        </div>

        {lastCheck && (
          <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-line pt-4 text-xs text-ink-soft">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Last Probed: {lastCheck.toLocaleTimeString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5" />
              Target: Singapore (sin1)
            </span>
            {currentResult && (
              <span className="font-mono text-ink">
                Liveness: {currentResult.liveLatency}ms · Readiness (DB):{' '}
                {currentResult.readyLatency}ms
              </span>
            )}
          </div>
        )}
      </div>

      {/* Keep-Alive & Wake-Up Control Station */}
      <div className="rounded-2xl border border-line bg-paper-light p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
                Heartbeat Sentinel
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-700">
                Configurable
              </span>
            </div>
            <h3 className="mt-1 text-xl font-medium text-ink">
              Keep-Alive Engine & Container Warmth
            </h3>
            <p className="mt-1 text-sm text-ink-soft leading-relaxed">
              Render Free instances spin down after 15 minutes of idle. You can keep the service
              awake, wake it up immediately, or pause automated pings to preserve your 750 free
              hours.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Instant Cold-Start Wake-up */}
            <button
              type="button"
              onClick={wakeUpServer}
              disabled={wakingUp}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 font-sans text-xs font-semibold text-paper shadow-sm transition hover:bg-ink/90 disabled:opacity-50"
            >
              <Zap className={`h-3.5 w-3.5 text-amber-400 ${wakingUp ? 'animate-bounce' : ''}`} />
              {wakingUp ? 'Waking Container...' : 'Wake Up Service'}
            </button>

            {/* In-Browser Background Keep-Alive Pulse */}
            <button
              type="button"
              onClick={() => setBrowserPulse(!browserPulse)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-sans text-xs font-semibold transition ${
                browserPulse
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800'
                  : 'border-line bg-paper text-ink hover:bg-paper-light'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  browserPulse ? 'bg-emerald-500 animate-ping' : 'bg-ink-soft'
                }`}
              />
              Browser Pulse: {browserPulse ? 'Active (5m)' : 'Paused'}
            </button>
          </div>
        </div>

        {wakeProgress && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-mono text-amber-800 animate-pulse">
            {wakeProgress}
          </div>
        )}

        {/* Configuration Reference Grid */}
        <div className="mt-6 grid gap-4 border-t border-line/60 pt-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-line/60 bg-paper p-4">
            <span className="font-sans text-[11px] font-semibold text-ink">
              1. GitHub Actions Heartbeat
            </span>
            <p className="mt-1 text-xs text-ink-soft">
              Runs every 10 min via{' '}
              <code className="font-mono text-[11px] text-ink">keep-alive-sanctuary.yml</code>.
            </p>
            <div className="mt-2 text-[11px] font-mono text-emerald-700 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Controlled via .github/keep-alive-config.json
            </div>
          </div>

          <div className="rounded-xl border border-line/60 bg-paper p-4">
            <span className="font-sans text-[11px] font-semibold text-ink">
              2. How to Stop Background Pings
            </span>
            <p className="mt-1 text-xs text-ink-soft">
              Set <code className="font-mono text-[11px] text-ink">&quot;enabled&quot;: false</code>{' '}
              in{' '}
              <code className="font-mono text-[11px] text-ink">.github/keep-alive-config.json</code>{' '}
              to let Render sleep and save hours.
            </p>
          </div>

          <div className="rounded-xl border border-line/60 bg-paper p-4">
            <span className="font-sans text-[11px] font-semibold text-ink">
              3. Browser Session Pulse
            </span>
            <p className="mt-1 text-xs text-ink-soft">
              Turn on Browser Pulse while developing. It pings{' '}
              <code className="font-mono text-[11px] text-ink">/health/live</code> every 5m and
              stops when tab is closed.
            </p>
            {lastPulse && (
              <span className="mt-2 block font-mono text-[10px] text-ink-soft">
                Last pulse: {lastPulse.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Services List */}
      <div>
        <h3 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
          Subsystems
        </h3>
        <p className="mt-1 text-xl font-medium text-ink">Architecture Verification Matrix</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="relative flex flex-col justify-between rounded-xl border border-line bg-paper-light p-5 transition hover:border-lotus/40"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-paper border border-line">
                    {service.icon}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      service.status === 'operational'
                        ? 'bg-emerald-500/10 text-emerald-700'
                        : service.status === 'checking'
                          ? 'bg-amber-500/10 text-amber-700'
                          : 'bg-rose-500/10 text-rose-700'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        service.status === 'operational'
                          ? 'bg-emerald-500'
                          : service.status === 'checking'
                            ? 'bg-amber-500 animate-pulse'
                            : 'bg-rose-500'
                      }`}
                    />
                    {service.status === 'operational'
                      ? 'Operational'
                      : service.status === 'checking'
                        ? 'Checking'
                        : 'Degraded'}
                  </span>
                </div>

                <h4 className="mt-4 font-medium text-ink">{service.name}</h4>
                <p className="mt-1 text-xs text-ink-soft leading-relaxed">{service.description}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-line/60 pt-3 text-[11px] text-ink-soft">
                <span className="font-mono">{service.endpoint}</span>
                {service.latency !== undefined && (
                  <span className="font-mono font-medium text-ink">{service.latency} ms</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latency History */}
      {probeHistory.length > 0 && (
        <div className="rounded-2xl border border-line bg-paper-light p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
                Telemetry
              </h3>
              <p className="mt-1 text-xl font-medium text-ink">Recent Response Times</p>
            </div>
            <span className="font-mono text-xs text-ink-soft">
              Last {probeHistory.length} probes
            </span>
          </div>

          <div className="mt-6 grid grid-cols-5 gap-2 sm:grid-cols-10">
            {probeHistory.map((item, idx) => {
              const heightPct = Math.min(100, Math.max(15, (item.liveLatency / 300) * 100));
              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className="flex h-24 w-full items-end justify-center rounded-lg bg-paper p-1">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded transition-all ${
                        item.liveOk ? 'bg-emerald-500/80 hover:bg-emerald-500' : 'bg-rose-500'
                      }`}
                      title={`${item.timestamp}: Live ${item.liveLatency}ms, Ready ${item.readyLatency}ms`}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-ink-soft">{item.liveLatency}ms</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dedicated Status Domain Guidance */}
      <div className="rounded-2xl border border-line bg-paper-light p-6 sm:p-8">
        <h3 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
          Domain Mapping
        </h3>
        <p className="mt-1 text-xl font-medium text-ink">status.gurudevi.app Integration</p>
        <p className="mt-2 text-sm text-ink-soft leading-relaxed max-w-2xl">
          To bind{' '}
          <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-xs text-ink">
            status.gurudevi.app
          </code>{' '}
          to this dashboard, set a DNS CNAME record in Cloudflare pointing to your web deployment,
          or route traffic to the status path.
        </p>
      </div>
    </div>
  );
}
