import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FlaskConical,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  Activity,
  Layers,
  Info,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { AlgorithmType, Language, UserRole } from '../types';
import { useTranslation } from '../translations/strings';
import { MOCK_BACKTEST_DATA } from '../data/mockData';

interface BacktestingPageProps {
  lang: Language;
  role: UserRole;
  selectedAlgorithm: AlgorithmType;
  onSelectAlgorithm: (algo: AlgorithmType) => void;
}

export const BacktestingPage: React.FC<BacktestingPageProps> = ({
  lang,
  role,
  selectedAlgorithm,
  onSelectAlgorithm,
}) => {
  const t = useTranslation(lang);
  const metrics = MOCK_BACKTEST_DATA[selectedAlgorithm];

  // Comparison data for Recharts Bar Chart
  const comparisonData = [
    {
      metric: t('sensitivity'),
      EWMA: MOCK_BACKTEST_DATA.EWMA.sensitivityPct,
      CUSUM: MOCK_BACKTEST_DATA.CUSUM.sensitivityPct,
      unit: '%',
    },
    {
      metric: t('ppv'),
      EWMA: MOCK_BACKTEST_DATA.EWMA.ppvPct,
      CUSUM: MOCK_BACKTEST_DATA.CUSUM.ppvPct,
      unit: '%',
    },
    {
      metric: t('false_alarm_rate'),
      EWMA: MOCK_BACKTEST_DATA.EWMA.falseAlarmRatePct,
      CUSUM: MOCK_BACKTEST_DATA.CUSUM.falseAlarmRatePct,
      unit: '%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FlaskConical className="w-6 h-6 text-teal-600" />
            <span>{t('backtesting_title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('backtesting_subtitle')}
          </p>
        </div>

        {/* Algorithm Switcher */}
        <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-xl border border-white/60 shadow-xs self-start sm:self-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectAlgorithm('EWMA')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedAlgorithm === 'EWMA'
                ? 'bg-[#0E2A47] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            EWMA Model
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectAlgorithm('CUSUM')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedAlgorithm === 'CUSUM'
                ? 'bg-[#0E2A47] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            CUSUM Model
          </motion.button>
        </div>
      </div>

      {/* Honest Disclaimer Banner */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>{t('synthetic_backtest_disclaimer')}</strong>{' '}
          Model performance has been calibrated against a 26-week simulation window containing 16 confirmed historical occupational health surges across stone quarries, textile processing clusters, and farm sectors.
        </div>
      </div>

      {/* 4 Performance Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Lead Time */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('lead_time')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900">
              {metrics.leadTimeWeeks}
            </span>
            <span className="text-sm font-bold text-teal-700">weeks</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            {t('lead_time_def')}
          </p>
        </div>

        {/* Metric 2: Sensitivity */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('sensitivity')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-emerald-700">
              {metrics.sensitivityPct}%
            </span>
            <span className="text-xs text-slate-400 font-medium">({metrics.detectedEvents}/{metrics.totalReferenceEvents})</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            {t('sensitivity_def')}
          </p>
        </div>

        {/* Metric 3: PPV */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('ppv')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-blue-700">
              {metrics.ppvPct}%
            </span>
            <span className="text-xs text-slate-400 font-medium">true positives</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            {t('ppv_def')}
          </p>
        </div>

        {/* Metric 4: False Alarm Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('false_alarm_rate')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-amber-700">
              {metrics.falseAlarmRatePct}%
            </span>
            <span className="text-xs text-slate-400 font-medium">({metrics.falseAlarmsCount} alerts)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            {t('false_alarm_def')}
          </p>
        </div>
      </div>

      {/* Two Column Section: Model Comparison Chart & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Model Comparison Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>EWMA vs. CUSUM Performance Comparison</span>
              </h3>
              <p className="text-xs text-slate-500">
                Evaluation across Sensitivity, PPV, and False Alarm Rate.
              </p>
            </div>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="metric" stroke="#64748B" fontSize={11} />
                <YAxis unit="%" stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}%`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="EWMA" name="EWMA (λ=0.2)" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="CUSUM" name="CUSUM (k=0.5, h=4.5)" fill="#0F766E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix Interactive Visualization */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>{t('confusion_matrix')} ({selectedAlgorithm})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Breakdown of 208 evaluated site-weeks (16 actual surge events, 192 normal baseline periods).
            </p>
          </div>

          <div className="my-4 grid grid-cols-2 gap-3">
            {/* True Positive */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                True Positives (TP)
              </span>
              <span className="text-2xl font-extrabold text-emerald-900 block my-1">
                {metrics.detectedEvents}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">
                Accurately warned before clinical surge
              </span>
            </div>

            {/* False Positive */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                False Positives (FP)
              </span>
              <span className="text-2xl font-extrabold text-amber-900 block my-1">
                {metrics.falseAlarmsCount}
              </span>
              <span className="text-[11px] text-amber-700 font-medium">
                Alert triggered without health surge
              </span>
            </div>

            {/* False Negative */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block">
                False Negatives (FN)
              </span>
              <span className="text-2xl font-extrabold text-red-900 block my-1">
                {metrics.missedEvents}
              </span>
              <span className="text-[11px] text-red-700 font-medium">
                Health surge undetected in advance
              </span>
            </div>

            {/* True Negative */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                True Negatives (TN)
              </span>
              <span className="text-2xl font-extrabold text-slate-800 block my-1">
                {metrics.trueNegativesCount}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Correctly identified normal baseline
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between">
            <span>Accuracy: {Math.round(((metrics.detectedEvents + metrics.trueNegativesCount) / 208) * 1000) / 10}%</span>
            <span>Total Evaluated Windows: 208 site-weeks</span>
          </div>
        </div>
      </div>
    </div>
  );
};
