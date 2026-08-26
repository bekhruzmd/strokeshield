# StrokeShield — Detailed Changelog & Modifications Report

This document details all structural, architectural, visual, and deployment changes made to the **StrokeShield** repository.

---

## 📑 Summary of Major Changes

1. **Repository Restoration**: Cloned and restored full workspace from `https://github.com/bekhruzmd/strokeshield`.
2. **Complete F.A.S.T. Assessment Suite**:
   - **F (Face)**: Live 468-point face mesh droop tracking normalized by inter-ocular distance.
   - **A (Arm)**: 10-second guided Arm Drift elevation hold test tracking bilateral wrist drift.
   - **S (Speech)**: Interactive speech recorder analyzing articulation, slurring, and word-finding impairment.
   - **T (Time)**: Emergency SOS dispatch protocol modal with copyable first responder diagnostic snapshot and 911 quick-call CTA.
3. **MediaPipe Engine Refactor**: Created a unified custom hook ([`useMediaPipe.js`](file:///Users/bekhruzmd/Desktop/stroke-shield/client/src/hooks/useMediaPipe.js)) replacing duplicate conflicting camera loops, preventing memory leaks, and auto-scaling landmark canvas coordinates.
4. **Mercury Alpine Banking Design System Overhaul**: Applied `#171721` Onyx Canvas, `#1e1e2a` Graphite Cards (12px radius, 32px padding, shadowless flat lift), `#272735` Obsidian secondary fills, `#5266eb` Cobalt primary action accent, `#ededf3` Ivory text, and 32px/40px pill-shaped controls.
5. **Server & Offline Robustness**: Updated backend with local speech comparator fallbacks and saved assessment logging.
6. **Vercel Deployment**: Configured [`vercel.json`](file:///Users/bekhruzmd/Desktop/stroke-shield/vercel.json) and deployed live to production.

---

## 🛠️ Detailed File-by-File Changes

### 1. Design & Configuration Files

#### [`client/public/index.html`](file:///Users/bekhruzmd/Desktop/stroke-shield/client/public/index.html)
- **Added**: Google Fonts Inter font link (`family=Inter:wght@300;400;500;600;700;800`).
- **Added**: Tailwind CSS inline theme configuration extending Mercury colors (`onyx: #171721`, `graphite: #1e1e2a`, `obsidian: #272735`, `cobalt: #5266eb`, `ivory: #ededf3`, `ash: #c3c3cc`, `slateBorder: #70707d`, `mistBorder: #e2e3ed`).
- **Updated**: Page title to `"StrokeShield — AI FAST Stroke Assessment System"`.
- **Updated**: Meta theme color to `#171721`.

#### [`client/src/styles/tailwind.css`](file:///Users/bekhruzmd/Desktop/stroke-shield/client/src/styles/tailwind.css)
- **Added**: CSS custom properties for all Mercury design system tokens (`--color-onyx-canvas`, `--color-graphite-card`, `--color-obsidian-button`, `--color-cobalt`, `--color-ivory-text`, `--color-ash-text`, `--radius-card: 12px`, `--radius-pill: 32px`).
- **Added**: Utility classes:
  - `.mercury-card`: `#1e1e2a` background, 12px border radius, 32px padding, no border, no shadow.
  - `.mercury-btn-cobalt`: `#5266eb` fill, `#ffffff` text, 32px pill shape (primary CTA).
  - `.mercury-btn-obsidian`: `#272735` fill, `#ededf3` text, 32px pill shape (secondary action).
  - `.mercury-btn-ghost`: Transparent background, 1px solid `#ededf3` outline, 40px pill shape.

#### [`vercel.json`](file:///Users/bekhruzmd/Desktop/stroke-shield/vercel.json) `[NEW]`
- **Added**: Vercel deployment configuration routing `/api/(.*)` to `server/index.js` serverless functions and static build outputs for React frontend (`client/build`).

---

### 2. Core Vision Engine & Utilities

#### [`client/src/hooks/useMediaPipe.js`](file:///Users/bekhruzmd/Desktop/stroke-shield/client/src/hooks/useMediaPipe.js) `[NEW]`
- **Created**: Unified React custom hook managing both MediaPipe `FaceMesh` and `Pose` models on a single video frame loop via `requestAnimationFrame`.
- **Added**: Single camera stream lifecycle management preventing webcam locks.
- **Added**: Canvas width/height auto-scaling matching actual displayed video bounding dimensions.
- **Added**: Demo mode fallback state allowing offline vision testing.

#### [`client/src/utils/facialAsymmetryDetector.js`](file:///Users/bekhruzmd/Desktop/stroke-shield/client/src/utils/facialAsymmetryDetector.js)
- **Refactored**: Normalized all facial distances by inter-ocular distance (distance between eye centers) to ensure scale and head-distance invariance.
- **Added**: Eye aspect ratio (EAR) and mouth corner height differential calculation.
- **Cleaned**: Unused ESLint variables.

#### [`client/src/utils/postureAnalyzer.js`](file:///Users/bekhruzmd/Desktop/stroke-shield/client/src/utils/postureAnalyzer.js)
- **Updated**: Posture analyzer to compute shoulder slope imbalance, head tilt, and spine body lean.
- **Added**: Arm elevation angle calculation and 10-second vertical wrist drift ratio (`armDriftRatio`).
- **Cleaned**: Unused ESLint variables.

---

### 3. Application Components

#### [`client/src/components/SpeechTest.js`](file:///Users/bekhruzmd/Desktop/stroke-shield/client/src/components/SpeechTest.js) `[NEW]`
- **Created**: Interactive Speech Test component (S in F.A.S.T.).
- **Added**: Standardized diagnostic passage selection ("The early bird catches the worm...", "Fifty fifty...", etc.).
- **Added**: Real-time voice recording via Web Speech API (`SpeechRecognition`).
- **Added**: Integration with `/api/analyze-speech` endpoint and fallback algorithmic text comparator.

#### [`client/src/components/ArmDriftTest.js`](file:///Users/bekhruzmd/Desktop/stroke-shield/client/src/components/ArmDriftTest.js) `[NEW]`
- **Created**: Guided 10-second Arm Drift Test component (A in F.A.S.T.).
- **Added**: 3-second countdown timer followed by a 10-second elevation hold test.
- **Added**: Real-time left/right arm angle display and automated drift summary calculation.

#### [`client/src/components/EmergencyModal.js`](file:///Users/bekhruzmd/Desktop/stroke-shield/client/src/components/EmergencyModal.js) `[NEW]`
- **Created**: Emergency SOS Protocol modal (T in F.A.S.T.).
- **Added**: Copyable first responder clinical diagnostic report containing exact metrics and timestamp.
- **Added**: Direct 911 quick-call action button.

#### [`client/src/components/AssessmentHistory.js`](file:///Users/bekhruzmd/Desktop/stroke-shield/client/src/components/AssessmentHistory.js) `[NEW]`
- **Created**: Assessment history log viewer.
- **Added**: Queries `/api/assessments/recent` and `/api/speech-analyses/recent` to display past diagnostic records in Mercury `#272735` table containers.

#### [`client/src/components/Webcam.js`](file:///Users/bekhruzmd/Desktop/stroke-shield/client/src/components/Webcam.js)
- **Updated**: Framed camera view container with Mercury `#171721` Onyx background and 12px radius.
- **Added**: Live indicator badge and camera standby overlay.

#### [`client/src/components/DetectionView.js`](file:///Users/bekhruzmd/Desktop/stroke-shield/client/src/components/DetectionView.js)
- **Updated**: Canvas overlay component to dynamically render MediaPipe face mesh and pose connectors without coordinate offset.

#### [`client/src/components/ResultsPanel.js`](file:///Users/bekhruzmd/Desktop/stroke-shield/client/src/components/ResultsPanel.js)
- **Overhauled**: Restyled diagnostic dashboard as a Mercury Graphite card (`#1e1e2a`, 12px radius, 32px padding).
- **Updated**: Chart.js bar chart with Cobalt (`#5266eb`), Slate (`#70707d`), and Ivory (`#ededf3`) colors.
- **Added**: Save assessment log button sending data to backend database.

#### [`client/src/components/StrokeAssessment.js`](file:///Users/bekhruzmd/Desktop/stroke-shield/client/src/components/StrokeAssessment.js)
- **Updated**: Weighted FAST risk calculator incorporating Face droop, Arm drift ratio, and Speech coherence scores.

#### [`client/src/App.js`](file:///Users/bekhruzmd/Desktop/stroke-shield/client/src/App.js)
- **Overhauled**: Top bar navigation with Mercury transparent background, logo, pill navigation links, and single primary Cobalt CTA button ("Emergency 911 SOS").
- **Added**: F.A.S.T. clinical guide sub-header banner.
- **Added**: Tab switcher controlling Vision & Face, Arm Weakness, Speech Test, and Assessment History.
- **Added**: Mercury dark footer.

---

### 4. Backend & Server

#### [`server/index.js`](file:///Users/bekhruzmd/Desktop/stroke-shield/server/index.js)
- **Updated**: Default `PORT` changed to `5000` to match client proxy configuration and resolve port 8000 collisions.
- **Added**: Local algorithmic speech comparator fallback in `/api/analyze-speech` when `GOOGLE_AI_API_KEY` is not present, ensuring 100% endpoint reliability.

---

## 🌐 Live Deployment Links

- **Production URL**: [https://stroke-shield-iota.vercel.app](https://stroke-shield-iota.vercel.app)
- **Deployment Build URL**: [https://stroke-shield-i9o201v7c-bekhruzmds-projects.vercel.app](https://stroke-shield-i9o201v7c-bekhruzmds-projects.vercel.app)
