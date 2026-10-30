import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Download,
  Calendar,
  Building,
  CheckCircle2,
  FileCheck,
  Shield,
  Clock,
  Printer,
  Table,
} from 'lucide-react';
import { Alert, Language, Site, UserRole } from '../types';
import { useTranslation } from '../translations/strings';
import { RiskBadge } from '../components/common/RiskBadge';
import { generateAlertPdfReport } from '../utils/pdfGenerator';

interface ReportsPageProps {
  lang: Language;
  role: UserRole;
  alerts: Alert[];
  sites: Site[];
  onOpenAlertDetail: (alert: Alert) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  lang,
  role,
  alerts,
  sites,
  onOpenAlertDetail,
}) => {
  const t = useTranslation(lang);
  const [selectedAlertId, setSelectedAlertId] = useState<string>(alerts[0]?.id || '');

  const activeAlert = alerts.find((a) => a.id === selectedAlertId) || alerts[0];
  const targetSite = sites.find((s) => s.id === activeAlert?.siteId);

  const handleDownloadPdf = (alertToDownload: Alert) => {
    const s = sites.find((site) => site.id === alertToDownload.siteId);
    generateAlertPdfReport(alertToDownload, s);
  };

  const handleExportCsv = () => {
    // Generate synthetic aggregated CSV
    const headers = ['Site_ID', 'Site_Name', 'Occupation', 'Week', 'Risk_Score', 'Risk_Level', 'Data_Completeness'];
    const rows = sites.map((s) => {
      const latest = s.weeklyData[s.weeklyData.length - 1];
      return [
        s.id,
        `"${s.name}"`,
        s.occupation,
        latest.week,
        latest.ewmaScore,
        s.dataCompletenessPct >= 90 ? 'Complete' : 'Partial',
        `${s.dataCompletenessPct}%`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SwasthyaSymbol_Aggregated_Surveillance_Summary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>{t('nav_reports')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            One-page occupational health surveillance summaries & downloadable audit dossiers.
          </p>
        </div>

        {/* Global CSV export */}
        {role !== 'public' && (
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0E2A47] hover:bg-[#163B61] text-white text-xs font-bold transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
            title={t('export_csv')}
          >
            <Table className="w-4 h-4 text-teal-300" />
            <span>{t('export_csv')}</span>
          </motion.button>
        )}
      </div>

      {/* Main Reports Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Available Dossiers List (5 cols) */}
        <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Active Alert Reports ({alerts.length})
            </h3>
            <span className="text-xs font-semibold text-slate-400">PDF Ready</span>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {alerts.map((al) => {
              const isSelected = al.id === selectedAlertId;
              const displayName =
                role === 'public'
                  ? `${al.occupation} Regional Cluster`
                  : lang === 'hi'
                  ? al.siteNameHi
                  : al.siteName;

              return (
                <motion.div
                  key={al.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedAlertId(al.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-400 shadow-xs'
                      : 'bg-white/80 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {displayName}
                    </span>
                    <RiskBadge level={al.alertLevel} score={al.combinedRiskScore} size="sm" />
                  </div>

                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{al.id} | {al.dateDetected}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPdf(al);
                      }}
                      className="text-blue-700 hover:text-blue-900 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Interactive Report Preview Card (7 cols) */}
        {activeAlert && (
          <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm flex flex-col justify-between">
            <div>
              {/* Report Header Simulation */}
              <div className="bg-[#0E2A47] text-white p-4 rounded-xl flex items-center justify-between border border-slate-700 shadow-sm">
                <div>
                  <h4 className="text-xs font-bold tracking-wider uppercase text-teal-300">
                    SWASTHYA SYMBOL OCCUPATIONAL HEALTH SURVEILLANCE REPORT
                  </h4>
                  <p className="text-sm font-extrabold text-white mt-0.5">
                    {lang === 'hi' ? activeAlert.siteNameHi : activeAlert.siteName}
                  </p>
                  <span className="text-[11px] text-slate-300">
                    Sector: {activeAlert.occupation} | Period: {activeAlert.dateDetected}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-xl font-extrabold">{activeAlert.combinedRiskScore}/100</div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-600 text-white">
                    {activeAlert.alertLevel} Risk
                  </span>
                </div>
              </div>

              {/* Signals summary row */}
              <div className="mt-4 grid grid-cols-3 gap-2.5 text-xs">
                {activeAlert.contributingSignals.slice(0, 3).map((sig, idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">
                      {lang === 'hi' ? sig.nameHi : sig.name}
                    </span>
                    <strong className="text-slate-900 block mt-0.5">{sig.currentValue}</strong>
                    <span className="text-[10px] text-slate-500">Base: {sig.baselineValue}</span>
                  </div>
                ))}
              </div>

              {/* Rationale Excerpt */}
              <div className="mt-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">Alert Detection Summary:</span>
                {lang === 'hi' ? activeAlert.explanationHi : activeAlert.explanationEn}
              </div>

              {/* Recommendations list preview */}
              <div className="mt-4 space-y-2">
                <span className="text-xs font-bold text-slate-900 block">
                  Mandated Preventive Directives:
                </span>
                {activeAlert.recommendations.slice(0, 2).map((rec) => (
                  <div key={rec.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>{lang === 'hi' ? rec.actionHi : rec.action}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                      <span>Role: {lang === 'hi' ? rec.responsibleRoleHi : rec.responsibleRole}</span>
                      <span>Timeframe: {lang === 'hi' ? rec.timeframeHi : rec.timeframe}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Format: 1-Page Vector PDF (A4) | Small-cell protection active
              </span>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onOpenAlertDetail(activeAlert)}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#0E2A47] text-xs font-bold border border-slate-300 shadow-xs cursor-pointer transition-colors"
                >
                  {t('view_details')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDownloadPdf(activeAlert)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0E2A47] hover:bg-[#163B61] text-white text-xs font-bold shadow-md shadow-[#0E2A47]/30 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-teal-300" />
                  <span>{t('download_report')}</span>
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
