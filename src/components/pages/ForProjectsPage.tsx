import React from 'react';
import { Button } from '../ui/Button';
import {
  Building2,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface ForProjectsPageProps {
  onOpenAuth: (mode: 'register-project') => void;
}

export const ForProjectsPage: React.FC<ForProjectsPageProps> = ({ onOpenAuth }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-medium dark:bg-[#161B22] dark:border-[#30363D] dark:text-emerald-400 bg-slate-100 border-slate-200 text-emerald-800">
            <Building2 className="w-3.5 h-3.5" />
            Enterprise & Protocol Partnerships
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight dark:text-white text-slate-900 leading-tight">
            Launch grassroots Web3 campaigns across Ethiopia without friction.
          </h1>
          <p className="dark:text-slate-300 text-slate-600 text-base leading-relaxed">
            Stop messaging individual creators on Telegram or relying on unverified screenshots.
            Deploy coordinated community campaigns, track official social engagement in real time, and
            build lasting traction in East Africa’s largest demographic market.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onOpenAuth('register-project')}
              leftIcon={<Building2 className="w-4 h-4" />}
              rightIcon={<ArrowUpRight className="w-4 h-4" />}
            >
              Partner / Launch Campaign
            </Button>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-semibold text-base dark:text-white text-slate-900 border-b dark:border-[#30363D] border-slate-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Why Web3 Protocols Choose EthioWeb3
          </h3>
          <div className="space-y-3 text-xs sm:text-sm dark:text-slate-300 text-slate-600">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md dark:bg-[#21262D] bg-emerald-50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border dark:border-[#30363D] border-emerald-200">
                ✓
              </span>
              <div>
                <strong className="dark:text-white text-slate-900">Single Agreement & Pool:</strong> Fund one campaign pool instead of 50 individual creator contracts.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md dark:bg-[#21262D] bg-emerald-50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border dark:border-[#30363D] border-emerald-200">
                ✓
              </span>
              <div>
                <strong className="dark:text-white text-slate-900">Native Language Content:</strong> Educational threads and videos produced in Amharic, Afaan Oromo, and English.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md dark:bg-[#21262D] bg-emerald-50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border dark:border-[#30363D] border-emerald-200">
                ✓
              </span>
              <div>
                <strong className="dark:text-white text-slate-900">Algorithmic Quality Scoring:</strong> Creators are compensated based on genuine views, reposts, and replies.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md dark:bg-[#21262D] bg-emerald-50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border dark:border-[#30363D] border-emerald-200">
                ✓
              </span>
              <div>
                <strong className="dark:text-white text-slate-900">Grassroots Tech Clubs:</strong> Direct access to 15,000+ university developers and builders in Addis Ababa.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Step Deployment Process */}
      <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-6 sm:p-8 space-y-8 shadow-xs">
        <div className="space-y-1">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
            Simple Protocol Onboarding
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold dark:text-white text-slate-900">
            How Protocols Deploy in 48 Hours
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'Register Project',
              desc: 'Submit project details, ecosystem links, and campaign goals for expedited review.',
            },
            {
              step: '02',
              title: 'Define Sprints',
              desc: 'Set custom hashtags, required mentions, reward pool, and educational themes.',
            },
            {
              step: '03',
              title: 'Creators Activate',
              desc: 'Qualified Ethiopian creators join and immediately publish high-resonance content.',
            },
            {
              step: '04',
              title: 'Audited ROI',
              desc: 'Watch impressions and engagement roll in with verifiable post-level snapshots.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-lg border dark:border-[#30363D] dark:bg-[#0D1117] bg-slate-50 border-slate-200 p-5 flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 dark:bg-[#21262D] bg-emerald-50 border dark:border-[#30363D] border-emerald-200 w-7 h-7 rounded-md flex items-center justify-center">
                  {item.step}
                </span>
                <h3 className="font-semibold text-sm dark:text-white text-slate-900 mt-3">{item.title}</h3>
                <p className="text-xs dark:text-slate-400 text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => onOpenAuth('register-project')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Apply to Launch a Campaign
          </Button>
        </div>
      </div>
    </div>
  );
};
