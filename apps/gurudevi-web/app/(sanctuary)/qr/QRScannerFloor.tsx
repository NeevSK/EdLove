'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

export function QRScannerFloor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorMsg('Camera access is not supported by your browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        void videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      setErrorMsg(
        'Unable to access camera. Please allow camera permissions or enter code manually.',
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      for (const track of stream.getTracks()) {
        track.stop();
      }
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      setHasCamera(true);
    }
    return () => {
      stopCamera();
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    setScannedResult(manualCode.trim());
  };

  return (
    <div
      style={{
        maxWidth: '38rem',
        margin: '2rem auto',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        background: 'var(--color-paper-light, #fffdf8)',
        border: '1px solid var(--color-line, rgba(104, 94, 85, 0.16))',
        boxShadow: '0 4px 12px var(--shadow-sanctuary-soft, rgba(69, 60, 53, 0.05))',
        fontFamily: 'var(--font-ui-grotesque, "Outfit", sans-serif)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      <header>
        <h2
          style={{
            fontFamily: 'var(--font-display, "Fraunces", serif)',
            fontSize: '1.4rem',
            margin: 0,
            color: 'var(--color-ink, #131e27)',
          }}
        >
          Sanctuary QR & Badge Scanner
        </h2>
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--color-ink-soft, #453c35)',
            margin: '0.25rem 0 0',
          }}
        >
          Scan classroom enrollment codes, attendance badges, or resource tokens directly in your
          browser.
        </p>
      </header>

      {/* Camera Viewfinder */}
      <div
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
          background: '#131e27',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <video
          ref={videoRef}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          playsInline
          muted
        />

        {!cameraActive && (
          <div
            style={{ position: 'absolute', textAlign: 'center', color: '#ffffff', padding: '1rem' }}
          >
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📷</span>
            <p style={{ fontSize: '0.85rem', margin: '0 0 1rem' }}>
              Camera is currently dormant to preserve battery and privacy.
            </p>
            {hasCamera && (
              <button
                type="button"
                onClick={startCamera}
                style={{
                  minHeight: 44,
                  padding: '0.5rem 1.25rem',
                  borderRadius: '999px',
                  background: 'var(--color-action, #a85022)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                }}
              >
                Activate Camera Viewfinder
              </button>
            )}
          </div>
        )}

        {cameraActive && (
          <button
            type="button"
            onClick={stopCamera}
            style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              minHeight: 36,
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              background: 'rgba(0, 0, 0, 0.65)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Stop Camera
          </button>
        )}
      </div>

      {errorMsg && (
        <div role="alert" style={{ color: '#b91c1c', fontSize: '0.8rem', fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      {/* Manual Code Input Fallback */}
      <form
        onSubmit={handleManualSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
      >
        <label
          htmlFor="manual-code"
          style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-ink, #131e27)' }}
        >
          Or enter enrollment code manually:
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            id="manual-code"
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="e.g. SANCT-COL-2026-X89"
            style={{
              flex: 1,
              minHeight: 44,
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--color-line, rgba(104, 94, 85, 0.25))',
              fontSize: '0.85rem',
            }}
          />
          <button
            type="submit"
            style={{
              minHeight: 44,
              padding: '0.5rem 1.25rem',
              borderRadius: '0.375rem',
              background: 'var(--color-action, #a85022)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Verify
          </button>
        </div>
      </form>

      {scannedResult && (
        <div
          aria-live="polite"
          style={{
            padding: '1rem',
            borderRadius: '0.5rem',
            background: '#e6f4ea',
            border: '1px solid #137333',
            color: '#137333',
            fontSize: '0.85rem',
          }}
        >
          <strong>✓ Validated Token:</strong> {scannedResult}
          <div style={{ marginTop: '0.5rem' }}>
            <Link
              href={`/c/${encodeURIComponent(scannedResult)}`}
              style={{
                display: 'inline-block',
                fontWeight: 700,
                color: '#137333',
                textDecoration: 'underline',
              }}
            >
              Open Connected Learning Circle →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
