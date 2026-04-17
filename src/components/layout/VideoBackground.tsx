// src/components/layout/VideoBackground.jsx
import React from 'react';

/**
 * A memoized component that renders a looping, muted video as a fixed background.
 * It includes an overlay for a dimming effect.
 */
const VideoBackground = () => (
  <div className="video-background">
    <video
      autoPlay
      loop
      muted
      playsInline // Crucial for autoplay on mobile devices
      src="/emblembg.mp4" // Assumes emblembg.mp4 is in your /public folder
    />
    <div className="video-overlay" />
  </div>
);

// Use React.memo to prevent this component from re-rendering if its props don't change.
export default React.memo(VideoBackground);