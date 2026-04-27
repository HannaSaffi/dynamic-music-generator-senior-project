import React, { useEffect, useState } from 'react';

export function AudioVisualizer({ isActive, waveColors }) {
  const [bars, setBars] = useState(Array(24).fill(20));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(24).fill(20));
      return;
    }

    const interval = setInterval(() => {
      setBars(Array(24).fill(0).map(() => Math.random() * 100));
    }, 150);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div style={{
      height: '64px',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: '2px',
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '12px',
      padding: '10px 16px'
    }}>
      {bars.map((height, index) => (
        <div
          key={index}
          style={{
            width: '100%',
            height: `${height}%`,
            background: `linear-gradient(to top, ${waveColors?.[0] || '#a855f7'}, ${waveColors?.[1] || '#ec4899'})`,
            borderRadius: '9999px',
            minHeight: '2px',
            transition: 'height 0.1s ease'
          }}
        />
      ))}
    </div>
  );
}
