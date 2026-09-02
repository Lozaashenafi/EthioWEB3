import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Search, ExternalLink, Globe, Sparkles, CheckCircle2 } from 'lucide-react';

interface CreatorsPageProps {
  onOpenAuth: (mode: 'register-creator') => void;
}

export const CreatorsPage: React.FC<CreatorsPageProps> = ({ onOpenAuth }) => {
  const { approvedCreators } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'ALL',
    'Web3 education',
    'DeFi',
    'Crypto',
    'Blockchain development',
    'Technology',
    'Finance',
  ];

  const filtered = approvedCreators.filter((c) => {
    if (selectedCategory !== 'ALL' && !c.categories.includes(selectedCategory)) {
      return false;
    }
    if (
      searchTerm &&
      !c.displayName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.bio.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-medium dark:bg-[#161B22] dark:border-[#30363D] dark:text-emerald-400 bg-slate-100 border-slate-200 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Creator Network
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight dark:text-white text-slate-900">
            Ethiopian Web3 Creator Directory
          </h1>
          <p className="dark:text-slate-400 text-slate-600 max-w-2xl text-sm leading-relaxed">
            Discover verified creators educating communities across Ethiopia in Amharic, Afaan
            Oromo, and English.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => onOpenAuth('register-creator')}
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          Join as a Creator
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 dark:text-slate-500 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search creator by name, handle, or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === cat
                  ? 'dark:bg-[#21262D] dark:text-white bg-slate-900 text-white font-semibold'
                  : 'dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#21262D] text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat === 'ALL' ? 'All Niches' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Creators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-12 text-center space-y-2">
            <h3 className="font-semibold text-base dark:text-white text-slate-900">No creators found</h3>
            <p className="text-xs dark:text-slate-400 text-slate-600">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          filtered.map((creator) => (
            <div
              key={creator.id}
              className="rounded-xl border dark:border-[#30363D] dark:bg-[#161B22] bg-white border-slate-200 p-5 flex flex-col justify-between shadow-xs transition-colors"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                      alt={creator.displayName}
                      className="w-12 h-12 rounded-lg object-cover border dark:border-[#30363D] border-slate-200"
                    />
                    <div>
                      <h2 className="font-semibold dark:text-white text-slate-900 text-sm leading-snug">
                        {creator.displayName}
                      </h2>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">@{creator.username}</div>
                      <div className="text-[11px] dark:text-slate-500 text-slate-400 mt-0.5">
                        {creator.city}, {creator.country}
                      </div>
                    </div>
                  </div>
                  <Badge variant="green" size="sm">
                    Verified
                  </Badge>
                </div>

                <p className="text-xs dark:text-slate-300 text-slate-600 leading-relaxed line-clamp-3">
                  {creator.bio}
                </p>

                {/* Categories */}
                <div className="flex flex-wrap gap-1.5">
                  {creator.categories.map((cat) => (
                    <span
                      key={cat}
                      className="text-[11px] font-medium dark:text-slate-300 dark:bg-[#21262D] dark:border-[#30363D] text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Languages */}
                <div className="flex items-center gap-1.5 text-xs dark:text-slate-500 text-slate-500">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{creator.languages.join(' • ')}</span>
                </div>
              </div>

              <div className="pt-3.5 mt-3.5 border-t dark:border-[#30363D] border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase dark:text-slate-500 text-slate-400 font-semibold block">
                    Audience Reach
                  </span>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                    {creator.audience.followerCount.toLocaleString()}+ followers
                  </span>
                </div>

                {creator.platforms.x && (
                  <a
                    href={creator.platforms.x}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium dark:text-slate-300 text-slate-700 dark:bg-[#21262D] bg-slate-100 hover:bg-slate-200 dark:hover:bg-[#30363D] px-2.5 py-1 rounded-md border dark:border-[#30363D] border-slate-200 transition-colors"
                  >
                    <span>View on X</span>
                    <ExternalLink className="w-3 h-3 text-emerald-500" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
