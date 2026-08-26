import React, { useState, useEffect } from 'react';

export default function ArmDriftTest({ postureMetrics, onArmTestComplete }) {
  const [testState, setTestState] = useState('idle'); // idle | countdown | running | completed
  const [timeLeft, setTimeLeft] = useState(10);
  const [driftHistory, setDriftHistory] = useState([]);
  const [testResult, setTestResult] = useState(null);

  const armDriftRatio = postureMetrics?.armDriftRatio || 0;
  const leftElevation = postureMetrics?.leftArmElevation || 0;
  const rightElevation = postureMetrics?.rightArmElevation || 0;

  const startTest = () => {
    setTestState('countdown');
    setTimeLeft(3);
    setDriftHistory([]);
    setTestResult(null);
  };

  useEffect(() => {
    let timer = null;

    if (testState === 'countdown') {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      } else {
        setTestState('running');
        setTimeLeft(10);
      }
    } else if (testState === 'running') {
      if (timeLeft > 0) {
        setDriftHistory(prev => [...prev, armDriftRatio]);
        timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      } else {
        setTestState('completed');
        const historyToUse = driftHistory.length > 0 ? driftHistory : [armDriftRatio];
        const avgDrift = historyToUse.reduce((a, b) => a + b, 0) / historyToUse.length;
        const maxDrift = Math.max(...historyToUse, armDriftRatio);
        const isWeaknessDetected = maxDrift > 0.22;

        const result = {
          avgDrift: Number(avgDrift.toFixed(3)),
          maxDrift: Number(maxDrift.toFixed(3)),
          isWeaknessDetected,
          risk: isWeaknessDetected ? 'high' : maxDrift > 0.12 ? 'medium' : 'low',
          summary: isWeaknessDetected
            ? "Unilateral Arm Drift Detected — One arm drifted significantly downwards during the 10s hold."
            : "No significant arm drift detected. Both arms maintained balanced elevation."
        };

        setTestResult(result);
        if (onArmTestComplete) onArmTestComplete(result);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [testState, timeLeft, armDriftRatio, driftHistory, onArmTestComplete]);

  return (
    <div className="mercury-card space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-[#ededf3]">Arm Drift & Weakness Assessment</h2>
          <p className="text-xs text-[#c3c3cc]">F.A.S.T. Arm Protocol — 10-second posture elevation hold</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#272735] text-[#ededf3] text-xs">
          Arm Protocol
        </span>
      </div>

      {/* Instructions Card */}
      <div className="bg-[#272735] rounded-[12px] p-5 text-xs text-[#c3c3cc] space-y-2">
        <h4 className="font-medium text-[#ededf3] text-sm mb-1">Standard Arm Drift Protocol:</h4>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Sit upright facing the camera.</li>
          <li>Raise both arms straight out in front of you at shoulder height (palms down).</li>
          <li>Close your eyes and hold both arms steady for 10 seconds.</li>
        </ol>
      </div>

      {/* Real-time Arm Elevation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-[#272735] p-5 rounded-[12px]">
          <div className="text-xs uppercase text-[#c3c3cc] mb-1">Left Arm Angle</div>
          <div className="text-2xl font-medium text-[#ededf3]">{Math.round(leftElevation * 90)}°</div>
        </div>
        <div className="bg-[#272735] p-5 rounded-[12px]">
          <div className="text-xs uppercase text-[#c3c3cc] mb-1">Right Arm Angle</div>
          <div className="text-2xl font-medium text-[#ededf3]">{Math.round(rightElevation * 90)}°</div>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-[#272735] p-5 rounded-[12px]">
          <div className="text-xs uppercase text-[#c3c3cc] mb-1">Arm Drift Ratio</div>
          <div className="text-2xl font-medium text-[#5266eb]">{(armDriftRatio * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {testState === 'idle' && (
          <button onClick={startTest} className="mercury-btn-cobalt">
            Start 10s Arm Drift Test
          </button>
        )}

        {testState === 'countdown' && (
          <div className="px-6 py-3 rounded-full bg-[#272735] text-[#ededf3] font-medium text-sm">
            Get ready in {timeLeft}s...
          </div>
        )}

        {testState === 'running' && (
          <div className="px-6 py-3 rounded-full bg-[#5266eb] text-white font-medium text-sm">
            Hold arms steady — {timeLeft}s remaining
          </div>
        )}

        {testState === 'completed' && (
          <button onClick={startTest} className="mercury-btn-obsidian">
            Re-run 10s Test
          </button>
        )}
      </div>

      {/* Test Result */}
      {testResult && (
        <div className="bg-[#272735] p-5 rounded-[12px] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-[#ededf3]">Arm Drift Diagnostic Summary</h4>
            <span className="px-3 py-1 rounded-full text-xs bg-[#171721] text-[#ededf3] uppercase font-medium">
              Risk: {testResult.risk}
            </span>
          </div>
          <p className="text-xs text-[#c3c3cc]">{testResult.summary}</p>
          <div className="flex gap-4 text-xs text-[#c3c3cc]">
            <div>Average Drift: {(testResult.avgDrift * 100).toFixed(1)}%</div>
            <div>Peak Drift: {(testResult.maxDrift * 100).toFixed(1)}%</div>
          </div>
        </div>
      )}
    </div>
  );
}
