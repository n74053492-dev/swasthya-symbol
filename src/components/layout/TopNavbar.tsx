import React from 'react';
import {
  Bell,
  Globe,
  UserCheck,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import { Language, UserRole } from '../../types';
import { useTranslation } from '../../translations/strings';

import { motion } from 'motion/react';

interface TopNavbarProps {
  lang: Language;
  onToggleLanguage: () => void;
  role: UserRole;
  onChangeRole: (newRole: UserRole) => void;
  alertCount: number;
  sidebarCollapsed: boolean;
  onOpenAlerts: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  lang,
  onToggleLanguage,
  role,
  onChangeRole,
  alertCount,
  sidebarCollapsed,
  onOpenAlerts,
}) => {
  const t = useTranslation(lang);

  // Formatted current date
  const dateFormatted = new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-white/92 backdrop-blur-md border-b border-white/70 px-4 sm:px-6 flex items-center justify-between transition-all duration-300 shadow-xs ${
        sidebarCollapsed ? 'left-18' : 'left-68'
      }`}
    >
      {/* Left: App Title and Date */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-[#0E2A47] flex items-center gap-2">
            <span>{t('app_full_name')}</span>
          </h1>
          <p className="hidden md:block text-xs text-slate-600 font-medium">
            {t('tagline')}
          </p>
        </div>
      </div>

      {/* Right Controls: Date, Lang Toggle, Role Selector, Notifications */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Date display */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-teal-700" />
          <span>{dateFormatted}</span>
        </div>

        {/* English / Hindi Toggle with contrasting deep navy background and motion */}
        <motion.button
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E2A47] hover:bg-[#163B61] text-xs font-bold text-white transition-all shadow-md shadow-[#0E2A47]/20 border border-[#0E2A47]"
          title="Toggle Language / भाषा बदलें"
        >
          <Globe className="w-3.5 h-3.5 text-teal-300" />
          <span>{t('lang_toggle')}</span>
        </motion.button>

        {/* Role Selector with clean contrasting card */}
        <div className="flex items-center gap-1.5 bg-white/90 border border-slate-300 rounded-xl px-2.5 py-1 text-xs shadow-2xs">
          <UserCheck className="w-3.5 h-3.5 text-teal-700 shrink-0" />
          <div className="flex flex-col">
            <span className="hidden sm:inline text-[9px] uppercase font-bold text-slate-500 leading-none">
              {t('select_role')}
            </span>
            <select
              value={role}
              onChange={(e) => onChangeRole(e.target.value as UserRole)}
              className="bg-transparent font-bold text-[#0E2A47] text-xs cursor-pointer focus:outline-hidden"
            >
              <option value="health_officer">{t('role_health_officer')}</option>
              <option value="inspector">{t('role_inspector')}</option>
              <option value="public">{t('role_public')}</option>
            </select>
          </div>
        </div>

        {/* Notifications Icon with active badge & motion */}
        <motion.button
          whileHover={{ scale: 1.08, y: -1 }}
          whileTap={{ scale: 0.92 }}
          onClick={onOpenAlerts}
          className="relative p-2 rounded-xl bg-white/90 text-[#0E2A47] hover:text-black hover:bg-white border border-slate-200 shadow-2xs transition-all"
          title={`${alertCount} Active Alerts`}
        >
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-xs">
              {alertCount}
            </span>
          )}
        </motion.button>
      </div>
    </header>
  );
};
