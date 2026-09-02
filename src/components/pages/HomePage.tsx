import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Building2,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Globe2,
  Play,
  Zap,
  ChevronRight,
  Send,
  Award,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface HomePageProps {
  onNavigate: (view: string, param?: string) => void;
  onOpenAuth: (mode: 'login' | 'register-creator' | 'register-project' | 'register-user') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAuth }) => {
  const { campaigns, approvedCreators, submissions } = useApp();
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  // Compute live platform statistics
  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE');
  const totalImpressions = submissions.reduce((sum, s) => sum + s.metrics.impressions, 0);
  const totalRewardsPool = campaigns.reduce((sum, c) => sum + c.rewardPool.total, 0);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ name: '', email: '', message: '' });
    }, 4000);
  };

  return (
    <div className="space-y-20 pb-24">
      {/* 1. HERO SECTION */}
      <section className="pt-10 sm:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* Status Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border text-xs font-medium dark:bg-[#161B22] dark:border-[#30363D] dark:text-slate-300 bg-white border-slate-200 text-slate-700 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              The Decentralized Creator Gateway in East Africa
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15] dark:text-white text-slate-900">
              Connecting Web3 protocols with Africa’s{' '}
              <span className="text-emerald-600 dark:text-emerald-400">
                creators & communities.
              </span>
            </h1>

            <p className="text-base sm:text-lg dark:text-slate-300 text-slate-600 max-w-2xl leading-relaxed">
              We help international blockchain protocols build meaningful grassroots presence in
              Ethiopia through a coordinated network of verified creators, developers, and measurable
              social campaigns.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => onOpenAuth('register-creator')}
                rightIcon={<ArrowUpRight className="w-4 h-4" />}
              >
                Join the Network
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => onOpenAuth('register-project')}
                leftIcon={<Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              >
                Partner With Us
              </Button>
            </div>

            {/* Micro-Features / Trust Signals */}
            <div className="pt-3 flex flex-wrap items-center gap-5 text-xs dark:text-slate-400 text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Verified Creator Audience</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Audited Social Metrics</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Transparent Escrow Bounties</span>
              </div>
            </div>
          </div>

          {/* Right Column: Grounded Campaign Hub Card */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-6 shadow-xs">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b dark:border-[#30363D] border-slate-200 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg dark:bg-[#21262D] bg-slate-100 flex items-center justify-center text-emerald-500">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm dark:text-white text-slate-900">Live Campaign Hub</div>
                    <div className="text-xs dark:text-slate-400 text-slate-500">Active Grassroots Sprints</div>
                  </div>
                </div>
                <Badge variant="green" size="sm">
                  {activeCampaigns.length} Active Sprints
                </Badge>
              </div>

              {/* Showcase Content with clean dividers instead of nested cards */}
              <div className="divide-y dark:divide-[#30363D] divide-slate-100">
                {/* Sprint 1 */}
                <div className="py-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium dark:text-slate-300 text-slate-700">Arbitrum Africa Initiative</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">$3,500 USDC</span>
                  </div>
                  <div className="text-xs dark:text-slate-400 text-slate-600 font-medium">
                    Builders & Creators Amharic Campaign
                  </div>
                  <div className="flex items-center justify-between text-[11px] dark:text-slate-500 text-slate-500 pt-1">
                    <span>14 Participating Creators</span>
                    <span className="font-mono">24.8k Verified Views</span>
                  </div>
                </div>

                {/* Sprint 2 */}
                <div className="py-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md dark:bg-[#21262D] bg-slate-100 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div>
                      <span className="font-medium dark:text-white text-slate-900 block">Recent Submission</span>
                      <span className="dark:text-slate-400 text-slate-500 text-[11px] font-mono">@dawit_web3 • 6.8k views</span>
                    </div>
                  </div>
                  <Badge variant="green" size="sm">
                    Verified
                  </Badge>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t dark:border-[#30363D] border-slate-100">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => onNavigate('campaigns')}
                  rightIcon={<ArrowUpRight className="w-4 h-4" />}
                >
                  Explore All Campaigns
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-6 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x dark:divide-[#30363D] divide-slate-200">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider font-semibold dark:text-slate-400 text-slate-500">
                Verified Creators
              </span>
              <div className="text-3xl font-bold font-mono dark:text-white text-slate-900">
                {approvedCreators.length}+
              </div>
              <p className="text-xs dark:text-slate-400 text-slate-600">
                Amharic, Oromo & English communicators
              </p>
            </div>

            <div className="space-y-1 pt-4 md:pt-0 md:pl-6">
              <span className="text-xs uppercase tracking-wider font-semibold dark:text-slate-400 text-slate-500">
                Audited Impressions
              </span>
              <div className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {(totalImpressions / 1000).toFixed(0)}k+
              </div>
              <p className="text-xs dark:text-slate-400 text-slate-600">
                Across X threads & Telegram groups
              </p>
            </div>

            <div className="space-y-1 pt-4 md:pt-0 md:pl-6">
              <span className="text-xs uppercase tracking-wider font-semibold dark:text-slate-400 text-slate-500">
                Escrowed Rewards
              </span>
              <div className="text-3xl font-bold font-mono dark:text-white text-slate-900">
                ${(totalRewardsPool / 1000).toFixed(1)}k
              </div>
              <p className="text-xs dark:text-slate-400 text-slate-600">
                Total campaign pools funded in USDC
              </p>
            </div>

            <div className="space-y-1 pt-4 md:pt-0 md:pl-6">
              <span className="text-xs uppercase tracking-wider font-semibold dark:text-slate-400 text-slate-500">
                Community Hubs
              </span>
              <div className="text-3xl font-bold font-mono dark:text-white text-slate-900">
                4 Cities
              </div>
              <p className="text-xs dark:text-slate-400 text-slate-600">
                Addis Ababa, Hawassa, Bahir Dar, Nairobi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOWCASE SPOTLIGHT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-medium dark:bg-[#21262D] dark:border-[#30363D] dark:text-emerald-400 bg-slate-100 border-slate-200 text-emerald-800">
                <Globe2 className="w-3.5 h-3.5" />
                Addis Ababa Web3 Community Hub
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white text-slate-900">
                Supporting the next generation of builders in East Africa.
              </h2>
              <p className="text-sm dark:text-slate-300 text-slate-600 leading-relaxed max-w-xl">
                Watch how authentic local creators translate technical protocol documentation into Amharic,
                Oromo, and accessible digital threads that mobilize thousands of developers and university students.
              </p>
              <div className="pt-2 flex items-center gap-4">
                <button
                  onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs dark:bg-[#21262D] dark:hover:bg-[#30363D] dark:text-white bg-slate-100 hover:bg-slate-200 text-slate-900 border dark:border-[#30363D] border-slate-300 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-emerald-500" />
                  <span>Community Highlights (01:45)</span>
                </button>
                <span className="text-xs dark:text-slate-400 text-slate-500">
                  Addis Ababa Blockchain Sprint
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-lg overflow-hidden border dark:border-[#30363D] border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80"
                  alt="Community Workshop in Addis Ababa"
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button
                    onClick={() => setIsPlayingVideo(true)}
                    className="w-12 h-12 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-md hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Play video"
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Video modal overlay if active */}
          <AnimatePresence>
            {isPlayingVideo && (
              <div className="mt-6 pt-6 border-t dark:border-[#30363D] border-slate-200">
                <div className="flex items-center justify-between pb-3">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Community Preview</span>
                  <button
                    onClick={() => setIsPlayingVideo(false)}
                    className="text-xs dark:text-slate-400 dark:hover:text-white text-slate-600 hover:text-slate-900 px-2 py-1 rounded-md border dark:border-[#30363D] border-slate-200"
                  >
                    Close ✕
                  </button>
                </div>
                <div className="p-6 text-center dark:bg-[#0D1117] bg-slate-50 rounded-lg border dark:border-[#30363D] border-slate-200 space-y-2">
                  <h4 className="font-semibold text-sm dark:text-white text-slate-900">
                    Addis Ababa Community Showcase Reel
                  </h4>
                  <p className="text-xs dark:text-slate-400 text-slate-600 max-w-md mx-auto">
                    Featuring Dawit, Amen, and 14 grassroots educators hosting live Arbitrum, Solana, and Ethereum workshops.
                  </p>
                  <div className="pt-2">
                    <Button variant="secondary" size="sm" onClick={() => onNavigate('community')}>
                      Visit Community Telegram Hub
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 4. THE 4 PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b dark:border-[#30363D] border-slate-200 pb-4">
          <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
            Platform Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold dark:text-white text-slate-900 tracking-tight">
            4 Pillars of Verified Community Growth
          </h2>
          <p className="dark:text-slate-400 text-slate-600 text-sm mt-1 max-w-2xl">
            Eliminating manual coordination and fake bot engagement with audited social metrics and escrow payouts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              step: '01',
              title: 'Vetted Native Creators',
              desc: 'Every creator in our network undergoes human review of past reach, Amharic/English fluency, and verified crypto audience authenticity.',
            },
            {
              step: '02',
              title: 'Automated Social Metrics',
              desc: 'Submissions are verified directly against official X API feeds. Real impressions, retweets, and bookmarks determine performance ranking.',
            },
            {
              step: '03',
              title: 'Milestone Escrow Payouts',
              desc: 'Projects fund campaign bounties in advance. Transparent leaderboards ensure creators are paid directly upon confirmed milestone completion.',
            },
            {
              step: '04',
              title: 'East African Expansion',
              desc: 'Originating in Addis Ababa, our protocol framework scales effortlessly across Kenya, Rwanda, and Uganda for pan-African impact.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-6 flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold dark:text-slate-500 text-slate-400">
                  {item.step}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-semibold text-base dark:text-white text-slate-900">
                  {item.title}
                </h3>
                <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ACTIVE CAMPAIGNS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b dark:border-[#30363D] border-slate-200 pb-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
              Active Opportunities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold dark:text-white text-slate-900 tracking-tight">
              Current Sprints & Bounties
            </h2>
            <p className="dark:text-slate-400 text-slate-600 text-sm mt-1">
              Discover active community sprints funded by global protocols and DeFi platforms.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            rightIcon={<ChevronRight className="w-4 h-4" />}
            onClick={() => onNavigate('campaigns')}
          >
            View All Campaigns ({campaigns.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campaigns.slice(0, 3).map((camp) => (
            <div
              key={camp.id}
              className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="h-40 relative bg-slate-900 overflow-hidden">
                  <img
                    src={camp.coverImage}
                    alt={camp.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant={camp.status === 'ACTIVE' ? 'green' : 'gold'} size="sm">
                      {camp.status}
                    </Badge>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium dark:text-slate-400 text-slate-500">
                    <img
                      src={camp.projectLogo}
                      alt={camp.projectName}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="dark:text-slate-300 text-slate-700">{camp.projectName}</span>
                  </div>

                  <h3 className="font-semibold dark:text-white text-slate-900 text-base line-clamp-1">
                    {camp.title}
                  </h3>
                  <p className="text-xs dark:text-slate-400 text-slate-600 line-clamp-2 leading-relaxed">
                    {camp.shortDescription}
                  </p>

                  <div className="pt-3 border-t dark:border-[#30363D] border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="dark:text-slate-400 text-slate-500 block text-[11px]">Reward Pool</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                        ${camp.rewardPool.total.toLocaleString()} {camp.rewardPool.currency}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="dark:text-slate-400 text-slate-500 block text-[11px]">Platform</span>
                      <span className="font-medium dark:text-slate-300 text-slate-700">
                        {camp.targetPlatforms.join(', ')}
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
                  onClick={() => onNavigate('campaign-detail', camp.slug)}
                >
                  View Campaign Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PROTOCOL ONBOARDING FORM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
                Protocol Onboarding
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold dark:text-white text-slate-900 tracking-tight">
                Ready to launch your campaign in Ethiopia?
              </h2>
              <p className="text-sm dark:text-slate-300 text-slate-600 leading-relaxed">
                Connect directly with our platform coordinators. We match your protocol with vetted Ethiopian
                creators, define verified KPIs, and launch your structured social sprint.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-5 text-xs dark:text-slate-400 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Verified Creator Network</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Transparent Escrow Contracts</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-6">
              {contactSubmitted ? (
                <div className="p-6 rounded-lg dark:bg-emerald-950/30 dark:border-emerald-800/80 bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full dark:bg-emerald-900/50 bg-emerald-100 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold dark:text-white text-slate-900 text-sm">Inquiry Received</h4>
                  <p className="text-xs dark:text-slate-300 text-slate-600">
                    Thank you! Our platform coordinator will reach out to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                        Your Name / Protocol
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Arbitrum Foundation"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                        Work Email / Telegram
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="rep@protocol.io or @handle"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                      Campaign Goals & Budget
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe your upcoming sprint, target audience, or bounty parameters..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    rightIcon={<Send className="w-4 h-4" />}
                  >
                    Submit Inquiry
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 7. CLEAN PROFESSIONAL FOOTER */}
      <footer className="border-t dark:border-[#30363D] border-slate-200 pt-10 text-xs dark:text-slate-400 text-slate-600 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-sm dark:text-white text-slate-900">EthioWeb3</span>
            </div>
            <p className="leading-relaxed">
              The grassroots gateway connecting global Web3 protocols with Ethiopian creators and communities.
            </p>
          </div>
          <div>
            <div className="font-semibold dark:text-white text-slate-900 mb-2">Explore</div>
            <ul className="space-y-1.5">
              <li><button onClick={() => onNavigate('campaigns')} className="hover:underline cursor-pointer">Campaigns</button></li>
              <li><button onClick={() => onNavigate('creators')} className="hover:underline cursor-pointer">Creator Directory</button></li>
              <li><button onClick={() => onNavigate('community')} className="hover:underline cursor-pointer">Community Hubs</button></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold dark:text-white text-slate-900 mb-2">For Organizations</div>
            <ul className="space-y-1.5">
              <li><button onClick={() => onNavigate('for-projects')} className="hover:underline cursor-pointer">Protocol Onboarding</button></li>
              <li><button onClick={() => onOpenAuth('register-project')} className="hover:underline cursor-pointer">Launch Campaign</button></li>
              <li><button onClick={() => onNavigate('about')} className="hover:underline cursor-pointer">Platform Architecture</button></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold dark:text-white text-slate-900 mb-2">Network Hubs</div>
            <p className="dark:text-slate-400 text-slate-600">
              Addis Ababa • Hawassa • Bahir Dar • Nairobi
            </p>
            <p className="mt-2 text-emerald-600 dark:text-emerald-400 font-medium">
              EthioWeb3 Platform
            </p>
          </div>
        </div>
        <div className="pt-4 border-t dark:border-[#30363D] border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 EthioWeb3 Community Platform. All rights reserved.</span>
          <span className="font-mono text-[11px] dark:text-slate-500 text-slate-400">Production Verified MVP</span>
        </div>
      </footer>
    </div>
  );
};
