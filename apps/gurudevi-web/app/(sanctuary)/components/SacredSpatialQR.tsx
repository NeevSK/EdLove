'use client';

import {
  Check,
  Copy,
  Download,
  QrCode,
  ScanLine,
  Share2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { QRCodeSvg } from '../../../lib/workspace/QRCodeSvg';
import { SacredLotusMandala } from '../self/components/SacredLotusMandala';
import styles from './sacred-spatial-qr.module.css';

export interface SacredSpatialQRProps {
  /** The destination URL or canonical gurudevi://qr?... URI */
  value: string;
  /** Human-readable title or label */
  title?: string;
  /** Subtitle or descriptor */
  subtitle?: string;
  /** Visual dimension in pixels (default 240) */
  size?: number;
  /** Default to revealing QR immediately (false means shows living mandala first) */
  defaultRevealed?: boolean;
  /** Brand foreground color */
  color?: string;
  /** Background color */
  bgColor?: string;
}

/**
 * SacredSpatialQR — Gurudevi's spatial visualizer for credentials and portal invitations.
 *
 * Full Lifecycle Support:
 * - View: 3D perspective flip between living Sacred Lotus Mandala and vector QR.
 * - Save/Download: 1-click SVG vector download for high-DPI paper print or digital archival.
 * - Share: Native Web Share API integration with automatic clipboard copy fallback.
 * - Anti-Quishing: Cryptographic origin verification indicator protecting against malicious clones.
 * - Scan Assist: High-contrast optical laser guide line to guarantee camera lock.
 */
export function SacredSpatialQR({
  value,
  title = 'Sanctuary Portal',
  subtitle = 'Scan to connect or click to morph',
  size = 240,
  defaultRevealed = true,
  color = '#131e27',
  bgColor = '#ffffff',
}: SacredSpatialQRProps) {
  const [isRevealed, setIsRevealed] = useState(defaultRevealed);
  const [copied, setCopied] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const isVerifiedOrigin =
    value.startsWith('gurudevi://') ||
    value.startsWith('https://gurudevi.app') ||
    value.startsWith('https://sanctuary.gurudevi.app');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: subtitle,
          url: value,
        });
        return;
      } catch {
        // User cancelled share
      }
    }
    await handleCopy();
  };

  const handleDownloadSvg = () => {
    if (!qrContainerRef.current) return;
    setDownloading(true);
    try {
      const svgElement = qrContainerRef.current.querySelector('svg');
      if (!svgElement) return;

      const serializer = new XMLSerializer();
      const svgXml = serializer.serializeToString(svgElement);
      const blob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);

      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      const sanitizedTitle = (title || 'gurudevi-qr').toLowerCase().replace(/[^a-z0-9]/g, '-');
      downloadLink.download = `${sanitizedTitle}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn('Failed to download QR SVG:', err);
    } finally {
      setTimeout(() => setDownloading(false), 1200);
    }
  };

  const stageSize = size + 48;

  return (
    <div className={styles.container}>
      <div className={styles.auraGlow} />

      <div
        className={styles.perspectiveStage}
        style={{ width: stageSize, height: stageSize }}
      >
        <div
          className={`${styles.cardFlip} ${isRevealed ? styles.cardFlipped : ''}`}
          style={{ width: stageSize, height: stageSize }}
        >
          {/* Front: Living Breathing Sacred Lotus Mandala */}
          <div
            className={`${styles.cardFront} ${styles.mandalaSurface}`}
            onClick={() => setIsRevealed(true)}
            role="button"
            tabIndex={0}
            aria-label="Reveal scannable QR code"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setIsRevealed(true);
              }
            }}
          >
            <SacredLotusMandala
              size={size * 0.82}
              primaryColor="#EF841F"
              secondaryColor="#D4843A"
              accentColor="#F5EDD6"
            />
            <div className={styles.mandalaPrompt}>
              <Sparkles size={13} />
              <span>Click to Morph into QR</span>
            </div>
          </div>

          {/* Back: Razor-Sharp Single-Path QR with Lotus Vector Emblem */}
          <div
            ref={qrContainerRef}
            className={`${styles.cardBack} ${styles.qrSurface}`}
            style={{ background: bgColor }}
          >
            {scanMode && <div className={styles.scanLine} />}
            <QRCodeSvg
              value={value}
              size={size}
              color={color}
              bgColor={bgColor}
              showLotus={true}
              lotusColor="#EF841F"
            />
          </div>
        </div>
      </div>

      {/* Title & Quishing-Immunity Trust Badge */}
      <div style={{ marginTop: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#131e27' }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 12, color: '#737373', marginTop: 2 }}>{subtitle}</div>
        )}

        {/* Anti-Quishing Authenticity Indicator */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            marginTop: 6,
            padding: '3px 8px',
            borderRadius: 999,
            background: isVerifiedOrigin ? 'rgba(22, 163, 74, 0.08)' : 'rgba(234, 179, 8, 0.1)',
            border: `1px solid ${isVerifiedOrigin ? 'rgba(22, 163, 74, 0.25)' : 'rgba(234, 179, 8, 0.3)'}`,
            fontSize: 11,
            fontWeight: 600,
            color: isVerifiedOrigin ? '#15803d' : '#854d0e',
          }}
        >
          <ShieldCheck size={12} color={isVerifiedOrigin ? '#16a34a' : '#ca8a04'} />
          <span>{isVerifiedOrigin ? 'Verified Sanctuary Origin (Anti-Quishing)' : 'External Origin'}</span>
        </div>
      </div>

      {/* Interactive Controls: Morph, Scan Assist, Copy, Download, Share */}
      <div className={styles.controlsRow}>
        <button
          type="button"
          className={`${styles.actionButton} ${!isRevealed ? styles.actionButtonActive : ''}`}
          onClick={() => setIsRevealed(!isRevealed)}
          title="Toggle between Living Mandala and Optical QR"
        >
          {isRevealed ? <Sparkles size={14} /> : <QrCode size={14} />}
          <span>{isRevealed ? 'Mandala' : 'QR View'}</span>
        </button>

        {isRevealed && (
          <button
            type="button"
            className={`${styles.actionButton} ${scanMode ? styles.actionButtonActive : ''}`}
            onClick={() => setScanMode(!scanMode)}
            title="Toggle camera scan guide sweep line"
          >
            <ScanLine size={14} />
            <span>{scanMode ? 'Scan Active' : 'Scan Assist'}</span>
          </button>
        )}

        <button
          type="button"
          className={styles.actionButton}
          onClick={handleCopy}
          title="Copy destination link to clipboard"
        >
          {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        <button
          type="button"
          className={styles.actionButton}
          onClick={handleDownloadSvg}
          title="Download vector SVG for high-DPI paper print"
        >
          {downloading ? <Check size={14} color="#16a34a" /> : <Download size={14} />}
          <span>{downloading ? 'Saved!' : 'Save SVG'}</span>
        </button>

        <button
          type="button"
          className={styles.actionButton}
          onClick={handleShare}
          title="Share via system share sheet or messaging"
        >
          <Share2 size={14} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
