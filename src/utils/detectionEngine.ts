import { AlgorithmType, RiskLevel, WeeklyObservation } from '../types';

export const RISK_WEIGHTS = {
  clinic: 0.35,
  absence: 0.3,
  environment: 0.35,
};

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 25) return 'Moderate';
  return 'Low';
}

export function getRiskColor(level: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  hex: string;
  dot: string;
} {
  switch (level) {
    case 'Critical':
      return {
        bg: 'bg-red-50 text-red-700',
        text: 'text-red-700',
        border: 'border-red-300',
        hex: '#DC2626',
        dot: 'bg-red-600',
      };
    case 'High':
      return {
        bg: 'bg-orange-50 text-orange-700',
        text: 'text-orange-700',
        border: 'border-orange-300',
        hex: '#F97316',
        dot: 'bg-orange-500',
      };
    case 'Moderate':
      return {
        bg: 'bg-amber-50 text-amber-700',
        text: 'text-amber-700',
        border: 'border-amber-300',
        hex: '#F59E0B',
        dot: 'bg-amber-500',
      };
    case 'Low':
    default:
      return {
        bg: 'bg-emerald-50 text-emerald-700',
        text: 'text-emerald-700',
        border: 'border-emerald-300',
        hex: '#16A34A',
        dot: 'bg-emerald-500',
      };
  }
}

/**
 * Calculates single signal risk normalized from 0 to 100 based on baseline and current observation.
 */
export function calculateSignalRiskScore(
  current: number | null,
  baseline: number,
  criticalThresholdMultiplier: number = 1.7
): number | null {
  if (current === null || isNaN(current)) return null;
  if (baseline <= 0) return 0;

  const ratio = current / baseline;
  if (ratio <= 1.0) {
    // Within normal baseline (0 - 24)
    return Math.round(ratio * 24);
  } else if (ratio < 1.3) {
    // Mild elevation: 25 - 49
    return Math.round(25 + ((ratio - 1.0) / 0.3) * 24);
  } else if (ratio < criticalThresholdMultiplier) {
    // Significant elevation: 50 - 74
    return Math.round(50 + ((ratio - 1.3) / (criticalThresholdMultiplier - 1.3)) * 24);
  } else {
    // Critical breach: 75 - 100
    const overage = (ratio - criticalThresholdMultiplier) / 0.5;
    return Math.min(100, Math.round(75 + overage * 25));
  }
}

/**
 * Calculates Environmental Risk Score (combining Heat and Dust) normalized 0-100.
 */
export function calculateEnvironmentRiskScore(
  heatIndex: number | null,
  heatThreshold: number = 40,
  dustConc: number | null,
  dustThreshold: number = 150
): { score: number | null; heatScore: number | null; dustScore: number | null } {
  let heatScore: number | null = null;
  let dustScore: number | null = null;

  if (heatIndex !== null) {
    // Baseline safe heat is ~32°C, threshold 40°C, dangerous 46°C+
    const ratio = heatIndex / heatThreshold;
    heatScore = Math.min(100, Math.max(0, Math.round(ratio * 70)));
    if (heatIndex > heatThreshold) {
      heatScore = Math.min(100, 75 + Math.round(((heatIndex - heatThreshold) / 8) * 25));
    }
  }

  if (dustConc !== null) {
    // Normal dust is <75 µg/m³, threshold 150, critical 250+
    const ratio = dustConc / dustThreshold;
    dustScore = Math.min(100, Math.max(0, Math.round(ratio * 70)));
    if (dustConc > dustThreshold) {
      dustScore = Math.min(100, 75 + Math.round(((dustConc - dustThreshold) / 100) * 25));
    }
  }

  if (heatScore === null && dustScore === null) {
    return { score: null, heatScore: null, dustScore: null };
  }
  if (heatScore === null) return { score: dustScore, heatScore: null, dustScore };
  if (dustScore === null) return { score: heatScore, heatScore, dustScore: null };

  // Heat and Dust weighted equally for environmental component
  const envCombined = Math.round(heatScore * 0.5 + dustScore * 0.5);
  return { score: envCombined, heatScore, dustScore };
}

export interface CombinedRiskResult {
  score: number | null;
  riskLevel: RiskLevel | 'Insufficient Data';
  clinicRisk: number | null;
  absenceRisk: number | null;
  envRisk: number | null;
  effectiveWeights: { clinic: number; absence: number; environment: number };
  isDataSufficient: boolean;
  missingSignals: string[];
}

/**
 * Combined Risk Score with dynamic missing-data re-weighting
 * Formula: Combined = (Clinic × 0.35) + (Absence × 0.30) + (Env × 0.35)
 */
