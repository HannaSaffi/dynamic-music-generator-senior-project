import React, { useEffect, useState } from 'react';

export function AudioVisualizer({ isActive }) {
  const [bars, setBars] = useState(Array(40).fill(20));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(40).fill(20));
      return;
    }

    const interval = setInterval(() => {
      setBars(Array(40).fill(0).map(() => Math.random() * 100));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div style={{
      height: '128px',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: '2px',
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '16px',
      padding: '16px'
    }}>
      {bars.map((height, index) => (
        <div
          key={index}
          style={{
            width: '100%',
            height: `${height}%`,
            background: 'linear-gradient(to top, #a855f7, #ec4899)',
            borderRadius: '9999px',
            minHeight: '4px',
            transition: 'height 0.1s ease'
          }}
        />
      ))}
    </div>
  );
}
