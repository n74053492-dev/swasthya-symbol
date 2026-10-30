import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  SlidersHorizontal,
  RotateCcw,
  Thermometer,
  Wind,
  Activity,
  AlertTriangle,
  Info,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Language, Site, UserRole } from '../types';
import { useTranslation } from '../translations/strings';
import { RiskBadge } from '../components/common/RiskBadge';
import { RiskGauge } from '../components/common/RiskGauge';
import {
  calculateCombinedRiskScore,
  calculateEnvironmentRiskScore,
} from '../utils/detectionEngine';

interface WhatIfPageProps {
  lang: Language;
  role: UserRole;
  sites: Site[];
  selectedSiteId: string;
  onSelectSiteId: (id: string) => void;
}

export const WhatIfPage: React.FC<WhatIfPageProps> = ({
  lang,
  role,
  sites,
  selectedSiteId,
  onSelectSiteId,
}) => {
  const t = useTranslation(lang);

  // Sliders state (-50% to +100%)
  const [heatDeltaPct, setHeatDeltaPct] = useState<number>(0);
  const [dustDeltaPct, setDustDeltaPct] = useState<number>(0);

  const currentSite = sites.find((s) => s.id === selectedSiteId) || sites[0];
  const latestObs = currentSite.weeklyData[currentSite.weeklyData.length - 1];

  // Baseline calculation (multiplier 1.0)
  const baselineResult = calculateCombinedRiskScore(latestObs, 1.0, 1.0);

  // Simulated calculation
  const heatMultiplier = 1.0 + heatDeltaPct / 100;
  const dustMultiplier = 1.0 + dustDeltaPct / 100;
  const simulatedResult = calculateCombinedRiskScore(latestObs, heatMultiplier, dustMultiplier);

  // Environmental breakdown scores
  const simHeatVal = latestObs.heatIndex !== null ? Math.round(latestObs.heatIndex * heatMultiplier * 10) / 10 : null;
  const simDustVal = latestObs.dustConcentration !== null ? Math.round(latestObs.dustConcentration * dustMultiplier) : null;

  const baselineEnv = calculateEnvironmentRiskScore(
    latestObs.heatIndex,
    latestObs.heatThreshold,
    latestObs.dustConcentration,
    latestObs.dustThreshold
  );
  const simulatedEnv = calculateEnvironmentRiskScore(
    simHeatVal,
    latestObs.heatThreshold,
    simDustVal,
    latestObs.dustThreshold
  );

  const handleReset = () => {
    setHeatDeltaPct(0);
    setDustDeltaPct(0);
  };

  const displayName =
    role === 'public'
      ? `${currentSite.occupation} Facility (${currentSite.id})`
      : lang === 'hi'
      ? currentSite.nameHi
      : currentSite.name;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <SlidersHorizontal className="w-6 h-6 text-teal-600" />
            <span>{t('what_if_title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('what_if_desc')}
          </p>
        </div>

        {/* Site Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto text-xs">
          <span className="font-semibold text-slate-500">{t('filter_site')}:</span>
          <select
            value={currentSite.id}
            onChange={(e) => onSelectSiteId(e.target.value)}
            className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {role === 'public' ? `${s.occupation} (${s.id})` : lang === 'hi' ? s.nameHi : s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prominent Mandatory Disclaimer Banner */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>{t('simulation_disclaimer')}</strong>{' '}
          All adjustments calculate simulated risk responses based on linear environmental exposure indices. This tool demonstrates surveillance sensitivity for proactive engineering controls (e.g. water-mist sprays, shift adjustments, cooling shelters).
        </div>
      </div>

      {/* Main Simulation Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Control Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/60 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Environmental Stressor Adjusters</span>
              </h3>
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0E2A47] hover:bg-[#163B61] px-2.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                title={t('reset_simulation')}
              >
                <RotateCcw className="w-3 h-3 text-teal-300" />
                <span>{t('reset_simulation')}</span>
              </motion.button>
            </div>

            {/* Slider 1: Heat Exposure */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span>{t('slider_heat')}</span>
                </span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded ${
                    heatDeltaPct > 0
                      ? 'bg-red-50 text-red-700'
                      : heatDeltaPct < 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {heatDeltaPct > 0 ? `+${heatDeltaPct}%` : `${heatDeltaPct}%`}
                </span>
              </div>
              <input
                type="range"
                min={-50}
                max={100}
                step={5}
                value={heatDeltaPct}
                onChange={(e) => setHeatDeltaPct(parseInt(e.target.value, 10))}
                className="w-full accent-red-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-50% (Mitigation)</span>
                <span>0% (Baseline)</span>
                <span>+100% (Heatwave)</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 flex justify-between">
                <span>Simulated Heat Index:</span>
                <strong className="font-mono text-slate-900">
                  {simHeatVal !== null ? `${simHeatVal}°C` : 'N/A'}{' '}
                  <span className="text-[10px] text-slate-400">
                    (Base: {latestObs.heatIndex ?? 'N/A'}°C)
                  </span>
                </strong>
              </div>
            </div>

            {/* Slider 2: Dust Exposure */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Wind className="w-4 h-4 text-teal-600" />
                  <span>{t('slider_dust')}</span>
                </span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded ${
                    dustDeltaPct > 0
                      ? 'bg-red-50 text-red-700'
                      : dustDeltaPct < 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {dustDeltaPct > 0 ? `+${dustDeltaPct}%` : `${dustDeltaPct}%`}
                </span>
              </div>
              <input
                type="range"
                min={-50}
                max={100}
                step={5}
                value={dustDeltaPct}
                onChange={(e) => setDustDeltaPct(parseInt(e.target.value, 10))}
                className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-50% (Water misting)</span>
                <span>0% (Baseline)</span>
                <span>+100% (Crushing surge)</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 flex justify-between">
                <span>Simulated Dust Conc:</span>
                <strong className="font-mono text-slate-900">
                  {simDustVal !== null ? `${simDustVal} µg/m³` : 'N/A'}{' '}
                  <span className="text-[10px] text-slate-400">
                    (Base: {latestObs.dustConcentration ?? 'N/A'})
                  </span>
                </strong>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-500 border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-700 block">Surveillance Guidance:</span>
            <p>
              Simulating a <strong>-30%</strong> reduction in dust represents the deployment of automated water-mist suppression nozzles.
            </p>
          </div>
        </div>

        {/* Results Comparison Side-by-Side (7 cols) */}
        <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t('baseline_vs_simulated')}
                </h3>
                <p className="text-xs text-slate-500">
                  Target site: <strong className="text-slate-800">{displayName}</strong>
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                Live Recalculation Active
              </span>
            </div>

            {/* Side by side comparison cards */}
            <div className="mt-5 grid grid-cols-2 gap-4">
              {/* Baseline Scenario */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col items-center text-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Actual Baseline (W{latestObs.week})
                </span>
                <RiskGauge score={baselineResult.score} size={110} />
                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div>
                    Env Risk: <strong>{baselineEnv.score ?? 'N/A'}/100</strong>
                  </div>
                  <div>
                    Combined Score: <strong>{baselineResult.score}/100</strong>
                  </div>
                </div>
              </div>

              {/* Simulated Scenario */}
              <div
                className={`rounded-2xl p-4 border flex flex-col items-center text-center transition-colors ${
                  simulatedResult.riskLevel === 'Critical'
                    ? 'bg-red-50/70 border-red-200'
                    : simulatedResult.riskLevel === 'High'
                    ? 'bg-orange-50/70 border-orange-200'
                    : 'bg-teal-50/70 border-teal-200'
                }`}
              >
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Simulated Scenario
                </span>
                <RiskGauge score={simulatedResult.score} size={110} />
                <div className="mt-3 space-y-1 text-xs text-slate-700">
                  <div>
                    Simulated Env Risk: <strong>{simulatedEnv.score ?? 'N/A'}/100</strong>
                  </div>
                  <div>
                    Simulated Score: <strong>{simulatedResult.score}/100</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Delta Impact Statement */}
            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Simulation Impact Summary:</span>
              </div>
              <p className="text-slate-700">
                Adjusting heat by {heatDeltaPct >= 0 ? `+${heatDeltaPct}%` : `${heatDeltaPct}%`} and dust by{' '}
                {dustDeltaPct >= 0 ? `+${dustDeltaPct}%` : `${dustDeltaPct}%`} alters the combined risk score from{' '}
                <strong className="text-slate-900">{baselineResult.score}</strong> to{' '}
                <strong
                  className={
                    (simulatedResult.score ?? 0) > (baselineResult.score ?? 0)
                      ? 'text-red-600'
                      : 'text-emerald-700'
                  }
                >
                  {simulatedResult.score}
                </strong>
                . Alert classification transitions from{' '}
                <span className="font-bold">{baselineResult.riskLevel}</span> to{' '}
                <span className="font-bold">{simulatedResult.riskLevel}</span>.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Dynamic weighting model applied</span>
            <span>Small-cell protection active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
