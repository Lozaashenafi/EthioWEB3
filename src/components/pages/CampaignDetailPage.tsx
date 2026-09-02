import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import {
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Award,
  Send,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface CampaignDetailPageProps {
  slug: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenAuth: (mode: 'login' | 'register-creator') => void;
}

export const CampaignDetailPage: React.FC<CampaignDetailPageProps> = ({
  slug,
  onOpenAuth,
}) => {
  const {
    campaigns,
    creators,
    participants,
    submissions,
    currentUser,
    joinCampaign,
    submitXPost,
    syncSubmissionMetrics,
  } = useApp();

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [postUrl, setPostUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [syncingSubId, setSyncingSubId] = useState<string | null>(null);

  const campaign = campaigns.find((c) => c.slug === slug);
  const activeCreator = creators.find((c) => c.userId === currentUser?.id) || creators[0];

  if (!campaign) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold dark:text-white text-slate-900">Campaign Not Found</h2>
        <p className="dark:text-slate-400 text-slate-600">The requested campaign does not exist or has been removed.</p>
      </div>
    );
  }

  // Filter participants for this campaign sorted by rank / score
  const campaignParticipants = participants
    .filter((p) => p.campaignId === campaign.id)
    .sort((a, b) => b.score - a.score);

  // Filter submissions for this campaign
  const campaignSubmissions = submissions
    .filter((s) => s.campaignId === campaign.id)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const isJoined = currentUser && participants.some(
    (p) => p.campaignId === campaign.id && p.creatorId === currentUser.id
  );

  const handleJoinClick = async () => {
    if (!currentUser || !activeCreator) {
      onOpenAuth('register-creator');
      return;
    }
    try {
      await joinCampaign(campaign.id, activeCreator);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to join campaign';
      alert(message);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (!activeCreator) throw new Error('Please set up your creator profile first');
      await submitXPost(campaign.id, activeCreator, postUrl);
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

  const handleSyncMetrics = async (submissionId: string) => {
    setSyncingSubId(submissionId);
    try {
      await syncSubmissionMetrics(submissionId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Metric sync failed';
      alert(message);
    } finally {
      setSyncingSubId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="rounded-xl overflow-hidden border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 shadow-xs">
        <div className="h-44 sm:h-56 relative overflow-hidden bg-slate-900">
          <img
            src={campaign.coverImage}
            alt={campaign.title}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="p-6 sm:p-8 -mt-20 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-3">
              <img
                src={campaign.projectLogo}
                alt={campaign.projectName}
                className="w-12 h-12 rounded-xl object-cover border dark:border-[#30363D] border-white shadow-sm bg-white"
              />
              <div>
                <span className="font-semibold text-sm dark:text-slate-200 text-slate-800">{campaign.projectName}</span>
                <div className="mt-0.5">
                  <Badge variant={campaign.status === 'ACTIVE' ? 'green' : 'gold'} size="sm">
                    {campaign.status}
                  </Badge>
                </div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white text-slate-900 leading-tight">
              {campaign.title}
            </h1>

            <p className="dark:text-slate-300 text-slate-600 text-sm leading-relaxed">
              {campaign.shortDescription}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="shrink-0 flex flex-col sm:flex-row gap-2">
            {isJoined ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsSubmitModalOpen(true)}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Submit X Post URL
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleJoinClick}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                {currentUser ? 'Join Campaign' : 'Sign In to Join'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-4 shadow-xs">
          <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Reward Pool</span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            ${campaign.rewardPool.total.toLocaleString()} {campaign.rewardPool.currency}
          </div>
        </div>
        <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-4 shadow-xs">
          <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Participants</span>
          <div className="text-xl font-bold dark:text-white text-slate-900 mt-1">
            {campaignParticipants.length} / {campaign.maxParticipants}
          </div>
        </div>
        <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-4 shadow-xs">
          <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Target Platform</span>
          <div className="text-xl font-bold dark:text-white text-slate-900 mt-1">
            {campaign.targetPlatforms.join(', ')}
          </div>
        </div>
        <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-4 shadow-xs">
          <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Campaign Deadline</span>
          <div className="text-sm font-bold dark:text-white text-slate-900 mt-2 truncate">
            {new Date(campaign.endDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Requirements, Rules, Reward Structure */}
        <div className="lg:col-span-7 space-y-6">
          {/* Detailed Description */}
          <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-6 space-y-3 shadow-xs">
            <h2 className="text-lg font-bold dark:text-white text-slate-900">Campaign Overview</h2>
            <div className="dark:text-slate-300 text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {campaign.description}
            </div>
          </div>

          {/* Requirements & Hashtags */}
          <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-lg font-bold dark:text-white text-slate-900">Content Requirements</h2>
            <ul className="space-y-2 text-sm dark:text-slate-300 text-slate-600">
              {campaign.contentRequirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t dark:border-[#30363D] border-slate-100 space-y-3">
              <div>
                <span className="text-xs font-semibold dark:text-slate-400 text-slate-500 block mb-1">
                  Required Hashtags:
                </span>
                <div className="flex flex-wrap gap-2">
                  {campaign.requiredHashtags.map((h) => (
                    <span
                      key={h}
                      className="text-xs font-mono font-medium text-emerald-800 bg-emerald-50 dark:text-emerald-400 dark:bg-[#21262D] px-2 py-0.5 rounded-md border dark:border-[#30363D] border-emerald-200"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold dark:text-slate-400 text-slate-500 block mb-1">
                  Required Mentions:
                </span>
                <div className="flex flex-wrap gap-2">
                  {campaign.requiredMentions.map((m) => (
                    <span
                      key={m}
                      className="text-xs font-mono font-medium dark:text-white dark:bg-[#21262D] text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border dark:border-[#30363D] border-slate-200"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reward Structure & Rules */}
          <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-6 space-y-3 shadow-xs">
            <h2 className="text-lg font-bold dark:text-white text-slate-900">Reward Distribution Structure</h2>
            <p className="text-sm dark:text-slate-300 text-slate-600 leading-relaxed dark:bg-[#0D1117] bg-slate-50 p-3.5 rounded-lg border dark:border-[#30363D] border-slate-200">
              {campaign.rewardPool.rewardStructure}
            </p>

            <h3 className="font-semibold text-sm dark:text-white text-slate-900 pt-2">Campaign Rules & Integrity</h3>
            <ul className="space-y-1.5 text-xs dark:text-slate-400 text-slate-600">
              {campaign.campaignRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Live Leaderboard & Submissions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Leaderboard Card */}
          <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b dark:border-[#30363D] border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                <h3 className="font-semibold dark:text-white text-slate-900 text-sm">Campaign Leaderboard</h3>
              </div>
              <Badge variant="green" size="sm">
                Live Score
              </Badge>
            </div>

            {campaignParticipants.length === 0 ? (
              <div className="text-center py-6 text-xs dark:text-slate-500 text-slate-400">
                No participants yet. Be the first creator to join!
              </div>
            ) : (
              <div className="space-y-2">
                {campaignParticipants.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between transition-colors ${
                      idx === 0
                        ? 'dark:bg-emerald-950/20 dark:border-emerald-800/60 bg-emerald-50 border-emerald-200'
                        : 'dark:bg-[#0D1117] dark:border-[#30363D] bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] font-mono dark:text-slate-300 text-slate-700 bg-slate-200 dark:bg-[#21262D]">
                        #{idx + 1}
                      </span>
                      <img
                        src={
                          p.creatorAvatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                        }
                        alt={p.creatorName}
                        className="w-7 h-7 rounded-full object-cover border dark:border-[#30363D] border-slate-300"
                      />
                      <div>
                        <div className="font-medium text-xs dark:text-white text-slate-900">{p.creatorName}</div>
                        <div className="text-[10px] dark:text-slate-500 text-slate-500 font-mono">
                          @{p.creatorUsername} • {p.totalPosts} post{p.totalPosts !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                        {p.score} pts
                      </div>
                      <div className="text-[10px] dark:text-slate-500 text-slate-500 font-mono">
                        {p.totalImpressions.toLocaleString()} views
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verified Content Feed */}
          <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b dark:border-[#30363D] border-slate-100">
              <h3 className="font-semibold dark:text-white text-slate-900 text-sm">Verified Content Submissions</h3>
              <span className="text-xs dark:text-slate-400 text-slate-500">{campaignSubmissions.length} posts</span>
            </div>

            {campaignSubmissions.length === 0 ? (
              <div className="text-center py-6 text-xs dark:text-slate-500 text-slate-400">
                No submissions yet. Submit your post to appear here.
              </div>
            ) : (
              <div className="space-y-2.5">
                {campaignSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 rounded-lg dark:bg-[#0D1117] dark:border-[#30363D] bg-slate-50 border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={sub.creatorAvatar}
                          alt={sub.creatorDisplayName}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-medium dark:text-white text-slate-900">{sub.creatorDisplayName}</span>
                        <span className="dark:text-slate-500 text-slate-500 font-mono text-[11px]">@{sub.creatorUsername}</span>
                      </div>
                      <a
                        href={sub.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>View X</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <p className="dark:text-slate-300 text-slate-600 text-xs italic line-clamp-2">
                      "{sub.contentText}"
                    </p>

                    <div className="pt-2 border-t dark:border-[#30363D] border-slate-200 flex items-center justify-between dark:text-slate-400 text-slate-500 font-mono text-[11px]">
                      <span>Views: {sub.metrics.impressions.toLocaleString()}</span>
                      <span>Likes: {sub.metrics.likes}</span>
                      <span>Reposts: {sub.metrics.reposts}</span>
                      <button
                        onClick={() => handleSyncMetrics(sub.id)}
                        disabled={syncingSubId === sub.id}
                        title="Sync X metrics"
                        className="p-1 dark:text-slate-400 dark:hover:text-white text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${
                            syncingSubId === sub.id ? 'animate-spin text-emerald-500' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* X Post Submission Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit X (Twitter) Post"
        subtitle={`Submit your post for "${campaign.title}". Hashtags and engagement metrics are verified automatically.`}
      >
        <form onSubmit={handlePostSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
              X Post URL *
            </label>
            <input
              type="url"
              required
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
              placeholder="https://x.com/yourhandle/status/1892300100234567890"
              className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <span className="text-[11px] dark:text-slate-500 text-slate-500 mt-1 block">
              Format: https://x.com/username/status/123456789 or https://twitter.com/...
            </span>
          </div>

          <div className="dark:bg-[#0D1117] bg-slate-50 p-3 rounded-lg border dark:border-[#30363D] border-slate-200 text-xs dark:text-slate-300 text-slate-600 space-y-1">
            <div className="font-semibold dark:text-white text-slate-900">Verification checklist:</div>
            <div>• Must include {campaign.requiredHashtags.join(' ')}</div>
            <div>• Must tag {campaign.requiredMentions.join(' ')}</div>
            <div>• Content must be original and published during the active window</div>
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
              <span>X Post verified and submitted! Leaderboard updated.</span>
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
