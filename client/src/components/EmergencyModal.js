import React, { useState } from 'react';

export default function EmergencyModal({ isOpen, onClose, overallRisk, asymmetryMetrics, postureMetrics, speechMetrics, findings }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const timestamp = new Date().toLocaleString();
  const summaryText = `
=== EMERGENCY STROKE DIAGNOSTIC REPORT ===
Timestamp: ${timestamp}
Risk Level: ${(overallRisk || 'HIGH').toUpperCase()} STROKE RISK DETECTED

F.A.S.T. PROTOCOL METRICS:
- Face Droop Asymmetry: ${((asymmetryMetrics?.overallAsymmetry || 0) * 100).toFixed(1)}% (Mouth: ${((asymmetryMetrics?.mouthAsymmetry || 0) * 100).toFixed(1)}%, Eye: ${((asymmetryMetrics?.eyeAsymmetry || 0) * 100).toFixed(1)}%)
- Arm Drift Weakness: ${((postureMetrics?.armDriftRatio || 0) * 100).toFixed(1)}% (Shoulder imbalance: ${((postureMetrics?.shoulderImbalance || 0) * 100).toFixed(1)}%)
- Speech Impairment: Coherence ${speechMetrics?.coherenceScore ?? 'N/A'}%, Slurred: ${speechMetrics?.slurredSpeechScore ?? 'N/A'}%

CLINICAL FINDINGS:
${findings && findings.length > 0 ? findings.map(f => `- ${f}`).join('\n') : '- High asymmetry and potential neurological indicators detected.'}

RECOMMENDED ACTION: Call 911 or local emergency services immediately. Note exact onset time.
=========================================
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#171721]/90 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#1e1e2a] rounded-[12px] p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#272735] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5266eb] text-white flex items-center justify-center font-bold text-sm">
              911
            </div>
            <div>
              <h3 className="text-lg font-medium text-[#ededf3]">Emergency Protocol Activations</h3>
              <p className="text-xs text-[#c3c3cc]">F.A.S.T. Time Protocol — Immediate Action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#c3c3cc] hover:text-[#ededf3] text-sm"
          >
            ✕
          </button>
        </div>

        <div className="bg-[#272735] p-5 rounded-[12px] text-xs text-[#ededf3] leading-relaxed space-y-2">
          <strong className="font-medium text-[#ededf3] block">Immediate Emergency Dispatch Advised</strong>
          <p className="text-[#c3c3cc]">
            Every minute during a stroke reduces brain cell loss. Inform 911 dispatcher: <em className="text-[#ededf3]">"I suspect acute stroke symptoms. Note onset time."</em>
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#c3c3cc]">
            <span>First Responder Summary Snapshot</span>
            <button
              onClick={handleCopy}
              className="text-[#5266eb] hover:underline"
            >
              {copied ? 'Copied to Clipboard' : 'Copy Summary Text'}
            </button>
          </div>
          <textarea
            readOnly
            value={summaryText}
            rows={7}
            className="w-full bg-[#171721] border border-[#272735] rounded-[12px] p-4 text-xs text-[#ededf3] font-mono focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <a
            href="tel:911"
            className="mercury-btn-cobalt flex-1 text-center"
          >
            Call 911 Immediately
          </a>
          <button
            onClick={onClose}
            className="mercury-btn-obsidian"
          >
            Dismiss Alert
          </button>
        </div>
      </div>
    </div>
  );
}
