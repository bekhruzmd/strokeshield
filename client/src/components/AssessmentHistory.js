import React, { useState, useEffect } from 'react';

export default function AssessmentHistory() {
  const [assessments, setAssessments] = useState([]);
  const [speechAnalyses, setSpeechAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resAss, resSpeech] = await Promise.all([
        fetch('/api/assessments/recent').then(r => r.ok ? r.json() : []),
        fetch('/api/speech-analyses/recent').then(r => r.ok ? r.json() : [])
      ]);
      setAssessments(resAss);
      setSpeechAnalyses(resSpeech);
    } catch (err) {
      console.error("Failed to load history:", err);
      setError("Could not load past assessments from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="mercury-card space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-[#ededf3]">Assessment Records & Diagnostic Logs</h2>
          <p className="text-xs text-[#c3c3cc]">Historical vision and speech evaluation records</p>
        </div>
        <button
          onClick={fetchHistory}
          className="mercury-btn-obsidian !text-xs"
        >
          Refresh Logs
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#c3c3cc] text-xs">
          Loading historical records...
        </div>
      ) : error ? (
        <div className="p-4 rounded-[12px] bg-[#272735] text-[#c3c3cc] text-xs text-center">
          {error}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Vision Assessments Table */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-medium text-[#c3c3cc]">
              Vision & Posture Evaluation Records ({assessments.length})
            </h3>
            {assessments.length === 0 ? (
              <div className="bg-[#272735] p-5 rounded-[12px] text-[#c3c3cc] text-xs text-center">
                No past vision assessments logged yet.
              </div>
            ) : (
              <div className="overflow-x-auto bg-[#272735] rounded-[12px] p-4">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#171721] text-[#c3c3cc]">
                      <th className="pb-3 pt-1">Date / Time</th>
                      <th className="pb-3 pt-1">Risk Level</th>
                      <th className="pb-3 pt-1">Facial Asymmetry</th>
                      <th className="pb-3 pt-1">Shoulder Imbalance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#171721]">
                    {assessments.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 text-[#ededf3]">
                          {new Date(item.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3">
                          <span className="px-2.5 py-1 rounded-full text-[11px] bg-[#171721] text-[#ededf3] capitalize">
                            {item.riskLevel}
                          </span>
                        </td>
                        <td className="py-3 text-[#ededf3]">
                          {((item.asymmetryMetrics?.overallAsymmetry || 0) * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 text-[#ededf3]">
                          {((item.postureMetrics?.shoulderImbalance || 0) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Speech Analyses Table */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-medium text-[#c3c3cc]">
              Speech Analysis Logs ({speechAnalyses.length})
            </h3>
            {speechAnalyses.length === 0 ? (
              <div className="bg-[#272735] p-5 rounded-[12px] text-[#c3c3cc] text-xs text-center">
                No speech analyses logged yet.
              </div>
            ) : (
              <div className="overflow-x-auto bg-[#272735] rounded-[12px] p-4">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#171721] text-[#c3c3cc]">
                      <th className="pb-3 pt-1">Date / Time</th>
                      <th className="pb-3 pt-1">Transcript</th>
                      <th className="pb-3 pt-1">Coherence</th>
                      <th className="pb-3 pt-1">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#171721]">
                    {speechAnalyses.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 text-[#ededf3]">
                          {new Date(item.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 text-[#c3c3cc] max-w-xs truncate">
                          "{item.transcript}"
                        </td>
                        <td className="py-3 text-[#ededf3]">
                          {item.coherenceScore ?? 'N/A'}%
                        </td>
                        <td className="py-3">
                          <span className="px-2.5 py-1 rounded-full text-[11px] bg-[#171721] text-[#ededf3] capitalize">
                            {item.overallRisk || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
