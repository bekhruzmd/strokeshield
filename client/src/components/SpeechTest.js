import React, { useState, useEffect, useRef } from 'react';

const PASSAGES = [
  { id: 'passage1', text: "The early bird catches the worm, but the second mouse gets the cheese.", title: "Standard Passage 1" },
  { id: 'passage2', text: "Fifty fifty, fifty-five, seventy-seven, eighty-eight.", title: "Articulation Reading" },
  { id: 'passage3', text: "You can't teach an old dog new tricks, but practice makes perfect.", title: "Fluency & Word Finding" }
];

export default function SpeechTest({ onSpeechAnalysisComplete }) {
  const [selectedPassage, setSelectedPassage] = useState(PASSAGES[0].text);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== 'no-speech') {
          setError(`Speech recognition notice: ${event.error}`);
        }
      };

      recognitionRef.current = recognition;
    } else {
      setError("Web Speech API not supported natively in this browser. You can type spoken text manually.");
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
      }
      setIsRecording(false);
    } else {
      setTranscript('');
      setError(null);
      setAnalysisResult(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch(e) {
          setIsRecording(true);
        }
      } else {
        setIsRecording(true);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError("Please speak or type a speech sample to analyze.");
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript,
          readingPassage: selectedPassage
        })
      });

      if (!response.ok) throw new Error(`Server status ${response.status}`);
      const data = await response.json();
      setAnalysisResult(data);
      if (onSpeechAnalysisComplete) onSpeechAnalysisComplete(data);
    } catch (err) {
      const expectedWords = selectedPassage.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
      const actualWords = transcript.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
      let matchedCount = 0;
      actualWords.forEach(w => { if (expectedWords.includes(w)) matchedCount++; });
      const matchRatio = expectedWords.length > 0 ? (matchedCount / expectedWords.length) : 0.8;
      const coherenceScore = Math.round(matchRatio * 100);

      const fallbackResult = {
        coherenceScore,
        slurredSpeechScore: Math.round((1 - matchRatio) * 40),
        wordFindingScore: Math.round((1 - matchRatio) * 60),
        overallRisk: coherenceScore > 75 ? 'low' : coherenceScore > 50 ? 'medium' : 'high',
        observations: [
          `Word match accuracy with prompt passage: ${coherenceScore}%`,
          coherenceScore < 60 ? "Noticed potential word omissions or substitutions." : "Speech alignment was clear."
        ]
      };
      setAnalysisResult(fallbackResult);
      if (onSpeechAnalysisComplete) onSpeechAnalysisComplete(fallbackResult);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="mercury-card space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-[#ededf3]">Speech Clarity & Word Finding Test</h2>
          <p className="text-xs text-[#c3c3cc]">F.A.S.T. Speech Protocol — Speech difficulty evaluation</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#272735] text-[#ededf3] text-xs">
          Speech Protocol
        </span>
      </div>

      {/* Reading Passage Selector */}
      <div className="bg-[#272735] rounded-[12px] p-5">
        <label className="block text-xs uppercase tracking-wider text-[#c3c3cc] mb-3">
          Select Standardized Prompt:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {PASSAGES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPassage(p.text)}
              className={`p-4 rounded-[12px] text-left text-xs transition-all ${
                selectedPassage === p.text
                  ? 'bg-[#5266eb] text-white'
                  : 'bg-[#1e1e2a] text-[#ededf3] hover:bg-[#313143]'
              }`}
            >
              <div className="font-medium text-sm mb-1">{p.title}</div>
              <div className="truncate opacity-80">"{p.text}"</div>
            </button>
          ))}
        </div>
        <div className="p-4 rounded-[12px] bg-[#171721] text-sm text-[#ededf3] italic">
          "{selectedPassage}"
        </div>
      </div>

      {/* Recording Actions */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={toggleRecording}
            className={isRecording ? "mercury-btn-obsidian !bg-[#5266eb] text-white" : "mercury-btn-cobalt"}
          >
            {isRecording ? 'Stop Recording' : 'Start Speech Recording'}
          </button>

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !transcript.trim()}
            className="mercury-btn-obsidian disabled:opacity-40"
          >
            {analyzing ? 'Analyzing Speech...' : 'Analyze Speech Coherence'}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-[12px] bg-[#272735] text-[#c3c3cc] text-xs">
            {error}
          </div>
        )}

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Spoken speech transcript will appear here..."
          rows={3}
          className="w-full bg-[#171721] border border-[#272735] rounded-[12px] p-4 text-sm text-[#ededf3] placeholder-[#c3c3cc] focus:outline-none focus:border-[#5266eb]"
        />
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="bg-[#272735] rounded-[12px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-[#ededf3]">Speech Diagnostic Report</h4>
            <span className="px-3 py-1 rounded-full text-xs bg-[#171721] text-[#ededf3] font-medium uppercase">
              Risk: {analysisResult.overallRisk}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#1e1e2a] p-4 rounded-[12px]">
              <div className="text-xs text-[#c3c3cc] mb-1">Coherence Score</div>
              <div className="text-xl font-medium text-[#ededf3]">{analysisResult.coherenceScore ?? 0}%</div>
            </div>
            <div className="bg-[#1e1e2a] p-4 rounded-[12px]">
              <div className="text-xs text-[#c3c3cc] mb-1">Slurred Speech Score</div>
              <div className="text-xl font-medium text-[#ededf3]">{analysisResult.slurredSpeechScore ?? 0}%</div>
            </div>
            <div className="bg-[#1e1e2a] p-4 rounded-[12px]">
              <div className="text-xs text-[#c3c3cc] mb-1">Word Finding Score</div>
              <div className="text-xl font-medium text-[#ededf3]">{analysisResult.wordFindingScore ?? 0}%</div>
            </div>
          </div>

          {analysisResult.observations && analysisResult.observations.length > 0 && (
            <ul className="space-y-1 text-xs text-[#c3c3cc] pt-2">
              {analysisResult.observations.map((obs, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#5266eb]">•</span>
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
