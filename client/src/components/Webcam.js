import React, { forwardRef } from 'react';

const Webcam = forwardRef(({ isDetecting, cameraActive, cameraError }, ref) => {
  return (
    <div className="relative w-full h-full bg-[#171721] flex items-center justify-center overflow-hidden rounded-[12px]">
      <video
        ref={ref}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isDetecting && cameraActive ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {(!isDetecting || !cameraActive) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#171721]">
          <div className="w-12 h-12 rounded-full bg-[#272735] flex items-center justify-center mb-3 text-[#ededf3]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-[#ededf3] mb-1">
            {cameraError ? 'Camera Access Required' : 'Camera Input Standby'}
          </h3>
          <p className="text-xs text-[#c3c3cc] max-w-xs">
            {cameraError || 'Click "Start Vision Analysis" to initialize real-time MediaPipe facial & posture tracking.'}
          </p>
        </div>
      )}

      {isDetecting && cameraActive && (
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-[#171721]/80 text-[#ededf3] text-xs">
          <span className="w-2 h-2 rounded-full bg-[#5266eb]" />
          Vision Live
        </div>
      )}
    </div>
  );
});

export default Webcam;
