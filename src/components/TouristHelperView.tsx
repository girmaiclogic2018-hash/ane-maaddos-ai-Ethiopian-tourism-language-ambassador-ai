import React, { useState, useMemo } from 'react';
import { TouristDestination, LanguageInfo, Itinerary3Day } from '../types';
import { TOURIST_DESTINATIONS } from '../data/destinations';
import { ItineraryPlanner } from './ItineraryPlanner';
import { LandmarkARViewModal } from './LandmarkARViewModal';
import {
  Compass,
  MapPin,
  Sparkles,
  BookOpen,
  Coffee,
  HeartHandshake,
  Volume2,
  Navigation,
  ExternalLink,
  Radio,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Globe2,
  Video,
  Building2,
  TreePine,
  ShieldCheck,
  HelpCircle,
  Clock,
  Banknote,
  Phone,
  Plane,
  Car,
  ChevronDown,
  Info,
  Camera,
  Play,
  Flame,
  Maximize2,
} from 'lucide-react';

interface TouristHelperViewProps {
  currentLanguage: LanguageInfo;
  onStartRoleplayWithDestination?: (dest: TouristDestination) => void;
  onStartRoleplayWithItinerary?: (itinerary: Itinerary3Day) => void;
}

export const TouristHelperView: React.FC<TouristHelperViewProps> = ({
  currentLanguage,
  onStartRoleplayWithDestination,
  onStartRoleplayWithItinerary,
}) => {
  const [activeTabMode, setActiveTabMode] = useState<'explorer' | 'itinerary'>('explorer');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDestination, setActiveDestination] = useState<TouristDestination>(TOURIST_DESTINATIONS[0]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [speakingPhrase, setSpeakingPhrase] = useState<string | null>(null);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);
  const [activeRightTab, setActiveRightTab] = useState<'guide' | 'media_directions' | 'official_faqs'>('guide');
  const [isArModalOpen, setIsArModalOpen] = useState<boolean>(false);

  // Filter destinations based on search query, type, and category
  const filteredDestinations = useMemo(() => {
    let list = TOURIST_DESTINATIONS;

    if (selectedTypeFilter !== 'all') {
      if (selectedTypeFilter === 'modern') {
        list = list.filter(
          (d) =>
            d.destinationType === 'modern_megaproject' ||
            d.destinationType === 'eco_park_recreation' ||
            d.destinationType === 'museum_cultural_center'
        );
      } else if (selectedTypeFilter === 'ancient') {
        list = list.filter((d) => d.destinationType === 'ancient_heritage' || d.unescoHeritage);
      } else if (selectedTypeFilter === 'wildlife_nature') {
        list = list.filter(
          (d) =>
            d.destinationType === 'national_park_wildlife' ||
            d.destinationType === 'geological_wonder' ||
            d.category === 'natural_wonder'
        );
      }
    }

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'unesco') {
        list = list.filter((d) => d.unescoHeritage);
      } else if (selectedCategory === 'modern_landmark') {
        list = list.filter(
          (d) => d.category === 'modern_landmark' || d.category === 'recreation_park'
        );
      } else {
        list = list.filter((d) => d.category === selectedCategory);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          (d.localName && d.localName.toLowerCase().includes(q)) ||
          d.shortSummary.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedTypeFilter, selectedCategory, searchQuery]);

  // Native Speech Synthesis for local phrases
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

  const getTypeBadge = (type: TouristDestination['destinationType']) => {
    switch (type) {
      case 'modern_megaproject':
        return { label: '⚡ Mega-Project', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'museum_cultural_center':
        return { label: '🏛️ Modern Museum', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'eco_park_recreation':
        return { label: '🌲 Eco-Park & Resort', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'ancient_heritage':
        return { label: '👑 Ancient Heritage', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'national_park_wildlife':
        return { label: '🦁 National Park & Safari', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
      case 'geological_wonder':
        return { label: '🌋 Geological Wonder', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      default:
        return { label: '📍 Destination', color: 'bg-stone-800 text-stone-300 border-stone-700' };
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in" id="tourist-helper-view">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-amber-950/80 to-stone-900 border border-amber-500/30 p-6 sm:p-8 shadow-2xl text-white">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Ethiopian Tourism Ministry & Heritage Guide</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {currentLanguage.flag} {currentLanguage.name} Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
            Ethiopia Ancient Wonders, Modern Megaprojects & Eco-Parks
          </h1>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
            Explore authentic historical sanctuaries (Axum, Lalibela, Gondar, Harar) and modern visitor marvels (Grand Ethiopian Renaissance Dam, Adwa Victory Memorial Museum, Unity Park, Friendship Park, Entoto Eco-Resort, Science Museum, Wonchi Crater Lake). Certified data with real directions, images, official fees, visitor FAQs, and live spoken AI tours!
          </p>
        </div>
      </div>

      {/* Navigation Mode Switcher: Historical & Modern Explorer vs AI 3-Day Planner */}
      <div className="flex items-center gap-3 bg-stone-900/90 p-2 rounded-2xl border border-stone-800 shadow-lg">
        <button
          onClick={() => setActiveTabMode('explorer')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeTabMode === 'explorer'
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Historical & Modern Places Explorer</span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] bg-stone-950/70 text-amber-300 uppercase font-mono font-bold">
            {TOURIST_DESTINATIONS.length} Official Places
          </span>
        </button>

        <button
          onClick={() => setActiveTabMode('itinerary')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeTabMode === 'itinerary'
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI 3-Day Ethiopian Itinerary Planner</span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-amber-950/40 text-amber-200 uppercase font-mono font-bold">
            Gemini AI
          </span>
        </button>
      </div>

      {/* Main View Content */}
      {activeTabMode === 'itinerary' ? (
        <ItineraryPlanner
          currentLanguage={currentLanguage}
          onStartRoleplayWithItinerary={onStartRoleplayWithItinerary}
          onJumpToLandmark={(name) => {
            const found = TOURIST_DESTINATIONS.find(
              (d) =>
                d.name.toLowerCase().includes(name.toLowerCase()) ||
                name.toLowerCase().includes(d.name.toLowerCase())
            );
            if (found) {
              setActiveDestination(found);
              setActiveTabMode('explorer');
            }
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* Filter Bar: Ancient vs Modern vs Nature + Search */}
          <div className="bg-stone-900 p-4 rounded-3xl border border-stone-800 space-y-3 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Type Category Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
                {[
                  { id: 'all', label: 'All Sights', emoji: '🌐' },
                  { id: 'modern', label: '⚡ Modern Megaprojects & Parks', emoji: '🏢' },
                  { id: 'ancient', label: '🏛️ Ancient & UNESCO Wonders', emoji: '👑' },
                  { id: 'wildlife_nature', label: '🦁 National Parks & Nature', emoji: '🌋' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedTypeFilter(tab.id);
                      setSelectedCategory('all');
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      selectedTypeFilter === tab.id
                        ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                        : 'bg-stone-950 text-stone-400 hover:bg-stone-800 hover:text-stone-200 border border-stone-800'
                    }`}
                  >
                    <span>{tab.emoji}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative w-full md:w-80 shrink-0">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search GERD, Adwa, Axum, Lalibela, Parks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Sub-Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-stone-800/80 no-scrollbar">
              {[
                { id: 'all', label: 'Show All' },
                { id: 'unesco', label: '🌟 UNESCO World Heritage' },
                { id: 'modern_landmark', label: '⚡ Mega-Dams & Museums' },
                { id: 'recreation_park', label: '🌲 Eco-Resorts & Crater Lakes' },
                { id: 'wildlife', label: '🦁 Elephants & Endemic Species' },
                { id: 'natural_wonder', label: '🌋 Volcanos & Salt Flats' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-stone-800 text-amber-300 border border-amber-500/40 font-bold'
                      : 'bg-stone-950/60 text-stone-400 hover:text-stone-200 border border-transparent'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid: Left Destination List (5 cols) & Right Comprehensive Guide (7 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Sights List Cards */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1 text-xs font-bold text-stone-400 uppercase tracking-wider">
                <span>Verified Destinations ({filteredDestinations.length})</span>
                <span className="text-[10px] text-amber-400 font-mono">Ministry Standards</span>
              </div>

              <div className="space-y-3 max-h-[850px] overflow-y-auto pr-1 no-scrollbar">
                {filteredDestinations.map((dest) => {
                  const isSelected = activeDestination.id === dest.id;
                  const typeBadge = getTypeBadge(dest.destinationType);

                  return (
                    <div
                      key={dest.id}
                      onClick={() => {
                        setActiveDestination(dest);
                        setActiveImageIndex(0);
                      }}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 group shadow-md text-white ${
                        isSelected
                          ? 'bg-stone-900 border-amber-400 ring-2 ring-amber-400/30'
                          : 'bg-stone-900/70 border-stone-800 hover:border-stone-700 hover:bg-stone-900'
                      }`}
                    >
                      {/* Top Row: Thumbnail + Info */}
                      <div className="flex items-start gap-3">
                        <img
                          src={dest.coverImage || dest.images[0]}
                          alt={dest.name}
                          className="w-20 h-20 rounded-xl object-cover border border-stone-800 shrink-0 group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${typeBadge.color}`}>
                              {typeBadge.label}
                            </span>
                            {dest.unescoHeritage && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                                UNESCO
                              </span>
                            )}
                          </div>

                          <div className="text-sm font-bold text-amber-200 font-display truncate">
                            {dest.name}
                          </div>

                          {dest.localName && (
                            <div className="text-[11px] text-stone-400 truncate">
                              {dest.localName}
                            </div>
                          )}

                          <div className="text-[11px] text-stone-400 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate">{dest.country}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                        {dest.shortSummary}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-800">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            {dest.officialMinistryInfo.openingHours.split('(')[0]}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                          <span>Inspect Guide</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Comprehensive Interactive Landmark & Ministry Guide */}
            <div className="lg:col-span-7">
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 text-white sticky top-20">
                {/* Visual Header & Image Gallery */}
                <div className="space-y-4 border-b border-stone-800 pb-5">
                  {/* Main Display Image */}
                  <div className="relative rounded-2xl overflow-hidden border border-stone-800 aspect-video max-h-72 bg-stone-950 group">
                    <img
                      src={activeDestination.images[activeImageIndex] || activeDestination.coverImage}
                      alt={activeDestination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/30" />

                    {/* Image Carousel Switcher */}
                    {activeDestination.images.length > 1 && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-stone-950/80 backdrop-blur-md p-1.5 rounded-xl border border-stone-700">
                        {activeDestination.images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                              activeImageIndex === idx ? 'bg-amber-400 w-5' : 'bg-stone-600 hover:bg-stone-400'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Video Tour Trigger Overlay */}
                    {activeDestination.videoWalkthroughUrl && (
                      <a
                        href={activeDestination.videoWalkthroughUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg transition-transform active:scale-95 cursor-pointer backdrop-blur-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Watch Video Tour</span>
                      </a>
                    )}
                  </div>

                  {/* Title & Badges */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${getTypeBadge(activeDestination.destinationType).color}`}>
                        {getTypeBadge(activeDestination.destinationType).label}
                      </span>
                      {activeDestination.unescoHeritage && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          🌟 UNESCO World Heritage Site
                        </span>
                      )}
                      {activeDestination.elevation && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-800 text-stone-300 border border-stone-700">
                          Elevation: {activeDestination.elevation}
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                      {activeDestination.name}
                    </h2>
                    {activeDestination.localName && (
                      <div className="text-base font-semibold text-amber-400">
                        {activeDestination.localName}
                      </div>
                    )}

                    <p className="text-xs text-stone-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{activeDestination.locationDescription}</span>
                    </p>
                  </div>

                  {/* Primary CTA Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => setIsArModalOpen(true)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-stone-950" />
                      <span>Launch 3D AR Holo-View</span>
                    </button>

                    {onStartRoleplayWithDestination && (
                      <button
                        onClick={() => onStartRoleplayWithDestination(activeDestination)}
                        className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-3 bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-xs rounded-xl border border-stone-700 shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        <Radio className="w-4 h-4 text-amber-400" />
                        <span>Start Live AI Spoken Guided Tour</span>
                      </button>
                    )}

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        activeDestination.placeDirections.googleMapsSearchQuery || activeDestination.name
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors shadow"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>GPS Directions</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>

                {/* Sub-Tab Navigation for Detail View */}
                <div className="flex items-center gap-2 border-b border-stone-800 pb-3 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'guide', label: '📖 History & Culture', icon: BookOpen },
                    { id: 'official_faqs', label: '🛡️ Ministry Info & FAQs', icon: ShieldCheck },
                    { id: 'media_directions', label: '🗺️ Directions & Transit', icon: Navigation },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveRightTab(tab.id as any)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          activeRightTab === tab.id
                            ? 'bg-stone-800 text-amber-300 border border-amber-500/40'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab 1: History, Must-See, Etiquette & Phrases */}
                {activeRightTab === 'guide' && (
                  <div className="space-y-5 animate-in fade-in">
                    {/* History Chronicle */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        <span>Historical Chronicle & Significance</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-200 leading-relaxed bg-stone-950/80 p-4 rounded-2xl border border-stone-800">
                        {activeDestination.historyAndSignificance}
                      </p>
                    </div>

                    {/* Must-See Highlights */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>Must-See Highlights & Key Features</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeDestination.mustSeeAttractions.map((att, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 text-xs text-stone-200 flex items-start gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{att}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cultural Etiquette */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <HeartHandshake className="w-4 h-4" />
                        <span>Cultural Etiquette & Sacred Customs</span>
                      </h3>
                      <div className="space-y-2">
                        {activeDestination.culturalEtiquette.map((rule, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 text-xs text-stone-200 flex items-start gap-2.5"
                          >
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {idx + 1}
                            </span>
                            <span>{rule}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Local Spoken Phrases with Speech Audio */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4" />
                        <span>Essential Local Spoken Phrases (Tap to Hear Audio)</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeDestination.essentialLocalPhrases.map((phraseItem, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between gap-2 hover:border-amber-500/40 transition-colors"
                          >
                            <div className="space-y-0.5 truncate">
                              <div className="text-sm font-bold font-display text-amber-200 truncate">
                                {phraseItem.phrase}
                              </div>
                              <div className="text-[11px] text-stone-400 font-mono truncate">
                                🗣️ {phraseItem.phonetic}
                              </div>
                              <div className="text-[11px] text-stone-300 font-medium truncate">
                                "{phraseItem.meaning}"
                              </div>
                            </div>

                            <button
                              onClick={() => handleSpeakPhrase(phraseItem.phrase)}
                              className={`p-2 rounded-xl border transition-all shrink-0 cursor-pointer ${
                                speakingPhrase === phraseItem.phrase
                                  ? 'bg-amber-500 text-stone-950 border-amber-400 animate-pulse'
                                  : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border-stone-700'
                              }`}
                              title="Listen to native voice pronunciation"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Traditional Coffee & Cuisine */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <Coffee className="w-4 h-4" />
                        <span>Traditional Coffee Ceremony & Cuisine</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeDestination.localCuisineAndCoffee.map((dish, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-stone-950/80 rounded-xl border border-stone-800 text-xs text-stone-200 flex items-center gap-2"
                          >
                            <span className="text-amber-400">☕</span>
                            <span className="truncate">{dish}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Official Ministry Info, Fees, Rules & FAQs */}
                {activeRightTab === 'official_faqs' && (
                  <div className="space-y-5 animate-in fade-in">
                    {/* Official Ministry Regulatory Card */}
                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Official Ministry of Tourism Regulations & Standards</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                          <span className="text-[10px] text-stone-400 uppercase font-mono">Governing Authority</span>
                          <div className="font-bold text-stone-200">{activeDestination.officialMinistryInfo.governingBody}</div>
                        </div>

                        <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                          <span className="text-[10px] text-stone-400 uppercase font-mono">Opening Schedule</span>
                          <div className="font-bold text-emerald-300">{activeDestination.officialMinistryInfo.openingHours}</div>
                        </div>

                        <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                          <span className="text-[10px] text-stone-400 uppercase font-mono">Local Visitor Fee</span>
                          <div className="font-bold text-stone-200">{activeDestination.officialMinistryInfo.entryFeeLocal}</div>
                        </div>

                        <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                          <span className="text-[10px] text-stone-400 uppercase font-mono">International Visitor Fee</span>
                          <div className="font-bold text-amber-300">{activeDestination.officialMinistryInfo.entryFeeForeigner}</div>
                        </div>
                      </div>

                      {activeDestination.officialMinistryInfo.contactPhone && (
                        <div className="p-2.5 bg-stone-900/60 rounded-xl border border-stone-800 flex items-center gap-2 text-xs text-stone-300">
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          <span>Official Visitor Bureau Desk: </span>
                          <span className="font-mono text-amber-300 font-bold">{activeDestination.officialMinistryInfo.contactPhone}</span>
                        </div>
                      )}
                    </div>

                    {/* Official Rules & Regulations */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Visitor Rules & Global Tourism Standards</span>
                      </h3>
                      <div className="space-y-1.5">
                        {activeDestination.rulesAndRegulations.map((rule, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 flex items-start gap-2"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{rule}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Visitor FAQs: What visitors ask & want to know */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-amber-400" />
                        <span>What Visitors Ask & Want to Know (FAQs)</span>
                      </h3>

                      <div className="space-y-2">
                        {activeDestination.visitorFaqs.map((faq, idx) => {
                          const isExpanded = expandedFaqIndex === idx;
                          return (
                            <div
                              key={idx}
                              className="bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden transition-colors"
                            >
                              <button
                                onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                                className="w-full p-3 text-left flex items-center justify-between gap-2 text-xs font-bold text-stone-200 hover:text-amber-300 cursor-pointer"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] shrink-0 font-mono">
                                    Q
                                  </span>
                                  <span>{faq.question}</span>
                                </span>
                                <ChevronDown
                                  className={`w-4 h-4 text-stone-400 transition-transform ${
                                    isExpanded ? 'rotate-180 text-amber-400' : ''
                                  }`}
                                />
                              </button>

                              {isExpanded && (
                                <div className="px-4 pb-3 pt-1 text-xs text-stone-300 leading-relaxed border-t border-stone-800/60 bg-stone-900/40">
                                  {faq.answer}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Real Directions, Road, Air Transit & Coordinates */}
                {activeRightTab === 'media_directions' && (
                  <div className="space-y-5 animate-in fade-in">
                    {/* Transit Routes Card */}
                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-emerald-400" />
                        <span>Real Routes & Transit Instructions</span>
                      </h3>

                      {activeDestination.placeDirections.byAir && (
                        <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                            <Plane className="w-4 h-4" />
                            <span>Flight Connections (By Air)</span>
                          </div>
                          <p className="text-xs text-stone-300 leading-relaxed">
                            {activeDestination.placeDirections.byAir}
                          </p>
                        </div>
                      )}

                      <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                          <Car className="w-4 h-4" />
                          <span>Highway & Road Travel</span>
                        </div>
                        <p className="text-xs text-stone-300 leading-relaxed">
                          {activeDestination.placeDirections.byRoad}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                          <span className="text-[10px] text-stone-400 uppercase font-mono">Distance from Addis</span>
                          <div className="font-bold text-stone-200">{activeDestination.placeDirections.distanceFromAddis}</div>
                        </div>

                        <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                          <span className="text-[10px] text-stone-400 uppercase font-mono">Recommended Vehicle</span>
                          <div className="font-bold text-emerald-300">{activeDestination.placeDirections.recommendedVehicle}</div>
                        </div>
                      </div>

                      <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-stone-400 uppercase font-mono">GPS Coordinates</div>
                          <div className="font-mono text-amber-300 font-bold">
                            {activeDestination.coordinates.lat.toFixed(4)}° N, {activeDestination.coordinates.lng.toFixed(4)}° E
                          </div>
                        </div>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${activeDestination.coordinates.lat},${activeDestination.coordinates.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Open Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Best Time to Visit & Practical Travel Tips */}
                    <div className="space-y-2">
                      <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center gap-2.5 text-xs">
                        <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <span className="font-bold text-stone-200">Best Season to Visit: </span>
                          <span className="text-stone-300">{activeDestination.bestTimeToVisit}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {activeDestination.practicalTravelTips.map((tip, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-stone-950/60 rounded-xl border border-stone-800 text-xs text-stone-300 flex items-start gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full 3D AR Landmark Viewport Modal */}
      {activeDestination && (
        <LandmarkARViewModal
          destination={activeDestination}
          currentLanguage={currentLanguage}
          isOpen={isArModalOpen}
          onClose={() => setIsArModalOpen(false)}
          onStartRoleplay={onStartRoleplayWithDestination}
        />
      )}
    </div>
  );
};
