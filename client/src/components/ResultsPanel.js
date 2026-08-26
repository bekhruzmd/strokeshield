import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const ResultsPanel = ({ asymmetryMetrics, postureMetrics, speechMetrics, riskLevel, assessmentFindings, onSaveAssessment }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const formatMetric = (value) => {
    if (value === undefined || value === null) return '0.0%';
    return `${(value * 100).toFixed(1)}%`;
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case 'high':
        return (
          <div className="p-5 rounded-[12px] bg-[#272735] border border-[#5266eb]/50 text-[#ededf3]">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5266eb]" />
              <div>
                <div className="font-medium text-base text-[#ededf3]">High Stroke Risk Detected</div>
                <div className="text-xs text-[#c3c3cc] mt-0.5">Multiple FAST neurological indicators flagged. Immediate emergency evaluation advised.</div>
              </div>
            </div>
          </div>
        );
      case 'medium':
        return (
          <div className="p-5 rounded-[12px] bg-[#272735] text-[#ededf3]">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c3c3cc]" />
              <div>
                <div className="font-medium text-base text-[#ededf3]">Moderate Deviation Detected</div>
                <div className="text-xs text-[#c3c3cc] mt-0.5">Slight facial asymmetry or posture imbalance observed.</div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-5 rounded-[12px] bg-[#272735] text-[#ededf3]">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ededf3]" />
              <div>
                <div className="font-medium text-base text-[#ededf3]">Low / Normal Risk</div>
                <div className="text-xs text-[#c3c3cc] mt-0.5">Landmarks indicate balanced symmetry across facial & posture metrics.</div>
              </div>
            </div>
          </div>
        );
    }
  };

  // Render Mercury Chart.js
  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const asymmetryValues = [
      (asymmetryMetrics.eyeAsymmetry || 0) * 100,
      (asymmetryMetrics.mouthAsymmetry || 0) * 100,
      (asymmetryMetrics.eyebrowAsymmetry || 0) * 100,
      (asymmetryMetrics.overallAsymmetry || 0) * 100
    ];

    const postureValues = [
      (postureMetrics.shoulderImbalance || 0) * 100,
      (postureMetrics.headTilt || 0) * 100,
      (postureMetrics.bodyLean || 0) * 100,
      (postureMetrics.armDriftRatio || 0) * 100
    ];

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
          'Eye Asym.',
          'Mouth Droop',
          'Eyebrow',
          'Overall Face',
          'Shoulder',
          'Head Tilt',
          'Body Lean',
          'Arm Drift'
        ],
        datasets: [{
          label: 'Deviation (%)',
          data: [...asymmetryValues, ...postureValues],
          backgroundColor: [
            '#ededf3',
            '#5266eb',
            '#c3c3cc',
            '#5266eb',
            '#ededf3',
            '#c3c3cc',
            '#70707d',
            '#5266eb'
          ],
          borderWidth: 0,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { color: '#c3c3cc', font: { family: 'Inter', size: 10 } },
            grid: { color: 'rgba(112, 112, 125, 0.2)' }
          },
          x: {
            ticks: { color: '#c3c3cc', font: { family: 'Inter', size: 10 } },
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Deviation: ${context.raw.toFixed(1)}%`
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [asymmetryMetrics, postureMetrics]);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      if (onSaveAssessment) {
        await onSaveAssessment();
      } else {
        await fetch('/api/assessments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            asymmetryMetrics,
            postureMetrics,
            riskLevel,
            timestamp: new Date().toISOString()
          })
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch(e) {
      console.error("Save failed:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mercury-card space-y-6">
      {/* Risk Level Header */}
      {getRiskBadge(riskLevel)}

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-xs font-medium text-[#c3c3cc] uppercase tracking-wider">
          Diagnostic Metrics
        </h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="mercury-btn-obsidian !text-xs"
        >
          {saveSuccess ? 'Saved to Server' : saving ? 'Saving...' : 'Save Record'}
        </button>
      </div>

      {/* Chart.js Visualization */}
      <div className="bg-[#272735] rounded-[12px] p-4">
        <h4 className="text-[11px] uppercase tracking-wider text-[#c3c3cc] mb-3">
          Asymmetry Profile (%)
        </h4>
        <div className="w-full h-48">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="metric-card">
          <div className="metric-label">Eye Asymmetry</div>
          <div className="metric-value">{formatMetric(asymmetryMetrics.eyeAsymmetry)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Mouth Droop</div>
          <div className="metric-value text-[#5266eb]">{formatMetric(asymmetryMetrics.mouthAsymmetry)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Eyebrow Asymmetry</div>
          <div className="metric-value">{formatMetric(asymmetryMetrics.eyebrowAsymmetry)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Arm Drift Ratio</div>
          <div className="metric-value text-[#5266eb]">{formatMetric(postureMetrics.armDriftRatio)}</div>
        </div>
      </div>

      {/* Clinical Findings */}
      {assessmentFindings && assessmentFindings.length > 0 && (
        <div className="bg-[#272735] rounded-[12px] p-5">
          <h4 className="text-xs uppercase tracking-wider font-medium text-[#c3c3cc] mb-3">
            Diagnostic Observations
          </h4>
          <ul className="space-y-2 text-xs text-[#ededf3]">
            {assessmentFindings.map((finding, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-[#5266eb] font-bold">•</span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer Footnote */}
      <div className="text-[11px] text-[#c3c3cc] leading-relaxed pt-2 border-t border-[#272735]">
        <strong className="text-[#ededf3]">Disclaimer:</strong> Tool intended for early F.A.S.T. stroke triage awareness. Always contact emergency services for diagnostic evaluation.
      </div>
    </div>
  );
};

export default ResultsPanel;
