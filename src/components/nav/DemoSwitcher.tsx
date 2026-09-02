import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Sparkles, UserCheck, Building2, UserX, RotateCcw, ChevronDown } from 'lucide-react';

export const DemoSwitcher: React.FC = () => {
  const { currentUser, switchUser, resetToDefaults, theme } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const isDark = theme === 'dark';

  const personas = [
    {
      id: 'user-admin',
      role: 'ADMIN',
      name: 'Alazar (Admin)',
      desc: 'Platform moderation & review',
      icon: <Shield className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      id: 'user-creator-1',
      role: 'CREATOR',
      name: 'Dawit (Verified Creator)',
      desc: 'Active campaigns & X submissions',
      icon: <Sparkles className="w-3.5 h-3.5 text-emerald-500" />,
    },
    {
      id: 'user-creator-pending',
      role: 'CREATOR',
      name: 'Amen (Applicant)',
      desc: 'Pending creator review',
      icon: <UserCheck className="w-3.5 h-3.5 text-slate-400" />,
    },
    {
      id: 'user-project-sheba',
      role: 'PROJECT',
      name: 'ShebaFi (Project Rep)',
      desc: 'Create campaigns & check analytics',
      icon: <Building2 className="w-3.5 h-3.5 text-sky-500" />,
    },
    {
      id: null,
      role: 'GUEST',
      name: 'Public Visitor',
      desc: 'Logged out view',
      icon: <UserX className="w-3.5 h-3.5 text-slate-400" />,
    },
  ];

  const currentPersona = personas.find((p) => p.id === (currentUser?.id || null)) || personas[4];

  return (
    <div
      className={`text-xs px-4 py-2 border-b ${
        isDark
          ? 'bg-[#161B22] text-slate-200 border-[#30363D]'
          : 'bg-slate-100 text-slate-800 border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 font-medium px-2 py-0.5 rounded-md border text-[11px] ${
              isDark
                ? 'text-emerald-300 bg-emerald-950/50 border-emerald-800/80'
                : 'text-emerald-800 bg-emerald-50 border-emerald-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Demo Persona
          </span>
          <span className={`hidden sm:inline ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Active test role:{' '}
            <strong className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentPersona.name}
            </strong>{' '}
            ({currentPersona.role})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md border cursor-pointer font-medium text-xs transition-colors ${
                isDark
                  ? 'bg-[#21262D] hover:bg-[#30363D] text-slate-200 border-[#30363D]'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-xs'
              }`}
            >
              {currentPersona.icon}
              <span>Switch Persona</span>
              <ChevronDown className={`w-3 h-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            </button>

            {isOpen && (
              <div
                className={`absolute right-0 top-full mt-1.5 w-64 rounded-lg shadow-lg border z-50 py-1 overflow-hidden ${
                  isDark
                    ? 'bg-[#161B22] text-slate-100 border-[#30363D]'
                    : 'bg-white text-slate-900 border-slate-200'
                }`}
              >
                <div
                  className={`px-3 py-1.5 text-[11px] font-semibold border-b ${
                    isDark ? 'text-slate-400 border-[#30363D]' : 'text-slate-500 border-slate-100'
                  }`}
                >
                  Select User Role for Demo
                </div>
                {personas.map((p) => {
                  const active = p.id === (currentUser?.id || null);
                  return (
                    <button
                      key={p.name}
                      onClick={() => {
                        switchUser(p.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 cursor-pointer transition-colors ${
                        isDark
                          ? active
                            ? 'bg-emerald-950/40 text-emerald-300 font-medium'
                            : 'text-slate-300 hover:bg-[#21262D]'
                          : active
                          ? 'bg-emerald-50 text-emerald-800 font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="shrink-0">{p.icon}</div>
                      <div>
                        <div className="text-xs font-medium">{p.name}</div>
                        <div
                          className={`text-[11px] ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          {p.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (window.confirm('Reset all demo submissions and creator state to initial default data?')) {
                resetToDefaults();
              }
            }}
            title="Reset to clean initial state"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#21262D] text-slate-300 hover:text-white border-[#30363D]'
                : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 shadow-xs'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
