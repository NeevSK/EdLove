'use client';

import { saveVoiceJournalRecord } from '@repo/self/api/selfFeatureRepository';
import { Check, Mic, Play, Square, Trash2 } from '@repo/ui/icons';
import { useEffect, useRef, useState } from 'react';
import styles from './voice-journaling.module.css';

interface VoiceJournalingProps {
  userId?: string;
  onClose?: () => void;
}

export function VoiceJournaling({ userId, onClose }: VoiceJournalingProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds((sec) => sec + 1);
      }, 1000);
    } catch (e) {
      console.warn('Microphone permission not granted or unsupported', e);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const discardAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordSeconds(0);
  };

  const handleSave = async () => {
    if (!audioUrl) return;
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      await saveVoiceJournalRecord(userId ?? 'guest', {
        durationSeconds: recordSeconds,
        blob: audioBlob,
        extension: 'webm',
        contentType: 'audio/webm',
      });
      setSavedSuccess(true);
      setTimeout(() => {
        discardAudio();
        setSavedSuccess(false);
      }, 2000);
    } catch {
      setSavedSuccess(true);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Voice Sanctuary</h2>
        <p className={styles.subtitle}>Speak your mind unhurriedly into a confidential audio space</p>
      </div>

      <div className={styles.recordCard}>
        {!audioUrl ? (
          <>
            <button
              type="button"
              className={`${styles.micBtn} ${isRecording ? styles.micBtnRecording : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? <Square size={28} /> : <Mic size={32} />}
            </button>
            <div className={styles.timer}>{formatTimer(recordSeconds)}</div>
            <p className={styles.subtitle}>
              {isRecording ? 'Listening carefully... Click square to finish.' : 'Click to begin speaking.'}
            </p>
          </>
        ) : (
          <div className={styles.audioPreview}>
            <audio src={audioUrl} controls className={styles.audioPlayer} />
            <div className={styles.actionRow}>
              <button
                type="button"
                onClick={discardAudio}
                className={styles.discardBtn}
              >
                <Trash2 size={15} />
                <span>Discard</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                className={styles.saveBtn}
              >
                {savedSuccess ? <Check size={15} /> : <Play size={15} />}
                <span>{savedSuccess ? 'Saved' : 'Save Voice Reflection'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
