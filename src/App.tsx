import React, { useState, useEffect } from 'react';
import {
  LanguageInfo,
  ProficiencyLevel,
  Scenario,
  PartnerSettings,
  VocabularyItem,
  UserStats,
  TouristDestination,
  Itinerary3Day,
} from './types';
import { SUPPORTED_LANGUAGES } from './data/languages';
import { DEFAULT_SCENARIOS } from './data/scenarios';
import { Header } from './components/Header';
import { TouristMap } from './components/TouristMap';
import { TouristHelperView } from './components/TouristHelperView';
import { LiveVoiceRoom } from './components/LiveVoiceRoom';
import { TextChatFallback } from './components/TextChatFallback';
import { ScenarioSelector } from './components/ScenarioSelector';
import { VocabularyDeck } from './components/VocabularyDeck';
import { OfflinePhrasebookView } from './components/OfflinePhrasebookView';
import { WordDetailModal } from './components/WordDetailModal';
import { CustomScenarioModal } from './components/CustomScenarioModal';
import { PartnerSettingsModal } from './components/PartnerSettingsModal';
import { AneMaddosLogo } from './components/AneMaddosLogo';
import { playReminderChime, sendBrowserNotification } from './utils/notifications';
import { Bell, Sparkles, X, ArrowRight, Clock, Flame } from 'lucide-react';

const DEFAULT_SETTINGS: PartnerSettings = {
  voiceName: 'Kore',
  speakingSpeed: 'normal',
  correctionStrictness: 'balanced',
  autoTranslate: false,
  pushToTalk: false,
  nativeLanguage: 'English',
  partnerPersona: 'Warm, patient, and inspirational cultural ambassador & tutor',
  reminderEnabled: false,
  reminderTime: '18:30',
  reminderFrequency: 'daily',
  reminderDays: [0, 1, 2, 3, 4, 5, 6],
  reminderSound: true,
};

const INITIAL_STATS: UserStats = {
  totalSpeakingTimeSeconds: 320,
  sessionsCompleted: 4,
  wordsSpoken: 110,
  correctionsLearned: 12,
  streakDays: 5,
  lastActiveDate: new Date().toISOString().slice(0, 10),
};

