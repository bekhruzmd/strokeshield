const express = require('express');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { AssemblyAI } = require('assemblyai');
const { createMemoryDb } = require('./memoryDb');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Google Generative AI
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);

// Initialize AssemblyAI
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const assemblyai = new AssemblyAI({
  apiKey: ASSEMBLYAI_API_KEY
});

// Create in-memory database
const db = createMemoryDb();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files - first try the React build, then fall back to static public folder
app.use(express.static(path.join(__dirname, '../client/build')));
app.use(express.static(path.join(__dirname, 'public')));

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Save assessment data
app.post('/api/assessments', (req, res) => {
  try {
    const { asymmetryMetrics, postureMetrics, riskLevel, timestamp } = req.body;
    
    if (!asymmetryMetrics || !postureMetrics || !riskLevel) {
      return res.status(400).json({ error: 'Missing required data' });
    }
    
    const id = Date.now().toString();
    const assessment = {
      id,
      asymmetryMetrics,
      postureMetrics,
      riskLevel,
      timestamp: timestamp || new Date().toISOString()
    };
    
    db.assessments.push(assessment);
    
    res.status(201).json({ id, message: 'Assessment saved successfully' });
  } catch (error) {
    console.error('Error saving assessment:', error);
    res.status(500).json({ error: 'Failed to save assessment' });
  }
});

// Get recent assessments
app.get('/api/assessments/recent', (req, res) => {
  try {
    // Sort by timestamp descending and get most recent 10
    const recentAssessments = [...db.assessments]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
      
    res.json(recentAssessments);
  } catch (error) {
    console.error('Error fetching recent assessments:', error);
    res.status(500).json({ error: 'Failed to fetch recent assessments' });
  }
});

// Analyze speech using Google AI or local fallback algorithm
app.post('/api/analyze-speech', async (req, res) => {
  try {
    const { transcript, readingPassage } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: 'Missing speech transcript' });
    }
    
    let analysisData;

    if (GOOGLE_AI_API_KEY && GOOGLE_AI_API_KEY !== 'YOUR_API_KEY') {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        let promptText;
        if (readingPassage) {
          promptText = `
          Analyze the following speech transcript for potential stroke symptoms by comparing with expected text:
          Expected: "${readingPassage}"
          Actual: "${transcript}"
          Return JSON format with: { "coherenceScore": number, "slurredSpeechScore": number, "wordFindingScore": number, "overallRisk": "low"|"medium"|"high", "observations": string[] }
          `;
        } else {
          promptText = `
          Analyze the transcript for stroke speech symptoms: "${transcript}"
          Return JSON format with: { "coherenceScore": number, "slurredSpeechScore": number, "wordFindingScore": number, "overallRisk": "low"|"medium"|"high", "observations": string[] }
          `;
        }
        
        const result = await model.generateContent(promptText);
        const responseText = (await result.response).text().trim();
        let jsonStr = responseText.replace(/```json\n|```\n|```/g, '');
        analysisData = JSON.parse(jsonStr);
      } catch (aiErr) {
        console.warn("AI API call failed, using local speech comparator fallback:", aiErr.message);
      }
    }

    // Fallback comparison if AI key unavailable or failed
    if (!analysisData) {
      const cleanExpected = (readingPassage || "").toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(Boolean);
      const cleanActual = transcript.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(Boolean);

      let matched = 0;
      cleanActual.forEach(w => {
        if (cleanExpected.includes(w)) matched++;
      });

      const totalExpected = cleanExpected.length || 1;
      const matchRatio = Math.min(1, matched / totalExpected);
      const coherenceScore = Math.round(matchRatio * 100);
      const slurredSpeechScore = Math.round((1 - matchRatio) * 35);
      const wordFindingScore = Math.round((1 - matchRatio) * 50);
      const overallRisk = coherenceScore >= 75 ? 'low' : coherenceScore >= 50 ? 'medium' : 'high';

      analysisData = {
        coherenceScore,
        slurredSpeechScore,
        wordFindingScore,
        overallRisk,
        observations: [
          `Speech word alignment score: ${coherenceScore}%`,
          coherenceScore < 60 ? "Potential word omissions or hesitations observed." : "Speech alignment is clear.",
          "Analysis computed via algorithmic text comparison."
        ]
      };
    }

    const id = Date.now().toString();
    const speechAnalysis = {
      id,
      transcript,
      readingPassage,
      ...analysisData,
      timestamp: new Date().toISOString()
    };
    
    db.addSpeechAnalysis(speechAnalysis);
    res.json(analysisData);

  } catch (error) {
    console.error('Error analyzing speech:', error);
    res.status(500).json({ error: 'Failed to analyze speech' });
  }
});


// Transcribe audio with AssemblyAI
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioUrl } = req.body;
    
    if (!audioUrl) {
      return res.status(400).json({ error: 'Missing audio URL' });
    }
    
    // Create transcription request with AssemblyAI
    const transcript = await assemblyai.transcripts.transcribe({
      audio: audioUrl,
      language_code: 'en',
    });
    
    res.json({ 
      transcript: transcript.text,
      status: 'completed'
    });
    
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: 'Failed to transcribe audio', details: error.message });
  }
});

// Upload audio to AssemblyAI
app.post('/api/upload-audio', express.raw({ type: 'audio/*', limit: '50mb' }), async (req, res) => {
  try {
    // Upload the audio data to AssemblyAI
    const uploadResponse = await assemblyai.files.upload(req.body, {
      // You can provide optional parameters here if needed
      // data_format: 'wav',
    });
    
    // Return the URL of the uploaded audio file
    res.json({ 
      upload_url: uploadResponse.url 
    });
    
  } catch (error) {
    console.error('Error uploading audio:', error);
    res.status(500).json({ error: 'Failed to upload audio', details: error.message });
  }
});

// Get recent speech analyses
app.get('/api/speech-analyses/recent', (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const recentAnalyses = db.getRecentSpeechAnalyses(limit);
    res.json(recentAnalyses);
  } catch (error) {
    console.error('Error fetching recent speech analyses:', error);
    res.status(500).json({ error: 'Failed to fetch recent speech analyses' });
  }
});

// Serve the static files from React app for any other routes
app.get('*', (req, res) => {
  // Try to serve the React build first, then fall back to public folder
  const reactBuildPath = path.join(__dirname, '../client/build', 'index.html');
  const publicPath = path.join(__dirname, 'public', 'index.html');
  
  // Check if React build exists, otherwise serve from public
  if (require('fs').existsSync(reactBuildPath)) {
    res.sendFile(reactBuildPath);
  } else {
    res.sendFile(publicPath);
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
