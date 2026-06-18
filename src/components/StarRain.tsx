import { useState, useCallback, useEffect } from 'react';

interface Star {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export function StarRain() {
  const [stars, setStars] = useState<Star[]>([]);

  const triggerStarRain = useCallback(() => {
    const newStars: Star[] = Array.from({ length: 60 }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 1.5 + Math.random() * 2,
      size: 1 + Math.random() * 2,
    }));
    setStars(newStars);
    setTimeout(() => setStars([]), 4000);
  }, []);

  return (
    <>
      <div className="star-rain">
        {stars.map((s) => (
          <div
            key={s.id}
            className="star-particle"
            style={{
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </div>
      {/* Expose trigger via custom event */}
      <StarRainTrigger onTrigger={triggerStarRain} />
    </>
  );
}

function StarRainTrigger({ onTrigger }: { onTrigger: () => void }) {
  useEffect(() => {
    const handler = () => onTrigger();
    window.addEventListener('orbit-star-rain', handler);
    return () => window.removeEventListener('orbit-star-rain', handler);
  }, [onTrigger]);
  return null;
}

export function fireStarRain() {
  window.dispatchEvent(new Event('orbit-star-rain'));
}
