import { useEffect, useRef, useState, useCallback } from 'react';
import analyzeFacialAsymmetry from '../utils/facialAsymmetryDetector';
import analyzePosture from '../utils/postureAnalyzer';

export function useMediaPipe({ isDetecting, demoMode = false }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [faceMeshResults, setFaceMeshResults] = useState(null);
  const [poseResults, setPoseResults] = useState(null);
  const [asymmetryMetrics, setAsymmetryMetrics] = useState({});
  const [postureMetrics, setPostureMetrics] = useState({});
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const faceMeshRef = useRef(null);
  const poseRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Initialize MediaPipe Models once
  useEffect(() => {
    let isMounted = true;

    const initModels = async () => {
      try {
        if (window.FaceMesh && !faceMeshRef.current) {
          const fm = new window.FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
          });
          fm.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });
          fm.onResults((results) => {
            if (!isMounted) return;
            setFaceMeshResults(results);
            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
              const metrics = analyzeFacialAsymmetry(results.multiFaceLandmarks[0]);
              setAsymmetryMetrics(metrics);
            }
          });
          faceMeshRef.current = fm;
        }

        if (window.Pose && !poseRef.current) {
          const p = new window.Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
          });
          p.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });
          p.onResults((results) => {
            if (!isMounted) return;
            setPoseResults(results);
            if (results.poseLandmarks) {
              const metrics = analyzePosture(results.poseLandmarks);
              setPostureMetrics(metrics);
            }
          });
          poseRef.current = p;
        }
      } catch (err) {
        console.error("Error initializing MediaPipe models:", err);
      }
    };

    initModels();

    return () => {
      isMounted = false;
      if (faceMeshRef.current) {
        try { faceMeshRef.current.close(); } catch(e){}
        faceMeshRef.current = null;
      }
      if (poseRef.current) {
        try { poseRef.current.close(); } catch(e){}
        poseRef.current = null;
      }
    };
  }, []);

  // Frame processing loop
  const processFrame = useCallback(async () => {
    if (!isDetecting || !videoRef.current || isProcessingRef.current) {
      return;
    }

    const video = videoRef.current;
    if (video.readyState >= 2 && !video.paused && !video.ended) {
      isProcessingRef.current = true;
      try {
        if (faceMeshRef.current) {
          await faceMeshRef.current.send({ image: video });
        }
        if (poseRef.current) {
          await poseRef.current.send({ image: video });
        }
      } catch (err) {
        // Frame processing error catch
      } finally {
        isProcessingRef.current = false;
      }
    }

    if (isDetecting) {
      animFrameIdRef.current = requestAnimationFrame(processFrame);
    }
  }, [isDetecting]);

  // Start / Stop Camera Stream & Loop
  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      if (!isDetecting || demoMode) return;
      setCameraError(null);

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
          animFrameIdRef.current = requestAnimationFrame(processFrame);
        }
      } catch (err) {
        console.error("Camera access failed:", err);
        setCameraError("Camera permission denied or camera unavailable. You can use Demo Mode to test.");
        setCameraActive(false);
      }
    };

    const stopCamera = () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    };

    if (isDetecting) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isDetecting, demoMode, processFrame]);

  // Canvas drawing loop
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    if (video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw FaceMesh
    if (faceMeshResults && faceMeshResults.multiFaceLandmarks && window.drawConnectors) {
      for (const landmarks of faceMeshResults.multiFaceLandmarks) {
        if (window.FACEMESH_TESSELATION) {
          window.drawConnectors(ctx, landmarks, window.FACEMESH_TESSELATION, { color: '#38bdf833', lineWidth: 0.5 });
        }
        if (window.FACEMESH_RIGHT_EYE) {
          window.drawConnectors(ctx, landmarks, window.FACEMESH_RIGHT_EYE, { color: '#f43f5e', lineWidth: 1.5 });
        }
        if (window.FACEMESH_LEFT_EYE) {
          window.drawConnectors(ctx, landmarks, window.FACEMESH_LEFT_EYE, { color: '#2dd4bf', lineWidth: 1.5 });
        }
        if (window.FACEMESH_LIPS) {
          window.drawConnectors(ctx, landmarks, window.FACEMESH_LIPS, { color: '#fbbf24', lineWidth: 1.5 });
        }
      }
    }

    // Draw Pose
    if (poseResults && poseResults.poseLandmarks && window.drawConnectors) {
      if (window.POSE_CONNECTIONS) {
        window.drawConnectors(ctx, poseResults.poseLandmarks, window.POSE_CONNECTIONS, { color: '#06b6d4', lineWidth: 2 });
      }
      if (window.drawLandmarks) {
        window.drawLandmarks(ctx, poseResults.poseLandmarks, { color: '#f43f5e', lineWidth: 1, radius: 4, fillColor: '#ffffff' });
      }
    }
  }, [faceMeshResults, poseResults]);

  const clearResults = () => {
    setFaceMeshResults(null);
    setPoseResults(null);
    setAsymmetryMetrics({});
    setPostureMetrics({});
  };

  return {
    videoRef,
    canvasRef,
    faceMeshResults,
    poseResults,
    asymmetryMetrics,
    postureMetrics,
    cameraActive,
    cameraError,
    clearResults
  };
}
