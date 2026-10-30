/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlgorithmType, Alert, Language, UserRole } from './types';
import { MOCK_ALERTS, MOCK_SITES } from './data/mockData';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { Footer } from './components/layout/Footer';
import { AlertDetailModal } from './components/alerts/AlertDetailModal';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { SiteSurveillancePage } from './pages/SiteSurveillancePage';
import { AlertsPage } from './pages/AlertsPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { BacktestingPage } from './pages/BacktestingPage';
import { WhatIfPage } from './pages/WhatIfPage';
import { ReportsPage } from './pages/ReportsPage';
import { AboutPrivacyPage } from './pages/AboutPrivacyPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [role, setRole] = useState<UserRole>('health_officer');
  const [lang, setLang] = useState<Language>('en');
  const [selectedSiteId, setSelectedSiteId] = useState<string>(MOCK_SITES[0].id);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('EWMA');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<Alert | null>(null);

  const handleToggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    // If public viewer is on restricted backtesting tab, move back to overview
    if (newRole === 'public' && currentTab === 'backtesting') {
      setCurrentTab('overview');
    }
  };

  const handleSelectSiteFromTable = (siteId: string) => {
    setSelectedSiteId(siteId);
    setCurrentTab('surveillance');
  };

  const handleOpenAlertById = (alertId: string) => {
    const alert = MOCK_ALERTS.find((a) => a.id === alertId);
    if (alert) {
      setSelectedAlertForModal(alert);
    }
  };

  const renderActivePage = () => {
    switch (currentTab) {
      case 'overview':
        return (
          <OverviewPage
            lang={lang}
            role={role}
            sites={MOCK_SITES}
            onSelectSite={handleSelectSiteFromTable}
            onOpenAlert={handleOpenAlertById}
            selectedAlgorithm={selectedAlgorithm}
            onSelectAlgorithm={setSelectedAlgorithm}
          />
        );
      case 'surveillance':
        return (
          <SiteSurveillancePage
            lang={lang}
            role={role}
            sites={MOCK_SITES}
            selectedSiteId={selectedSiteId}
            onSelectSiteId={setSelectedSiteId}
            selectedAlgorithm={selectedAlgorithm}
            onSelectAlgorithm={setSelectedAlgorithm}
            onOpenAlert={handleOpenAlertById}
          />
        );
      case 'alerts':
        return (
          <AlertsPage
            lang={lang}
            role={role}
            alerts={MOCK_ALERTS}
            sites={MOCK_SITES}
            onOpenAlertDetail={(alert) => setSelectedAlertForModal(alert)}
          />
        );
      case 'risk_analysis':
        return (
          <RiskAnalysisPage
            lang={lang}
            role={role}
            sites={MOCK_SITES}
            onSelectSite={handleSelectSiteFromTable}
          />
        );
      case 'backtesting':
        return (
          <BacktestingPage
            lang={lang}
            role={role}
            selectedAlgorithm={selectedAlgorithm}
            onSelectAlgorithm={setSelectedAlgorithm}
          />
        );
      case 'what_if':
        return (
          <WhatIfPage
            lang={lang}
            role={role}
            sites={MOCK_SITES}
            selectedSiteId={selectedSiteId}
            onSelectSiteId={setSelectedSiteId}
          />
        );
      case 'reports':
        return (
          <ReportsPage
            lang={lang}
            role={role}
            alerts={MOCK_ALERTS}
            sites={MOCK_SITES}
            onOpenAlertDetail={(alert) => setSelectedAlertForModal(alert)}
          />
        );
      case 'about':
        return <AboutPrivacyPage lang={lang} />;
      default:
        return (
          <OverviewPage
            lang={lang}
            role={role}
            sites={MOCK_SITES}
            onSelectSite={handleSelectSiteFromTable}
            onOpenAlert={handleOpenAlertById}
            selectedAlgorithm={selectedAlgorithm}
            onSelectAlgorithm={setSelectedAlgorithm}
          />
        );
    }
  };

  const currentModalSite = selectedAlertForModal
    ? MOCK_SITES.find((s) => s.id === selectedAlertForModal.siteId)
    : undefined;

  return (
    <div className="min-h-screen bg-[linear-gradient(90deg,#47C8B0_0%,#A2EAB9_50%,#F7FDB4_100%)] bg-fixed text-slate-900 font-sans antialiased selection:bg-[#0E2A47] selection:text-white flex">
      {/* Collapsible Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        lang={lang}
        role={role}
        alertCount={MOCK_ALERTS.length}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'ml-18' : 'ml-68'
        }`}
      >
        {/* Top Navbar */}
        <TopNavbar
          lang={lang}
          onToggleLanguage={handleToggleLanguage}
          role={role}
          onChangeRole={handleRoleChange}
          alertCount={MOCK_ALERTS.length}
          sidebarCollapsed={sidebarCollapsed}
          onOpenAlerts={() => setCurrentTab('alerts')}
        />

        {/* Page Content Body */}
        <main className="flex-1 mt-16 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
          <Footer lang={lang} />
        </main>
      </div>

      {/* Alert Detail & Explanation Modal */}
      {selectedAlertForModal && (
        <AlertDetailModal
          alert={selectedAlertForModal}
          onClose={() => setSelectedAlertForModal(null)}
          lang={lang}
          role={role}
          site={currentModalSite}
        />
      )}
    </div>
  );
}
