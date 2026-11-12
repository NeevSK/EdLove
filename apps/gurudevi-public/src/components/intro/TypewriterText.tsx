import { useEffect, useRef, useState } from 'react';

interface TypewriterProps {
  text: string;
  speedMs?: number; // Calm Breath Cadence: ~650ms per word = ~90 WPM (peaceful, spoken meditation cadence)
  onComplete?: () => void;
}

export function TypewriterText({ text, speedMs = 650, onComplete }: Readonly<TypewriterProps>) {
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const words = text.split(' ');
    setDisplayedWords([]);
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex++;
      setDisplayedWords(words.slice(0, currentIndex));

      if (currentIndex >= words.length) {
        clearInterval(interval);
        // Fire immediately when words finish typing;
        // The deep resting breath pause is handled explicitly by the parent caller before CTA.
        onCompleteRef.current?.();
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [text, speedMs]);

  return (
    <span className="inline-block transition-opacity duration-700">
      {displayedWords.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block mr-2 animate-in fade-in duration-700 ease-out"
        >
          {word}
        </span>
      ))}
      {displayedWords.length < text.split(' ').length && (
        <span className="inline-block w-1.5 h-4 ml-0.5 bg-amber-400/80 rounded-xs animate-pulse duration-1000 align-middle" />
      )}
    </span>
  );
}
