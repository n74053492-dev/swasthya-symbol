import React from 'react';
import { ShieldAlert, Lock, Info } from 'lucide-react';
import { Language } from '../../types';
import { useTranslation } from '../../translations/strings';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = useTranslation(lang);

  return (
    <footer className="mt-12 mb-6 border-t border-slate-200/80 pt-6">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-4 h-4 text-teal-700" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>{lang === 'hi' ? 'अनिवार्य जनस्वास्थ्य गोपनीयता सूचना' : 'Mandatory Privacy Notice'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-emerald-100 text-emerald-800 font-semibold">
                {lang === 'hi' ? 'लघु-संख्या छिपाव सक्रिय' : 'Small-cell suppression active'}
              </span>
            </h4>
            <p className="text-xs text-slate-600 mt-1 max-w-4xl leading-relaxed">
              {t('privacy_notice_full')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs text-slate-500 font-medium">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Swasthya Symbol v2.4 (Synthetic Surveillance Prototype)</span>
        </div>
      </div>
    </footer>
  );
};
