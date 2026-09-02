import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import {
  Send,
  ExternalLink,
  RefreshCw,
  Eye,
  Heart,
  Repeat,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const CreatorDashboard: React.FC = () => {
  const {
    currentUser,
    creators,
    campaigns,
    participants,
    submissions,
    rewards,
    submitXPost,
    syncSubmissionMetrics,
    joinCampaign,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'campaigns' | 'my-campaigns' | 'my-posts' | 'leaderboard' | 'rewards'
  >('overview');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [postUrl, setPostUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const activeCreatorProfile =
    creators.find((c) => c.userId === currentUser?.id) || creators[0];

  // Creator's campaigns & submissions
  const myParticipations = participants.filter(
    (p) => p.creatorId === (currentUser?.id || activeCreatorProfile?.userId)
  );
  const myCampaignIds = myParticipations.map((p) => p.campaignId);
  const myCampaignsList = campaigns.filter((c) => myCampaignIds.includes(c.id));

  const mySubmissions = submissions.filter(
    (s) => s.creatorId === (currentUser?.id || activeCreatorProfile?.userId)
  );

  const myRewards = rewards.filter(
    (r) => r.creatorId === (currentUser?.id || activeCreatorProfile?.userId)
  );

  const totalEarned = myRewards
    .filter((r) => r.status === 'PAID')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalReach = mySubmissions.reduce(
    (acc, sub) => acc + (sub.metrics.impressions || 0),
    0
  );

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await submitXPost(selectedCampaignId, activeCreatorProfile, postUrl);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsSubmitModalOpen(false);
        setPostUrl('');
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSync = async (submissionId: string) => {
    setSyncingId(submissionId);
    try {
      await syncSubmissionMetrics(submissionId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      alert(message);
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Creator Top Profile Card */}
      <div className="rounded-xl p-6 border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
            alt={activeCreatorProfile.displayName}
            className="w-14 h-14 rounded-lg object-cover border dark:border-[#30363D] border-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold dark:text-white text-slate-900">
                {activeCreatorProfile.displayName}
              </h1>
              <Badge
                variant={activeCreatorProfile.status === 'APPROVED' ? 'green' : 'gold'}
                size="sm"
              >
                ● {activeCreatorProfile.status}
              </Badge>
            </div>
            <div className="text-xs dark:text-slate-400 text-slate-500 font-mono mt-0.5">
              @{activeCreatorProfile.username} • {activeCreatorProfile.city},{' '}
              {activeCreatorProfile.country}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {activeCreatorProfile.categories.map((c) => (
                <span
                  key={c}
                  className="text-[10px] font-medium text-emerald-800 bg-emerald-50 dark:text-emerald-400 dark:bg-[#21262D] px-2 py-0.5 rounded-md border dark:border-[#30363D] border-emerald-200"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          leftIcon={<Send className="w-4 h-4" />}
          onClick={() => {
            setSelectedCampaignId(campaigns[0]?.id || '');
            setIsSubmitModalOpen(true);
          }}
        >
          Submit X Post URL
        </Button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b dark:border-[#30363D] border-slate-200 gap-1 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'campaigns', label: 'Explore Campaigns' },
          { id: 'my-campaigns', label: `My Campaigns (${myCampaignsList.length})` },
          { id: 'my-posts', label: `My Posts (${mySubmissions.length})` },
          { id: 'leaderboard', label: 'Leaderboard' },
          { id: 'rewards', label: `Rewards ($${totalEarned})` },
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

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-4 shadow-xs">
              <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Joined Campaigns</span>
              <div className="text-xl font-bold dark:text-white text-slate-900 mt-1">
                {myParticipations.length}
              </div>
            </div>
            <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-4 shadow-xs">
              <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Posts Submitted</span>
              <div className="text-xl font-bold dark:text-white text-slate-900 mt-1">{mySubmissions.length}</div>
            </div>
            <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-4 shadow-xs">
              <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Total Reach</span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                {totalReach.toLocaleString()}+ views
              </div>
            </div>
            <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-4 shadow-xs">
              <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Approved Rewards</span>
              <div className="text-xl font-bold dark:text-white text-slate-900 font-mono mt-1">
                ${totalEarned.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Active Campaigns joined */}
          <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold dark:text-white text-slate-900">Active Campaign Engagements</h2>
              <button
                onClick={() => setActiveTab('campaigns')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Browse all campaigns →
              </button>
            </div>

            {myCampaignsList.length === 0 ? (
              <div className="text-center py-6 text-xs dark:text-slate-400 text-slate-500">
                You have not joined any campaigns yet. Browse open campaigns to get started.
              </div>
            ) : (
              <div className="divide-y dark:divide-[#30363D] divide-slate-100">
                {myCampaignsList.map((camp) => {
                  const part = myParticipations.find((p) => p.campaignId === camp.id);
                  return (
                    <div
                      key={camp.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm dark:text-white text-slate-900">{camp.title}</span>
                          <Badge variant="green" size="sm">
                            {camp.status}
                          </Badge>
                        </div>
                        <div className="text-xs dark:text-slate-400 text-slate-500">
                          {camp.projectName} • Pool: ${camp.rewardPool.total.toLocaleString()}{' '}
                          {camp.rewardPool.currency}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <div className="text-right">
                          <span className="dark:text-slate-400 text-slate-500 block text-[10px]">Your Score</span>
                          <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                            {part?.score || 0} pts (Rank #{part?.rank || 1})
                          </span>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedCampaignId(camp.id);
                            setIsSubmitModalOpen(true);
                          }}
                        >
                          Submit Post
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: EXPLORE CAMPAIGNS */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => {
              const isJoined = myCampaignIds.includes(camp.id);
              return (
                <div
                  key={camp.id}
                  className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 space-y-3 flex flex-col justify-between shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold dark:text-slate-400 text-slate-600">
                        {camp.projectName}
                      </span>
                      <Badge variant={camp.status === 'ACTIVE' ? 'green' : 'gold'} size="sm">
                        {camp.status}
                      </Badge>
                    </div>
                    <h2 className="font-semibold text-sm dark:text-white text-slate-900">{camp.title}</h2>
                    <p className="text-xs dark:text-slate-400 text-slate-600 line-clamp-2">{camp.shortDescription}</p>

                    <div className="pt-1 text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                      Reward Pool: ${camp.rewardPool.total.toLocaleString()}{' '}
                      {camp.rewardPool.currency}
                    </div>
                  </div>

                  <div className="pt-3 border-t dark:border-[#30363D] border-slate-100 flex items-center justify-between">
                    {isJoined ? (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Joined
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => joinCampaign(camp.id, activeCreatorProfile)}
                      >
                        Join Campaign
                      </Button>
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedCampaignId(camp.id);
                        setIsSubmitModalOpen(true);
                      }}
                    >
                      Submit X Post
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: MY POSTS */}
      {activeTab === 'my-posts' && (
        <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold dark:text-white text-slate-900">
                Submitted Content & Live X Metrics
              </h2>
              <p className="text-xs dark:text-slate-400 text-slate-500">
                Verified post URLs with background impressions, likes, reposts, and bookmark snapshots.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Send className="w-4 h-4" />}
              onClick={() => {
                setSelectedCampaignId(campaigns[0]?.id || '');
                setIsSubmitModalOpen(true);
              }}
            >
              Submit New Post
            </Button>
          </div>

          {mySubmissions.length === 0 ? (
            <div className="text-center py-10 dark:text-slate-400 text-slate-500 text-xs space-y-1">
              <FileText className="w-7 h-7 mx-auto dark:text-slate-600 text-slate-300" />
              <div>You haven't submitted any content for active campaigns yet.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {mySubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="dark:bg-[#0D1117] bg-slate-50 rounded-lg p-4 border dark:border-[#30363D] border-slate-200 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 dark:text-emerald-400 dark:bg-[#21262D] px-2 py-0.5 rounded-md border dark:border-[#30363D] border-emerald-200">
                        {sub.campaignTitle}
                      </span>
                      <div className="text-xs dark:text-slate-400 text-slate-500 mt-1">
                        Post ID: <code className="font-mono dark:text-slate-300 text-slate-700">{sub.externalPostId}</code> •
                        Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={sub.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>Open on X</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <Button
                        variant="secondary"
                        size="sm"
                        isLoading={syncingId === sub.id}
                        leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                        onClick={() => handleSync(sub.id)}
                      >
                        Sync
                      </Button>
                    </div>
                  </div>

                  {sub.contentText && (
                    <div className="p-2.5 dark:bg-[#161B22] bg-white rounded-md border dark:border-[#30363D] border-slate-200 text-xs dark:text-slate-300 text-slate-600 italic">
                      "{sub.contentText}"
                    </div>
                  )}

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                    <div className="dark:bg-[#161B22] bg-white p-2.5 rounded-md border dark:border-[#30363D] border-slate-200">
                      <div className="flex items-center gap-1 dark:text-slate-400 text-slate-500 text-[11px]">
                        <Eye className="w-3.5 h-3.5" /> Views
                      </div>
                      <div className="font-mono font-semibold dark:text-white text-slate-900 text-sm mt-0.5">
                        {sub.metrics.impressions.toLocaleString()}
                      </div>
                    </div>

                    <div className="dark:bg-[#161B22] bg-white p-2.5 rounded-md border dark:border-[#30363D] border-slate-200">
                      <div className="flex items-center gap-1 dark:text-slate-400 text-slate-500 text-[11px]">
                        <Heart className="w-3.5 h-3.5 text-rose-500" /> Likes
                      </div>
                      <div className="font-mono font-semibold dark:text-white text-slate-900 text-sm mt-0.5">
                        {sub.metrics.likes}
                      </div>
                    </div>

                    <div className="dark:bg-[#161B22] bg-white p-2.5 rounded-md border dark:border-[#30363D] border-slate-200">
                      <div className="flex items-center gap-1 dark:text-slate-400 text-slate-500 text-[11px]">
                        <Repeat className="w-3.5 h-3.5 text-emerald-500" /> Reposts
                      </div>
                      <div className="font-mono font-semibold dark:text-white text-slate-900 text-sm mt-0.5">
                        {sub.metrics.reposts}
                      </div>
                    </div>

                    <div className="dark:bg-[#161B22] bg-white p-2.5 rounded-md border dark:border-[#30363D] border-slate-200">
                      <div className="flex items-center gap-1 dark:text-slate-400 text-slate-500 text-[11px]">
                        <Bookmark className="w-3.5 h-3.5 text-blue-500" /> Bookmarks
                      </div>
                      <div className="font-mono font-semibold dark:text-white text-slate-900 text-sm mt-0.5">
                        {sub.metrics.bookmarks}
                      </div>
                    </div>

                    <div className="dark:bg-[#161B22] bg-white p-2.5 rounded-md border dark:border-[#30363D] border-slate-200">
                      <div className="dark:text-slate-400 text-slate-500 text-[11px]">Post Score</div>
                      <div className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                        {sub.score} pts
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] dark:text-slate-500 text-slate-400 font-mono">
                    Last synced: {new Date(sub.lastSyncedAt).toLocaleTimeString()} •{' '}
                    {sub.snapshots.length} snapshots recorded
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold dark:text-white text-slate-900">Global Creator Leaderboard</h2>
            <Badge variant="green" size="sm">
              Updated Live
            </Badge>
          </div>

          <div className="divide-y dark:divide-[#30363D] divide-slate-100">
            {participants
              .slice()
              .sort((a, b) => b.score - a.score)
              .map((p, idx) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] font-mono dark:text-slate-300 text-slate-700 bg-slate-200 dark:bg-[#21262D]">
                      #{idx + 1}
                    </span>
                    <img
                      src={p.creatorAvatar}
                      alt={p.creatorName}
                      className="w-7 h-7 rounded-full object-cover border dark:border-[#30363D] border-slate-200"
                    />
                    <div>
                      <div className="font-medium text-xs dark:text-white text-slate-900">{p.creatorName}</div>
                      <div className="text-[10px] dark:text-slate-500 text-slate-400 font-mono">
                        @{p.creatorUsername}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="font-semibold text-xs text-emerald-600 dark:text-emerald-400">{p.score} pts</div>
                    <div className="text-[10px] dark:text-slate-500 text-slate-400">
                      {p.totalImpressions.toLocaleString()} views
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB: REWARDS */}
      {activeTab === 'rewards' && (
        <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 space-y-4 shadow-xs">
          <h2 className="text-base font-semibold dark:text-white text-slate-900">Campaign Rewards & Payouts</h2>
          {myRewards.length === 0 ? (
            <div className="text-center py-6 text-xs dark:text-slate-400 text-slate-500">
              No rewards awarded yet. Keep publishing high-engagement content to climb the leaderboard!
            </div>
          ) : (
            <div className="space-y-2.5">
              {myRewards.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-lg dark:bg-[#0D1117] bg-slate-50 border dark:border-[#30363D] border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-sm dark:text-white text-slate-900">{r.campaignTitle}</div>
                    <div className="text-xs dark:text-slate-500 text-slate-400 font-mono">
                      Rank #{r.rank} reward • Awarded {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                      ${r.amount} {r.currency}
                    </div>
                    <Badge variant={r.status === 'PAID' ? 'green' : 'gold'} size="sm">
                      {r.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBMIT X POST MODAL */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit X (Twitter) Post"
        subtitle="Paste the public URL of your campaign post. We will extract metrics and calculate your score."
      >
        <form onSubmit={handlePostSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
              Select Campaign *
            </label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id} className="dark:bg-[#161B22] bg-white">
                  {c.title} ({c.projectName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
              X Post URL *
            </label>
            <input
              type="url"
              required
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
              placeholder="https://x.com/username/status/1892300100234567890"
              className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[11px] dark:text-slate-500 text-slate-400 mt-1 block">
              Format: https://x.com/username/status/123456789
            </span>
          </div>

          {submitError && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Post submitted successfully! Metrics synced.</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsSubmitModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Verify & Submit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
