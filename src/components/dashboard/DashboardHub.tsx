import React from 'react';
import { useApp } from '../../context/AppContext';
import { CreatorDashboard } from './creator/CreatorDashboard';
import { ProjectDashboard } from './project/ProjectDashboard';
import { AdminDashboard } from './admin/AdminDashboard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Sparkles, Building2, ArrowLeft, UserCheck } from 'lucide-react';

interface DashboardHubProps {
  onNavigate: (view: string) => void;
  onOpenAuth: (mode: 'register-creator' | 'register-project') => void;
}

export const DashboardHub: React.FC<DashboardHubProps> = ({ onNavigate, onOpenAuth }) => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold dark:text-white text-slate-900">Please Sign In</h2>
        <p className="dark:text-slate-400 text-slate-600 text-sm">
          You must be signed in to access your campaigns, submissions, and analytics dashboard.
        </p>
        <Button variant="primary" onClick={() => onNavigate('home')}>
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Return to Public Site */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold dark:text-slate-400 dark:hover:text-white text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Public Website</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs dark:text-slate-500 text-slate-400">Acting Role:</span>
          <Badge
            variant={
              currentUser.role === 'ADMIN'
                ? 'gold'
                : currentUser.role === 'CREATOR'
                ? 'green'
                : 'forest'
            }
            size="sm"
          >
            {currentUser.role}
          </Badge>
        </div>
      </div>

      {/* Render Role-Specific Dashboard */}
      {currentUser.role === 'ADMIN' && <AdminDashboard />}
      {currentUser.role === 'PROJECT' && <ProjectDashboard />}
      {currentUser.role === 'CREATOR' && <CreatorDashboard />}

      {currentUser.role === 'USER' && (
        <div className="rounded-xl p-8 border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 shadow-xs space-y-6 max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 rounded-lg dark:bg-[#21262D] bg-emerald-50 border dark:border-[#30363D] border-emerald-200 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold dark:text-white text-slate-900">
              Welcome, {currentUser.name}!
            </h2>
            <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
              You are currently registered as a general member. To participate in paid campaigns or
              launch bounties for your Web3 project, upgrade your profile below:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-lg border dark:border-[#30363D] dark:bg-[#0D1117] bg-slate-50 border-slate-200 space-y-3 text-left flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold dark:text-white text-slate-900">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Become a Creator</span>
                </div>
                <p className="text-xs dark:text-slate-400 text-slate-600 mt-1">
                  Connect your X profile, submit content for bounties, and earn crypto rewards.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onOpenAuth('register-creator')}
              >
                Apply as Creator
              </Button>
            </div>

            <div className="p-5 rounded-lg border dark:border-[#30363D] dark:bg-[#0D1117] bg-slate-50 border-slate-200 space-y-3 text-left flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold dark:text-white text-slate-900">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  <span>Register a Project</span>
                </div>
                <p className="text-xs dark:text-slate-400 text-slate-600 mt-1">
                  Deploy campaigns and hire verified Ethiopian creators for grassroots adoption.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onOpenAuth('register-project')}
              >
                Register Web3 Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
