'use client';

import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import type { MockVideoChapter as Chapter } from '@repo/core/api/library';
import { orpcClient } from '@repo/core/api/orpcClient';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import styles from './video.module.css';



interface VideoPlayerFloorProps {
  videoId: string;
  displayName: string;
  capacity?: string;
}

interface ReflectionNote {
  id: string;
  timestamp: string;
  seconds: number;
  text: string;
}

export function VideoPlayerFloor({
  videoId,
  displayName,
  capacity,
}: Readonly<VideoPlayerFloorProps>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1470); // default ~24:30
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [theaterMode, setTheaterMode] = useState(false);
  const [notes, setNotes] = useState<ReflectionNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');

  const demoResource = getSandboxSamples<any[]>('library', 'getResources', [], []).find((r) => r.id === videoId);
  const [videoTitle, setVideoTitle] = useState(
    demoResource?.title ?? `Pedagogical Lecture & Practical Demonstration (${videoId})`
  );
  const [videoUrl, setVideoUrl] = useState(demoResource?.url ?? '/sample-lecture.mp4');

  const chapters: Chapter[] = getSandboxSamples<Chapter[]>('library', 'getVideoChapters', [], []);

  // Fetch resource metadata from live oRPC
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await orpcClient.library.getResource({ params: { id: videoId } });
        if (!active || !res) return;
        if (res.title) setVideoTitle(res.title);
        if (res.url) setVideoUrl(res.url);

        void orpcClient.library.engage({
          params: { id: videoId },
          body: { engagement_type: 'use' },
        }).catch(() => {});
      } catch {
        // Fall back gracefully
      }
    })();
    return () => {
      active = false;
    };
  }, [videoId]);

  // Sync video time updates
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    if (videoRef.current.duration) {
      setDuration(videoRef.current.duration);
    }
  };

  const [mediaError, setMediaError] = useState<string | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setMediaError(null);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!Number.isFinite(val)) return;
    const clamped = Math.min(Math.max(val, 0), Math.max(duration, 0));
    setCurrentTime(clamped);
    if (videoRef.current) {
      videoRef.current.currentTime = clamped;
    }
  };

  const handleSeek = (delta: number) => {
    if (!videoRef.current) return;
    const current = Number.isFinite(videoRef.current.currentTime) ? videoRef.current.currentTime : currentTime;
    const target = Math.min(Math.max(current + delta, 0), Math.max(duration, 0));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const handleSeekChapter = (seconds: number) => {
    if (!videoRef.current) return;
    const target = Math.min(Math.max(seconds, 0), Math.max(duration, 0));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
    videoRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setMediaError(null);
      })
      .catch(() => {
        setIsPlaying(false);
      });
  };

  const handleSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (!document.fullscreenElement) {
      void videoRef.current.requestFullscreen().catch(() => {});
    } else {
      void document.exitFullscreen().catch(() => {});
    }
  };

  // Load persisted reflection notes on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`gurudevi_video_notes_${videoId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setNotes(parsed);
      }
    } catch {
      // Ignore localStorage read errors in private browsing
    }
  }, [videoId]);

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const m = Math.floor(currentTime / 60);
    const s = Math.floor(currentTime % 60);
    const timeFormatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    const newNote: ReflectionNote = {
      id: Date.now().toString(),
      timestamp: timeFormatted,
      seconds: currentTime,
      text: newNoteText.trim(),
    };

    setNotes((prev) => {
      const updated = [...prev, newNote];
      try {
        localStorage.setItem(`gurudevi_video_notes_${videoId}`, JSON.stringify(updated));
      } catch {
        // Storage quota / privacy mode fallback
      }
      return updated;
    });

    // Sync engagement with backend
    void orpcClient.library.engage({
      params: { id: videoId },
      body: { engagement_type: 'use' },
    }).catch(() => {});

    setNewNoteText('');
  };

  const deleteNote = (noteId: string) => {
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== noteId);
      try {
        localStorage.setItem(`gurudevi_video_notes_${videoId}`, JSON.stringify(updated));
      } catch {
        // Storage fallback
      }
      return updated;
    });
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Active chapter computation
  const activeChapter = chapters.reduce((acc, ch) => {
    if (currentTime >= ch.seconds) return ch;
    return acc;
  }, chapters[0]);

  return (
    <div
      aria-label="Video Lecture Player"
      className={`${styles.theaterShell} ${theaterMode ? styles.theaterShellWide : ''}`}
      role="region"
    >
      <header className={styles.theaterHeader}>
        <div className={styles.titleArea}>
          <Link className={styles.backLink} href="/library">
            ← Back to Sanctuary Library
          </Link>
          <h1 className={styles.lectureHeading}>{videoTitle}</h1>
          <p className={styles.lectureSub}>
            <span>Official Curricular Video Lecture</span>
            <span>•</span>
            <span>Captions & Synchronized Chapters</span>
          </p>
        </div>

        <button
          aria-label={theaterMode ? 'Exit theater mode' : 'Enter theater mode'}
          className={styles.ctrlBtn}
          onClick={() => setTheaterMode((prev) => !prev)}
          type="button"
        >
          {theaterMode ? '⇲ Normal Stage' : '⇱ Theater Stage'}
        </button>
      </header>

      <div className={styles.theaterStage}>
        {/* Main Video Screen with Custom Controls */}
        <div className={styles.videoCard}>
          {mediaError && (
            <div
              role="alert"
              style={{
                padding: '0.75rem 1rem',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '0.5rem',
                color: '#fca5a5',
                fontSize: '0.85rem',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>⚠️ {mediaError}</span>
              <button
                type="button"
                onClick={() => {
                  setMediaError(null);
                  videoRef.current?.load();
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                Retry Stream
              </button>
            </div>
          )}
          <video
            className={styles.videoElement}
            onError={() =>
              setMediaError('Video lecture stream interrupted or unavailable. Check connection or offline cache.')
            }
            onLoadedMetadata={handleLoadedMetadata}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onTimeUpdate={handleTimeUpdate}
            poster="/sample-lecture-poster.jpg"
            ref={videoRef}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support HTML5 video streaming.
          </video>

          {/* Accessible Custom Playbar */}
          <div aria-label="Playback controls" className={styles.controlsBar} role="toolbar">
            <div className={styles.timelineRow}>
              <span className={styles.timeDisplay}>{formatTime(currentTime)}</span>
              <input
                aria-label="Seek timeline position"
                aria-valuemax={duration}
                aria-valuemin={0}
                aria-valuenow={currentTime}
                className={styles.scrubber}
                max={duration}
                min={0}
                onChange={handleScrub}
                step={0.5}
                type="range"
                value={currentTime}
              />
              <span className={styles.timeDisplay}>{formatTime(duration)}</span>
            </div>

            <div className={styles.buttonsRow}>
              <div className={styles.btnGroup}>
                <button
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                  className={`${styles.ctrlBtn} ${isPlaying ? styles.ctrlBtnActive : ''}`}
                  onClick={togglePlay}
                  type="button"
                >
                  {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <button
                  aria-label="Rewind 10 seconds"
                  className={styles.ctrlBtn}
                  onClick={() => handleSeek(-10)}
                  type="button"
                >
                  ↺ -10s
                </button>
                <button
                  aria-label="Fast forward 10 seconds"
                  className={styles.ctrlBtn}
                  onClick={() => handleSeek(10)}
                  type="button"
                >
                  ↻ +10s
                </button>
                <button
                  aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                  className={styles.ctrlBtn}
                  onClick={toggleMute}
                  type="button"
                >
                  {isMuted ? '🔇 Muted' : '🔊 Audio'}
                </button>
              </div>

              {/* Speed Pills */}
              <div aria-label="Playback speeds" className={styles.btnGroup} role="group">
                {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    aria-label={`Set playback speed to ${rate}x`}
                    className={`${styles.speedPill} ${playbackRate === rate ? styles.speedPillActive : ''}`}
                    onClick={() => handleSpeed(rate)}
                    type="button"
                  >
                    {rate}x
                  </button>
                ))}
                <button
                  aria-label="Toggle Fullscreen"
                  className={styles.ctrlBtn}
                  onClick={toggleFullscreen}
                  title="Fullscreen"
                  type="button"
                >
                  ⛶
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Side Companion (Chapters & Active Reflection Notes) */}
        <aside aria-label="Lecture Companion" className={styles.companionPane}>
          {/* Synchronized Chapters */}
          <section className={styles.cardSection}>
            <h2 className={styles.cardTitle}>
              <span>📑 Lecture Chapters</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-action, #a85022)' }}>
                {activeChapter?.title}
              </span>
            </h2>
            <div className={styles.chaptersList}>
              {chapters.map((ch) => (
                <button
                  key={ch.seconds}
                  className={`${styles.chapterItem} ${activeChapter?.seconds === ch.seconds ? styles.chapterItemActive : ''}`}
                  onClick={() => handleSeekChapter(ch.seconds)}
                  type="button"
                >
                  <span>{ch.title}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>{ch.time}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Interactive Pedagogical Reflection Notes */}
          <section className={styles.cardSection}>
            <h2 className={styles.cardTitle}>
              <span>📝 Contemplative Notes</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                At {formatTime(currentTime)}
              </span>
            </h2>

            <form className={styles.noteInputArea} onSubmit={addNote}>
              <input
                aria-label="Write a timestamped reflection"
                className={styles.noteInput}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder={`Capture insight at ${formatTime(currentTime)}…`}
                type="text"
                value={newNoteText}
              />
              <button className={styles.ctrlBtn} type="submit">
                Pin
              </button>
            </form>

            {notes.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className={styles.chapterItem}
                    onClick={() => handleSeekChapter(n.seconds)}
                    role="button"
                    tabIndex={0}
                  >
                    <span>{n.text}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--color-action, #a85022)', fontWeight: 700 }}>
                        {n.timestamp}
                      </span>
                      <button
                        type="button"
                        aria-label="Delete note"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(n.id);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#aaa',
                          cursor: 'pointer',
                          padding: '0 0.25rem',
                          fontSize: '0.8rem',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
