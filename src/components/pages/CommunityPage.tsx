import React from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Users, MapPin, MessageSquare, Sparkles, ArrowUpRight } from 'lucide-react';

interface CommunityPageProps {
  onOpenAuth: (mode: 'register-user') => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ onOpenAuth }) => {
  const hubs = [
    {
      city: 'Addis Ababa (HQ Hub)',
      location: 'Bole / Kazanchis Innovation Districts',
      members: '3,800+ Members',
      focus: 'DeFi Research, L2 Developers, Campus Hackathons',
      status: 'Active Weekly Meetups',
    },
    {
      city: 'Hawassa Hub',
      location: 'Hawassa University Technology Park',
      members: '1,200+ Members',
      focus: 'Smart Contract Bootcamps & Student Hackers',
      status: 'Monthly Workshops',
    },
    {
      city: 'Bahir Dar Hub',
      location: 'Poly Institute of Technology',
      members: '850+ Members',
      focus: 'Crypto Literacy & Freelancer On-ramps',
      status: 'Bi-weekly Sessions',
    },
    {
      city: 'Dire Dawa Hub',
      location: 'East Ethiopia Tech Center',
      members: '600+ Members',
      focus: 'Cross-border Trade & Remittance Research',
      status: 'Forming Community',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-medium dark:bg-[#161B22] dark:border-[#30363D] dark:text-emerald-400 bg-slate-100 border-slate-200 text-emerald-800">
          <Users className="w-3.5 h-3.5" />
          Grassroots Ecosystem
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight dark:text-white text-slate-900">
          Ethiopia’s Grassroots Web3 Community
        </h1>
        <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
          From university computer science clubs to developer meetups, we connect grassroots Web3
          builders across Ethiopia. Join a local hub or start a university chapter.
        </p>
      </div>

      {/* Regional Hubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {hubs.map((hub) => (
          <div
            key={hub.city}
            className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 space-y-3.5 shadow-xs transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-base dark:text-white text-slate-900">{hub.city}</h3>
                <div className="flex items-center gap-1.5 text-xs dark:text-slate-400 text-slate-500 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{hub.location}</span>
                </div>
              </div>
              <Badge variant="green" size="sm">
                {hub.status}
              </Badge>
            </div>

            <div className="text-xs dark:text-slate-300 text-slate-600 space-y-1.5 pt-1">
              <div>
                <strong className="dark:text-white text-slate-900">Focus:</strong> {hub.focus}
              </div>
              <div>
                <strong className="dark:text-white text-slate-900">Network Size:</strong> {hub.members}
              </div>
            </div>

            <div className="pt-3 border-t dark:border-[#30363D] border-slate-100 flex items-center justify-between">
              <a
                href="https://t.me/ethio_crypto_insights"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Join Telegram Group</span>
              </a>
              <span className="text-[11px] dark:text-slate-500 text-slate-400 font-mono">Grassroots Chapter</span>
            </div>
          </div>
        ))}
      </div>

      {/* Callout */}
      <div className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-6 sm:p-8 text-center space-y-3 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-bold dark:text-white text-slate-900">
          Are you a University Club or Community Lead?
        </h2>
        <p className="dark:text-slate-400 text-slate-600 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
          Partner your campus organization with EthioWeb3 to get direct protocol sponsorship,
          workshop bounties, and hackathon travel grants.
        </p>
        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => onOpenAuth('register-user')}
            leftIcon={<Sparkles className="w-4 h-4" />}
            rightIcon={<ArrowUpRight className="w-4 h-4" />}
          >
            Register as Community Leader
          </Button>
        </div>
      </div>
    </div>
  );
};
