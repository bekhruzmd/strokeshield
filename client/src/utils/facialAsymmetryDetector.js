const calculateDistance = (p1, p2) => {
  if (!p1 || !p2) return 0;
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const calculateAsymmetryRatio = (val1, val2) => {
  const maxVal = Math.max(val1, val2);
  const minVal = Math.min(val1, val2);
  if (maxVal <= 0.0001) return 0;
  return Math.min(1, Math.max(0, 1 - minVal / maxVal));
};

const analyzeFacialAsymmetry = (landmarks) => {
  if (!landmarks || landmarks.length < 468) {
    return { eyeAsymmetry: 0, mouthAsymmetry: 0, eyebrowAsymmetry: 0, overallAsymmetry: 0 };
  }

  const leftEyeOuter   = landmarks[33];
  const leftEyeInner   = landmarks[133];
  const rightEyeOuter  = landmarks[263];
  const rightEyeInner  = landmarks[362];
  const leftEyeTop     = landmarks[159];
  const leftEyeBottom  = landmarks[145];
  const rightEyeTop    = landmarks[386];
  const rightEyeBottom = landmarks[374];
  const mouthLeft      = landmarks[61];
  const mouthRight     = landmarks[291];
  const leftEyebrowOuter  = landmarks[70];
  const leftEyebrowInner  = landmarks[107];
  const rightEyebrowOuter = landmarks[300];
  const rightEyebrowInner = landmarks[336];

  const leftEyeCenter = {
    x: (leftEyeOuter.x + leftEyeInner.x) / 2,
    y: (leftEyeOuter.y + leftEyeInner.y) / 2,
  };
  const rightEyeCenter = {
    x: (rightEyeOuter.x + rightEyeInner.x) / 2,
    y: (rightEyeOuter.y + rightEyeInner.y) / 2,
  };

  const interOcularDist = calculateDistance(leftEyeCenter, rightEyeCenter) || 1;

  // Face center (midpoint between the two eyes)
  const fcx = (leftEyeCenter.x + rightEyeCenter.x) / 2;
  const fcy = (leftEyeCenter.y + rightEyeCenter.y) / 2;

  // Roll angle of the face in image space — counter-rotate by this to get upright coords
  const rollAngle = Math.atan2(
    rightEyeCenter.y - leftEyeCenter.y,
    rightEyeCenter.x - leftEyeCenter.x,
  );
  const cosA = Math.cos(-rollAngle);
  const sinA = Math.sin(-rollAngle);

  const rotatePt = (pt) => ({
    x: cosA * (pt.x - fcx) - sinA * (pt.y - fcy) + fcx,
    y: sinA * (pt.x - fcx) + cosA * (pt.y - fcy) + fcy,
  });

  // Rotate all measured landmarks into the face-upright frame
  const rLeftEyeTop      = rotatePt(leftEyeTop);
  const rLeftEyeBottom   = rotatePt(leftEyeBottom);
  const rRightEyeTop     = rotatePt(rightEyeTop);
  const rRightEyeBottom  = rotatePt(rightEyeBottom);
  const rMouthLeft       = rotatePt(mouthLeft);
  const rMouthRight      = rotatePt(mouthRight);
  const rLeftEyeCenter   = rotatePt(leftEyeCenter);
  const rRightEyeCenter  = rotatePt(rightEyeCenter);
  const rLEBrowOuter     = rotatePt(leftEyebrowOuter);
  const rLEBrowInner     = rotatePt(leftEyebrowInner);
  const rREBrowOuter     = rotatePt(rightEyebrowOuter);
  const rREBrowInner     = rotatePt(rightEyebrowInner);

  // 1. Eye-opening asymmetry (height of each eye, EAR-style)
  const leftEyeHeight  = calculateDistance(rLeftEyeTop, rLeftEyeBottom)  / interOcularDist;
  const rightEyeHeight = calculateDistance(rRightEyeTop, rRightEyeBottom) / interOcularDist;
  const eyeAsymmetry   = Number(calculateAsymmetryRatio(leftEyeHeight, rightEyeHeight).toFixed(4));

  // 2. Mouth asymmetry — vertical droop + width imbalance, tilt-corrected
  // Vertical: one corner lower than the other in face-upright space
  const mouthDroopScore = Math.abs(rMouthLeft.y - rMouthRight.y) / interOcularDist;
  const mouthDroopNorm  = Math.min(1, mouthDroopScore * 3.0);

  // Horizontal: each half-width of the mouth
  const mouthMidX           = (rMouthLeft.x + rMouthRight.x) / 2;
  const leftHalfWidth       = Math.abs(rMouthLeft.x  - mouthMidX) / interOcularDist;
  const rightHalfWidth      = Math.abs(rMouthRight.x - mouthMidX) / interOcularDist;
  const mouthWidthAsymmetry = calculateAsymmetryRatio(leftHalfWidth, rightHalfWidth);

  const mouthAsymmetry = Number((mouthDroopNorm * 0.7 + mouthWidthAsymmetry * 0.3).toFixed(4));

  // 3. Eyebrow height asymmetry (distance of each brow from its own eye center)
  const leftBrowMidY   = (rLEBrowOuter.y + rLEBrowInner.y) / 2;
  const rightBrowMidY  = (rREBrowOuter.y + rREBrowInner.y) / 2;
  const leftBrowRaise  = Math.abs(leftBrowMidY  - rLeftEyeCenter.y)  / interOcularDist;
  const rightBrowRaise = Math.abs(rightBrowMidY - rRightEyeCenter.y) / interOcularDist;
  const eyebrowAsymmetry = Number(calculateAsymmetryRatio(leftBrowRaise, rightBrowRaise).toFixed(4));

  // 4. Weighted overall score — mouth droop is the strongest stroke indicator
  const overallAsymmetry = Number((
    mouthAsymmetry    * 0.50 +
    eyeAsymmetry      * 0.35 +
    eyebrowAsymmetry  * 0.15
  ).toFixed(4));

  return { eyeAsymmetry, mouthAsymmetry, eyebrowAsymmetry, overallAsymmetry };
};

export default analyzeFacialAsymmetry;
