import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { UserCategory } from '../../types';
import { CheckCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register-creator' | 'register-project' | 'register-user';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, register, applyAsCreator, applyAsProject } = useApp();
  const [mode, setMode] = useState<'login' | 'register-creator' | 'register-project' | 'register-user'>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');

  // General Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCategory, setRegCategory] = useState<UserCategory>('Creator');

  // Creator profile state
  const [cDisplayName, setCDisplayName] = useState('');
  const [cUsername, setCUsername] = useState('');
  const [cCity, setCCity] = useState('Addis Ababa');
  const [cBio, setCBio] = useState('');
  const [cXHandle, setCXHandle] = useState('');
  const [cTelegram, setCTelegram] = useState('');
  const [cFollowers, setCFollowers] = useState('5000');
  const [cCategory, setCCategory] = useState('Web3 education');

  // Project registration state
  const [pName, setPName] = useState('');
  const [pWebsite, setPWebsite] = useState('');
  const [pEcosystem, setPEcosystem] = useState('Ethereum / L2');
  const [pEmail, setPEmail] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pRepName, setPRepName] = useState('');

  // Sync initialMode when modal opens
  React.useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccessMessage(null);
  }, [initialMode, isOpen]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(loginEmail.trim());
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed.';
      setError(message);
    }
  };

  const handleQuickLogin = async (email: string) => {
    try {
      await login(email);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Quick login failed.';
      setError(message);
    }
  };

  const handleUserRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(regName, regEmail, regCategory, 'USER');
      setSuccessMessage('Account registered successfully!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed.';
      setError(message);
    }
  };

  const handleCreatorApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const email = `${cUsername.toLowerCase().replace(/[^a-z0-9]/g, '')}@creator.local`;
      const newUser = await register(cDisplayName, email, 'Creator', 'CREATOR');

      await applyAsCreator({
        userId: newUser.id,
        displayName: cDisplayName,
        username: cUsername.replace('@', ''),
        bio: cBio,
        country: 'Ethiopia',
        city: cCity,
        languages: ['Amharic', 'English'],
        platforms: {
          x: cXHandle.startsWith('http') ? cXHandle : `https://x.com/${cXHandle.replace('@', '')}`,
          telegram: cTelegram ? (cTelegram.startsWith('@') ? cTelegram : `@${cTelegram}`) : undefined,
        },
        audience: {
          followerCount: Number(cFollowers),
          avgViews: Math.round(Number(cFollowers) * 0.4),
          engagementRate: 4.8,
          topLocations: ['Addis Ababa', 'Hawassa'],
        },
        experience: {
          yearsInWeb3: 2,
          previousCampaigns: 'Community writer and content contributor',
          portfolioLinks: [cXHandle],
        },
        categories: [cCategory, 'Education'],
      });

      setSuccessMessage('Application submitted! Your profile is pending review.');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Creator submission failed.';
      setError(message);
    }
  };

  const handleProjectApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const newUser = await register(pName, pEmail, 'Project / Company', 'PROJECT');

      await applyAsProject({
        userId: newUser.id,
        name: pName,
        logoUrl: `https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150`,
        description: pDescription,
        category: 'DeFi & Infrastructure',
        website: pWebsite.startsWith('http') ? pWebsite : `https://${pWebsite}`,
        ecosystem: pEcosystem,
        contactEmail: pEmail,
        socialLinks: {
          x: `https://x.com/${pName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        },
        representativeName: pRepName || 'Lead Contributor',
      });

      setSuccessMessage('Project submitted! EthioWeb3 admins will review your profile.');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Project submission failed.';
      setError(message);
    }
  };

  const titles = {
    login: 'Welcome Back',
    'register-creator': 'Apply as Web3 Creator',
    'register-project': 'Register Web3 Project / Protocol',
    'register-user': 'Join Community Directory',
  };

  const subtitles = {
    login: 'Select a demo persona below or sign in with your email.',
    'register-creator': 'Get verified to join sponsored campaigns and earn rewards.',
    'register-project': 'Launch campaigns and reward verified Ethiopian community creators.',
    'register-user': 'Join Ethiopia\'s fastest-growing blockchain builder & enthusiast network.',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titles[mode]}
      subtitle={subtitles[mode]}
      maxWidth={mode === 'register-creator' || mode === 'register-project' ? 'lg' : 'md'}
    >
      {/* Navigation tabs */}
      <div className="flex border-b dark:border-[#30363D] border-slate-200 mb-5 gap-1 overflow-x-auto text-xs font-semibold pb-2">
        <button
          onClick={() => {
            setMode('login');
            setError(null);
          }}
          className={`py-1.5 px-3 rounded-md cursor-pointer transition-colors ${
            mode === 'login'
              ? 'dark:bg-[#21262D] dark:text-white bg-slate-200 text-slate-900'
              : 'dark:text-slate-400 dark:hover:text-white text-slate-500 hover:text-slate-900'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setMode('register-creator');
            setError(null);
          }}
          className={`py-1.5 px-3 rounded-md cursor-pointer transition-colors ${
            mode === 'register-creator'
              ? 'dark:bg-emerald-950/40 dark:text-emerald-300 dark:border dark:border-emerald-800/60 bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'dark:text-slate-400 dark:hover:text-white text-slate-500 hover:text-slate-900'
          }`}
        >
          Join as Creator
        </button>
        <button
          onClick={() => {
            setMode('register-project');
            setError(null);
          }}
          className={`py-1.5 px-3 rounded-md cursor-pointer transition-colors ${
            mode === 'register-project'
              ? 'dark:bg-amber-950/40 dark:text-amber-300 dark:border dark:border-amber-800/60 bg-amber-100 text-amber-900 border border-amber-300'
              : 'dark:text-slate-400 dark:hover:text-white text-slate-500 hover:text-slate-900'
          }`}
        >
          Register Project
        </button>
        <button
          onClick={() => {
            setMode('register-user');
            setError(null);
          }}
          className={`py-1.5 px-3 rounded-md cursor-pointer transition-colors ${
            mode === 'register-user'
              ? 'dark:bg-[#21262D] dark:text-white bg-slate-200 text-slate-900'
              : 'dark:text-slate-400 dark:hover:text-white text-slate-500 hover:text-slate-900'
          }`}
        >
          General Member
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-3 mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* LOGIN MODE */}
      {mode === 'login' && (
        <div className="space-y-4">
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g. dawit@creator.ethioweb3.org"
                className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                defaultValue="password123"
                className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Sign In
            </Button>
          </form>

          {/* Instant 1-Click Demo Logins */}
          <div className="pt-3 border-t dark:border-[#30363D] border-slate-200">
            <div className="text-xs font-medium dark:text-slate-400 text-slate-500 mb-2">
              Instant 1-Click Demo Accounts:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@ethioweb3.org')}
                className="p-2.5 text-left rounded-lg dark:bg-[#0D1117] dark:hover:bg-[#21262D] dark:border-[#30363D] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs cursor-pointer transition-colors"
              >
                <div className="font-semibold dark:text-white text-slate-900">Admin</div>
                <div className="text-[10px] dark:text-slate-400 text-slate-500">Alazar Kebede</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('dawit@creator.ethioweb3.org')}
                className="p-2.5 text-left rounded-lg dark:bg-[#0D1117] dark:hover:bg-[#21262D] dark:border-[#30363D] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs cursor-pointer transition-colors"
              >
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">Creator (Approved)</div>
                <div className="text-[10px] dark:text-slate-400 text-slate-500">Dawit Alemu</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('contact@shebafi.org')}
                className="p-2.5 text-left rounded-lg dark:bg-[#0D1117] dark:hover:bg-[#21262D] dark:border-[#30363D] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs cursor-pointer transition-colors"
              >
                <div className="font-semibold text-blue-600 dark:text-blue-400">Project Rep</div>
                <div className="text-[10px] dark:text-slate-400 text-slate-500">ShebaFi Protocol</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATOR APPLICATION */}
      {mode === 'register-creator' && (
        <form onSubmit={handleCreatorApplication} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                Full Name / Display Name *
              </label>
              <input
                type="text"
                required
                value={cDisplayName}
                onChange={(e) => setCDisplayName(e.target.value)}
                placeholder="e.g. Bethlehem Tadesse"
                className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                Handle / Username *
              </label>
              <input
                type="text"
                required
                value={cUsername}
                onChange={(e) => setCUsername(e.target.value)}
                placeholder="e.g. bethlehem_eth"
                className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                X (Twitter) Profile or Link *
              </label>
              <input
                type="text"
                required
                value={cXHandle}
                onChange={(e) => setCXHandle(e.target.value)}
                placeholder="https://x.com/bethlehem_eth"
                className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                Telegram Channel / Username
              </label>
              <input
                type="text"
                value={cTelegram}
                onChange={(e) => setCTelegram(e.target.value)}
                placeholder="@ethio_defi_hub"
                className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                Estimated Followers
              </label>
              <select
                value={cFollowers}
                onChange={(e) => setCFollowers(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
              >
                <option value="1500" className="dark:bg-[#161B22] bg-white">1,000 - 3,000</option>
                <option value="5000" className="dark:bg-[#161B22] bg-white">3,000 - 10,000</option>
                <option value="15000" className="dark:bg-[#161B22] bg-white">10,000 - 30,000</option>
                <option value="50000" className="dark:bg-[#161B22] bg-white">30,000+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={cCity}
                onChange={(e) => setCCity(e.target.value)}
                placeholder="Addis Ababa"
                className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                Primary Niche
              </label>
              <select
                value={cCategory}
                onChange={(e) => setCCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
              >
                <option value="Web3 education" className="dark:bg-[#161B22] bg-white">Web3 Education</option>
                <option value="DeFi" className="dark:bg-[#161B22] bg-white">DeFi & Payments</option>
                <option value="Blockchain development" className="dark:bg-[#161B22] bg-white">Blockchain Development</option>
                <option value="Crypto" className="dark:bg-[#161B22] bg-white">Crypto & Trading</option>
                <option value="Community" className="dark:bg-[#161B22] bg-white">Community Building</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
              Short Bio & Web3 Experience *
            </label>
            <textarea
              rows={2}
              required
              value={cBio}
              onChange={(e) => setCBio(e.target.value)}
              placeholder="Tell us about the content you create and why you want to participate in campaigns..."
              className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Submit Creator Application
          </Button>
        </form>
      )}

      {/* PROJECT REGISTRATION */}
      {mode === 'register-project' && (
        <form onSubmit={handleProjectApplication} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                Protocol / Project Name *
              </label>
              <input
                type="text"
                required
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                placeholder="e.g. ShebaFi Protocol"
                className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                Official Website *
              </label>
              <input
                type="text"
                required
                value={pWebsite}
                onChange={(e) => setPWebsite(e.target.value)}
                placeholder="https://shebafi.org"
                className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                Underlying Ecosystem *
              </label>
              <input
                type="text"
                required
                value={pEcosystem}
                onChange={(e) => setPEcosystem(e.target.value)}
                placeholder="Ethereum, Arbitrum, Solana, Polygon, etc."
                className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                Work Contact Email *
              </label>
              <input
                type="email"
                required
                value={pEmail}
                onChange={(e) => setPEmail(e.target.value)}
                placeholder="partnerships@protocol.io"
                className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
              Representative Name
            </label>
            <input
              type="text"
              value={pRepName}
              onChange={(e) => setPRepName(e.target.value)}
              placeholder="e.g. Michael Chen (Ecosystem Lead)"
              className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
              Project Description & Goals in Ethiopia *
            </label>
            <textarea
              rows={2}
              required
              value={pDescription}
              onChange={(e) => setPDescription(e.target.value)}
              placeholder="What are your objectives in launching campaigns for the Ethiopian market?"
              className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Submit Project Onboarding Request
          </Button>
        </form>
      )}

      {/* GENERAL USER REGISTER */}
      {mode === 'register-user' && (
        <form onSubmit={handleUserRegister} className="space-y-3">
          <div>
            <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              placeholder="e.g. Yohannes Girma"
              className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              placeholder="yohannes@gmail.com"
              className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
              What best describes you? *
            </label>
            <select
              value={regCategory}
              onChange={(e) => setRegCategory(e.target.value as UserCategory)}
              className="w-full px-3 py-2 text-xs sm:text-sm dark:bg-[#0D1117] dark:border-[#30363D] dark:text-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
            >
              <option value="Creator" className="dark:bg-[#161B22] bg-white">Creator</option>
              <option value="Developer" className="dark:bg-[#161B22] bg-white">Developer</option>
              <option value="Builder" className="dark:bg-[#161B22] bg-white">Builder</option>
              <option value="Community Leader" className="dark:bg-[#161B22] bg-white">Community Leader</option>
              <option value="Trader" className="dark:bg-[#161B22] bg-white">Trader</option>
              <option value="Web3 Enthusiast" className="dark:bg-[#161B22] bg-white">Web3 Enthusiast</option>
              <option value="Student" className="dark:bg-[#161B22] bg-white">Student</option>
              <option value="Project / Company" className="dark:bg-[#161B22] bg-white">Project / Company</option>
            </select>
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Complete Registration
          </Button>
        </form>
      )}
    </Modal>
  );
};
