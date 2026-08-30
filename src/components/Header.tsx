import React, { useState } from 'react';
import {
  Radio,
  MessageSquare,
  Compass,
  Bookmark,
  Sliders,
  Flame,
  Clock,
  Sparkles,
  ChevronDown,
  WifiOff,
  Globe2,
  HeartHandshake,
  Bell,
  MapPin,
  Map,
} from 'lucide-react';
import { LanguageInfo, ProficiencyLevel, UserStats } from '../types';
import { SUPPORTED_LANGUAGES, PROFICIENCY_LEVELS } from '../data/languages';
import { AneMaddosLogo } from './AneMaddosLogo';

interface HeaderProps {
  activeTab: 'tourist_map' | 'tourist_helper' | 'live' | 'text' | 'scenarios' | 'vocabulary' | 'offline';
  onTabChange: (tab: 'tourist_map' | 'tourist_helper' | 'live' | 'text' | 'scenarios' | 'vocabulary' | 'offline') => void;
  currentLanguage: LanguageInfo;
  onLanguageChange: (lang: LanguageInfo) => void;
  currentLevel: ProficiencyLevel;
  onLevelChange: (level: ProficiencyLevel) => void;
  onOpenSettings: () => void;
  stats: UserStats;
  reminderSchedule?: { enabled?: boolean; time?: string };
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  currentLanguage,
  onLanguageChange,
  currentLevel,
  onLevelChange,
  onOpenSettings,
  stats,
  reminderSchedule,
}) => {
  const [regionFilter, setRegionFilter] = useState<'all' | 'ethiopian' | 'african' | 'global'>('all');

  const filteredLanguages =
    regionFilter === 'all'
      ? SUPPORTED_LANGUAGES
      : SUPPORTED_LANGUAGES.filter((l) => l.region === regionFilter);

  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2 gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <AneMaddosLogo variant="full" size="md" animated={true} />
          </div>

          {/* Language, Regional Grouping & Level Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Region Filter Selector */}
            <div className="relative group hidden sm:block">
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value as any)}
                className="appearance-none bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-2xl pl-3 pr-7 py-2 text-[11px] font-bold text-stone-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                title="Filter language regions"
              >
                <option value="all">🌍 All Regions</option>
                <option value="ethiopian">🇪🇹 Ethiopian & Horn</option>
                <option value="african">🌍 African Languages</option>
                <option value="global">🌐 Global Languages</option>
              </select>
              <ChevronDown className="w-3 h-3 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Language Selector */}
            <div className="relative group max-w-[200px] sm:max-w-xs">
              <select
                value={currentLanguage.code}
                onChange={(e) => {
                  const found = SUPPORTED_LANGUAGES.find((l) => l.code === e.target.value);
                  if (found) onLanguageChange(found);
                }}
                className="appearance-none bg-white hover:bg-stone-50 border border-stone-300 rounded-2xl pl-3 pr-8 py-2 text-xs font-bold text-stone-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer truncate"
                id="language-select"
              >
                {filteredLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Level Selector */}
            <div className="relative group">
              <select
                value={currentLevel}
                onChange={(e) => onLevelChange(e.target.value as ProficiencyLevel)}
                className="appearance-none bg-white hover:bg-stone-50 border border-stone-300 rounded-2xl pl-3 pr-8 py-2 text-xs font-bold text-stone-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer font-mono"
                id="level-select"
              >
                {PROFICIENCY_LEVELS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.id.split('_')[0]} • {lvl.label.split(' - ')[1]}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Speaking Stats Pill */}
            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-stone-100/80 rounded-2xl text-xs text-stone-600 border border-stone-200/60">
              <div className="flex items-center gap-1 font-semibold text-amber-700" title="Speaking practice streak">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>{stats.streakDays}d streak</span>
              </div>
              <span className="text-stone-300">|</span>
              <div className="flex items-center gap-1 font-medium" title="Total speaking time practiced">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span>{Math.round(stats.totalSpeakingTimeSeconds / 60)} min</span>
              </div>
            </div>

            {/* Settings & Reminder Button */}
            <div className="flex items-center gap-1.5">
              {reminderSchedule?.enabled && (
                <button
                  onClick={onOpenSettings}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-500/30 rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
                  title={`Daily practice reminder scheduled for ${reminderSchedule.time}`}
                >
                  <Bell className="w-3 h-3 text-amber-600 animate-pulse" />
                  <span>{reminderSchedule.time}</span>
                </button>
              )}
              <button
                onClick={onOpenSettings}
                className="relative p-2.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-2xl text-stone-600 hover:text-stone-900 shadow-sm transition-colors cursor-pointer"
                title="Partner, Persona & Voice Settings"
                id="header-settings-btn"
              >
                <Sliders className="w-4 h-4" />
                {reminderSchedule?.enabled && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 border-t border-stone-200/70 no-scrollbar">
          {[
            {
              id: 'tourist_map' as const,
              label: 'Interactive Tourist Map',
              icon: <MapPin className="w-4 h-4 text-amber-500" />,
              badge: 'Landmarks GPS',
            },
            {
              id: 'tourist_helper' as const,
              label: 'Tourism Ambassador Hub',
              icon: <Compass className="w-4 h-4 text-amber-600" />,
              badge: 'Historical Guide',
            },
            {
              id: 'live' as const,
              label: 'Live Voice Room',
              icon: <Radio className="w-4 h-4 text-emerald-600" />,
              badge: 'Real-time AI',
            },
            {
              id: 'text' as const,
              label: 'Text & Speech Tutor',
              icon: <MessageSquare className="w-4 h-4 text-amber-500" />,
            },
            {
              id: 'scenarios' as const,
              label: 'Tourism & Education Roleplay',
              icon: <Compass className="w-4 h-4 text-indigo-500" />,
            },
            {
              id: 'offline' as const,
              label: 'Offline & Tourism Phrasebook',
              icon: <WifiOff className="w-4 h-4 text-emerald-600" />,
              badge: 'Zero Data',
            },
            {
              id: 'vocabulary' as const,
              label: 'Saved Words & Deck',
              icon: <Bookmark className="w-4 h-4 text-rose-500" />,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200/80'
                }`}
                id={`nav-tab-${tab.id}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[9px] uppercase font-bold rounded-md ${
                      isActive ? 'bg-amber-500 text-stone-950 font-extrabold' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
