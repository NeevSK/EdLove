'use client';

import Link from 'next/link';
import React, { useRef, useState } from 'react';
import styles from './video.module.css';

interface Chapter {
  title: string;
  time: string;
  seconds: number;
}

interface VideoPlayerFloorProps {
  videoId: string;
  displayName: string;
  capacity?: string;
}

export function VideoPlayerFloor({
  videoId,
  displayName,
  capacity,
}: Readonly<VideoPlayerFloorProps>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const videoTitle =
    videoId === 'intro-botany'
      ? 'Field Botany: Identifying Endemic Wet-Zone Plants'
      : videoId === 'geometry-proofs'
        ? 'Geometric Proofs in Classical Sri Lankan Architecture'
        : `Pedagogical Lecture & Practical Demonstration (${videoId})`;

  const chapters: Chapter[] = [
    { title: 'Introduction & Regional Context', time: '00:00', seconds: 0 },
    { title: 'Taxonomic Features & Leaf Venation', time: '04:15', seconds: 255 },
    { title: 'Conservation Status & Field Notes', time: '11:30', seconds: 690 },
    { title: 'Student Reflective Exercises', time: '18:45', seconds: 1125 },
  ];

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      void videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeekChapter = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    void videoRef.current.play();
    setIsPlaying(true);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rate = Number(e.target.value);
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.headerBar}>
        <div className={styles.titleArea}>
          <div style={{ marginBottom: '0.25rem' }}>
            <Link
              href="/library"
              style={{
                fontSize: '0.75rem',
                fontWeight: 650,
                color: 'var(--color-action, #a85022)',
                textDecoration: 'none',
              }}
            >
              ← Back to Library
            </Link>
          </div>
          <h1>{videoTitle}</h1>
          <p>National Curricular Video Stream • Captions Available</p>
        </div>
      </header>

      {/* Video Container */}
      <div className={styles.playerCard}>
        <video
          ref={videoRef}
          controls
          className={styles.videoElement}
          poster="/sample-lecture-poster.jpg"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src="/sample-lecture.mp4" type="video/mp4" />
          Your browser does not support HTML5 video streaming.
        </video>

        <div className={styles.controlsBar}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button type="button" className={styles.ctrlBtn} onClick={togglePlay}>
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button
              type="button"
              className={styles.ctrlBtn}
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime -= 10;
              }}
            >
              ↺ -10s
            </button>
            <button
              type="button"
              className={styles.ctrlBtn}
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime += 10;
              }}
            >
              ↻ +10s
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label htmlFor="playback-speed" style={{ fontSize: '0.75rem' }}>
              Speed:
            </label>
            <select
              id="playback-speed"
              value={playbackRate}
              onChange={handleSpeedChange}
              className={styles.speedSelector}
            >
              <option value="0.75">0.75x</option>
              <option value="1">1.0x (Normal)</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2.0x</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chapter Markers */}
      <section className={styles.chaptersCard}>
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            margin: 0,
            color: 'var(--color-ink, #131e27)',
          }}
        >
          Lecture Chapters & Timestamps
        </h2>
        <div className={styles.chaptersList}>
          {chapters.map((ch) => (
            <div
              key={ch.seconds}
              className={styles.chapterItem}
              onClick={() => handleSeekChapter(ch.seconds)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSeekChapter(ch.seconds)}
            >
              <span style={{ fontWeight: 650 }}>{ch.title}</span>
              <span style={{ color: 'var(--color-ink-soft, #453c35)', fontSize: '0.8rem' }}>
                {ch.time}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
