import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BellRing,
  AlertTriangle,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Activity,
  FileText,
  Search,
} from 'lucide-react';
import { Alert, Language, Occupation, RiskLevel, Site, UserRole } from '../types';
import { useTranslation } from '../translations/strings';
import { RiskBadge } from '../components/common/RiskBadge';
import { generateAlertPdfReport } from '../utils/pdfGenerator';

interface AlertsPageProps {
  lang: Language;
  role: UserRole;
  alerts: Alert[];
  sites: Site[];
  onOpenAlertDetail: (alert: Alert) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  lang,
  role,
  alerts,
  sites,
  onOpenAlertDetail,
}) => {
  const t = useTranslation(lang);

  const [selectedLevel, setSelectedLevel] = useState<RiskLevel | 'All'>('All');
  const [selectedOccupation, setSelectedOccupation] = useState<Occupation | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredAlerts = alerts.filter((a) => {
    if (selectedLevel !== 'All' && a.alertLevel !== selectedLevel) return false;
    if (selectedOccupation !== 'All' && a.occupation !== selectedOccupation) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchSite = a.siteName.toLowerCase().includes(q) || a.siteNameHi.toLowerCase().includes(q);
      const matchId = a.id.toLowerCase().includes(q);
      const matchDriver = a.primaryContributingSignal.toLowerCase().includes(q);
      if (!matchSite && !matchId && !matchDriver) return false;
    }
    return true;
  });

  const handleDownloadReport = (e: React.MouseEvent, alert: Alert) => {
    e.stopPropagation();
    const site = sites.find((s) => s.id === alert.siteId);
    generateAlertPdfReport(alert, site);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BellRing className="w-6 h-6 text-red-600" />
            <span>{t('nav_alerts')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Epidemiological alerts triggered by statistical anomalies and multi-signal threshold breaches.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 self-start sm:self-auto">
          {filteredAlerts.length} Active Surveillance Flags
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-48 sm:w-60"
            />
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium">{t('filter_risk')}:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as RiskLevel | 'All')}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-medium"
            >
              <option value="All">{t('filter_all')} Levels</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Occupation Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium">{t('filter_occupation')}:</span>
            <select
              value={selectedOccupation}
              onChange={(e) => setSelectedOccupation(e.target.value as Occupation | 'All')}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-medium"
            >
              <option value="All">{t('filter_all')} Sectors</option>
              <option value="Agriculture">{t('occ_agriculture')}</option>
              <option value="Quarry and Mining">{t('occ_quarry')}</option>
              <option value="Waste Management">{t('occ_waste')}</option>
              <option value="Textile">{t('occ_textile')}</option>
              <option value="Construction">{t('occ_construction')}</option>
            </select>
          </div>
        </div>

        {/* Clear filters */}
        {(selectedLevel !== 'All' || selectedOccupation !== 'All' || searchTerm) && (
          <button
            onClick={() => {
              setSelectedLevel('All');
              setSelectedOccupation('All');
              setSearchTerm('');
            }}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            {t('filter_reset')}
          </button>
        )}
      </div>

      {/* Alerts Cards List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Active Alerts Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No surveillance threshold breaches match the current filter criteria. Baseline health parameters are within statistical tolerance limits.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const displayName =
              role === 'public'
                ? `${alert.occupation} Regional Cluster`
                : lang === 'hi'
                ? alert.siteNameHi
                : alert.siteName;

            return (
              <div
                key={alert.id}
                onClick={() => onOpenAlertDetail(alert)}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-blue-300"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        alert.alertLevel === 'Critical'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-orange-50 text-orange-600'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {displayName}
                        </h3>
                        <RiskBadge level={alert.alertLevel} score={alert.combinedRiskScore} size="sm" />
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {alert.occupation}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">
                        {alert.id} | {alert.dateDetected} | Algorithm: {alert.detectionAlgorithm}
                      </p>
                    </div>
                  </div>

                  {/* Actions on right with motion and high contrast */}
                  <div className="flex items-center gap-2 self-start md:self-auto">
                    {role !== 'public' && (
                      <motion.button
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleDownloadReport(e, alert)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 text-[#0E2A47] hover:bg-white hover:text-black border border-slate-300 shadow-xs text-xs font-bold transition-all"
                        title={t('download_report')}
                      >
                        <Download className="w-3.5 h-3.5 text-teal-700" />
                        <span>PDF Report</span>
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0E2A47] hover:bg-[#163B61] text-white text-xs font-bold shadow-md shadow-[#0E2A47]/20 border border-[#0E2A47] transition-all"
                    >
                      <span>{t('why_this_alert')}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
                    </motion.button>
                  </div>
                </div>

                {/* Primary Driver & Contributing Signals Preview */}
                <div className="mt-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      {t('primary_signal')}
                    </span>
                    <span className="font-bold text-teal-800">
                      {lang === 'hi' ? alert.primaryContributingSignalHi : alert.primaryContributingSignal}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 md:col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      {t('contributing_signals')} Breakdown
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {alert.contributingSignals.map((sig, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium"
                        >
                          <strong>{lang === 'hi' ? sig.nameHi : sig.name}</strong>: {sig.currentValue}{' '}
                          {sig.changePct !== null && (
                            <span className="text-red-600 font-bold">
                              ({sig.changePct > 0 ? `+${sig.changePct}%` : `${sig.changePct}%`})
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Plain language excerpt */}
                <div className="mt-3 text-xs text-slate-600 line-clamp-2 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                  💡 {lang === 'hi' ? alert.plainSummaryHi : alert.plainSummaryEn}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
