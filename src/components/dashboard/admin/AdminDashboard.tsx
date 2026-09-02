import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import {
  Shield,
  ExternalLink,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    creators,
    projects,
    campaigns,
    submissions,
    rewards,
    updateCreatorStatus,
    updateProjectStatus,
    updateCampaignStatus,
    updateRewardStatus,
    syncSubmissionMetrics,
    resetToDefaults,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'creators' | 'projects' | 'campaigns' | 'submissions' | 'rewards'
  >('overview');
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const pendingCreators = creators.filter((c) => c.status === 'PENDING');
  const pendingProjects = projects.filter((p) => p.status === 'PENDING');
  const pendingCampaigns = campaigns.filter(
    (c) => c.status === 'PENDING_REVIEW' || c.status === 'DRAFT'
  );

  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      await syncSubmissionMetrics(id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      alert(message);
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="rounded-xl p-6 border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg dark:bg-[#21262D] bg-slate-100 border dark:border-[#30363D] border-slate-200 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold dark:text-white text-slate-900">Admin Control Portal</h1>
              <Badge variant="gold" size="sm">
                Super Admin Access
              </Badge>
            </div>
            <p className="text-xs dark:text-slate-400 text-slate-500 mt-0.5 font-mono">
              Moderate creators, review protocol campaigns, audit submissions, and manage payouts.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset platform data to clean initial state?')) resetToDefaults();
          }}
          className="text-xs dark:text-slate-400 dark:hover:text-white text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border dark:border-[#30363D] dark:bg-[#21262D] bg-slate-100 border-slate-200 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b dark:border-[#30363D] border-slate-200 gap-1 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'creators', label: `Creator Review (${pendingCreators.length} pending)` },
          { id: 'projects', label: `Project Requests (${pendingProjects.length} pending)` },
          { id: 'campaigns', label: `Campaigns (${pendingCampaigns.length} review)` },
          { id: 'submissions', label: `Submissions & Sync (${submissions.length})` },
          { id: 'rewards', label: `Rewards & Payouts (${rewards.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`pb-2.5 px-3 cursor-pointer whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-emerald-500 dark:text-white text-slate-900 font-bold'
                : 'border-transparent dark:text-slate-400 dark:hover:text-white text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-4 shadow-xs">
              <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Pending Creator Approvals</span>
              <div className="text-xl font-bold dark:text-white text-slate-900 mt-1">
                {pendingCreators.length}
              </div>
            </div>
            <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-4 shadow-xs">
              <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Pending Campaigns</span>
              <div className="text-xl font-bold dark:text-white text-slate-900 mt-1">
                {pendingCampaigns.length}
              </div>
            </div>
            <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-4 shadow-xs">
              <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Total X Submissions</span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                {submissions.length}
              </div>
            </div>
            <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-4 shadow-xs">
              <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Total Rewards Allocated</span>
              <div className="text-xl font-bold dark:text-white text-slate-900 font-mono mt-1">
                ${rewards.reduce((s, r) => s + r.amount, 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Quick Action Center */}
          <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 space-y-4 shadow-xs">
            <h2 className="text-base font-semibold dark:text-white text-slate-900">Needs Attention</h2>
            {pendingCreators.length === 0 &&
            pendingProjects.length === 0 &&
            pendingCampaigns.length === 0 ? (
              <div className="p-6 text-center text-xs dark:text-slate-400 text-slate-500">
                All queues are clear. No pending applications or moderation reviews.
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingCreators.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-lg dark:bg-amber-950/20 bg-amber-50 border dark:border-amber-800/40 border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-amber-700 dark:text-amber-300">
                        Creator Application: {c.displayName} (@{c.username})
                      </span>
                      <p className="dark:text-slate-400 text-slate-600 mt-0.5 font-mono">
                        {c.city}, {c.country} • {c.categories.join(', ')} •{' '}
                        {c.audience.followerCount} followers
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => updateCreatorStatus(c.id, 'APPROVED')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => updateCreatorStatus(c.id, 'REJECTED')}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATOR MANAGEMENT TAB */}
      {activeTab === 'creators' && (
        <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold dark:text-white text-slate-900">All Creator Applications</h2>
            <span className="text-xs dark:text-slate-400 text-slate-500">{creators.length} total creators</span>
          </div>

          <div className="divide-y dark:divide-[#30363D] divide-slate-100">
            {creators.map((c) => (
              <div
                key={c.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm dark:text-white text-slate-900">{c.displayName}</span>
                    <span className="dark:text-slate-400 text-slate-500 font-mono">@{c.username}</span>
                    <Badge variant={c.status === 'APPROVED' ? 'green' : 'gold'} size="sm">
                      {c.status}
                    </Badge>
                  </div>
                  <p className="dark:text-slate-300 text-slate-600">{c.bio}</p>
                  <div className="dark:text-slate-400 text-slate-500 flex items-center gap-3 font-mono text-[11px]">
                    <span>Followers: {c.audience.followerCount.toLocaleString()}</span>
                    <span>City: {c.city}</span>
                    {c.platforms.x && (
                      <a
                        href={c.platforms.x}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-sans"
                      >
                        <span>X Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {c.status !== 'APPROVED' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => updateCreatorStatus(c.id, 'APPROVED')}
                    >
                      Approve
                    </Button>
                  )}
                  {c.status === 'APPROVED' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateCreatorStatus(c.id, 'SUSPENDED')}
                    >
                      Suspend
                    </Button>
                  )}
                  {c.status === 'PENDING' && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => updateCreatorStatus(c.id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROJECT APPLICATIONS TAB */}
      {activeTab === 'projects' && (
        <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 space-y-4 shadow-xs">
          <h2 className="text-base font-semibold dark:text-white text-slate-900">Registered Protocols & Projects</h2>
          <div className="divide-y dark:divide-[#30363D] divide-slate-100">
            {projects.map((p) => (
              <div
                key={p.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm dark:text-white text-slate-900">{p.name}</span>
                    <Badge variant={p.status === 'APPROVED' ? 'green' : 'gold'} size="sm">
                      {p.status}
                    </Badge>
                  </div>
                  <p className="dark:text-slate-300 text-slate-600">{p.description}</p>
                  <div className="dark:text-slate-400 text-slate-500 font-mono text-[11px]">
                    Ecosystem: <strong className="dark:text-white text-slate-900">{p.ecosystem}</strong> • Rep: {p.representativeName} • Email:{' '}
                    {p.contactEmail}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {p.status !== 'APPROVED' ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => updateProjectStatus(p.id, 'APPROVED')}
                    >
                      Approve Project
                    </Button>
                  ) : (
                    <Badge variant="green">Verified Partner</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CAMPAIGNS MODERATION */}
      {activeTab === 'campaigns' && (
        <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 space-y-4 shadow-xs">
          <h2 className="text-base font-semibold dark:text-white text-slate-900">All Platform Campaigns</h2>
          <div className="divide-y dark:divide-[#30363D] divide-slate-100">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm dark:text-white text-slate-900">{camp.title}</span>
                    <Badge variant={camp.status === 'ACTIVE' ? 'green' : 'gold'} size="sm">
                      {camp.status}
                    </Badge>
                  </div>
                  <p className="dark:text-slate-400 text-slate-500 font-mono text-[11px]">
                    {camp.projectName} • Reward Pool: ${camp.rewardPool.total} {camp.rewardPool.currency}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {camp.status !== 'ACTIVE' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => updateCampaignStatus(camp.id, 'ACTIVE')}
                    >
                      Set Active
                    </Button>
                  )}
                  {camp.status === 'ACTIVE' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateCampaignStatus(camp.id, 'COMPLETED')}
                    >
                      Mark Completed
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBMISSIONS MONITOR */}
      {activeTab === 'submissions' && (
        <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold dark:text-white text-slate-900">X Post Submissions Audit</h2>
            <span className="text-xs dark:text-slate-400 text-slate-500">{submissions.length} verified submissions</span>
          </div>

          <div className="divide-y dark:divide-[#30363D] divide-slate-100">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold dark:text-white text-slate-900">{sub.creatorDisplayName}</span>
                    <span className="dark:text-slate-400 text-slate-500 font-mono">@{sub.creatorUsername}</span>
                    <span className="text-[10px] dark:bg-[#21262D] dark:border-[#30363D] dark:text-emerald-400 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                      {sub.campaignTitle}
                    </span>
                  </div>
                  <p className="dark:text-slate-300 text-slate-600 italic">"{sub.contentText}"</p>
                  <div className="dark:text-slate-400 text-slate-500 font-mono text-[11px] flex items-center gap-3">
                    <span>Views: {sub.metrics.impressions.toLocaleString()}</span>
                    <span>Likes: {sub.metrics.likes}</span>
                    <span>Reposts: {sub.metrics.reposts}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Score: {sub.score}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={sub.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 dark:text-slate-400 dark:hover:text-white text-slate-500 hover:text-slate-900 rounded-md border dark:border-[#30363D] dark:bg-[#21262D] bg-slate-100 border-slate-200"
                    title="Open on X"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <Button
                    size="sm"
                    variant="secondary"
                    isLoading={syncingId === sub.id}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    onClick={() => handleSync(sub.id)}
                  >
                    Sync X API
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REWARDS MANAGEMENT */}
      {activeTab === 'rewards' && (
        <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold dark:text-white text-slate-900">Rewards Payout Ledger</h2>
            <span className="text-xs dark:text-slate-400 text-slate-500">{rewards.length} allocations</span>
          </div>

          <div className="divide-y dark:divide-[#30363D] divide-slate-100">
            {rewards.map((r) => (
              <div
                key={r.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold dark:text-white text-slate-900 text-sm">
                    {r.creatorName} (@{r.creatorUsername})
                  </div>
                  <div className="dark:text-slate-400 text-slate-500 font-mono text-[11px]">
                    {r.campaignTitle} • Rank #{r.rank}
                  </div>
                  {r.txReference && (
                    <div className="text-[10px] dark:text-slate-500 text-slate-400 font-mono mt-0.5">
                      Tx: {r.txReference}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                      ${r.amount} {r.currency}
                    </span>
                    <Badge variant={r.status === 'PAID' ? 'green' : 'gold'} size="sm">
                      {r.status}
                    </Badge>
                  </div>

                  {r.status !== 'PAID' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() =>
                        updateRewardStatus(
                          r.id,
                          'PAID',
                          `0x${Math.random().toString(16).substring(2, 18)}`
                        )
                      }
                    >
                      Mark as Paid
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
