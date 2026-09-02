import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Search, Filter, ChevronRight, Zap } from 'lucide-react';

interface CampaignsPageProps {
  onNavigate: (view: string, param?: string) => void;
  onOpenAuth: (mode: 'login' | 'register-creator') => void;
}

export const CampaignsPage: React.FC<CampaignsPageProps> = ({ onNavigate }) => {
  const { campaigns, participants } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = campaigns.filter((c) => {
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    if (
      searchTerm &&
      !c.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.projectName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-medium dark:bg-[#161B22] dark:border-[#30363D] dark:text-emerald-400 bg-slate-100 border-slate-200 text-emerald-800">
          <Zap className="w-3.5 h-3.5" />
          Live Bounties & Sprints
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight dark:text-white text-slate-900">
          Campaigns & Creator Bounties
        </h1>
        <p className="dark:text-slate-400 text-slate-600 max-w-2xl text-sm leading-relaxed">
          Join sponsored campaigns, create educational content on X, and earn rewards backed by
          verified community engagement metrics.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 dark:text-slate-500 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campaigns, protocols, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'ACTIVE', 'APPROVED', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                filterStatus === st
                  ? 'dark:bg-[#21262D] dark:text-white bg-slate-900 text-white font-semibold'
                  : 'dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#21262D] text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL' ? 'All Campaigns' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full dark:bg-[#21262D] bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Filter className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base dark:text-white text-slate-900">No campaigns found</h3>
            <p className="text-xs dark:text-slate-400 text-slate-600 max-w-sm mx-auto">
              No campaigns match your selected status or keyword. Try clearing filters or check back soon.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterStatus('ALL');
                setSearchTerm('');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          filtered.map((camp) => {
            const count = participants.filter((p) => p.campaignId === camp.id).length;
            return (
              <div
                key={camp.id}
                className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs transition-colors"
              >
                <div>
                  <div className="h-44 relative bg-slate-900 overflow-hidden">
                    <img
                      src={camp.coverImage}
                      alt={camp.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-black/75 text-white text-[11px] px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 border border-white/15">
                      <img
                        src={camp.projectLogo}
                        alt={camp.projectName}
                        className="w-3.5 h-3.5 rounded-full object-cover"
                      />
                      <span>{camp.projectName}</span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant={camp.status === 'ACTIVE' ? 'green' : 'gold'}
                        size="sm"
                      >
                        {camp.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h2 className="font-semibold text-base dark:text-white text-slate-900 leading-snug line-clamp-1">
                      {camp.title}
                    </h2>
                    <p className="text-xs dark:text-slate-400 text-slate-600 line-clamp-2 leading-relaxed">
                      {camp.shortDescription}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {camp.requiredHashtags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-mono dark:text-emerald-400 dark:bg-[#21262D] dark:border-[#30363D] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t dark:border-[#30363D] border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="dark:text-slate-500 text-slate-400 block text-[11px]">Reward Pool</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                          ${camp.rewardPool.total.toLocaleString()} {camp.rewardPool.currency}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="dark:text-slate-500 text-slate-400 block text-[11px]">Participants</span>
                        <span className="font-semibold dark:text-slate-300 text-slate-700">
                          {count} / {camp.maxParticipants}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Button
                    variant="forest"
                    size="sm"
                    className="w-full"
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                    onClick={() => onNavigate('campaign-detail', camp.slug)}
                  >
                    View & Join Campaign
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