export default function App() {
  // Navigation & view mode
  const [activeTab, setActiveTab] = useState<'tourist_map' | 'tourist_helper' | 'live' | 'text' | 'scenarios' | 'vocabulary' | 'offline'>('tourist_map');

  // Language & Level - Default to Amharic (Ethiopian) or Spanish
  const [language, setLanguage] = useState<LanguageInfo>(SUPPORTED_LANGUAGES[0]);
  const [level, setLevel] = useState<ProficiencyLevel>('B1_INTERMEDIATE');

  // Scenario
  const [scenario, setScenario] = useState<Scenario>(DEFAULT_SCENARIOS[0]);
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>(() => {
    try {
      const saved = localStorage.getItem('lp_custom_scenarios');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Settings
  const [settings, setSettings] = useState<PartnerSettings>(() => {
    try {
      const saved = localStorage.getItem('lp_partner_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Vocabulary bank
  const [savedWords, setSavedWords] = useState<VocabularyItem[]>(() => {
    try {
      const saved = localStorage.getItem('lp_saved_vocab');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'init_1',
        word: 'ሰላም (Selam)',
        phonetic: 'sə.lam',
        partOfSpeech: 'greeting / noun',
        translation: 'Peace / Hello / Greetings',
        exampleSentence: 'ሰላም! እንደምን አደሩ?',
        exampleTranslation: 'Peace / Hello! Good morning, how did you spend the night?',
        language: 'Amharic',
        masteryLevel: 5,
        savedAt: Date.now() - 86400000,
      },
      {
        id: 'init_2',
        word: 'Karibu sana',
        phonetic: 'kah-ree-boo sah-nah',
        partOfSpeech: 'phrase',
        translation: 'You are very welcome',
        exampleSentence: 'Karibu sana kwenye nchi yetu nzuri.',
        exampleTranslation: 'You are very welcome to our beautiful country.',
        language: 'Swahili',
        masteryLevel: 4,
        savedAt: Date.now() - 43200000,
      },
      {
        id: 'init_3',
        word: 'por supuesto',
        phonetic: 'poɾ suˈpwesto',
        partOfSpeech: 'phrase',
        translation: 'of course / certainly',
        exampleSentence: 'Por supuesto, podemos explorar la ciudad juntos.',
        exampleTranslation: 'Of course, we can explore the city together.',
        language: 'Spanish',
        masteryLevel: 4,
        savedAt: Date.now() - 20000000,
      },
    ];
  });

  // Stats
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('lp_user_stats');
      return saved ? JSON.parse(saved) : INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  });

  // Modals state
  const [selectedWordForModal, setSelectedWordForModal] = useState<{
    word: string;
    context: string;
  } | null>(null);
  const [isCustomScenarioModalOpen, setIsCustomScenarioModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Practice Reminder Alert state
  const [activeReminderAlert, setActiveReminderAlert] = useState<{
    time: string;
    language: string;
  } | null>(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('lp_custom_scenarios', JSON.stringify(customScenarios));
  }, [customScenarios]);

  useEffect(() => {
    localStorage.setItem('lp_partner_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('lp_saved_vocab', JSON.stringify(savedWords));
  }, [savedWords]);

  useEffect(() => {
    localStorage.setItem('lp_user_stats', JSON.stringify(stats));
  }, [stats]);

  // Practice Reminder Background Scheduler
  useEffect(() => {
    if (!settings.reminderEnabled || !settings.reminderTime) return;

    const checkReminderTime = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday ...

      const targetDays = settings.reminderDays || [0, 1, 2, 3, 4, 5, 6];
      if (!targetDays.includes(currentDay)) return;

      if (currentTimeStr === settings.reminderTime) {
        const todayKey = `lp_reminded_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}_${currentTimeStr}`;
        const alreadyTriggered = sessionStorage.getItem(todayKey);

        if (!alreadyTriggered) {
          sessionStorage.setItem(todayKey, 'true');

          // Play melodious audio chime
          if (settings.reminderSound !== false) {
            playReminderChime();
          }

          // Trigger native browser notification
          sendBrowserNotification(`Language Partner AI: Time for ${language.name} practice! 🌟`, {
            body: `It's ${settings.reminderTime}! Practice 5 minutes of live voice speaking to maintain your ${stats.streakDays}-day streak.`,
            tag: 'practice-daily-reminder',
          });

          // Show interactive in-app reminder banner
          setActiveReminderAlert({
            time: settings.reminderTime,
            language: language.name,
          });
        }
      }
    };

    checkReminderTime();
    const interval = setInterval(checkReminderTime, 15000);
    return () => clearInterval(interval);
  }, [
    settings.reminderEnabled,
    settings.reminderTime,
    settings.reminderDays,
    settings.reminderSound,
    language.name,
    stats.streakDays,
  ]);

  // Handlers
  const handleSaveWord = (item: VocabularyItem) => {
    setSavedWords((prev) => {
      const exists = prev.some((w) => w.word.toLowerCase() === item.word.toLowerCase());
      if (exists) return prev;
      return [item, ...prev];
    });
  };

  const handleDeleteWord = (id: string) => {
    setSavedWords((prev) => prev.filter((w) => w.id !== id));
  };

  const handleUpdateWordMastery = (id: string, newLevel: number) => {
    setSavedWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, masteryLevel: newLevel } : w))
    );
  };

  const handleSessionComplete = (seconds: number, turns: number) => {
    if (seconds <= 0 && turns <= 0) return;
    setStats((prev) => ({
      ...prev,
      totalSpeakingTimeSeconds: prev.totalSpeakingTimeSeconds + seconds,
      sessionsCompleted: prev.sessionsCompleted + 1,
      wordsSpoken: prev.wordsSpoken + turns * 7,
    }));
  };

  const handleCreateCustomScenario = (newScenario: Scenario) => {
    setCustomScenarios((prev) => [newScenario, ...prev]);
    setScenario(newScenario);
    setActiveTab('live');
  };

  const handleStartRoleplayWithDestination = (dest: TouristDestination) => {
    // Dynamically create a specialized tourism ambassador tour scenario for this destination
    const destScenario: Scenario = {
      id: `tour_${dest.id}`,
      title: `Guided Tour of ${dest.name}`,
      iconName: 'Compass',
      category: 'tourism',
      level: level,
      description: `Live conversational tour of ${dest.name} (${dest.country}) with ANE MADDOS Tourism Ambassador AI.`,
      partnerRole: `Enthusiastic International Traveler exploring ${dest.name}`,
      userRole: `Official Tourism & Cultural Ambassador for ${dest.country}`,
      starterPrompt: `Hello! I have just arrived at ${dest.name} and I am in awe! Can you guide me through its historical wonders, cultural etiquette, and local traditions?`,
      objectives: [
        `Welcome the traveler to ${dest.name} in the native spoken language`,
        `Describe the architectural marvel and historical origins of ${dest.name}`,
        `Explain the local coffee rituals and cultural etiquette`,
      ],
      suggestedPhrases: dest.essentialLocalPhrases.map((p) => p.phrase),
    };
    setScenario(destScenario);
    setActiveTab('live');
  };

  const handleStartRoleplayWithItinerary = (itin: Itinerary3Day) => {
    const allPhrases = itin.days?.flatMap((d) => d.dailyPhrases?.map((p) => p.phrase) || []) || [];
    const itinScenario: Scenario = {
      id: `itin_tour_${itin.id}`,
      title: `3-Day Tour: ${itin.title}`,
      iconName: 'Compass',
      category: 'tourism',
      level: level,
      description: `Spoken immersive travel experience across ${itin.region} with ANE MADDOS Tourism Ambassador AI. ${itin.summary}`,
      partnerRole: `ANE MADDOS - Official Ethiopian Tourism Ambassador & Cultural Companion`,
      userRole: `Curious Traveler exploring ${itin.region}`,
      starterPrompt:
        itin.suggestedSpokenGuideStarter ||
        `Welcome to ${itin.region}! I am your ANE MADDOS Tourism Ambassador. Are you ready to begin our 3-day journey?`,
      objectives: [
        `Greet your ambassador warmly in the local language (${itin.targetLanguage})`,
        `Discuss Day 1 activities and historic/natural highlights in ${itin.region}`,
        `Learn about traditional coffee ceremony rituals and local dining etiquette`,
      ],
      suggestedPhrases: allPhrases.slice(0, 6),
    };
    setScenario(itinScenario);
    setActiveTab('live');
  };

  const isWordSaved = (word: string) => {
    return savedWords.some((w) => w.word.toLowerCase() === word.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col antialiased">
      {/* App Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentLanguage={language}
        onLanguageChange={(newLang) => {
          setLanguage(newLang);
          // Set default voice for language
          setSettings((prev) => ({
            ...prev,
            voiceName: newLang.defaultVoice || prev.voiceName,
          }));
        }}
        currentLevel={level}
        onLevelChange={setLevel}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        stats={stats}
        reminderSchedule={{
          enabled: settings.reminderEnabled,
          time: settings.reminderTime || '18:30',
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Practice Reminder Notification Banner */}
        {activeReminderAlert && (
          <div
            className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-stone-900 border border-amber-500/40 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 duration-300"
            id="active-practice-reminder-banner"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20 animate-bounce">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                    ⏰ Scheduled Practice Reminder ({activeReminderAlert.time})
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                    <Flame className="w-3 h-3" />
                    <span>{stats.streakDays} Day Streak</span>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-stone-100 font-display mt-0.5">
                  Time for your daily {activeReminderAlert.language} immersion practice!
                </h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  5 minutes of live conversational speaking today will solidify your vocabulary and keep your fluency streak going.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => {
                  setActiveTab('live');
                  setActiveReminderAlert(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                id="reminder-practice-live-btn"
              >
                <span>Practice Live Voice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  // Snooze 15 minutes
                  setActiveReminderAlert(null);
                }}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
              >
                Snooze
              </button>
              <button
                onClick={() => setActiveReminderAlert(null)}
                className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'tourist_map' && (
          <TouristMap
            currentLanguage={language}
            onStartRoleplayWithDestination={handleStartRoleplayWithDestination}
          />
        )}

        {activeTab === 'tourist_helper' && (
          <TouristHelperView
            currentLanguage={language}
            onStartRoleplayWithDestination={handleStartRoleplayWithDestination}
            onStartRoleplayWithItinerary={handleStartRoleplayWithItinerary}
          />
        )}

        {activeTab === 'live' && (
          <LiveVoiceRoom
            key={`${language.code}_${level}_${scenario.id}`}
            language={language}
            level={level}
            scenario={scenario}
            settings={settings}
            onWordClick={(word, sentence) => setSelectedWordForModal({ word, context: sentence })}
            onSaveWord={handleSaveWord}
            onSessionComplete={handleSessionComplete}
          />
        )}

        {activeTab === 'text' && (
          <TextChatFallback
            key={`text_${language.code}_${level}_${scenario.id}`}
            language={language}
            level={level}
            scenario={scenario}
            settings={settings}
            onWordClick={(word, sentence) => setSelectedWordForModal({ word, context: sentence })}
            onSaveWord={handleSaveWord}
            onSessionComplete={handleSessionComplete}
          />
        )}

        {activeTab === 'scenarios' && (
          <ScenarioSelector
            selectedScenario={scenario}
            onSelectScenario={(scen) => {
              setScenario(scen);
              setActiveTab('live');
            }}
            onOpenCustomModal={() => setIsCustomScenarioModalOpen(true)}
            customScenarios={customScenarios}
            targetLanguageName={language.name}
          />
        )}

        {activeTab === 'offline' && (
          <OfflinePhrasebookView currentLanguage={language} />
        )}

        {activeTab === 'vocabulary' && (
          <VocabularyDeck
            savedWords={savedWords}
            onDeleteWord={handleDeleteWord}
            onUpdateMastery={handleUpdateWordMastery}
            targetLanguageName={language.name}
            onWordClick={(word, context) => setSelectedWordForModal({ word, context })}
          />
        )}
      </main>

      {/* ANE MADDOS Vision & Deployment Footer */}
      <footer className="mt-12 bg-stone-900 border-t border-stone-800 text-stone-300 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <AneMaddosLogo variant="badge" size="md" />
            <div className="space-y-1">
              <div className="text-xs font-semibold text-stone-400">
                Bridging Culture, Heritage & Spoken Voice across the Horn of Africa & the World
              </div>
              <div className="text-[11px] text-stone-500 font-mono">
                100% Free • Certified Ethiopian Ministry Destinations • Zero-Data Offline Mode
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setActiveTab('tourist_map')}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold transition-colors cursor-pointer"
            >
              🗺️ 3D Tourist Map
            </button>
            <button
              onClick={() => setActiveTab('tourist_helper')}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold transition-colors cursor-pointer"
            >
              🧭 Heritage Hub
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black transition-colors cursor-pointer"
            >
              🎙️ Live Voice Room
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {selectedWordForModal && (
        <WordDetailModal
          word={selectedWordForModal.word}
          contextSentence={selectedWordForModal.context}
          targetLanguage={language.name}
          nativeLanguage={settings.nativeLanguage}
          onClose={() => setSelectedWordForModal(null)}
          onSaveWord={handleSaveWord}
          isSaved={isWordSaved(selectedWordForModal.word)}
        />
      )}

      {isCustomScenarioModalOpen && (
        <CustomScenarioModal
          targetLanguage={language.name}
          level={level}
          onClose={() => setIsCustomScenarioModalOpen(false)}
          onScenarioCreated={handleCreateCustomScenario}
        />
      )}

      {isSettingsModalOpen && (
        <PartnerSettingsModal
          settings={settings}
          onSave={setSettings}
          onClose={() => setIsSettingsModalOpen(false)}
          targetLanguageName={language.name}
        />
      )}
    </div>
  );
}
