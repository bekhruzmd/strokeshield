import React, { forwardRef } from 'react';

const DetectionView = forwardRef(({ isDetecting }, ref) => {
  return (
    <canvas
      ref={ref}
      className={`detection-canvas pointer-events-none transition-opacity duration-300 ${
        isDetecting ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
});

export default DetectionView;
