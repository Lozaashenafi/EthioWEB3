import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import {
  Building2,
  Plus,
  Eye,
  Heart,
  Repeat,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react';

export const ProjectDashboard: React.FC = () => {
  const {
    currentUser,
    projects,
    campaigns,
    participants,
    submissions,
    createCampaign,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'campaigns' | 'create-campaign' | 'analytics'
  >('overview');

  const activeProjectProfile =
    projects.find((p) => p.userId === currentUser?.id) || projects[0];

  // Campaigns created by this project
  const displayCampaigns = campaigns.filter(
    (c) => c.projectId === (activeProjectProfile?.id || 'proj-1')
  );

  // Participants & submissions across these campaigns
  const campaignIds = displayCampaigns.map((c) => c.id);
  const projectParticipants = participants.filter((p) =>
    campaignIds.includes(p.campaignId)
  );
  const projectSubmissions = submissions.filter((s) =>
    campaignIds.includes(s.campaignId)
  );

  // Stats aggregate
  const totalViews = projectSubmissions.reduce(
    (acc, sub) => acc + (sub.metrics.impressions || 0),
    0
  );
  const totalLikes = projectSubmissions.reduce(
    (acc, sub) => acc + (sub.metrics.likes || 0),
    0
  );
  const totalReposts = projectSubmissions.reduce(
    (acc, sub) => acc + (sub.metrics.reposts || 0),
    0
  );
  const totalReplies = projectSubmissions.reduce(
    (acc, sub) => acc + (sub.metrics.replies || 0),
    0
  );

  // Form state for creating new campaign
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [desc, setDesc] = useState('');
  const [rewardAmount, setRewardAmount] = useState('2000');
  const [rewardCurrency, setRewardCurrency] = useState<'USDC' | 'USDT' | 'ETH'>('USDC');
  const [rewardStructure, setRewardStructure] = useState('Top 1: $600, Top 2-5: $250 each, Top 6-10: $80 each');
  const [hashtags, setHashtags] = useState('#ShebaFi #EthioWeb3');
  const [mentions, setMentions] = useState('@ShebaFi_DeFi');
  const [rules, setRules] = useState('No automated bots, original content only, published during sprint dates.');
  const [maxParticipants, setMaxParticipants] = useState('50');
  const [createSuccess, setCreateSuccess] = useState(false);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectProfile) return;

    await createCampaign({
      projectId: activeProjectProfile.id,
      projectName: activeProjectProfile.name,
      projectLogo: activeProjectProfile.logoUrl,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      shortDescription: shortDesc,
      description: desc,
      rewardPool: {
        total: Number(rewardAmount),
        currency: rewardCurrency,
        rewardStructure,
      },
      contentRequirements: [
        'Post at least 1 original thread or video on X explaining the protocol',
        'Include all required campaign hashtags and protocol tags',
        'Demonstrate platform features in Amharic, Afaan Oromo, or English',
      ],
      requiredHashtags: hashtags.split(' ').map((h) => h.trim()).filter(Boolean),
      requiredMentions: mentions.split(' ').map((m) => m.trim()).filter(Boolean),
      targetPlatforms: ['X'],
      maxParticipants: Number(maxParticipants),
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      campaignRules: [
        rules,
        'EthioWeb3 bot verification runs 24/7 on submissions',
        'Disqualified posts receive zero score calculation',
      ],
      coverImage:
        'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200',
    });

    setCreateSuccess(true);
    setTimeout(() => {
      setCreateSuccess(false);
      setActiveTab('campaigns');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="rounded-xl p-6 border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg dark:bg-[#21262D] bg-slate-100 border dark:border-[#30363D] border-slate-200 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold dark:text-white text-slate-900">
                {activeProjectProfile?.name || 'ShebaFi Project Portal'}
              </h1>
              <Badge variant="green" size="sm">
                Verified Protocol
              </Badge>
            </div>
            <div className="text-xs dark:text-slate-400 text-slate-500 mt-1 font-mono">
              Ecosystem: {activeProjectProfile?.ecosystem || 'Ethereum L2'} • Rep:{' '}
              {activeProjectProfile?.representativeName || 'Ecosystem Lead'}
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setActiveTab('create-campaign')}
        >
          Create New Campaign
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b dark:border-[#30363D] border-slate-200 gap-1 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'campaigns', label: `My Campaigns (${displayCampaigns.length})` },
          { id: 'create-campaign', label: 'Create Campaign' },
          { id: 'analytics', label: 'Campaign Analytics' },
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
              <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Active Campaigns</span>
              <div className="text-xl font-bold dark:text-white text-slate-900 mt-1">
                {displayCampaigns.length}
              </div>
            </div>
            <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-4 shadow-xs">
              <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Enrolled Creators</span>
              <div className="text-xl font-bold dark:text-white text-slate-900 mt-1">
                {projectParticipants.length}
              </div>
            </div>
            <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-4 shadow-xs">
              <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Verified Views</span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                {totalViews.toLocaleString()}+
              </div>
            </div>
            <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-4 shadow-xs">
              <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Total Engagements</span>
              <div className="text-xl font-bold dark:text-white text-slate-900 font-mono mt-1">
                {(totalLikes + totalReposts + totalReplies).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Campaigns list */}
          <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 space-y-4 shadow-xs">
            <h2 className="text-base font-semibold dark:text-white text-slate-900">Active Campaign Performance</h2>
            <div className="divide-y dark:divide-[#30363D] divide-slate-100">
              {displayCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm dark:text-white text-slate-900">{camp.title}</span>
                      <Badge variant={camp.status === 'ACTIVE' ? 'green' : 'gold'} size="sm">
                        {camp.status}
                      </Badge>
                    </div>
                    <p className="text-xs dark:text-slate-400 text-slate-500 font-mono">
                      Reward Pool: ${camp.rewardPool.total.toLocaleString()} {camp.rewardPool.currency}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveTab('analytics')}
                    >
                      View Analytics
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE CAMPAIGN WIZARD */}
      {activeTab === 'create-campaign' && (
        <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-6 max-w-3xl space-y-5 shadow-xs">
          <div>
            <h2 className="text-lg font-bold dark:text-white text-slate-900">Create a New Campaign Sprint</h2>
            <p className="text-xs dark:text-slate-400 text-slate-500 mt-0.5">
              Your campaign will be drafted and sent to EthioWeb3 admins for review before going live.
            </p>
          </div>

          {createSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Campaign created successfully and submitted for admin review!</span>
            </div>
          )}

          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div>
              <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                Campaign Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. ShebaFi Birr-to-Stablecoin Awareness Sprint"
                className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                Short Description (1-2 sentences) *
              </label>
              <input
                type="text"
                required
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Brief summary shown on campaign cards"
                className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                Detailed Campaign Objectives & Content Guidelines *
              </label>
              <textarea
                rows={4}
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Explain the background, target audience, and key messaging pillars creators should address..."
                className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                  Reward Pool ($)
                </label>
                <input
                  type="number"
                  required
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                  Currency
                </label>
                <select
                  value={rewardCurrency}
                  onChange={(e) => setRewardCurrency(e.target.value as typeof rewardCurrency)}
                  className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="USDC" className="dark:bg-[#161B22] bg-white">USDC</option>
                  <option value="USDT" className="dark:bg-[#161B22] bg-white">USDT</option>
                  <option value="ETH" className="dark:bg-[#161B22] bg-white">ETH</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                  Max Participants
                </label>
                <input
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                Reward Distribution Structure
              </label>
              <input
                type="text"
                value={rewardStructure}
                onChange={(e) => setRewardStructure(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                  Required Hashtags (space separated)
                </label>
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                  Required Mentions (space separated)
                </label>
                <input
                  type="text"
                  value={mentions}
                  onChange={(e) => setMentions(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                Rules & Disqualification Criteria
              </label>
              <textarea
                rows={2}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="md" className="w-full">
                Submit Campaign for Admin Review
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold dark:text-white text-slate-900">
                  Campaign Aggregate Performance
                </h2>
                <p className="text-xs dark:text-slate-400 text-slate-500">
                  Tracking impressions and community interaction across verified X posts.
                </p>
              </div>
              <Badge variant="green">Official X Feed</Badge>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 dark:bg-[#0D1117] bg-slate-50 rounded-lg border dark:border-[#30363D] border-slate-200">
                <div className="flex items-center gap-1.5 dark:text-slate-400 text-slate-500 text-xs">
                  <Eye className="w-4 h-4 text-emerald-500" /> Views
                </div>
                <div className="text-xl font-bold dark:text-white text-slate-900 font-mono mt-1">
                  {totalViews.toLocaleString()}
                </div>
              </div>

              <div className="p-3.5 dark:bg-[#0D1117] bg-slate-50 rounded-lg border dark:border-[#30363D] border-slate-200">
                <div className="flex items-center gap-1.5 dark:text-slate-400 text-slate-500 text-xs">
                  <Heart className="w-4 h-4 text-rose-500" /> Likes
                </div>
                <div className="text-xl font-bold dark:text-white text-slate-900 font-mono mt-1">
                  {totalLikes.toLocaleString()}
                </div>
              </div>

              <div className="p-3.5 dark:bg-[#0D1117] bg-slate-50 rounded-lg border dark:border-[#30363D] border-slate-200">
                <div className="flex items-center gap-1.5 dark:text-slate-400 text-slate-500 text-xs">
                  <Repeat className="w-4 h-4 text-emerald-500" /> Reposts
                </div>
                <div className="text-xl font-bold dark:text-white text-slate-900 font-mono mt-1">
                  {totalReposts.toLocaleString()}
                </div>
              </div>

              <div className="p-3.5 dark:bg-[#0D1117] bg-slate-50 rounded-lg border dark:border-[#30363D] border-slate-200">
                <div className="flex items-center gap-1.5 dark:text-slate-400 text-slate-500 text-xs">
                  <MessageCircle className="w-4 h-4 text-blue-500" /> Replies
                </div>
                <div className="text-xl font-bold dark:text-white text-slate-900 font-mono mt-1">
                  {totalReplies.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Top Creators Leaderboard in this campaign */}
            <div className="pt-3 border-t dark:border-[#30363D] border-slate-100 space-y-3">
              <h3 className="font-semibold text-sm dark:text-white text-slate-900">
                Top Ranked Content Creators in Your Campaigns
              </h3>
              <div className="divide-y dark:divide-[#30363D] divide-slate-100">
                {projectParticipants
                  .slice()
                  .sort((a, b) => b.score - a.score)
                  .map((p, idx) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold dark:text-slate-400 text-slate-500 font-mono">#{idx + 1}</span>
                        <img
                          src={p.creatorAvatar}
                          alt={p.creatorName}
                          className="w-7 h-7 rounded-full object-cover border dark:border-[#30363D] border-slate-200"
                        />
                        <div>
                          <div className="font-medium dark:text-white text-slate-900">{p.creatorName}</div>
                          <div className="dark:text-slate-500 text-slate-400 font-mono text-[11px]">@{p.creatorUsername}</div>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{p.score} pts</span>
                        <div className="dark:text-slate-500 text-slate-400 text-[11px]">
                          {p.totalImpressions.toLocaleString()} reach
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
