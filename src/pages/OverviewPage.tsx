import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  BellRing,
  AlertTriangle,
  Database,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Calendar,
  ExternalLink,
  Thermometer,
  Wind,
  Users,
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
  AreaChart,
  Area,
} from 'recharts';
import {
  AlgorithmType,
  Language,
  Occupation,
  RiskLevel,
  Site,
  UserRole,
} from '../types';
import { useTranslation } from '../translations/strings';
import { FilterBar } from '../components/common/FilterBar';
import { RiskBadge } from '../components/common/RiskBadge';
import { CompletenessBadge } from '../components/common/CompletenessBadge';
import { formatSmallCellCount, getSafeCountTooltip } from '../utils/privacy';
import { calculateCombinedRiskScore } from '../utils/detectionEngine';

interface OverviewPageProps {
  lang: Language;
  role: UserRole;
  sites: Site[];
  onSelectSite: (siteId: string) => void;
  onOpenAlert: (alertId: string) => void;
  selectedAlgorithm: AlgorithmType;
  onSelectAlgorithm: (algo: AlgorithmType) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  lang,
  role,
  sites,
  onSelectSite,
  onOpenAlert,
  selectedAlgorithm,
  onSelectAlgorithm,
}) => {
  const t = useTranslation(lang);

  // Filters state
  const [selectedSiteId, setSelectedSiteId] = useState<string>('All');
  const [selectedOccupation, setSelectedOccupation] = useState<Occupation | 'All'>('All');
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | 'All'>('All');
  const [selectedSignalTab, setSelectedSignalTab] = useState<'all' | 'clinic' | 'absence' | 'env'>('all');

  // Filter sites logic
  const filteredSites = sites.filter((site) => {
    if (selectedSiteId !== 'All' && site.id !== selectedSiteId) return false;
    if (selectedOccupation !== 'All' && site.occupation !== selectedOccupation) return false;

    // Calculate current risk score from latest observation
    const latestObs = site.weeklyData[site.weeklyData.length - 1];
    const riskResult = calculateCombinedRiskScore(latestObs);

    if (selectedRisk !== 'All' && riskResult.riskLevel !== selectedRisk) return false;
    return true;
  });

  // Calculate aggregated KPIs
  const totalMonitoredSites = sites.length;
  const activeAlertsCount = 5; // from mock alerts
  const highRiskSitesCount = sites.filter((s) => {
    const latestObs = s.weeklyData[s.weeklyData.length - 1];
    const res = calculateCombinedRiskScore(latestObs);
    return res.riskLevel === 'High' || res.riskLevel === 'Critical';
  }).length;
  const avgCompleteness = Math.round(
    sites.reduce((acc, s) => acc + s.dataCompletenessPct, 0) / sites.length
  );
  const totalWorkersCohort = sites.reduce((acc, s) => acc + s.workerCountApprox, 0);

  // Synthesize aggregated 26-week trend data across filtered sites
  const aggregatedWeeklyTrend = Array.from({ length: 26 }, (_, idx) => {
    const weekNum = idx + 1;
    let sumClinic = 0;
    let validClinicCount = 0;
    let sumAbsence = 0;
    let validAbsenceCount = 0;
    let sumHeat = 0;
    let validHeatCount = 0;
    let sumDust = 0;
    let validDustCount = 0;

    const targetSites = filteredSites.length > 0 ? filteredSites : sites;

    targetSites.forEach((s) => {
      const obs = s.weeklyData.find((w) => w.week === weekNum);
      if (obs) {
        if (obs.clinicVisits !== null) {
          sumClinic += obs.clinicVisits;
          validClinicCount++;
        }
        if (obs.absenceRate !== null) {
          sumAbsence += obs.absenceRate;
          validAbsenceCount++;
        }
        if (obs.heatIndex !== null) {
          sumHeat += obs.heatIndex;
          validHeatCount++;
        }
        if (obs.dustConcentration !== null) {
          sumDust += obs.dustConcentration;
          validDustCount++;
        }
      }
    });

    const avgClinic = validClinicCount > 0 ? Math.round(sumClinic / validClinicCount) : null;
    const avgAbsence = validAbsenceCount > 0 ? Math.round((sumAbsence / validAbsenceCount) * 10) / 10 : null;
    const avgHeat = validHeatCount > 0 ? Math.round((sumHeat / validHeatCount) * 10) / 10 : null;
    const avgDust = validDustCount > 0 ? Math.round(sumDust / validDustCount) : null;

    return {
      week: `W${weekNum}`,
      weekNum,
      clinicVisits: avgClinic,
      absenceRate: avgAbsence,
      heatIndex: avgHeat,
      dustConcentration: avgDust,
    };
  });

  const handleResetFilters = () => {
    setSelectedSiteId('All');
    setSelectedOccupation('All');
    setSelectedRisk('All');
    onSelectAlgorithm('EWMA');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {t('nav_overview')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {role === 'public'
              ? 'Aggregated population-level health surveillance and regional risk tracking.'
              : 'Real-time multi-stream occupational surveillance across active industrial cohorts.'}
          </p>
        </div>

        {/* Small-cell privacy badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Small-Cell Suppression Active (&lt;5 hidden)</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Monitored Sites */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('kpi_monitored_sites')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {totalMonitoredSites}
            </span>
            <span className="text-xs text-slate-500 font-medium">sites</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-400" />
            ~{totalWorkersCohort.toLocaleString()} {t('kpi_target_population')}
          </p>
        </div>

        {/* KPI 2: Active Alerts */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('kpi_active_alerts')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-red-600">
              {activeAlertsCount}
            </span>
            <span className="text-xs font-semibold text-red-600">active</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            2 critical breaches requiring immediate inspection
          </p>
        </div>

        {/* KPI 3: High-Risk Sites */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('kpi_high_risk_sites')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-orange-600">
              {highRiskSitesCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ {totalMonitoredSites} total</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Triggered by dust and heat exposure surges
          </p>
        </div>

        {/* KPI 4: Data Completeness */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('kpi_data_completeness')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
              {avgCompleteness}%
            </span>
            <CompletenessBadge pct={avgCompleteness} showPercent={false} />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {t('missing_signal_warning')}
          </p>
        </div>
      </div>

      {/* Filter Bar Component */}
      <FilterBar
        lang={lang}
        sites={sites}
        selectedSiteId={selectedSiteId}
        onSelectSiteId={setSelectedSiteId}
        selectedOccupation={selectedOccupation}
        onSelectOccupation={setSelectedOccupation}
        selectedRisk={selectedRisk}
        onSelectRisk={setSelectedRisk}
        selectedAlgorithm={selectedAlgorithm}
        onSelectAlgorithm={onSelectAlgorithm}
        onReset={handleResetFilters}
      />

      {/* Multi-Stream Surveillance Charts Card */}
      <div className="bg-white/92 backdrop-blur-md rounded-2xl p-5 border border-white/70 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#0E2A47] flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-700" />
              <span>Multi-Stream Surveillance Trends (26 Weeks)</span>
            </h3>
            <p className="text-xs text-slate-600">
              Weekly aggregated trends across clinic visits, sickness absence rate, heat index, and respirable dust.
            </p>
          </div>

          {/* Chart Signal Filter Tabs with motion & high contrast */}
          <div className="flex items-center bg-white/90 p-1 rounded-xl text-xs font-bold border border-slate-300 shadow-2xs self-start sm:self-auto gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedSignalTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedSignalTab === 'all'
                  ? 'bg-[#0E2A47] text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:text-[#0E2A47]'
              }`}
            >
              All Signals
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedSignalTab('clinic')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedSignalTab === 'clinic'
                  ? 'bg-[#0E2A47] text-white shadow-xs font-bold'
                  : 'text-purple-700 hover:text-purple-900'
              }`}
            >
              Clinic Visits
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedSignalTab('absence')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedSignalTab === 'absence'
                  ? 'bg-[#0E2A47] text-white shadow-xs font-bold'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              Absence (%)
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedSignalTab('env')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedSignalTab === 'env'
                  ? 'bg-[#0E2A47] text-white shadow-xs font-bold'
                  : 'text-teal-700 hover:text-teal-900'
              }`}
            >
              Heat & Dust
            </motion.button>
          </div>
        </div>

        {/* Recharts Trend Line Display */}
        <div className="mt-4 h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={aggregatedWeeklyTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                formatter={(value: any, name?: any) => {
                  const label = name ? String(name) : '';
                  if (value === null || value === undefined) return ['Data Missing / Suppressed', label];
                  if (label.includes('Clinic')) return [formatSmallCellCount(value), label];
                  if (label.includes('Absence')) return [`${value}%`, label];
                  if (label.includes('Heat')) return [`${value}°C`, label];
                  if (label.includes('Dust')) return [`${value} µg/m³`, label];
                  return [value, label];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

              {(selectedSignalTab === 'all' || selectedSignalTab === 'clinic') && (
                <Line
                  type="monotone"
                  dataKey="clinicVisits"
                  name={t('clinic_visits')}
                  stroke="#7C3AED"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#7C3AED' }}
                  connectNulls={false}
                />
              )}

              {(selectedSignalTab === 'all' || selectedSignalTab === 'absence') && (
                <Line
                  type="monotone"
                  dataKey="absenceRate"
                  name={`${t('sickness_absence')} (%)`}
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#F59E0B' }}
                  connectNulls={false}
                />
              )}

              {(selectedSignalTab === 'all' || selectedSignalTab === 'env') && (
                <>
                  <Line
                    type="monotone"
                    dataKey="heatIndex"
                    name={`${t('heat_exposure')} (°C)`}
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="dustConcentration"
                    name={`${t('dust_exposure')} (µg/m³)`}
                    stroke="#0F766E"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Site Surveillance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Site Surveillance Overview ({filteredSites.length})
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated site-week observations with dynamic missing-data re-weighting and small-cell suppression.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">{t('col_site')}</th>
                <th className="py-3 px-4">{t('col_occupation')}</th>
                <th className="py-3 px-4">{t('col_clinic')}</th>
                <th className="py-3 px-4">{t('col_absence')}</th>
                <th className="py-3 px-4">{t('col_environment')}</th>
                <th className="py-3 px-4">{t('col_risk_score')}</th>
                <th className="py-3 px-4">{t('col_risk_level')}</th>
                <th className="py-3 px-4">{t('col_completeness')}</th>
                <th className="py-3 px-4 text-right">{t('col_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSites.map((site) => {
                const latestObs = site.weeklyData[site.weeklyData.length - 1];
                const riskResult = calculateCombinedRiskScore(latestObs);

                // For Public Viewer role: Anonymize or provide general regional label
                const displayName =
                  role === 'public'
                    ? `${site.occupation} Facility (${site.region.split(',')[1]?.trim() || 'Regional Site'})`
                    : lang === 'hi'
                    ? site.nameHi
                    : site.name;

                return (
                  <tr
                    key={site.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectSite(site.id)}
                  >
                    {/* Site Name & Region */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="group-hover:text-blue-600 transition-colors">{displayName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {lang === 'hi' ? site.regionHi : site.region}
                      </span>
                    </td>

                    {/* Occupation */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {site.occupation}
                      </span>
                    </td>

                    {/* Clinic Visits with Small-Cell Suppression */}
                    <td className="py-3.5 px-4">
                      {latestObs.clinicVisits === null ? (
                        <span className="text-slate-400 italic">Missing</span>
                      ) : (
                        <div>
                          <span
                            className="font-bold font-mono text-slate-800"
                            title={getSafeCountTooltip(latestObs.clinicVisits)}
                          >
                            {formatSmallCellCount(latestObs.clinicVisits)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            (base: {latestObs.clinicBaseline})
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Sickness Absence */}
                    <td className="py-3.5 px-4">
                      {latestObs.absenceRate === null ? (
                        <span className="text-slate-400 italic">Missing</span>
                      ) : (
                        <div>
                          <span className="font-bold font-mono text-slate-800">
                            {latestObs.absenceRate}%
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            (base: {latestObs.absenceBaseline}%)
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Environmental Exposure */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Thermometer className="w-3 h-3 text-red-500" />
                          <span className="font-medium text-slate-700">
                            {latestObs.heatIndex !== null ? `${latestObs.heatIndex}°C` : '—'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px]">
                          <Wind className="w-3 h-3 text-teal-600" />
                          <span className="font-medium text-slate-700">
                            {latestObs.dustConcentration !== null ? `${latestObs.dustConcentration} µg/m³` : '—'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Combined Risk Score */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {riskResult.score !== null ? `${riskResult.score}/100` : '—'}
                    </td>

                    {/* Risk Level Badge */}
                    <td className="py-3.5 px-4">
                      <RiskBadge level={riskResult.riskLevel} score={riskResult.score} size="sm" />
                    </td>

                    {/* Data Completeness */}
                    <td className="py-3.5 px-4">
                      <CompletenessBadge pct={site.dataCompletenessPct} status={site.completenessStatus} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSite(site.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E2A47] hover:bg-[#163B61] text-white text-xs font-bold shadow-xs shadow-[#0E2A47]/20 transition-all cursor-pointer"
                      >
                        <span>{t('view_details')}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-teal-300" />
                      </motion.button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
