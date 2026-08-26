# StrokeShield: AI-powered stroke detection when seconds matter
**By Abubakr and Bekhruz**

StrokeShield is an advanced AI-powered stroke detection platform that combines cutting-edge computer vision and speech analysis to provide real-time health monitoring and early warning signs of stroke. By analyzing facial asymmetry, arm drift, and speech patterns through the clinical F.A.S.T. protocol, the system offers comprehensive stroke risk assessment.

![photo_2025-04-06 11 43 35](https://github.com/user-attachments/assets/d4200934-c275-4ed8-b311-596c8a9e3406)

## Key Features

- **Real-time Facial Asymmetry Detection**: Uses MediaPipe Face Mesh (468 landmarks) to detect subtle changes in facial symmetry that may indicate stroke — normalized to the face's own orientation so head tilt doesn't produce false positives.
- **Guided Arm Drift Test**: A 10-second bilateral elevation hold test using AI pose estimation to detect unilateral arm weakness in real time.
- **Speech Pattern Analysis**: Records the user reading a standardized diagnostic passage and analyzes articulation, slurring, and word-finding difficulty.
- **Emergency Protocol (T — Time)**: Surfaces a copyable first-responder diagnostic snapshot and a direct 911 call shortcut when high-risk indicators are detected.
- **Comprehensive Dashboard**: Real-time metrics, historical assessments, and risk scoring in a clean, clinical interface.

## Technology Stack

- **Frontend**: React, Tailwind CSS
- **AI / Computer Vision**: MediaPipe FaceMesh + Pose — runs fully in-browser, no server round-trips
- **Speech Recognition**: Web Speech API for real-time transcription + server-side analysis fallback
- **Backend**: Node.js, Express
- **Deployment**: Vercel

## Disclaimer

This tool is for educational and screening purposes only and should not be used for medical diagnosis. If you suspect a stroke, call emergency services immediately (911 in the US). Remember the FAST method: **F**acial drooping, **A**rm weakness, **S**peech difficulties, **T**ime to call emergency services.