export function calculateCombinedRiskScore(
  obs: WeeklyObservation,
  customHeatMultiplier: number = 1.0,
  customDustMultiplier: number = 1.0
): CombinedRiskResult {
  const missingSignals: string[] = [];

  const clinicRisk = calculateSignalRiskScore(obs.clinicVisits, obs.clinicBaseline, 1.6);
  if (clinicRisk === null) missingSignals.push('Clinic Visits');

  const absenceRisk = calculateSignalRiskScore(obs.absenceRate, obs.absenceBaseline, 1.7);
  if (absenceRisk === null) missingSignals.push('Sickness Absence');

  const simulatedHeat = obs.heatIndex !== null ? obs.heatIndex * customHeatMultiplier : null;
  const simulatedDust = obs.dustConcentration !== null ? obs.dustConcentration * customDustMultiplier : null;

  const envObj = calculateEnvironmentRiskScore(
    simulatedHeat,
    obs.heatThreshold,
    simulatedDust,
    obs.dustThreshold
  );
  const envRisk = envObj.score;
  if (envRisk === null) missingSignals.push('Environmental Exposure');

  // Count available signals
  const availableSignals: { key: 'clinic' | 'absence' | 'environment'; weight: number; score: number }[] = [];
  if (clinicRisk !== null) availableSignals.push({ key: 'clinic', weight: RISK_WEIGHTS.clinic, score: clinicRisk });
  if (absenceRisk !== null) availableSignals.push({ key: 'absence', weight: RISK_WEIGHTS.absence, score: absenceRisk });
  if (envRisk !== null) availableSignals.push({ key: 'environment', weight: RISK_WEIGHTS.environment, score: envRisk });

  // If fewer than 2 signals available, mark as Insufficient Data
  if (availableSignals.length < 2) {
    return {
      score: null,
      riskLevel: 'Insufficient Data',
      clinicRisk,
      absenceRisk,
      envRisk,
      effectiveWeights: { clinic: 0, absence: 0, environment: 0 },
      isDataSufficient: false,
      missingSignals,
    };
  }

  // Proportionally re-weight active signals
  const totalWeight = availableSignals.reduce((sum, s) => sum + s.weight, 0);
  const effectiveWeights = { clinic: 0, absence: 0, environment: 0 };

  let combined = 0;
  for (const s of availableSignals) {
    const adjustedWeight = s.weight / totalWeight;
    effectiveWeights[s.key] = Math.round(adjustedWeight * 100) / 100;
    combined += s.score * adjustedWeight;
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(combined)));

  return {
    score: finalScore,
    riskLevel: getRiskLevel(finalScore),
    clinicRisk,
    absenceRisk,
    envRisk,
    effectiveWeights,
    isDataSufficient: true,
    missingSignals,
  };
}

/**
 * Computes EWMA control chart series for a given signal time-series
 */
export function computeEWMA(
  values: (number | null)[],
  baseline: number,
  lambda: number = 0.2,
  L: number = 3.0
): { ewma: (number | null)[]; ucl: number[]; alert: boolean[] } {
  let prevZ = baseline;
  const std = Math.max(2, baseline * 0.18); // estimated standard deviation

  const ewma: (number | null)[] = [];
  const ucl: number[] = [];
  const alert: boolean[] = [];

  for (let t = 0; t < values.length; t++) {
    const val = values[t];
    if (val === null) {
      ewma.push(null);
      ucl.push(baseline + L * std);
      alert.push(false);
      continue;
    }

    const currentZ = lambda * val + (1 - lambda) * prevZ;
    prevZ = currentZ;

    // Time-varying UCL
    const factor = Math.sqrt((lambda / (2 - lambda)) * (1 - Math.pow(1 - lambda, 2 * (t + 1))));
    const limit = baseline + L * std * factor;

    ewma.push(Math.round(currentZ * 10) / 10);
    ucl.push(Math.round(limit * 10) / 10);
    alert.push(currentZ > limit);
  }

  return { ewma, ucl, alert };
}

/**
 * Computes CUSUM control chart series
 */
export function computeCUSUM(
  values: (number | null)[],
  baseline: number,
  k: number = 0.5,
  h: number = 4.5
): { cusum: (number | null)[]; threshold: number; alert: boolean[] } {
  const std = Math.max(2, baseline * 0.18);
  const slackK = k * std;
  const decisionIntervalH = h * std;

  let prevS = 0;
  const cusum: (number | null)[] = [];
  const alert: boolean[] = [];

  for (let t = 0; t < values.length; t++) {
    const val = values[t];
    if (val === null) {
      cusum.push(null);
      alert.push(false);
      continue;
    }

    const s = Math.max(0, prevS + (val - baseline - slackK));
    prevS = s;

    cusum.push(Math.round(s * 10) / 10);
    alert.push(s > decisionIntervalH);
  }

  return { cusum, threshold: Math.round(decisionIntervalH * 10) / 10, alert };
}
