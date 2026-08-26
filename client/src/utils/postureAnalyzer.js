/**
 * Analyzes body posture and arm elevation using MediaPipe Pose landmarks
 * Focuses on:
 * 1. Shoulder imbalance (drooping on one side)
 * 2. Head tilt
 * 3. Body lean
 * 4. Arm elevation & drift ratio (Arm weakness test)
 */

// Helper to calculate distance between two points
const calculateDistance = (p1, p2) => {
  if (!p1 || !p2) return 0;
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Helper to calculate the angle between three points
const calculateAngle = (p1, p2, p3) => {
  if (!p1 || !p2 || !p3) return 0;
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return angle;
};

// Helper to calculate the slope of a line between two points
const calculateSlope = (p1, p2) => {
  if (!p1 || !p2 || Math.abs(p2.x - p1.x) < 0.0001) return 0;
  return (p2.y - p1.y) / (p2.x - p1.x);
};

const normalizeValue = (value, maxValue) => {
  return Math.min(Math.abs(value) / maxValue, 1);
};

const analyzePosture = (poseLandmarks) => {
  if (!poseLandmarks || poseLandmarks.length < 33) {
    return {
      shoulderImbalance: 0,
      headTilt: 0,
      bodyLean: 0,
      leftArmElevation: 0,
      rightArmElevation: 0,
      armDriftRatio: 0
    };
  }

  // Shoulders
  const leftShoulder = poseLandmarks[11];
  const rightShoulder = poseLandmarks[12];

  // Wrists
  const leftWrist = poseLandmarks[15];
  const rightWrist = poseLandmarks[16];

  // Hips
  const leftHip = poseLandmarks[23];
  const rightHip = poseLandmarks[24];

  // Head/Ears/Nose
  const leftEar = poseLandmarks[7];
  const rightEar = poseLandmarks[8];
  const nose = poseLandmarks[0];

  // 1. Calculate shoulder imbalance
  const shoulderSlope = calculateSlope(leftShoulder, rightShoulder);
  const shoulderImbalance = Number(normalizeValue(Math.atan(shoulderSlope), 0.35).toFixed(4));

  // 2. Calculate head tilt
  const earMidpoint = {
    x: (leftEar.x + rightEar.x) / 2,
    y: (leftEar.y + rightEar.y) / 2
  };
  const verticalPoint = { x: earMidpoint.x, y: earMidpoint.y - 0.1 };
  const headAngle = calculateAngle(verticalPoint, earMidpoint, nose);
  const headTilt = Number(normalizeValue(headAngle, 15).toFixed(4));

  // 3. Calculate body lean
  const shoulderMidpoint = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2
  };
  const hipMidpoint = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2
  };
  const verticalFromHips = { x: hipMidpoint.x, y: hipMidpoint.y - 0.1 };
  const spineAngle = calculateAngle(verticalFromHips, hipMidpoint, shoulderMidpoint);
  const bodyLean = Number(normalizeValue(spineAngle, 12).toFixed(4));

  // 4. Arm Elevation & Arm Drift Calculation
  // Angle of arm (shoulder -> wrist) relative to torso horizontal
  const leftArmAngle = calculateAngle(leftHip, leftShoulder, leftWrist);
  const rightArmAngle = calculateAngle(rightHip, rightShoulder, rightWrist);

  // Height difference between wrists normalized by torso height
  const torsoHeight = calculateDistance(shoulderMidpoint, hipMidpoint) || 1;
  const wristHeightDiff = Math.abs(leftWrist.y - rightWrist.y) / torsoHeight;

  // Arm drift ratio (difference in arm elevation)
  const armDriftRatio = Number(Math.min(1, wristHeightDiff).toFixed(4));

  return {
    shoulderImbalance,
    headTilt,
    bodyLean,
    leftArmElevation: Number((leftArmAngle / 90).toFixed(2)),
    rightArmElevation: Number((rightArmAngle / 90).toFixed(2)),
    armDriftRatio
  };
};

export default analyzePosture;

