import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Layers,
  ShieldAlert,
  Activity,
  AlertCircle,
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
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { Language, Occupation, Site, UserRole } from '../types';
import { useTranslation } from '../translations/strings';
import { RiskBadge } from '../components/common/RiskBadge';
import { calculateCombinedRiskScore, getRiskColor } from '../utils/detectionEngine';

interface RiskAnalysisPageProps {
  lang: Language;
  role: UserRole;
  sites: Site[];
  onSelectSite: (siteId: string) => void;
}

export const RiskAnalysisPage: React.FC<RiskAnalysisPageProps> = ({
  lang,
  role,
  sites,
  onSelectSite,
}) => {
  const t = useTranslation(lang);

  // Compute latest risk metrics for all sites
  const siteRiskData = sites.map((s) => {
    const latest = s.weeklyData[s.weeklyData.length - 1];
    const risk = calculateCombinedRiskScore(latest);
    return {
      siteId: s.id,
      name: role === 'public' ? `${s.occupation} Facility` : lang === 'hi' ? s.nameHi : s.name,
      occupation: s.occupation,
      score: risk.score ?? 0,
      level: risk.riskLevel,
      clinicRisk: risk.clinicRisk ?? 0,
      absenceRisk: risk.absenceRisk ?? 0,
      envRisk: risk.envRisk ?? 0,
    };
  });

  // Risk Level Distribution counts
  const riskCounts = {
    Low: siteRiskData.filter((s) => s.level === 'Low').length,
    Moderate: siteRiskData.filter((s) => s.level === 'Moderate').length,
    High: siteRiskData.filter((s) => s.level === 'High').length,
    Critical: siteRiskData.filter((s) => s.level === 'Critical').length,
  };

  const pieData = [
    { name: t('risk_low'), value: riskCounts.Low, color: '#16A34A' },
    { name: t('risk_moderate'), value: riskCounts.Moderate, color: '#F59E0B' },
    { name: t('risk_high'), value: riskCounts.High, color: '#F97316' },
    { name: t('risk_critical'), value: riskCounts.Critical, color: '#DC2626' },
  ].filter((d) => d.value > 0);

  // Sector-wise average risk scores
  const occupationsList: Occupation[] = [
    'Agriculture',
    'Quarry and Mining',
    'Waste Management',
    'Textile',
    'Construction',
  ];

  const sectorAverages = occupationsList.map((occ) => {
    const occSites = siteRiskData.filter((s) => s.occupation === occ);
    const avgScore =
      occSites.length > 0
        ? Math.round(occSites.reduce((sum, s) => sum + s.score, 0) / occSites.length)
        : 0;
    const avgClinic =
      occSites.length > 0
        ? Math.round(occSites.reduce((sum, s) => sum + s.clinicRisk, 0) / occSites.length)
        : 0;
    const avgAbsence =
      occSites.length > 0
        ? Math.round(occSites.reduce((sum, s) => sum + s.absenceRisk, 0) / occSites.length)
        : 0;
    const avgEnv =
      occSites.length > 0
        ? Math.round(occSites.reduce((sum, s) => sum + s.envRisk, 0) / occSites.length)
        : 0;

    return {
      sector: occ,
      avgScore,
      avgClinic,
      avgAbsence,
      avgEnv,
      siteCount: occSites.length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <span>{t('nav_risk_analysis')}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Comparative risk distributions, sector vulnerability profiles, and multi-stream risk breakdown.
        </p>
      </div>

      {/* Two Column Visualizations: Bar Comparison & Pie Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Ranked Site Risk Bar Chart */}
        <div className="lg:col-span-2 bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Current Combined Risk Score by Work Site (0 - 100)
              </h3>
              <p className="text-xs text-slate-500">
                Sorted across active surveillance locations with threshold markers.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">Week 26</span>
          </div>

          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...siteRiskData].sort((a, b) => b.score - a.score)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={11} width={130} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} / 100`, 'Combined Risk Score']}
                />
                <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                  {siteRiskData.map((entry, index) => {
                    const color = entry.level === 'Insufficient Data' ? { hex: '#94A3B8' } : getRiskColor(entry.level);
                    return <Cell key={`cell-${index}`} fill={color.hex} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Risk Classification Pie Chart */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Risk Level Portfolio Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Distribution of monitored cohorts across early warning tiers.
            </p>
          </div>

          <div className="h-52 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Low: {riskCounts.Low}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Moderate: {riskCounts.Moderate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>High: {riskCounts.High}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span>Critical: {riskCounts.Critical}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Vulnerability & Occupational Hazards Breakdown */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm">
        <div className="pb-4 border-b border-slate-100">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Sector Vulnerability Profile & Multi-Signal Contributors
          </h3>
          <p className="text-xs text-slate-500">
            Average surveillance signal burden aggregated across 5 major occupational sectors.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {sectorAverages.map((sec) => (
            <motion.div
              key={sec.sector}
              whileHover={{ scale: 1.03, y: -2 }}
              className="bg-white/80 rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {sec.sector}
                </span>
                <span className="text-[11px] text-slate-500 block mb-2">
                  {sec.siteCount} Monitored Facilities
                </span>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {sec.avgScore}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ 100 avg</span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-purple-700 font-medium">Clinic Risk:</span>
                    <span className="font-bold">{sec.avgClinic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-700 font-medium">Absence Risk:</span>
                    <span className="font-bold">{sec.avgAbsence}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teal-700 font-medium">Env Exposure:</span>
                    <span className="font-bold">{sec.avgEnv}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-200 text-[10.5px] text-slate-500">
                Primary Driver:{' '}
                <strong className="text-slate-700">
                  {sec.avgEnv >= sec.avgClinic && sec.avgEnv >= sec.avgAbsence
                    ? 'Environmental Hazards'
                    : sec.avgClinic >= sec.avgAbsence
                    ? 'Clinic Consultations'
                    : 'Workforce Sickness Absence'}
                </strong>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
