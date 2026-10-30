import React from 'react';
import {
  ShieldCheck,
  Lock,
  Activity,
  AlertTriangle,
  Info,
  CheckCircle,
  FileSpreadsheet,
  BookOpen,
} from 'lucide-react';
import { Language } from '../types';
import { useTranslation } from '../translations/strings';

interface AboutPrivacyPageProps {
  lang: Language;
}

export const AboutPrivacyPage: React.FC<AboutPrivacyPageProps> = ({ lang }) => {
  const t = useTranslation(lang);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-teal-600" />
          <span>{t('nav_about')}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Architecture, statistical methodology, synthetic benchmark validation, and worker privacy safeguards.
        </p>
      </div>

      {/* Prominent Mandatory Non-Diagnostic Statement */}
      <div className="bg-red-50/90 border-2 border-red-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-red-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-950 uppercase tracking-wide">
              {lang === 'hi' ? 'अनिवार्य जनस्वास्थ्य गैर-नैदानिक उद्घोषणा' : 'Mandatory Non-Diagnostic Disclaimer'}
            </h3>
            <p className="text-xs sm:text-sm text-red-900 font-semibold mt-1 leading-relaxed">
              &quot;This system is designed for population-level occupational health early warning. It is not a diagnostic tool and must not be used to identify, rank, penalize, or make employment decisions about individual workers.&quot;
            </p>
            {lang === 'hi' && (
              <p className="text-xs text-red-800 font-medium mt-1">
                &quot;यह प्रणाली जनसंख्या-स्तरीय व्यावसायिक स्वास्थ्य पूर्व चेतावनी के लिए डिज़ाइन की गई है। यह कोई नैदानिक (डायग्नोस्टिक) उपकरण नहीं है और इसका उपयोग व्यक्तिगत श्रमिकों की पहचान करने, रैंकिंग करने, दंडित करने या रोजगार संबंधी निर्णय लेने के लिए नहीं किया जाना चाहिए।&quot;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Core Privacy Safeguards Grid */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-teal-600" />
          <span>Privacy Architecture & Small-Cell Suppression</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Small-Cell Suppression (&lt;5 Rule)</span>
            </h4>
            <p className="text-xs leading-relaxed text-slate-600">
              Any aggregated count between 1 and 4 is automatically suppressed and rendered as &quot;&lt;5&quot; across tables, tooltips, chart legends, and exported dossiers to prevent demographic re-identification.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>No Individual Health Records (PII/PHI)</span>
            </h4>
            <p className="text-xs leading-relaxed text-slate-600">
              The platform operates strictly on aggregated site-week counts. Worker names, employee serial numbers, and individual health charts are never ingested or stored.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Role-Based Interface Partitioning</span>
            </h4>
            <p className="text-xs leading-relaxed text-slate-600">
              Public Viewer roles access only high-level regional averages with protected facility names. Health Officers and Inspectors access actionable aggregated metrics under statutory public health supervision.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Ethical Action Recommendations</span>
            </h4>
            <p className="text-xs leading-relaxed text-slate-600">
              Generated preventive actions emphasize workplace engineering controls (ventilation, water-mist dust suppressors, hydration shelters, rest schedules) rather than individual scrutiny.
            </p>
          </div>
        </div>
      </div>

      {/* Surveillance Signals Methodology */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span>Surveillance Signals & Detection Engine</span>
        </h3>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600">
          <p className="leading-relaxed">
            Swasthya Symbol continuously monitors three distinct data streams to construct an early warning index before clinical crises materialize:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-purple-700 block">1. Clinic Visits (35%)</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Tracks sudden elevations above 26-week moving baselines for work-related symptoms (respiratory irritation, heat exhaustion, trauma).
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-amber-700 block">2. Sickness Absence (30%)</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Aggregated workforce absence percentages reflecting generalized morbidity and cluster illnesses.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-teal-700 block">3. Environment (35%)</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Co-monitors ambient Wet-Bulb Heat Index (&gt;40°C threshold) and respirable dust concentration PM10 (&gt;150 µg/m³ threshold).
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-blue-900 block">Statistical Control Charts:</span>
            <p>
              <strong>EWMA (Exponentially Weighted Moving Average)</strong> applies smoothing parameter &lambda;=0.2 and 3&sigma; control limits to detect subtle persistent trends. <strong>CUSUM (Cumulative Sum)</strong> accumulates small consecutive shifts (k=0.5, h=4.5) to capture acute step-changes.
            </p>
          </div>
        </div>
      </div>

      {/* Synthetic Data Limitations */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-700" />
          <span>Synthetic Benchmark Data & Prototype Notice</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          This application is an educational and engineering prototype built with realistic synthetic data models. No actual government registries, real patient records, or identifiable factory telemetries are connected. Data was modeled based on Indian Council of Medical Research (ICMR) and Directorate General of Mines Safety (DGMS) occupational health standards.
        </p>
      </div>
    </div>
  );
};
