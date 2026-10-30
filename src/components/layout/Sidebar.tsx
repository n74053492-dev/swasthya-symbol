import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Building2,
  BellRing,
  TrendingUp,
  FlaskConical,
  SlidersHorizontal,
  FileText,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import { Language, UserRole } from '../../types';
import { useTranslation } from '../../translations/strings';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  lang: Language;
  role: UserRole;
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  lang,
  role,
  alertCount,
}) => {
  const t = useTranslation(lang);

  const menuItems = [
    { id: 'overview', label: t('nav_overview'), icon: LayoutDashboard },
    { id: 'surveillance', label: t('nav_surveillance'), icon: Building2 },
    {
      id: 'alerts',
      label: t('nav_alerts'),
      icon: BellRing,
      badge: alertCount > 0 ? alertCount : undefined,
    },
    { id: 'risk_analysis', label: t('nav_risk_analysis'), icon: TrendingUp },
    {
      id: 'backtesting',
      label: t('nav_backtesting'),
      icon: FlaskConical,
      restrictedToHealthOfficer: true,
    },
    { id: 'what_if', label: t('nav_what_if'), icon: SlidersHorizontal },
    { id: 'reports', label: t('nav_reports'), icon: FileText },
    { id: 'about', label: t('nav_about'), icon: ShieldCheck },
  ];

  const getRoleBadge = () => {
    switch (role) {
      case 'health_officer':
        return { label: t('role_health_officer'), color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'inspector':
        return { label: t('role_inspector'), color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'public':
        return { label: t('role_public'), color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#142D4E] text-white flex flex-col transition-all duration-300 shadow-xl ${
        collapsed ? 'w-18' : 'w-68'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-700/60 bg-[#0f233d]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5 truncate">
                Swasthya Symbol
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded-sm bg-teal-500/30 text-teal-300 border border-teal-500/40">
                  Surveillance
                </span>
              </span>
              <span className="text-[10.5px] text-slate-300 truncate">
                {lang === 'hi' ? 'व्यावसायिक स्वास्थ्य पूर्व चेतावनी' : 'Occ. Health Early Warning'}
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle button with motion */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.88 }}
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors shrink-0"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1.5">
        {menuItems.map((item) => {
          // If Public Viewer, hide deep backtesting or mark accordingly
          const isRestrictedForPublic = role === 'public' && item.restrictedToHealthOfficer;
          if (isRestrictedForPublic) return null;

          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.03, x: collapsed ? 0 : 3 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold shadow-lg shadow-teal-900/30 border border-teal-400/30'
                  : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-300'
                }`}
              />

              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {/* Badge for Alert count */}
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-blue-900 shadow-xs' : 'bg-red-500 text-white'
                  } ${collapsed ? 'absolute top-1 right-1' : ''}`}
                >
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Role Indicator Card at Bottom */}
      <div className="p-3 border-t border-slate-700/60 bg-[#0f233d]/70">
        {!collapsed ? (
          <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {t('active_role')}
              </span>
              <Activity className="w-3 h-3 text-teal-400 animate-pulse" />
            </div>
            <div className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${roleInfo.color} truncate`}>
              {roleInfo.label}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-2">
              {role === 'health_officer'
                ? t('role_health_officer_desc')
                : role === 'inspector'
                ? t('role_inspector_desc')
                : t('role_public_desc')}
            </p>
          </div>
        ) : (
          <div
            className="flex items-center justify-center p-2 rounded-lg bg-slate-800 border border-slate-700"
            title={`${t('active_role')}: ${roleInfo.label}`}
          >
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
        )}
      </div>
    </aside>
  );
};
