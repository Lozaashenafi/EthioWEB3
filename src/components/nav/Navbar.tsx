import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ThemeToggle } from '../ui/ThemeToggle';
import {
  Bell,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  onOpenAuth: (mode: 'login' | 'register-creator' | 'register-project' | 'register-user') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { currentUser, logout, notifications, markNotificationRead, theme } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const isDark = theme === 'dark';

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'creators', label: 'Creators' },
    { id: 'community', label: 'Community' },
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-200 ${
        isDark
          ? 'bg-[#0D1117] border-[#30363D] text-slate-100'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span
              className={`font-sans font-bold text-lg tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Ethio<span className="text-emerald-500">Web3</span>
            </span>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-md border font-medium hidden sm:inline ${
              isDark
                ? 'text-slate-400 border-[#30363D] bg-[#161B22]'
                : 'text-slate-600 border-slate-200 bg-slate-100'
            }`}
          >
            East Africa
          </span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'text-emerald-400 bg-[#161B22] font-semibold'
                      : 'text-emerald-800 bg-slate-100 font-semibold'
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-[#161B22]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Area */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-md border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-[#161B22] border-[#30363D] text-slate-300 hover:text-white hover:bg-[#21262D]'
                      : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div
                    className={`absolute right-0 top-full mt-1.5 w-80 rounded-lg shadow-lg border z-50 p-1 overflow-hidden ${
                      isDark
                        ? 'bg-[#161B22] border-[#30363D] text-slate-100'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div
                      className={`px-3 py-2 border-b flex items-center justify-between ${
                        isDark ? 'border-[#30363D]' : 'border-slate-100'
                      }`}
                    >
                      <span className="font-semibold text-xs">Notifications</span>
                      <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {unreadCount} unread
                      </span>
                    </div>
                    <div
                      className={`max-h-64 overflow-y-auto divide-y ${
                        isDark ? 'divide-[#30363D]' : 'divide-slate-100'
                      }`}
                    >
                      {notifications.length === 0 ? (
                        <div
                          className={`p-4 text-center text-xs ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          No notifications
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markNotificationRead(n.id);
                              if (n.link) handleNavClick(n.link);
                              setShowNotifications(false);
                            }}
                            className={`p-3 text-left cursor-pointer transition-colors ${
                              isDark ? 'hover:bg-[#21262D]' : 'hover:bg-slate-50'
                            } ${!n.read ? (isDark ? 'bg-emerald-950/30' : 'bg-emerald-50') : ''}`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-xs font-semibold">{n.title}</span>
                              {!n.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                              )}
                            </div>
                            <p
                              className={`text-xs mt-0.5 line-clamp-2 ${
                                isDark ? 'text-slate-400' : 'text-slate-600'
                              }`}
                            >
                              {n.message}
                            </p>
                            <span
                              className={`text-[11px] mt-1 block ${
                                isDark ? 'text-slate-500' : 'text-slate-400'
                              }`}
                            >
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Dashboard Navigation Button */}
              <Button
                variant={isDark ? 'forest' : 'primary'}
                size="sm"
                leftIcon={<LayoutDashboard className="w-4 h-4" />}
                onClick={() => handleNavClick('dashboard')}
              >
                Dashboard
              </Button>

              {/* User Avatar & Logout */}
              <div
                className={`flex items-center gap-2 pl-2 border-l ${
                  isDark ? 'border-[#30363D]' : 'border-slate-200'
                }`}
              >
                <img
                  src={
                    currentUser.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                  }
                  alt={currentUser.name}
                  className={`w-7 h-7 rounded-full object-cover border ${
                    isDark ? 'border-[#30363D]' : 'border-slate-300'
                  }`}
                />
                <button
                  onClick={logout}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    isDark
                      ? 'text-slate-400 hover:text-rose-400 hover:bg-[#21262D]'
                      : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                  }`}
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className={`text-sm px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  isDark
                    ? 'text-slate-300 hover:text-white hover:bg-[#161B22]'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium'
                }`}
              >
                Login
              </button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onOpenAuth('register-project')}
              >
                Launch Campaign
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                onClick={() => onOpenAuth('register-creator')}
              >
                Join Network
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          {currentUser && (
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`p-2 rounded-md border ${
                isDark
                  ? 'bg-[#161B22] text-emerald-400 border-[#30363D]'
                  : 'bg-slate-100 text-emerald-700 border-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-md border ${
              isDark
                ? 'bg-[#161B22] border-[#30363D] text-slate-200 hover:bg-[#21262D]'
                : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className={`lg:hidden border-b px-4 py-4 space-y-3 ${
            isDark
              ? 'bg-[#0D1117] border-[#30363D] text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === link.id
                    ? isDark
                      ? 'bg-[#161B22] text-emerald-400 font-semibold'
                      : 'bg-emerald-50 text-emerald-800 font-semibold'
                    : isDark
                    ? 'text-slate-300 hover:bg-[#161B22] hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div
            className={`pt-3 border-t flex flex-col gap-2 ${
              isDark ? 'border-[#30363D]' : 'border-slate-200'
            }`}
          >
            {currentUser ? (
              <>
                <div
                  className={`flex items-center gap-3 p-2.5 rounded-lg border ${
                    isDark
                      ? 'bg-[#161B22] border-[#30363D]'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-400/20"
                  />
                  <div>
                    <div className="font-semibold text-sm">{currentUser.name}</div>
                    <Badge variant="green" size="sm">
                      {currentUser.role}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  leftIcon={<LayoutDashboard className="w-4 h-4" />}
                  onClick={() => handleNavClick('dashboard')}
                >
                  Go to Dashboard
                </Button>
                <Button variant="ghost" className="w-full" onClick={logout}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register-creator');
                  }}
                >
                  Join Network as Creator
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register-project');
                  }}
                >
                  Partner / Launch Campaign
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
