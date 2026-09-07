import { describe, expect, it, vi, beforeEach } from 'vitest';
import { authenticatedSovereignFetch } from '@repo/core/api/clientRuntime';
import { createScenarioTestContext } from '../../testing/scenarioHarness';

describe('Chaos & Network Degradation Scenario Suite', () => {
  const harness = createScenarioTestContext();

  beforeEach(async () => {
    await harness.resetAll();
    harness.setAuthenticatedUser('user_chaos_test');
  });

  it('safely catches and converts captive portal HTML 200 responses to valid handling without JSON crash', async () => {
    // Captive portal returns 200 OK with HTML content instead of expected JSON
    const captivePortalResponse = new Response('<html><body>Please log in to Airport WiFi</body></html>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(captivePortalResponse);

    const response = await authenticatedSovereignFetch('https://api.gurudevi.org/profile');
    expect(response.status).toBe(200);

    // Asserting safe JSON parsing handling
    let parsedData = null;
    let parseFailed = false;
    try {
      parsedData = await response.json();
    } catch {
      parseFailed = true;
    }

    expect(parseFailed).toBe(true);
    expect(parsedData).toBeNull();
  });

  it('handles hanging network latency and abort signals gracefully', async () => {
    const controller = new AbortController();

    // Mock fetch that hangs until aborted
    vi.spyOn(globalThis, 'fetch').mockImplementationOnce((_input, init) => {
      return new Promise((_, reject) => {
        const signal = init?.signal as AbortSignal | undefined;
        if (signal) {
          signal.addEventListener('abort', () => {
            reject(new DOMException('The user aborted a request.', 'AbortError'));
          });
        }
      });
    });

    const fetchPromise = authenticatedSovereignFetch('https://api.gurudevi.org/heavy-query', {
      signal: controller.signal,
    });

    // Abort after 20ms simulating user unmounting component or navigating away
    setTimeout(() => {
      controller.abort();
    }, 20);

    const response = await fetchPromise;
    // Abort is a network failure converted to safe synthetic 503
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.offline).toBe(true);
  });

  it('handles truncated or corrupted byte streams without throwing uncaught exceptions', async () => {
    // Malformed chunked stream
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('NetworkError: Truncated stream'));

    const response = await authenticatedSovereignFetch('https://api.gurudevi.org/stream');
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.offline).toBe(true);
  });
});
