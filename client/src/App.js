import React, { useState } from "react";
import Webcam from "./components/Webcam";
import DetectionView from "./components/DetectionView";
import ResultsPanel from "./components/ResultsPanel";
import StrokeAssessment from "./components/StrokeAssessment";
import SpeechTest from "./components/SpeechTest";
import ArmDriftTest from "./components/ArmDriftTest";
import EmergencyModal from "./components/EmergencyModal";
import AssessmentHistory from "./components/AssessmentHistory";
import { useMediaPipe } from "./hooks/useMediaPipe";

function App() {
  const [activeTab, setActiveTab] = useState("monitor"); // monitor | arm | speech | history
  const [isDetecting, setIsDetecting] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [riskLevel, setRiskLevel] = useState("low");
  const [assessmentFindings, setAssessmentFindings] = useState([]);
  const [speechMetrics, setSpeechMetrics] = useState(null);
  const [armTestResult, setArmTestResult] = useState(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const {
    videoRef,
    canvasRef,
    asymmetryMetrics,
    postureMetrics,
    cameraActive,
    cameraError,
    clearResults
  } = useMediaPipe({ isDetecting, demoMode });

  const toggleDetection = () => {
    setIsDetecting(!isDetecting);
  };

  const handleClear = () => {
    clearResults();
    setRiskLevel("low");
    setAssessmentFindings([]);
    setSpeechMetrics(null);
    setArmTestResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#171721] text-[#ededf3] font-sans">
      {/* Mercury Top Bar Navigation */}
      <header className="sticky top-0 z-40 bg-[#171721]/90 backdrop-blur-lg border-b border-[#272735]">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#5266eb] flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-medium tracking-tight text-[#ededf3]">
                  StrokeShield
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#272735] text-[#c3c3cc]">
                  FAST AI
                </span>
              </div>
            </div>
          </div>

          {/* Mercury Navigation Pills */}
          <div className="hidden md:flex items-center gap-1 bg-[#1e1e2a] p-1 rounded-full">
            <button
              onClick={() => setActiveTab("monitor")}
              className={`px-5 py-2 rounded-full text-sm font-normal transition-all ${
                activeTab === "monitor"
                  ? "bg-[#5266eb] text-white"
                  : "text-[#ededf3] hover:text-white"
              }`}
            >
              Vision & Face
            </button>
            <button
              onClick={() => setActiveTab("arm")}
              className={`px-5 py-2 rounded-full text-sm font-normal transition-all ${
                activeTab === "arm"
                  ? "bg-[#5266eb] text-white"
                  : "text-[#ededf3] hover:text-white"
              }`}
            >
              Arm Weakness
            </button>
            <button
              onClick={() => setActiveTab("speech")}
              className={`px-5 py-2 rounded-full text-sm font-normal transition-all ${
                activeTab === "speech"
                  ? "bg-[#5266eb] text-white"
                  : "text-[#ededf3] hover:text-white"
              }`}
            >
              Speech Test
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-5 py-2 rounded-full text-sm font-normal transition-all ${
                activeTab === "history"
                  ? "bg-[#5266eb] text-white"
                  : "text-[#ededf3] hover:text-white"
              }`}
            >
              Assessment History
            </button>
          </div>

          {/* Mercury Primary Action Button (Cobalt) */}
          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            className="mercury-btn-cobalt"
          >
            Emergency 911 SOS
          </button>
        </div>
      </header>

      {/* Mercury Sub-header Guide Banner */}
      <div className="bg-[#1e1e2a] py-3 text-xs text-[#c3c3cc]">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 font-normal tracking-wide">
            <span className="text-[#ededf3] font-medium uppercase text-[11px] tracking-widest">F.A.S.T. Diagnostic Standard:</span>
            <span><strong className="text-[#ededf3]">F</strong>acial Drooping</span>
            <span><strong className="text-[#ededf3]">A</strong>rm Weakness</span>
            <span><strong className="text-[#ededf3]">S</strong>peech Difficulty</span>
            <span><strong className="text-[#5266eb]">T</strong>ime to Call Emergency</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#c3c3cc]">
            <span className="w-2 h-2 rounded-full bg-[#5266eb]" />
            System Status: Active
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-[1200px] mx-auto px-6 py-10 flex-1 w-full space-y-8">
        {/* Mobile Navigation Pills */}
        <div className="md:hidden flex items-center justify-around bg-[#1e1e2a] p-1.5 rounded-full text-xs">
          <button
            onClick={() => setActiveTab("monitor")}
            className={`px-3 py-1.5 rounded-full ${activeTab === "monitor" ? "bg-[#5266eb] text-white" : "text-[#c3c3cc]"}`}
          >
            Face
          </button>
          <button
            onClick={() => setActiveTab("arm")}
            className={`px-3 py-1.5 rounded-full ${activeTab === "arm" ? "bg-[#5266eb] text-white" : "text-[#c3c3cc]"}`}
          >
            Arm
          </button>
          <button
            onClick={() => setActiveTab("speech")}
            className={`px-3 py-1.5 rounded-full ${activeTab === "speech" ? "bg-[#5266eb] text-white" : "text-[#c3c3cc]"}`}
          >
            Speech
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-full ${activeTab === "history" ? "bg-[#5266eb] text-white" : "text-[#c3c3cc]"}`}
          >
            History
          </button>
        </div>

        {/* Camera elements — always mounted so the video stream persists across tab switches */}
        {/* Display toggled via CSS, never conditionally unmounted */}
        <div style={{ display: activeTab === "monitor" ? "block" : "none" }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Camera Viewfinder */}
            <div className="lg:col-span-7 space-y-6">
              <div className="mercury-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium uppercase tracking-wider text-[#ededf3]">
                    Live Vision Feed & Landmark Tracking
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-[#5266eb]' : 'bg-[#70707d]'}`} />
                    <span className="text-xs text-[#c3c3cc]">
                      {cameraActive ? 'Camera Live' : 'Standby'}
                    </span>
                  </div>
                </div>

                <div className="detection-container mb-6">
                  <Webcam
                    ref={videoRef}
                    isDetecting={isDetecting}
                    cameraActive={cameraActive}
                    cameraError={cameraError}
                    demoMode={demoMode}
                  />
                  <DetectionView
                    ref={canvasRef}
                    isDetecting={isDetecting}
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={toggleDetection}
                    className="mercury-btn-cobalt"
                  >
                    {isDetecting ? "Stop Vision Analysis" : "Start Vision Analysis"}
                  </button>

                  <button
                    onClick={handleClear}
                    className="mercury-btn-obsidian"
                  >
                    Reset Results
                  </button>

                  <button
                    onClick={() => setDemoMode(!demoMode)}
                    className="mercury-btn-ghost"
                  >
                    {demoMode ? "Demo Mode Active" : "Toggle Demo Mode"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Diagnostic Results Dashboard */}
            <div className="lg:col-span-5">
              <ResultsPanel
                asymmetryMetrics={asymmetryMetrics}
                postureMetrics={postureMetrics}
                speechMetrics={speechMetrics}
                riskLevel={riskLevel}
                assessmentFindings={assessmentFindings}
              />
            </div>
          </div>
        </div>

        {/* Tab 2: Arm Weakness & Drift Test */}
        {activeTab === "arm" && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Camera status + controls so the user can start detection from this tab */}
            <div className="mercury-card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium uppercase tracking-wider text-[#ededf3]">Pose Tracking Camera</h2>
                  <p className="text-xs text-[#c3c3cc] mt-0.5">Camera must be active for arm drift metrics to update.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-[#5266eb]' : 'bg-[#70707d]'}`} />
                    <span className="text-xs text-[#c3c3cc]">{cameraActive ? 'Camera Live' : 'Standby'}</span>
                  </div>
                  <button onClick={toggleDetection} className="mercury-btn-cobalt" style={{ fontSize: 13, padding: '8px 18px' }}>
                    {isDetecting ? "Stop Camera" : "Start Camera"}
                  </button>
                </div>
              </div>
            </div>
            <ArmDriftTest
              postureMetrics={postureMetrics}
              onArmTestComplete={(result) => setArmTestResult(result)}
            />
          </div>
        )}

        {/* Tab 3: Speech Clarity & Word Finding Test */}
        {activeTab === "speech" && (
          <div className="max-w-3xl mx-auto">
            <SpeechTest
              onSpeechAnalysisComplete={(metrics) => setSpeechMetrics(metrics)}
            />
          </div>
        )}

        {/* Tab 4: Records & Assessment History */}
        {activeTab === "history" && (
          <div className="max-w-4xl mx-auto">
            <AssessmentHistory />
          </div>
        )}

        {/* Background Assessment Logical Processing */}
        <StrokeAssessment
          asymmetryMetrics={asymmetryMetrics}
          postureMetrics={{ ...postureMetrics, armDriftRatio: armTestResult?.maxDrift || postureMetrics?.armDriftRatio }}
          speechMetrics={speechMetrics}
          onRiskUpdate={setRiskLevel}
          onFindingsUpdate={setAssessmentFindings}
        />

        {/* Emergency SOS Modal */}
        <EmergencyModal
          isOpen={isEmergencyModalOpen}
          onClose={() => setIsEmergencyModalOpen(false)}
          overallRisk={riskLevel}
          asymmetryMetrics={asymmetryMetrics}
          postureMetrics={postureMetrics}
          speechMetrics={speechMetrics}
          findings={assessmentFindings}
        />
      </main>

      {/* Mercury Footer */}
      <footer className="bg-[#171721] border-t border-[#272735] py-8 text-[#c3c3cc] text-xs mt-16">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#ededf3]">StrokeShield</span>
            <span>— Alpine Diagnostic Platform</span>
          </div>
          <p className="text-center sm:text-right text-[11px] text-[#c3c3cc]">
            For educational awareness and rapid stroke evaluation. Always call 911 for medical emergencies.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
