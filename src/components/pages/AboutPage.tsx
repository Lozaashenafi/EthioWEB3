import React from 'react';
import { NetworkMotif } from '../ui/NetworkMotif';
import { ShieldCheck, Target, Compass, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-medium dark:bg-[#161B22] dark:border-[#30363D] dark:text-emerald-400 bg-slate-100 border-slate-200 text-emerald-800">
          <Sparkles className="w-3.5 h-3.5" />
          Mission & Architecture
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight dark:text-white text-slate-900">
          Pioneering African Web3 Grassroots Infrastructure
        </h1>
        <p className="dark:text-slate-400 text-slate-600 text-base leading-relaxed">
          EthioWeb3 is building the marketing and campaign infrastructure needed for
          international Web3 protocols to successfully enter Ethiopia and expand across East Africa.
        </p>
      </div>

      {/* Brand Motif & Principles */}
      <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-6 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-xl font-bold dark:text-white text-slate-900">The Network Motif</h2>
          <p className="text-sm dark:text-slate-300 text-slate-600 leading-relaxed">
            Our geometric node identity symbolizes the essential bridge between four pillars:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm dark:text-slate-300 text-slate-600 font-medium">
            <li className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span><strong className="dark:text-white text-slate-900">Web3 Projects & Protocols:</strong> Providing capital & technology.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span><strong className="dark:text-white text-slate-900">Content Creators:</strong> Explaining concepts in local languages.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span><strong className="dark:text-white text-slate-900">Communities & Dev Clubs:</strong> Nurturing long-term user retention.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span><strong className="dark:text-white text-slate-900">Verifiable Analytics:</strong> Ensuring fair, transparent rewards.</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-center p-6 dark:bg-[#0D1117] bg-slate-50 rounded-lg border dark:border-[#30363D] border-slate-200">
          <NetworkMotif size={160} color="#10B981" accentColor="#059669" />
        </div>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 space-y-2.5 shadow-xs">
          <div className="w-8 h-8 rounded-md dark:bg-[#21262D] bg-emerald-50 border dark:border-[#30363D] border-emerald-200 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Target className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm dark:text-white text-slate-900">Authentic Localization</h3>
          <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed">
            We prioritize native Amharic, Oromo, and regional creators who genuinely understand local financial realities.
          </p>
        </div>

        <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 space-y-2.5 shadow-xs">
          <div className="w-8 h-8 rounded-md dark:bg-[#21262D] bg-emerald-50 border dark:border-[#30363D] border-emerald-200 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm dark:text-white text-slate-900">Anti-Bot Integrity</h3>
          <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed">
            Our platform evaluates real engagement depth through API-verified impressions, bookmarks, and contextual replies.
          </p>
        </div>

        <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 space-y-2.5 shadow-xs">
          <div className="w-8 h-8 rounded-md dark:bg-[#21262D] bg-emerald-50 border dark:border-[#30363D] border-emerald-200 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Compass className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm dark:text-white text-slate-900">Pan-African Scale</h3>
          <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed">
            Designed in Addis Ababa with clean modular architecture, built to scale across Kenya, Rwanda, and Uganda.
          </p>
        </div>
      </div>
    </div>
  );
};
