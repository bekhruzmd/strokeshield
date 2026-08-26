# StrokeShield — F.A.S.T. Stroke Assessment Platform
**By Abubakr and Bekhruz**

StrokeShield is a real-time stroke screening platform that uses computer vision and speech analysis to evaluate the three primary clinical indicators of stroke: facial drooping, arm weakness, and speech difficulty — the F.A.S.T. protocol used by first responders worldwide.

![photo_2025-04-06 11 43 35](https://github.com/user-attachments/assets/d4200934-c275-4ed8-b311-596c8a9e3406)

## How It Works

The platform walks the user through each step of the F.A.S.T. assessment:

- **F — Face**: Live 468-point face mesh tracks mouth corner droop and eye asymmetry, normalized to the face's own orientation so head tilt doesn't produce false positives.
- **A — Arm**: A guided 10-second elevation hold test measures bilateral wrist drift using pose landmarks.
- **S — Speech**: The user reads a standardized diagnostic passage aloud; the system checks articulation and word-finding against the reference text.
- **T — Time**: If indicators are flagged, an emergency panel surfaces a copyable first-responder snapshot and a direct 911 call shortcut.

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Vision**: MediaPipe FaceMesh + Pose (runs fully in-browser, no server round-trips)
- **Speech**: Web Speech API + server-side text comparison fallback
- **Backend**: Node.js / Express
- **Deployment**: Vercel

## Disclaimer

This tool is for educational and screening purposes only and is not a substitute for medical diagnosis. If you suspect a stroke, call emergency services immediately. Always follow the F.A.S.T. method: **F**acial drooping, **A**rm weakness, **S**peech difficulty, **T**ime to call emergency services.
