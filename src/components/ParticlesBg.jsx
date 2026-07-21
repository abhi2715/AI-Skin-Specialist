import { useMemo } from 'react';

export default function ParticlesBg() {
  const particles = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 1.5 + Math.random() * 2,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 15,
      opacity: 0.15 + Math.random() * 0.35,
    }));
  }, []);

  return (
    <div className="mesh-bg" aria-hidden="true">
      <div className="mesh-bg-extra" />
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}
