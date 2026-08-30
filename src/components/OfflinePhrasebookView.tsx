import React, { useState } from 'react';
import { OFFLINE_PHRASEBOOK } from '../data/offlinePhrases';
import { LanguageInfo } from '../types';
import {
  Volume2,
  WifiOff,
  Sparkles,
  Award,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Download,
  CheckCircle2,
  Copy,
  Languages,
  BookOpen,
} from 'lucide-react';

interface OfflinePhrasebookViewProps {
  currentLanguage: LanguageInfo;
  onSelectLanguage?: (langCode: string) => void;
}

export const OfflinePhrasebookView: React.FC<OfflinePhrasebookViewProps> = ({
  currentLanguage,
}) => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [savedOfflineStatus, setSavedOfflineStatus] = useState<boolean>(true);

  // Get categories for selected language, fallback to Amharic or English if needed
  const categories =
    OFFLINE_PHRASEBOOK[currentLanguage.code] ||
    OFFLINE_PHRASEBOOK['am'] ||
    OFFLINE_PHRASEBOOK['en'] ||
    [];

  const currentCategory = categories[activeCategoryIndex] || categories[0];

  const handleSpeak = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Try to set speech synthesis language if browser supports it
      utterance.lang = currentLanguage.code;
      utterance.rate = 0.85; // slightly slower for educational clarity
      setSpeakingId(id);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in" id="offline-phrasebook-view">
      {/* Top Banner: 100% Free Offline & Tourism Ambassador Hub */}
      <div className="p-6 bg-gradient-to-r from-emerald-900/40 via-stone-900 to-amber-950/40 border border-emerald-500/30 rounded-2xl shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <WifiOff className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-display">
                Zero-Data Offline & Rural Mode
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                100% Free Forever
              </span>
            </div>
            <h2 className="text-2xl font-bold font-display text-white">
              Tourism Ambassador & Community Phrasebook
            </h2>
            <p className="text-sm text-stone-300 max-w-2xl leading-relaxed">
              Equipping students, teachers, rural communities, and global travelers with instant,
              offline-ready spoken phrases, phonetics, and cultural etiquette for{' '}
              <strong className="text-emerald-300">{currentLanguage.name}</strong> ({currentLanguage.nativeName}).
            </p>
          </div>

          {/* Offline Cached Badge */}
          <div className="flex items-center gap-3 bg-stone-900/80 p-3 rounded-xl border border-stone-700/80 shrink-0">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-200">Device Local Storage</div>
              <div className="text-[11px] text-emerald-400 font-medium">Ready Without Internet</div>
            </div>
          </div>
        </div>

        {/* Tourism & Cultural Ambassador Highlights */}
        {currentLanguage.tourismHighlights && currentLanguage.tourismHighlights.length > 0 && (
          <div className="mt-4 pt-4 border-t border-stone-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-amber-300 font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Heritage & Tourism Gems:
            </span>
            {currentLanguage.tourismHighlights.map((highlight, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full bg-stone-800/80 border border-stone-700 text-stone-300 text-[11px]"
              >
                {highlight}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Categories Navigation Bar */}
      {categories.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-800">
            {categories.map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryIndex(idx)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategoryIndex === idx
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                    : 'bg-stone-900 text-stone-400 hover:bg-stone-800 hover:text-stone-200 border border-stone-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{cat.categoryName}</span>
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-black/30">
                  {cat.phrases.length}
                </span>
              </button>
            ))}
          </div>

          {/* Phrase Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentCategory?.phrases.map((phrase) => (
              <div
                key={phrase.id}
                className="bg-stone-900/90 rounded-2xl p-5 border border-stone-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3 group shadow-lg text-white"
              >
                {/* Top: Native Text & Spoken Audio Button */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-lg font-bold font-display text-amber-200 group-hover:text-amber-100 transition-colors">
                        {phrase.originalText}
                      </div>
                      <div className="text-xs text-stone-400 font-mono">
                        🗣️ {phrase.phonetic}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleSpeak(phrase.originalText, phrase.id)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          speakingId === phrase.id
                            ? 'bg-amber-500 text-stone-950 border-amber-400 animate-pulse ring-2 ring-amber-400'
                            : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border-stone-700'
                        }`}
                        title="Listen to native voice pronunciation"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleCopy(phrase.originalText, phrase.id)}
                        className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors cursor-pointer"
                        title="Copy phrase"
                      >
                        {copiedId === phrase.id ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* English Translation */}
                  <div className="mt-2.5 text-sm font-medium text-stone-200">
                    "{phrase.englishTranslation}"
                  </div>
                </div>

                {/* Cultural & Tourism Context Note */}
                <div className="space-y-1.5 pt-2 border-t border-stone-800/80 text-xs">
                  <div className="text-stone-300">
                    <span className="text-amber-400 font-semibold">Context: </span>
                    {phrase.context}
                  </div>
                  {phrase.tourismOrCommunityUse && (
                    <div className="text-emerald-400/90 text-[11px] flex items-start gap-1">
                      <HeartHandshake className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                      <span>{phrase.tourismOrCommunityUse}</span>
                    </div>
                  )}
                  {phrase.audioTips && (
                    <div className="text-stone-400 text-[11px] italic">
                      💡 {phrase.audioTips}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty / Standard Language State */
        <div className="p-8 text-center bg-stone-900/60 rounded-2xl border border-stone-800 text-stone-400 space-y-3">
          <Globe2 className="w-10 h-10 mx-auto text-amber-400 opacity-60" />
          <h3 className="text-lg font-bold text-white">Full Offline Support Enabled</h3>
          <p className="text-xs max-w-md mx-auto">
            You can practice conversation and speech with {currentLanguage.name} freely online or
            use the interactive voice tools.
          </p>
        </div>
      )}

      {/* Community Education & Rural Inclusion Manifesto */}
      <div className="p-5 bg-stone-900/60 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-stone-200 block">
              Inclusive Global Education & Open Access Mission
            </span>
            <span>
              Designed for low-income communities, rural schools, teachers, and global travelers to
              break down language barriers everywhere.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            Zero Cost • Unlimited
          </span>
        </div>
      </div>
    </div>
  );
};
