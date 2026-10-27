'use client';

import { classifyRouteIntent } from '@repo/core/logic/deeplink/deepLinkPolicyPipeline';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

export function QRScannerFloor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [securityStatus, setSecurityStatus] = useState<{
    safe: boolean;
    label: string;
    actionHref?: string;
  } | null>(null);

  const evaluateScannedCode = (code: string) => {
    setScannedResult(code);
    setErrorMsg(null);

    // Run code through the DeepLink Security & Quishing Pipeline
    try {
      const intent = classifyRouteIntent(code);
      if (intent.kind === 'qr') {
        const payload = intent.payload;
        let actionHref = `/c/${encodeURIComponent(code)}`;
        if (payload.action === 'join_class') {
          actionHref = `/workspace/classroom/${encodeURIComponent(payload.classroom_id)}`;
        } else if (payload.action === 'join_school') {
          actionHref = `/school/${encodeURIComponent(payload.school_id)}`;
        } else if (payload.action === 'claim_invite') {
          actionHref = `/invite?code=${encodeURIComponent(payload.invite_code)}`;
        }

        setSecurityStatus({
          safe: true,
          label: `Verified Sovereign Action: ${payload.action}`,
          actionHref,
        });
      } else if (intent.kind === 'classroomInvite') {
        setSecurityStatus({
          safe: true,
          label: 'Verified Classroom Invite Token',
          actionHref: `/c/${encodeURIComponent(intent.inviteCode)}`,
        });
      } else {
        setSecurityStatus({
          safe: false,
          label: 'Caution: Unverified or external origin. Link is not a verified sanctuary credential.',
          actionHref: `/c/${encodeURIComponent(code)}`,
        });
      }
    } catch {
      setSecurityStatus({
        safe: false,
        label: 'Warning: Code rejected by Quishing Firewall (malformed syntax or untrusted origin).',
      });
    }
  };

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
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch {
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

  // Continuous frame scanning loop when camera is active
  useEffect(() => {
    if (!cameraActive) return;

    let animFrame: number;
    let detector: any = null;

    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      } catch {
        detector = null;
      }
    }

    const checkFrame = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        animFrame = requestAnimationFrame(checkFrame);
        return;
      }

      if (detector) {
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0 && barcodes[0].rawValue) {
            evaluateScannedCode(barcodes[0].rawValue);
            stopCamera();
            return;
          }
        } catch {
          // Detection frame drop ignored
        }
      }

      animFrame = requestAnimationFrame(checkFrame);
    };

    animFrame = requestAnimationFrame(checkFrame);

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [cameraActive]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      setHasCamera(true);
    }
    return () => {
      stopCamera();
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    try {
      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        const bitmap = await createImageBitmap(file);
        const barcodes = await detector.detect(bitmap);
        if (barcodes.length > 0 && barcodes[0].rawValue) {
          evaluateScannedCode(barcodes[0].rawValue);
          return;
        }
      }
      setErrorMsg('No QR code detected in the uploaded image. Try a clearer screenshot.');
    } catch {
      setErrorMsg('Failed to process image file. Please enter code manually.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    evaluateScannedCode(manualCode.trim());
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
          browser with Anti-Quishing origin protection.
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

      {/* Alternative Input Options: Screenshot upload or manual typing */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--color-line, rgba(104, 94, 85, 0.3))',
              background: '#ffffff',
              color: 'var(--color-ink, #131e27)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            📁 Scan Screenshot from Device
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </div>

        {/* Manual Code Input Fallback */}
        <form
          onSubmit={handleManualSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
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
              placeholder="e.g. SANCT-COL-2026-X89 or gurudevi://qr?..."
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
      </div>

      {scannedResult && (
        <div
          aria-live="polite"
          style={{
            padding: '1.25rem',
            borderRadius: '0.5rem',
            background: securityStatus?.safe ? '#e6f4ea' : '#fef3c7',
            border: `1px solid ${securityStatus?.safe ? '#137333' : '#d97706'}`,
            color: securityStatus?.safe ? '#137333' : '#92400e',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{securityStatus?.safe ? '🛡️ Verified Sanctuary Link' : '⚠️ Security Advisory'}</span>
          </div>

          <div style={{ marginTop: '0.35rem', fontSize: '0.8rem' }}>
            {securityStatus?.label}
          </div>

          <div style={{ marginTop: '0.5rem', wordBreak: 'break-all', fontSize: '0.75rem', opacity: 0.85 }}>
            <strong>Raw Decoded:</strong> {scannedResult}
          </div>

          {securityStatus?.actionHref && (
            <div style={{ marginTop: '0.75rem' }}>
              <Link
                href={securityStatus.actionHref}
                style={{
                  display: 'inline-block',
                  fontWeight: 750,
                  color: securityStatus?.safe ? '#137333' : '#92400e',
                  textDecoration: 'underline',
                  padding: '4px 8px',
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                Proceed to Destination →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
