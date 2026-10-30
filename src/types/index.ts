export type UserRole = 'health_officer' | 'inspector' | 'public';

export type Language = 'en' | 'hi';

export type Occupation =
  | 'Agriculture'
  | 'Quarry and Mining'
  | 'Waste Management'
  | 'Textile'
  | 'Construction';

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export type AlgorithmType = 'EWMA' | 'CUSUM';

export type CompletenessStatus = 'Complete' | 'Partial' | 'Incomplete';

export interface WeeklyObservation {
  week: number;
  dateRange: string;
  // Clinic Visits
  clinicVisits: number | null; // null if missing
  clinicBaseline: number;
  clinicChangePct: number | null;
  clinicAlert: boolean;
  // Sickness Absence
  absenceRate: number | null; // percentage e.g. 8.4%
  absenceBaseline: number;
  absenceChangePct: number | null;
  absenceAlert: boolean;
  // Environmental Signals
  heatIndex: number | null; // in °C / Heat Index
  heatThreshold: number; // 40°C
  heatAlert: boolean;
  dustConcentration: number | null; // µg/m³ PM10
  dustThreshold: number; // 150 µg/m³
  dustAlert: boolean;
  // Statistical outputs
  ewmaScore: number;
  cusumScore: number;
  // Ground truth for backtesting
  groundTruthIncident?: boolean;
}

export interface Site {
  id: string;
  name: string;
  nameHi: string;
  region: string;
  regionHi: string;
  occupation: Occupation;
  workerCountApprox: number;
  assignedInspector: string;
  healthOfficerContact: string;
  latitude: number;
  longitude: number;
  weeklyData: WeeklyObservation[];
  dataCompletenessPct: number;
  completenessStatus: CompletenessStatus;
  missingSignalsSummary: string[];
}

export interface ContributingSignal {
  name: string;
  nameHi: string;
  currentValue: string;
  baselineValue: string;
  changePct: number | null;
  severity: RiskLevel;
  signalWeight: number; // e.g. 0.35
  description: string;
  descriptionHi: string;
}

export interface ActionRecommendation {
  id: string;
  action: string;
  actionHi: string;
  responsibleRole: 'Health Officer' | 'Site Inspector' | 'Joint Team';
  responsibleRoleHi: string;
  priority: 'Immediate' | 'High' | 'Medium';
  timeframe: string;
  timeframeHi: string;
  supportingEvidence: string;
  supportingEvidenceHi: string;
}

export interface Alert {
  id: string;
  siteId: string;
  siteName: string;
  siteNameHi: string;
  occupation: Occupation;
  weekDetected: number;
  dateDetected: string;
  alertLevel: RiskLevel;
  combinedRiskScore: number;
  detectionAlgorithm: AlgorithmType;
  primaryContributingSignal: string;
  primaryContributingSignalHi: string;
  contributingSignals: ContributingSignal[];
  explanationEn: string;
  explanationHi: string;
  plainSummaryEn: string;
  plainSummaryHi: string;
  recommendations: ActionRecommendation[];
  dataQualityNotes: string;
  dataQualityNotesHi: string;
  status: 'Open' | 'Under Investigation' | 'Mitigated' | 'Dismissed';
}

export interface BacktestMetrics {
  leadTimeWeeks: number;
  sensitivityPct: number;
  ppvPct: number;
  falseAlarmRatePct: number;
  totalReferenceEvents: number;
  detectedEvents: number;
  missedEvents: number;
  falseAlarmsCount: number;
  trueNegativesCount: number;
  evaluationWindowWeeks: number;
}
