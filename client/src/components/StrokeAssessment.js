import { useEffect } from 'react';

const StrokeAssessment = ({ asymmetryMetrics, postureMetrics, speechMetrics, onRiskUpdate, onFindingsUpdate }) => {
  useEffect(() => {
    // If metrics aren't loaded yet
    if (!asymmetryMetrics || Object.keys(asymmetryMetrics).length === 0) {
      return;
    }

    const { eyeAsymmetry = 0, mouthAsymmetry = 0, overallAsymmetry = 0 } = asymmetryMetrics;
    const { shoulderImbalance = 0, headTilt = 0, armDriftRatio = 0 } = postureMetrics || {};

    const findings = [];
    let riskScore = 0;
    let highRiskIndicators = 0;

    const LOW_THRESHOLD = 0.12;
    const MEDIUM_THRESHOLD = 0.22;
    const HIGH_THRESHOLD = 0.32;

    // 1. Face Assessment (F)
    if (mouthAsymmetry > HIGH_THRESHOLD) {
      findings.push("Significant mouth drooping detected (F - Face Droop).");
      riskScore += 3;
      highRiskIndicators++;
    } else if (mouthAsymmetry > MEDIUM_THRESHOLD) {
      findings.push("Moderate mouth corner asymmetry observed.");
      riskScore += 2;
    } else if (mouthAsymmetry > LOW_THRESHOLD) {
      findings.push("Mild mouth corner asymmetry.");
      riskScore += 1;
    }

    if (eyeAsymmetry > HIGH_THRESHOLD) {
      findings.push("Significant palpebral eye asymmetry detected.");
      riskScore += 2;
      highRiskIndicators++;
    } else if (eyeAsymmetry > MEDIUM_THRESHOLD) {
      findings.push("Moderate eye asymmetry detected.");
      riskScore += 1;
    }

    if (overallAsymmetry > HIGH_THRESHOLD) {
      findings.push("High overall facial asymmetry score.");
      riskScore += 3;
      highRiskIndicators++;
    }

    // 2. Arm Assessment (A)
    if (armDriftRatio > HIGH_THRESHOLD || shoulderImbalance > HIGH_THRESHOLD) {
      findings.push("Significant arm elevation imbalance / drift detected (A - Arm Weakness).");
      riskScore += 3;
      highRiskIndicators++;
    } else if (armDriftRatio > MEDIUM_THRESHOLD || shoulderImbalance > MEDIUM_THRESHOLD) {
      findings.push("Moderate shoulder height imbalance detected.");
      riskScore += 2;
    }

    if (headTilt > MEDIUM_THRESHOLD) {
      findings.push("Noticeable head tilt angle detected.");
      riskScore += 1;
    }

    // 3. Speech Assessment (S)
    if (speechMetrics) {
      if (speechMetrics.overallRisk === 'high' || (speechMetrics.coherenceScore < 60)) {
        findings.push("Significant speech impairment or word-finding difficulty detected (S - Speech Difficulty).");
        riskScore += 3;
        highRiskIndicators++;
      } else if (speechMetrics.overallRisk === 'medium') {
        findings.push("Moderate speech articulation issues observed.");
        riskScore += 1;
      }
    }

    // Determine overall FAST risk level
    let riskLevel = 'low';
    if (riskScore >= 5 || highRiskIndicators >= 2) {
      riskLevel = 'high';
      findings.push("⚠️ MULTIPLE HIGH-RISK F.A.S.T. INDICATORS FLAGGED. Seek immediate medical evaluation (Call 911).");
    } else if (riskScore >= 2) {
      riskLevel = 'medium';
      findings.push("Moderate neurological asymmetry detected. Consider consulting a physician.");
    } else {
      findings.push("No critical F.A.S.T. stroke asymmetry indicators detected at this time.");
    }

    onRiskUpdate(riskLevel);
    onFindingsUpdate(findings);

  }, [asymmetryMetrics, postureMetrics, speechMetrics, onRiskUpdate, onFindingsUpdate]);

  return null;
};

export default StrokeAssessment;
