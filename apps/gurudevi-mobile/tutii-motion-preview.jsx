import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

function TutiiDancePreview() {
  const [animationData, setAnimationData] = useState(null);
  const [player, setPlayer] = useState(null);
  const [reduceMotion, setReduceMotion] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    let active = true;
    void fetch('/assets/animations/tutii-happy-dance.json')
      .then((response) => {
        if (!response.ok) throw new Error(`Animation asset returned ${response.status}`);
        return response.text();
      })
      .then((data) => {
        if (active) setAnimationData(data);
      })
      .catch(() => {
        if (active) setAnimationData('');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (event) => setReduceMotion(event.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!player) return;
    if (reduceMotion || !playing) player.pause();
    else player.play();
  }, [player, playing, reduceMotion]);

  const canAnimate = Boolean(animationData);
  const toggleDance = () => {
    if (!player) return;
    if (playing) player.pause();
    else player.play();
    setPlaying(!playing);
  };

  return (
    <main style={styles.page}>
      <section style={styles.intro}>
        <p style={styles.eyebrow}>TUTII</p>
        <h1 style={styles.title}>A little joy, in motion</h1>
        <p style={styles.subtitle}>A happy little dance, just because.</p>
      </section>
      <div style={styles.stage}>
        {canAnimate ? (
          <DotLottieReact
            data={animationData}
            autoplay={!reduceMotion}
            loop={!reduceMotion}
            dotLottieRefCallback={setPlayer}
            layout={{ fit: 'contain', align: [0.5, 0.5] }}
            style={styles.animation}
          />
        ) : (
          <p style={styles.resting}>Tutii is taking a quiet moment.</p>
        )}
      </div>
      <button
        disabled={!player || reduceMotion}
        onClick={toggleDance}
        style={styles.button}
        type="button"
      >
        {reduceMotion ? 'Tutii is resting' : playing ? 'Pause dance' : 'Dance again'}
      </button>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100svh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '36px 20px 28px',
    overflow: 'hidden',
    textAlign: 'center',
  },
  intro: { zIndex: 1 },
  eyebrow: {
    margin: 0,
    color: '#758465',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.2em',
  },
  title: {
    margin: '12px 0 0',
    fontSize: 'clamp(26px, 6vw, 36px)',
    fontWeight: 600,
    letterSpacing: '-0.045em',
  },
  subtitle: { margin: '8px 0 0', color: '#75776c', fontSize: 15 },
  stage: {
    width: 'min(100%, 480px)',
    height: 'min(62svh, 520px)',
    minHeight: 280,
    margin: '0 auto 4px',
  },
  animation: { display: 'block', width: '100%', height: '100%', objectFit: 'contain' },
  button: {
    minHeight: 44,
    padding: '0 8px',
    border: 0,
    background: 'transparent',
    color: '#41513b',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  resting: { color: '#75776c', fontSize: 14 },
};

createRoot(document.getElementById('root')).render(<TutiiDancePreview />);
