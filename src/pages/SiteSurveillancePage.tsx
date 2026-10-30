import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Calendar,
  Thermometer,
  Wind,
  Activity,
  AlertTriangle,
  Download,
  Info,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { AlgorithmType, Language, Site, UserRole } from '../types';
import { useTranslation } from '../translations/strings';
import { RiskBadge } from '../components/common/RiskBadge';
import { RiskGauge } from '../components/common/RiskGauge';
import { CompletenessBadge } from '../components/common/CompletenessBadge';
import { formatSmallCellCount, getSafeCountTooltip } from '../utils/privacy';
import {
  calculateCombinedRiskScore,
  computeCUSUM,
  computeEWMA,
  RISK_WEIGHTS,
} from '../utils/detectionEngine';

interface SiteSurveillancePageProps {
  lang: Language;
  role: UserRole;
  sites: Site[];
  selectedSiteId: string;
  onSelectSiteId: (id: string) => void;
  selectedAlgorithm: AlgorithmType;
  onSelectAlgorithm: (algo: AlgorithmType) => void;
  onOpenAlert: (alertId: string) => void;
}

export const SiteSurveillancePage: React.FC<SiteSurveillancePageProps> = ({
  lang,
  role,
  sites,
  selectedSiteId,
  onSelectSiteId,
  selectedAlgorithm,
  onSelectAlgorithm,
  onOpenAlert,
}) => {
  const t = useTranslation(lang);

  const currentSite = sites.find((s) => s.id === selectedSiteId) || sites[0];
  const latestObs = currentSite.weeklyData[currentSite.weeklyData.length - 1];
  const combinedRisk = calculateCombinedRiskScore(latestObs);

  // Prepare 26-week series for EWMA and CUSUM
  const clinicValues = currentSite.weeklyData.map((w) => w.clinicVisits);
  const ewmaResult = computeEWMA(clinicValues, latestObs.clinicBaseline);
  const cusumResult = computeCUSUM(clinicValues, latestObs.clinicBaseline);

  // Combine charts dataset
  const chartData = currentSite.weeklyData.map((obs, idx) => ({
    week: `W${obs.week}`,
    weekNum: obs.week,
    clinicVisits: obs.clinicVisits,
    clinicBaseline: obs.clinicBaseline,
    absenceRate: obs.absenceRate,
    absenceBaseline: obs.absenceBaseline,
    heatIndex: obs.heatIndex,
    heatThreshold: obs.heatThreshold,
    dustConcentration: obs.dustConcentration,
    dustThreshold: obs.dustThreshold,
    ewmaVal: ewmaResult.ewma[idx],
    ewmaUcl: ewmaResult.ucl[idx],
    cusumVal: cusumResult.cusum[idx],
    cusumThreshold: cusumResult.threshold,
    isIncident: obs.groundTruthIncident,
  }));

  // Public view site label
  const siteDisplayName =
    role === 'public'
      ? `${currentSite.occupation} Facility (${currentSite.region.split(',')[1]?.trim() || 'Regional Site'})`
      : lang === 'hi'
      ? currentSite.nameHi
      : currentSite.name;

  return (
    <div className="space-y-6">
      {/* Site Selector & Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {siteDisplayName}
              </h2>
              <RiskBadge level={combinedRisk.riskLevel} score={combinedRisk.score} size="md" />
              <CompletenessBadge pct={currentSite.dataCompletenessPct} status={currentSite.completenessStatus} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'hi' ? currentSite.regionHi : currentSite.region} |{' '}
              <span className="font-semibold text-slate-700">{currentSite.occupation}</span> |{' '}
              ~{currentSite.workerCountApprox} workers
            </p>
          </div>
        </div>

        {/* Site Dropdown Selector */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {t('filter_site')}:
          </label>
          <select
            value={currentSite.id}
            onChange={(e) => onSelectSiteId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {role === 'public' ? `${s.occupation} (${s.id})` : lang === 'hi' ? s.nameHi : s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Split: Risk Calculation Breakdown & Combined Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Gauge Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {t('risk_score')} (Week {latestObs.week})
          </span>
          <RiskGauge score={combinedRisk.score} size={130} />
          <div className="mt-4 text-xs text-slate-500 max-w-xs">
            {combinedRisk.isDataSufficient ? (
              <span>
                Weighted combination of active surveillance streams. Threshold 75 triggers critical alert.
              </span>
            ) : (
              <span className="text-amber-600 font-semibold">
                ⚠️ Insufficient streams reporting to establish a reliable risk score.
              </span>
            )}
          </div>
        </div>

        {/* Formula Weights & Missing-Data Re-weighting */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Multi-Stream Weighting & Mathematical Formulation</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">Scale 0 - 100</span>
            </div>

            <div className="mt-3 bg-slate-50 rounded-xl p-3 text-xs font-mono text-slate-700 leading-relaxed border border-slate-200">
              Combined Score = (Clinic Risk × {combinedRisk.effectiveWeights.clinic}) + (Absence Risk ×{' '}
              {combinedRisk.effectiveWeights.absence}) + (Env Risk × {combinedRisk.effectiveWeights.environment})
            </div>

            {/* Signal component breakdown bars */}
            <div className="mt-4 space-y-2.5">
              {/* Clinic Component */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-purple-700">{t('clinic_visits')} Component (Risk: {combinedRisk.clinicRisk ?? 'Missing'})</span>
                  <span className="text-slate-500">Weight: {Math.round(combinedRisk.effectiveWeights.clinic * 100)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${combinedRisk.clinicRisk ?? 0}%` }}
                  />
                </div>
              </div>

              {/* Sickness Absence Component */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-700">{t('sickness_absence')} Component (Risk: {combinedRisk.absenceRisk ?? 'Missing'})</span>
                  <span className="text-slate-500">Weight: {Math.round(combinedRisk.effectiveWeights.absence * 100)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${combinedRisk.absenceRisk ?? 0}%` }}
                  />
                </div>
              </div>

              {/* Environmental Component */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-teal-700">{t('environment')} Component (Risk: {combinedRisk.envRisk ?? 'Missing'})</span>
                  <span className="text-slate-500">Weight: {Math.round(combinedRisk.effectiveWeights.environment * 100)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full transition-all duration-500"
                    style={{ width: `${combinedRisk.envRisk ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Missing data caveat message */}
          {combinedRisk.missingSignals.length > 0 && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Data Notice:</strong> {combinedRisk.missingSignals.join(', ')} missing for Week{' '}
                {latestObs.week}. Weights have been proportionally reallocated across remaining signals.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Module A: Clinic Visits Surveillance Module */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              <span>Signal A: Aggregated Clinic Visits</span>
            </h3>
            <p className="text-xs text-slate-500">
              Historical baseline: {latestObs.clinicBaseline} visits/week | Current: {formatSmallCellCount(latestObs.clinicVisits)} visits
              ({latestObs.clinicChangePct !== null ? `${latestObs.clinicChangePct > 0 ? `+${latestObs.clinicChangePct}%` : `${latestObs.clinicChangePct}%`}` : 'Missing'})
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-purple-50 text-purple-700 border border-purple-200 self-start sm:self-auto">
            Small-Cell Protection Enforced
          </span>
        </div>

        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                }}
                formatter={(val: any, name?: any) => {
                  const label = name ? String(name) : '';
                  if (val === null) return ['Suppressed / Missing', label];
                  return [formatSmallCellCount(val), label];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine y={latestObs.clinicBaseline} stroke="#94A3B8" strokeDasharray="3 3" label="Baseline" />
              <Line
                type="monotone"
                dataKey="clinicVisits"
                name={t('clinic_visits')}
                stroke="#7C3AED"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#7C3AED' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Module B: Sickness Absence Surveillance Module */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Signal B: Sickness Absence Rate</span>
            </h3>
            <p className="text-xs text-slate-500">
              Historical baseline: {latestObs.absenceBaseline}% | Current observation: {latestObs.absenceRate}%
              ({latestObs.absenceChangePct !== null ? `${latestObs.absenceChangePct > 0 ? `+${latestObs.absenceChangePct}%` : `${latestObs.absenceChangePct}%`}` : 'Missing'})
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200 self-start sm:self-auto">
            Aggregated Workforce Rate (%)
          </span>
        </div>

        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${val}%`, 'Absence Rate']}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine y={latestObs.absenceBaseline} stroke="#94A3B8" strokeDasharray="3 3" label="Baseline" />
              <Line
                type="monotone"
                dataKey="absenceRate"
                name={`${t('sickness_absence')} (%)`}
                stroke="#F59E0B"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#F59E0B' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Module C: Environmental Exposure (Heat and Dust) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
              <span>Signal C: Environmental Exposure (Heat & Respirable Dust)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Heat Index Limit: {latestObs.heatThreshold}°C | Respirable Dust (PM10) Safety Threshold: {latestObs.dustThreshold} µg/m³
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-teal-50 text-teal-700 border border-teal-200 self-start sm:self-auto">
            Telemetry & Tele-monitoring
          </span>
        </div>

        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#EF4444" fontSize={11} tickLine={false} unit="°C" domain={[20, 50]} />
              <YAxis yAxisId="right" orientation="right" stroke="#0F766E" fontSize={11} tickLine={false} unit="µg" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine yAxisId="left" y={40} stroke="#EF4444" strokeDasharray="4 4" label="Heat Limit (40°C)" />
              <ReferenceLine yAxisId="right" y={150} stroke="#0F766E" strokeDasharray="4 4" label="Dust Limit (150 µg)" />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="heatIndex"
                name={`${t('heat_exposure')} (°C)`}
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ r: 3, fill: '#EF4444' }}
                connectNulls={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="dustConcentration"
                name={`${t('dust_exposure')} (µg/m³)`}
                stroke="#0F766E"
                strokeWidth={2}
                dot={{ r: 3, fill: '#0F766E' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Early Warning Detection Engine: EWMA & CUSUM Statistical Control Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Statistical Early Warning Detection Engine ({selectedAlgorithm})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Demonstration of {selectedAlgorithm === 'EWMA' ? 'Exponentially Weighted Moving Average (λ=0.2, L=3.0)' : 'Cumulative Sum Control Chart (k=0.5, h=4.5)'}
              {' '}on site-level surveillance streams.
            </p>
          </div>

          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto border border-slate-200">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectAlgorithm('EWMA')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedAlgorithm === 'EWMA'
                  ? 'bg-[#0E2A47] text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              EWMA Chart
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectAlgorithm('CUSUM')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedAlgorithm === 'CUSUM'
                  ? 'bg-[#0E2A47] text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              CUSUM Chart
            </motion.button>
          </div>
        </div>

        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />

              {selectedAlgorithm === 'EWMA' ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="ewmaVal"
                    name="EWMA Smoothed Statistic (Z_t)"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#2563EB' }}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="ewmaUcl"
                    name="Upper Control Limit (UCL)"
                    stroke="#DC2626"
                    strokeWidth={1.8}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </>
              ) : (
                <>
                  <Line
                    type="monotone"
                    dataKey="cusumVal"
                    name="Cumulative Sum Statistic (S_t)"
                    stroke="#0F766E"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#0F766E' }}
                  />
                  <ReferenceLine
                    y={chartData[0]?.cusumThreshold || 12}
                    stroke="#DC2626"
                    strokeDasharray="4 4"
                    label="Decision Threshold H"
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
