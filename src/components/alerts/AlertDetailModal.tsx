import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  AlertTriangle,
  Download,
  Building,
  Calendar,
  Activity,
  CheckCircle2,
  Clock,
  User,
  Shield,
  FileCheck,
  TrendingUp,
} from 'lucide-react';
import { Alert, Language, Site, UserRole } from '../../types';
import { useTranslation } from '../../translations/strings';
import { RiskBadge } from '../common/RiskBadge';
import { generateAlertPdfReport } from '../../utils/pdfGenerator';

interface AlertDetailModalProps {
  alert: Alert | null;
  onClose: () => void;
  lang: Language;
  role: UserRole;
  site?: Site;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  onClose,
  lang,
  role,
  site,
}) => {
  const t = useTranslation(lang);

  if (!alert) return null;

  const handleDownloadPdf = () => {
    generateAlertPdfReport(alert, site);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'hi' ? alert.siteNameHi : alert.siteName}
                </h3>
                <RiskBadge level={alert.alertLevel} score={alert.combinedRiskScore} size="sm" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {t('alert_id')}: {alert.id} | {alert.dateDetected}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {role !== 'public' && (
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E2A47] hover:bg-[#163B61] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                title={t('download_report')}
              >
                <Download className="w-3.5 h-3.5 text-teal-300" />
                <span>{t('download_report')}</span>
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
              title={t('close')}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">{t('col_occupation')}</span>
              <span className="font-bold text-slate-800">{alert.occupation}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">{t('detection_algorithm')}</span>
              <span className="font-bold text-slate-800">{alert.detectionAlgorithm} Control Chart</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">{t('primary_signal')}</span>
              <span className="font-bold text-teal-700">
                {lang === 'hi' ? alert.primaryContributingSignalHi : alert.primaryContributingSignal}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">{t('data_completeness')}</span>
              <span className="font-bold text-emerald-700">
                {site?.dataCompletenessPct || 92}% ({site?.completenessStatus || 'Complete'})
              </span>
            </div>
          </div>

          {/* Section: Why Was This Alert Generated? */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>{t('why_this_alert')}</span>
            </h4>
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {lang === 'hi' ? alert.explanationHi : alert.explanationEn}
            </div>
          </div>

          {/* Section: Plain-Language Summary */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-teal-600" />
              <span>{t('plain_summary')}</span>
            </h4>
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
              💡 {lang === 'hi' ? alert.plainSummaryHi : alert.plainSummaryEn}
            </div>
          </div>

          {/* Section: Contributing Signals Detail Cards */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-700" />
              <span>{t('contributing_signals')}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {alert.contributingSignals.map((sig, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">
                      {lang === 'hi' ? sig.nameHi : sig.name}
                    </span>
                    <RiskBadge level={sig.severity} size="sm" />
                  </div>
                  <div className="text-xs text-slate-500">
                    <div>{t('baseline')}: <span className="font-mono text-slate-700">{sig.baselineValue}</span></div>
                    <div>{t('current_value')}: <span className="font-bold font-mono text-slate-900">{sig.currentValue}</span></div>
                    {sig.changePct !== null && (
                      <div className="text-xs font-semibold text-red-600">
                        {sig.changePct > 0 ? `+${sig.changePct}%` : `${sig.changePct}%`} {t('percentage_change')}
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    {lang === 'hi' ? sig.descriptionHi : sig.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Recommended Preventive Actions */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>{t('recommendations')}</span>
            </h4>
            <div className="space-y-2.5">
              {alert.recommendations.map((rec) => {
                let priorityColor = 'bg-teal-50 text-teal-700 border-teal-200';
                if (rec.priority === 'Immediate') priorityColor = 'bg-red-50 text-red-700 border-red-200';
                else if (rec.priority === 'High') priorityColor = 'bg-orange-50 text-orange-700 border-orange-200';

                return (
                  <div
                    key={rec.id}
                    className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${priorityColor}`}>
                          {rec.priority}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900">
                          {lang === 'hi' ? rec.actionHi : rec.action}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-500">
                        <strong className="text-slate-700">{t('supporting_evidence')}:</strong>{' '}
                        {lang === 'hi' ? rec.supportingEvidenceHi : rec.supportingEvidence}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-2 text-xs shrink-0 text-slate-500">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                        <User className="w-3 h-3 text-slate-500" />
                        {lang === 'hi' ? rec.responsibleRoleHi : rec.responsibleRole}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        {lang === 'hi' ? rec.timeframeHi : rec.timeframe}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Data Quality & Privacy Disclaimers */}
          <div className="bg-slate-100 rounded-xl p-3 text-xs text-slate-600 space-y-1 border border-slate-200">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>{t('confidence_notes')}</span>
            </div>
            <p>{lang === 'hi' ? alert.dataQualityNotesHi : alert.dataQualityNotes}</p>
            <p className="text-[11px] text-slate-500 italic">
              * Note: Statistical associations indicate population-level surveillance priorities and do not claim individual medical causation.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            {t('privacy_notice_short')}
          </span>
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#0E2A47] hover:bg-[#163B61] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            {t('close')}
          </motion.button>
        </div>
      </div>
    </div>
  );
};
