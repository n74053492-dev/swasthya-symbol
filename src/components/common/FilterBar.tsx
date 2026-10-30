import React from 'react';
import { Filter, RotateCcw, Activity } from 'lucide-react';
import { AlgorithmType, Language, Occupation, RiskLevel, Site } from '../../types';
import { useTranslation } from '../../translations/strings';

import { motion } from 'motion/react';

interface FilterBarProps {
  lang: Language;
  sites: Site[];
  selectedSiteId: string;
  onSelectSiteId: (id: string) => void;
  selectedOccupation: Occupation | 'All';
  onSelectOccupation: (occ: Occupation | 'All') => void;
  selectedRisk: RiskLevel | 'All';
  onSelectRisk: (risk: RiskLevel | 'All') => void;
  selectedAlgorithm: AlgorithmType;
  onSelectAlgorithm: (algo: AlgorithmType) => void;
  onReset: () => void;
  hideSiteSelector?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  lang,
  sites,
  selectedSiteId,
  onSelectSiteId,
  selectedOccupation,
  onSelectOccupation,
  selectedRisk,
  onSelectRisk,
  selectedAlgorithm,
  onSelectAlgorithm,
  onReset,
  hideSiteSelector = false,
}) => {
  const t = useTranslation(lang);

  const occupations: (Occupation | 'All')[] = [
    'All',
    'Agriculture',
    'Quarry and Mining',
    'Waste Management',
    'Textile',
    'Construction',
  ];

  const riskLevels: (RiskLevel | 'All')[] = ['All', 'Low', 'Moderate', 'High', 'Critical'];

  const getOccLabel = (occ: Occupation | 'All') => {
    if (occ === 'All') return t('filter_all');
    if (occ === 'Agriculture') return t('occ_agriculture');
    if (occ === 'Quarry and Mining') return t('occ_quarry');
    if (occ === 'Waste Management') return t('occ_waste');
    if (occ === 'Textile') return t('occ_textile');
    if (occ === 'Construction') return t('occ_construction');
    return occ;
  };

  const getRiskLabel = (r: RiskLevel | 'All') => {
    if (r === 'All') return t('filter_all');
    if (r === 'Low') return t('risk_low');
    if (r === 'Moderate') return t('risk_moderate');
    if (r === 'High') return t('risk_high');
    if (r === 'Critical') return t('risk_critical');
    return r;
  };

  const hasActiveFilters =
    selectedSiteId !== 'All' ||
    selectedOccupation !== 'All' ||
    selectedRisk !== 'All' ||
    selectedAlgorithm !== 'EWMA';

  return (
    <div className="bg-white/92 backdrop-blur-md rounded-2xl shadow-sm border border-white/80 p-4 mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E2A47] uppercase tracking-wider mr-1">
            <Filter className="w-3.5 h-3.5 text-teal-700" />
            <span>{t('filter_occupation')}:</span>
          </div>

          {/* Occupation Chips with high contrast & motion */}
          <div className="flex flex-wrap gap-1.5">
            {occupations.map((occ) => {
              const active = selectedOccupation === occ;
              return (
                <motion.button
                  key={occ}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectOccupation(occ)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-bold transition-all border ${
                    active
                      ? 'bg-[#0E2A47] text-white shadow-md shadow-[#0E2A47]/25 border-[#0E2A47]'
                      : 'bg-white/90 text-[#0E2A47] hover:bg-white hover:text-black border-slate-300'
                  }`}
                >
                  {getOccLabel(occ)}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Algorithm switch and Reset */}
        <div className="flex items-center gap-2">
          {/* Algorithm Toggle */}
          <div className="flex items-center bg-white/90 p-1 rounded-xl border border-slate-300 text-xs shadow-2xs">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectAlgorithm('EWMA')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                selectedAlgorithm === 'EWMA'
                  ? 'bg-[#0E2A47] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0E2A47]'
              }`}
              title="Exponentially Weighted Moving Average Control Chart"
            >
              <Activity className="w-3 h-3 text-teal-400" />
              <span>EWMA</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectAlgorithm('CUSUM')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                selectedAlgorithm === 'CUSUM'
                  ? 'bg-[#0E2A47] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0E2A47]'
              }`}
              title="Cumulative Sum Control Chart"
            >
              <Activity className="w-3 h-3 text-teal-400" />
              <span>CUSUM</span>
            </motion.button>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReset}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#0E2A47] bg-white/90 hover:bg-white border border-slate-300 rounded-xl shadow-2xs transition-colors"
              title={t('filter_reset')}
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>{t('filter_reset')}</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Secondary filter row for site and risk level */}
      <div className="flex flex-wrap items-center gap-3 pt-3 mt-3 border-t border-slate-200/80 text-xs">
        {/* Site dropdown */}
        {!hideSiteSelector && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-bold">{t('filter_site')}:</span>
            <select
              value={selectedSiteId}
              onChange={(e) => onSelectSiteId(e.target.value)}
              className="bg-white/90 border border-slate-300 font-semibold text-[#0E2A47] rounded-xl px-2.5 py-1 text-xs focus:ring-2 focus:ring-[#0E2A47] focus:outline-hidden"
            >
              <option value="All">{t('filter_all')} Sites ({sites.length})</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {lang === 'hi' ? s.nameHi : s.name} ({s.occupation})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Risk Level selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-600 font-bold">{t('filter_risk')}:</span>
          <div className="flex gap-1">
            {riskLevels.map((r) => {
              const active = selectedRisk === r;
              return (
                <motion.button
                  key={r}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectRisk(r)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                    active
                      ? 'bg-[#0E2A47] text-white shadow-xs border-[#0E2A47]'
                      : 'bg-white/90 text-[#0E2A47] hover:bg-white border-slate-300'
                  }`}
                >
                  {getRiskLabel(r)}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
