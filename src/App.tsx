import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/nav/Navbar';
import { AuthModal } from './components/auth/AuthModal';
import { BackgroundPattern } from './components/ui/BackgroundPattern';

import { HomePage } from './components/pages/HomePage';
import { CampaignsPage } from './components/pages/CampaignsPage';
import { CampaignDetailPage } from './components/pages/CampaignDetailPage';
import { CreatorsPage } from './components/pages/CreatorsPage';
import { ForProjectsPage } from './components/pages/ForProjectsPage';
import { CommunityPage } from './components/pages/CommunityPage';
import { AboutPage } from './components/pages/AboutPage';
import { DashboardHub } from './components/dashboard/DashboardHub';

function AppContent() {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<
    'login' | 'register-creator' | 'register-project' | 'register-user'
  >('login');

  const handleNavigate = (view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (
    mode: 'login' | 'register-creator' | 'register-project' | 'register-user'
  ) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div
      className={`min-h-screen flex flex-col relative transition-colors duration-300 selection:bg-emerald-500/20 ${
        isDark
          ? 'bg-[#0D1117] text-slate-100 selection:text-emerald-300'
          : 'bg-[#F8FAFC] text-slate-900 selection:text-emerald-800'
      }`}
    >
      {/* Background Architectural Vector Motion */}
      <BackgroundPattern />

      {/* Main Responsive Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Dynamic View Router */}
      <main className="flex-1 relative z-10">
        {currentView === 'home' && (
          <HomePage onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
        )}

        {currentView === 'campaigns' && (
          <CampaignsPage onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
        )}

        {currentView === 'campaign-detail' && (
          <CampaignDetailPage
            slug={viewParam || 'arbitrum-africa-builders'}
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'creators' && <CreatorsPage onOpenAuth={handleOpenAuth} />}

        {currentView === 'for-projects' && <ForProjectsPage onOpenAuth={handleOpenAuth} />}

        {currentView === 'community' && <CommunityPage onOpenAuth={handleOpenAuth} />}

        {currentView === 'about' && <AboutPage />}

        {currentView === 'dashboard' && (
          <DashboardHub onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
        )}
      </main>

      {/* Central Auth and Application Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={() => {
          if (authMode === 'register-creator' || authMode === 'login') {
            handleNavigate('dashboard');
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
