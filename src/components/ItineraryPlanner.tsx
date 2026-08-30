import React, { useState, useEffect } from 'react';
import {
  Itinerary3Day,
  ItineraryDay,
  LanguageInfo,
  TouristDestination,
} from '../types';
import {
  ETHIOPIAN_REGIONS,
  TRAVELER_INTERESTS,
  TRAVEL_PACES,
  SAMPLE_ETHIOPIAN_ITINERARIES,
  EthiopianRegionOption,
} from '../data/itineraryOptions';
import {
  Sparkles,
  Calendar,
  Compass,
  MapPin,
  Clock,
  Coffee,
  Volume2,
  Copy,
  Check,
  Bookmark,
  Printer,
  Radio,
  RefreshCw,
  AlertCircle,
  Footprints,
  Shield,
  Utensils,
  ChevronRight,
  BookOpen,
  Send,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface ItineraryPlannerProps {
  currentLanguage: LanguageInfo;
  onStartRoleplayWithItinerary?: (itinerary: Itinerary3Day) => void;
  onJumpToLandmark?: (landmarkName: string) => void;
}

export const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({
  currentLanguage,
  onStartRoleplayWithItinerary,
  onJumpToLandmark,
}) => {
  // Input Selection State
  const [selectedRegion, setSelectedRegion] = useState<EthiopianRegionOption>(
    ETHIOPIAN_REGIONS[0]
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Ancient History & Castles',
    'UNESCO Rock-Hewn Monolithic Churches',
    'Traditional Coffee Ceremonies & Origin Stories',
  ]);
  const [selectedPace, setSelectedPace] = useState<string>('Balanced & Moderate');
  const [specialPreferences, setSpecialPreferences] = useState<string>('');
  
  // Generation & Active Plan State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [itinerary, setItinerary] = useState<Itinerary3Day>(
    SAMPLE_ETHIOPIAN_ITINERARIES.northern_historic
  );
  const [selectedDayTab, setSelectedDayTab] = useState<number>(1);
  const [speakingPhrase, setSpeakingPhrase] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedItineraries, setSavedItineraries] = useState<Itinerary3Day[]>(() => {
    try {
      const saved = localStorage.getItem('ane_maddos_saved_itineraries');
      return saved ? JSON.parse(saved) : [SAMPLE_ETHIOPIAN_ITINERARIES.northern_historic];
    } catch {
      return [SAMPLE_ETHIOPIAN_ITINERARIES.northern_historic];
    }
  });
  const [isSaved, setIsSaved] = useState(false);

  // Sync saved list to local storage
  useEffect(() => {
    try {
      localStorage.setItem(
        'ane_maddos_saved_itineraries',
        JSON.stringify(savedItineraries)
      );
    } catch (e) {
      console.error('Failed to persist saved itineraries', e);
    }
  }, [savedItineraries]);

  // Check if active itinerary is already saved
  useEffect(() => {
    if (itinerary) {
      setIsSaved(savedItineraries.some((item) => item.id === itinerary.id || item.title === itinerary.title));
    }
  }, [itinerary, savedItineraries]);

  // Toggle interest
  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter((i) => i !== interest);
      } else {
        return [...prev, interest];
      }
    });
  };

  // Generate Itinerary via Gemini Server API
  const handleGenerateItinerary = async () => {
    setIsGenerating(true);
    setGenerationStep('Connecting with ANE MADDOS Tourism Ambassador AI...');

    const stepTimer1 = setTimeout(() => {
      setGenerationStep(`Analyzing historical archives for ${selectedRegion.name}...`);
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setGenerationStep(`Curating local coffee ceremonies, sacred paths & ${currentLanguage.name} phrases...`);
    }, 2800);

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region: `${selectedRegion.name} (${selectedRegion.subName})`,
          interests: selectedInterests,
          travelPace: selectedPace,
          targetLanguage: currentLanguage.name,
          nativeLanguage: 'English',
          specialPreferences: specialPreferences.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data: Itinerary3Day = await response.json();
      setItinerary(data);
      setSelectedDayTab(1);
    } catch (err) {
      console.warn('API error or offline fallback, using curated itinerary:', err);
      // Construct an intelligent fallback using the selected region
      const fallback = SAMPLE_ETHIOPIAN_ITINERARIES[selectedRegion.id] || {
        ...SAMPLE_ETHIOPIAN_ITINERARIES.northern_historic,
        id: `itin_fallback_${Date.now()}`,
        region: selectedRegion.name,
        targetLanguage: currentLanguage.name,
        interests: selectedInterests,
        travelPace: selectedPace,
        title: `3-Day Cultural Exploration of ${selectedRegion.name}`,
        summary: `An enriching 3-day voyage across ${selectedRegion.name} curated with authentic Ethiopian coffee ceremonies, ancient traditions, and local ${currentLanguage.name} spoken phrases.`,
      };
      setItinerary(fallback);
      setSelectedDayTab(1);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Speech synthesis for phrase pronunciation
  const handleSpeakPhrase = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      setSpeakingPhrase(text);
      utterance.onend = () => setSpeakingPhrase(null);
      utterance.onerror = () => setSpeakingPhrase(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Copy full itinerary as formatted text
  const handleCopyItinerary = () => {
    if (!itinerary) return;
    const textLines: string[] = [
      `🇪🇹 ANE MADDOS TOURISM AMBASSADOR AI - 3-DAY TRAVEL ITINERARY`,
      `TITLE: ${itinerary.title} (${itinerary.titleNative || ''})`,
      `REGION: ${itinerary.region} | PACE: ${itinerary.travelPace} | LANGUAGE: ${itinerary.targetLanguage}`,
      `\nOVERVIEW:\n${itinerary.summary}`,
      `\nHIGHLIGHTS:`,
      ...itinerary.highlights.map((h) => `• ${h}`),
      `\n-----------------------------------------`,
    ];

    itinerary.days.forEach((d) => {
      textLines.push(`\n📅 DAY ${d.dayNumber}: ${d.dayTitle.toUpperCase()} (${d.theme})`);
      textLines.push(`☀️ MORNING: ${d.morning.activity} @ ${d.morning.landmarkName || ''}`);
      textLines.push(`   ${d.morning.description}`);
      textLines.push(`🌤️ AFTERNOON: ${d.afternoon.activity} (${d.afternoon.culinaryOrCoffee || ''})`);
      textLines.push(`   ${d.afternoon.description}`);
      textLines.push(`🌙 EVENING: ${d.evening.activity}`);
      textLines.push(`   ${d.evening.description}`);
      textLines.push(`🗣️ LOCAL PHRASES:`);
      d.dailyPhrases.forEach((p) => {
        textLines.push(`   • "${p.phrase}" (${p.phonetic}) = ${p.meaning} [${p.context}]`);
      });
      textLines.push(`🚗 LOGISTICS: ${d.transportAndLogistics}`);
      textLines.push(`🤝 ETIQUETTE: ${d.culturalEtiquette}`);
    });

    textLines.push(`\n🧳 PACKING & READINESS:`);
    itinerary.packingAndPreparation.forEach((item) => textLines.push(`• ${item}`));

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Toggle Save to Favorites
  const handleToggleSave = () => {
    if (!itinerary) return;
    if (isSaved) {
      setSavedItineraries((prev) => prev.filter((i) => i.id !== itinerary.id && i.title !== itinerary.title));
      setIsSaved(false);
    } else {
      setSavedItineraries((prev) => [itinerary, ...prev]);
      setIsSaved(true);
    }
  };

  // Print View
  const handlePrint = () => {
    window.print();
  };

  const activeDay = itinerary?.days?.find((d) => d.dayNumber === selectedDayTab) || itinerary?.days?.[0];

  return (
    <div className="space-y-8 animate-in fade-in" id="ai-itinerary-planner">
      {/* Planner Configurator Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI 3-Day Travel Planner</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {currentLanguage.flag} {currentLanguage.name} Spoken Guidance
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white">
              Personalized Ethiopian Travel Itinerary Generator
            </h2>
            <p className="text-xs sm:text-sm text-stone-300">
              Select your destination region in Ethiopia, customize your cultural interests, and let ANE MADDOS craft a real-time, day-by-day expedition with authentic coffee rituals, historic landmarks, and localized spoken phrases.
            </p>
          </div>

          <button
            onClick={handleGenerateItinerary}
            disabled={isGenerating}
            className="shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                <span>Generating Itinerary...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-stone-950" />
                <span>Generate 3-Day Plan</span>
              </>
            )}
          </button>
        </div>

        {/* Step 1: Region Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>1. Choose Ethiopian Region</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ETHIOPIAN_REGIONS.map((region) => {
              const isSelected = selectedRegion.id === region.id;
              return (
                <div
                  key={region.id}
                  onClick={() => {
                    setSelectedRegion(region);
                    setSelectedInterests(region.defaultInterests);
                  }}
                  className={`cursor-pointer p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-2 group text-left ${
                    isSelected
                      ? 'bg-stone-800/90 border-amber-400 ring-2 ring-amber-400/30'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 hover:bg-stone-950'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-lg">{region.icon}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-amber-200 group-hover:text-amber-300 font-display">
                      {region.name}
                    </h4>
                    <p className="text-[11px] text-stone-400 leading-tight mt-0.5 line-clamp-1">
                      {region.subName}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-800/80 text-[10px] text-stone-400 flex items-center justify-between">
                    <span className="text-amber-400/80 font-mono">📅 {region.bestMonths}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2 & 3: Interests and Pace */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
          {/* Interests (8 cols) */}
          <div className="md:col-span-8 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>2. Traveler Cultural Interests (Select Multiple)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TRAVELER_INTERESTS.map((interest) => {
                const active = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                        : 'bg-stone-950 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800'
                    }`}
                  >
                    <span>{interest}</span>
                    {active && <Check className="w-3 h-3 text-stone-950 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Travel Pace (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-amber-400" />
              <span>3. Travel Pace</span>
            </label>
            <div className="space-y-2">
              {TRAVEL_PACES.map((pace) => {
                const active = selectedPace === pace.label;
                return (
                  <div
                    key={pace.id}
                    onClick={() => setSelectedPace(pace.label)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      active
                        ? 'bg-stone-800 border-amber-400 ring-1 ring-amber-400/40 text-amber-200'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>{pace.label}</span>
                      {active && <Check className="w-3 h-3 text-amber-400" />}
                    </div>
                    <p className="text-[10px] text-stone-400 mt-0.5 leading-tight">
                      {pace.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 4: Optional Custom Notes */}
        <div className="space-y-2 pt-2 border-t border-stone-800">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-amber-400" />
            <span>4. Special Custom Requests or Dietary Needs (Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Vegetarian/Vegan (Fasting Beyaynetu food preferred), traveling with kids, interested in raw honey tasting or Masenqo music..."
            value={specialPreferences}
            onChange={(e) => setSpecialPreferences(e.target.value)}
            className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Loading Progress State */}
        {isGenerating && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 animate-pulse">
            <RefreshCw className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-amber-300">
                Generating Personalized 3-Day Journey...
              </div>
              <div className="text-[11px] text-stone-300 font-mono">
                {generationStep}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generated Itinerary Display */}
      {itinerary && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white" id="generated-itinerary-result">
          {/* Header & Quick Actions */}
          <div className="space-y-4 border-b border-stone-800 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  📍 {itinerary.region}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {itinerary.travelPace}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-800 text-stone-300 border border-stone-700">
                  🗣️ Spoken in {itinerary.targetLanguage}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleToggleSave}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isSaved
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border-stone-800'
                  }`}
                  title="Save to My Itineraries"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save Plan'}</span>
                </button>

                <button
                  onClick={handleCopyItinerary}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Copy full itinerary text"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Title & Native script */}
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                {itinerary.title}
              </h3>
              {itinerary.titleNative && (
                <div className="text-sm sm:text-base font-semibold text-amber-400">
                  {itinerary.titleNative}
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed bg-stone-950/70 p-4 rounded-2xl border border-stone-800">
              {itinerary.summary}
            </p>

            {/* Top Highlights */}
            {itinerary.highlights && itinerary.highlights.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Expedition Highlights</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {itinerary.highlights.map((highlight, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-stone-950/80 rounded-xl border border-stone-800/80 text-xs text-stone-300 flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Spoken Tour Trigger Button */}
            {onStartRoleplayWithItinerary && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-stone-950 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Live Spoken AI Tour Guide Available</span>
                  </div>
                  <p className="text-xs text-stone-300">
                    Step into an interactive voice tour! ANE MADDOS will act as your warm Ethiopian guide navigating this 3-day journey with real-time conversation and pronunciation checks.
                  </p>
                </div>
                <button
                  onClick={() => onStartRoleplayWithItinerary(itinerary)}
                  className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <Radio className="w-4 h-4 text-stone-950" />
                  <span>Start Live Spoken Tour</span>
                </button>
              </div>
            )}
          </div>

          {/* 3-Day Timeline Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Day-by-Day Schedule</span>
              </div>
              <div className="text-xs text-stone-400">
                Click day tabs to switch view
              </div>
            </div>

            {/* Day Tabs */}
            <div className="flex items-center gap-3 border-b border-stone-800 pb-3 overflow-x-auto no-scrollbar">
              {itinerary.days?.map((day) => {
                const isDaySelected = selectedDayTab === day.dayNumber;
                return (
                  <button
                    key={day.dayNumber}
                    onClick={() => setSelectedDayTab(day.dayNumber)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                      isDaySelected
                        ? 'bg-amber-500 text-stone-950 shadow-lg font-extrabold'
                        : 'bg-stone-950 text-stone-400 hover:bg-stone-800 hover:text-stone-200 border border-stone-800'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-stone-950/20 flex items-center justify-center text-[10px] font-bold">
                      {day.dayNumber}
                    </span>
                    <span>Day {day.dayNumber}: {day.theme || `Day ${day.dayNumber}`}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Day Content */}
            {activeDay && (
              <div className="space-y-6 pt-2">
                <div className="space-y-1">
                  <div className="text-lg sm:text-xl font-bold font-display text-amber-200">
                    Day {activeDay.dayNumber}: {activeDay.dayTitle}
                  </div>
                  <div className="text-xs text-amber-400/80 font-mono">
                    Theme: {activeDay.theme}
                  </div>
                </div>

                {/* Morning / Afternoon / Evening Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Morning */}
                  <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300 pb-2 border-b border-stone-800">
                      <span className="flex items-center gap-1.5">
                        <span>🌅</span> Morning Excursion
                      </span>
                      {activeDay.morning?.estimatedDuration && (
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activeDay.morning.estimatedDuration}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h5 className="text-sm font-bold text-white">
                        {activeDay.morning?.activity}
                      </h5>
                      {activeDay.morning?.landmarkName && (
                        <div className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{activeDay.morning.landmarkName}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed">
                      {activeDay.morning?.description}
                    </p>

                    {activeDay.morning?.culturalNote && (
                      <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-[11px] text-amber-200/90 flex items-start gap-1.5">
                        <span className="text-amber-400">💡</span>
                        <span>{activeDay.morning.culturalNote}</span>
                      </div>
                    )}
                  </div>

                  {/* Afternoon */}
                  <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300 pb-2 border-b border-stone-800">
                      <span className="flex items-center gap-1.5">
                        <span>☀️</span> Afternoon & Coffee
                      </span>
                      {activeDay.afternoon?.estimatedDuration && (
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activeDay.afternoon.estimatedDuration}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h5 className="text-sm font-bold text-white">
                        {activeDay.afternoon?.activity}
                      </h5>
                      {activeDay.afternoon?.landmarkName && (
                        <div className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{activeDay.afternoon.landmarkName}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed">
                      {activeDay.afternoon?.description}
                    </p>

                    {activeDay.afternoon?.culinaryOrCoffee && (
                      <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-1.5">
                        <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{activeDay.afternoon.culinaryOrCoffee}</span>
                      </div>
                    )}
                  </div>

                  {/* Evening */}
                  <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300 pb-2 border-b border-stone-800">
                      <span className="flex items-center gap-1.5">
                        <span>🌙</span> Evening Dining & Vibe
                      </span>
                      {activeDay.evening?.estimatedDuration && (
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activeDay.evening.estimatedDuration}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h5 className="text-sm font-bold text-white">
                        {activeDay.evening?.activity}
                      </h5>
                      {activeDay.evening?.landmarkName && (
                        <div className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{activeDay.evening.landmarkName}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed">
                      {activeDay.evening?.description}
                    </p>

                    {activeDay.evening?.culinaryOrCoffee && (
                      <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-[11px] text-stone-300 flex items-start gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{activeDay.evening.culinaryOrCoffee}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Day-Specific Essential Phrases with Audio Playback */}
                {activeDay.dailyPhrases && activeDay.dailyPhrases.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <span>Essential Spoken Phrases for Day {activeDay.dayNumber} (Tap Speaker to Listen)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeDay.dailyPhrases.map((phraseItem, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 hover:border-amber-500/40 transition-colors flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="text-sm font-bold font-display text-amber-200 truncate">
                              {phraseItem.phrase}
                            </div>
                            <div className="text-xs text-stone-400 font-mono">
                              🗣️ {phraseItem.phonetic}
                            </div>
                            <div className="text-xs text-stone-200 font-medium">
                              "{phraseItem.meaning}"
                            </div>
                            <div className="text-[10px] text-amber-400/80 italic">
                              Context: {phraseItem.context}
                            </div>
                          </div>

                          <button
                            onClick={() => handleSpeakPhrase(phraseItem.phrase)}
                            className={`p-2.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                              speakingPhrase === phraseItem.phrase
                                ? 'bg-amber-500 text-stone-950 border-amber-400 animate-pulse'
                                : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border-stone-700'
                            }`}
                            title="Listen to native voice pronunciation"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Logistics & Cultural Etiquette for this Day */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>Transport & Logistics</span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      {activeDay.transportAndLogistics}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cultural Etiquette & Respect</span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      {activeDay.culturalEtiquette}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Packing & Preparation Checklist */}
          {itinerary.packingAndPreparation && itinerary.packingAndPreparation.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-stone-800">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Essential Packing & Cultural Readiness Checklist</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {itinerary.packingAndPreparation.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 text-xs text-stone-200 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
