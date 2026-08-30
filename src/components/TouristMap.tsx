import React, { useEffect, useRef, useState, useMemo } from 'react';
import { TouristDestination, LanguageInfo } from '../types';
import { TOURIST_DESTINATIONS } from '../data/destinations';
import { LandmarkARViewModal } from './LandmarkARViewModal';
import { Landmark3DCanvas } from './Landmark3DCanvas';
import {
  MapPin,
  Compass,
  Sparkles,
  Volume2,
  ExternalLink,
  Navigation,
  CheckCircle2,
  BookOpen,
  Coffee,
  HeartHandshake,
  Lightbulb,
  Search,
  Layers,
  Radio,
  X,
  Info,
  Calendar,
  Eye,
  Globe2,
  Maximize2,
  Minimize2,
  Camera,
  Play,
  Rotate3d,
  Split,
  LayoutGrid,
} from 'lucide-react';
import L from 'leaflet';

interface TouristMapProps {
  currentLanguage: LanguageInfo;
  onStartRoleplayWithDestination?: (dest: TouristDestination) => void;
  onSelectDestination?: (dest: TouristDestination) => void;
}

export type MapViewLayoutMode = 'map_with_ar_dock' | 'split_ar_and_map';

export const TouristMap: React.FC<TouristMapProps> = ({
  currentLanguage,
  onStartRoleplayWithDestination,
  onSelectDestination,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedDest, setSelectedDest] = useState<TouristDestination | null>(TOURIST_DESTINATIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterByLanguageCountry, setFilterByLanguageCountry] = useState<boolean>(true);
  const [speakingPhrase, setSpeakingPhrase] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'culture' | 'phrases' | 'logistics'>('overview');
  const [isArModalOpen, setIsArModalOpen] = useState<boolean>(false);
  const [isArFloatingHUDOpen, setIsArFloatingHUDOpen] = useState<boolean>(true);
  const [arDockMode, setArDockMode] = useState<'interactive_3d' | 'compact_holo'>('interactive_3d');
  const [viewLayoutMode, setViewLayoutMode] = useState<MapViewLayoutMode>('map_with_ar_dock');

  // Determine which destinations are associated with the current language
  const languageRelevantDestinations = useMemo(() => {
    return TOURIST_DESTINATIONS.filter((d) => {
      // If Ethiopian language, match all Ethiopian landmarks
      if (currentLanguage.region === 'ethiopian' && d.region === 'ethiopian') {
        return true;
      }
      return d.languageCodes.includes(currentLanguage.code) || d.languageCodes.includes(currentLanguage.code.toLowerCase());
    });
  }, [currentLanguage]);

  // Filter destinations based on search, category, and language preference
  const filteredDestinations = useMemo(() => {
    let list = filterByLanguageCountry && languageRelevantDestinations.length > 0
      ? languageRelevantDestinations
      : TOURIST_DESTINATIONS;

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'unesco') {
        list = list.filter((d) => d.unescoHeritage);
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
          d.tags.some((t) => t.toLowerCase().includes(q)) ||
          d.shortSummary.toLowerCase().includes(q)
      );
    }

    return list;
  }, [languageRelevantDestinations, filterByLanguageCountry, selectedCategory, searchQuery]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      // Create Leaflet map instance centered over Ethiopia / Horn of Africa by default
      const defaultCenter: [number, number] = [9.0272, 38.762];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 5,
        zoomControl: false,
        attributionControl: true,
      });

      // Add modern, high-contrast CartoDB Voyager tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Add custom styled zoom control in top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
      setMapLoaded(true);

      // Fix container size on resize
      const handleResize = () => {
        map.invalidateSize();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch (err) {
      console.warn('Leaflet map initialization notice:', err);
    }
  }, []);

  // Update Markers whenever filteredDestinations or selectedDest changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const bounds: L.LatLngTuple[] = [];

    filteredDestinations.forEach((dest) => {
      const isSelected = selectedDest?.id === dest.id;
      const isRelevantToLang = dest.languageCodes.includes(currentLanguage.code) || (currentLanguage.region === 'ethiopian' && dest.region === 'ethiopian');

      // Category icon emoji
      let categoryEmoji = '📍';
      if (dest.destinationType === 'modern_megaproject') categoryEmoji = '⚡';
      else if (dest.destinationType === 'museum_cultural_center') categoryEmoji = '🏛️';
      else if (dest.destinationType === 'eco_park_recreation') categoryEmoji = '🌲';
      else if (dest.destinationType === 'national_park_wildlife') categoryEmoji = '🦁';
      else if (dest.destinationType === 'geological_wonder') categoryEmoji = '🌋';
      else if (dest.unescoHeritage) categoryEmoji = '👑';
      else if (dest.category === 'historical') categoryEmoji = '🏛️';
      else if (dest.category === 'natural_wonder') categoryEmoji = '🌋';
      else if (dest.category === 'wildlife') categoryEmoji = '🦁';
      else if (dest.category === 'cultural') categoryEmoji = '☕';

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-tourist-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${
            isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-10'
          }">
            <div class="w-9 h-9 rounded-2xl flex items-center justify-center text-sm shadow-xl border-2 transition-all ${
              isSelected
                ? 'bg-amber-500 text-stone-950 border-white ring-4 ring-amber-400/50'
                : isRelevantToLang
                ? 'bg-stone-900 text-amber-300 border-amber-400/80 shadow-amber-500/20'
                : 'bg-stone-900 text-white border-stone-600'
            }">
              <span>${categoryEmoji}</span>
            </div>
            ${
              dest.unescoHeritage
                ? '<div class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-stone-950 rounded-full flex items-center justify-center text-[8px] font-black border border-stone-900 shadow">★</div>'
                : ''
            }
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([dest.coordinates.lat, dest.coordinates.lng], {
        icon: customIcon,
        title: dest.name,
      });

      // Bind custom popup with AR 3D View Simulator quick action
      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 220px; padding: 2px;">
          <div style="font-size: 10px; font-weight: 700; color: #d97706; text-transform: uppercase; margin-bottom: 2px; display: flex; align-items: center; justify-content: space-between;">
            <span>${dest.country}</span>
            ${dest.unescoHeritage ? '<span style="color: #059669;">★ UNESCO</span>' : ''}
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #1c1917; margin-bottom: 3px;">
            ${dest.name}
          </div>
          ${dest.localName ? `<div style="font-size: 11px; color: #78716c; margin-bottom: 5px;">${dest.localName}</div>` : ''}
          <div style="font-size: 11px; color: #44403c; line-height: 1.4; margin-bottom: 8px;">
            ${dest.shortSummary}
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <button id="popup-ar-btn-${dest.id}" style="width: 100%; padding: 6px 10px; background: linear-gradient(135deg, #0c0a09, #292524); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4); font-weight: 800; font-size: 11px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
              <span>⚡ Launch 3D AR Holo-View</span>
            </button>
            <button id="popup-btn-${dest.id}" style="width: 100%; padding: 6px 10px; background: #f59e0b; color: #0c0a09; font-weight: 700; font-size: 11px; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
              Inspect Guide & Spoken Phrases →
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280 });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${dest.id}`);
        if (btn) {
          btn.onclick = () => {
            handleSelectDestination(dest);
            marker.closePopup();
          };
        }
        const arBtn = document.getElementById(`popup-ar-btn-${dest.id}`);
        if (arBtn) {
          arBtn.onclick = () => {
            setSelectedDest(dest);
            setIsArModalOpen(true);
            marker.closePopup();
          };
        }
      });

      marker.on('click', () => {
        handleSelectDestination(dest);
      });

      markersGroup.addLayer(marker);
      bounds.push([dest.coordinates.lat, dest.coordinates.lng]);
    });

    // Auto-fit bounds if we have points and user changed language or filtered
    if (bounds.length > 0 && mapInstanceRef.current) {
      if (bounds.length === 1) {
        mapInstanceRef.current.setView(bounds[0], 8, { animate: true });
      } else {
        mapInstanceRef.current.fitBounds(L.latLngBounds(bounds), {
          padding: [50, 50],
          maxZoom: 10,
          animate: true,
        });
      }
    }
  }, [filteredDestinations, selectedDest, currentLanguage]);

  // Handle destination selection
  const handleSelectDestination = (dest: TouristDestination) => {
    setSelectedDest(dest);
    setIsDetailDrawerOpen(true);
    if (onSelectDestination) {
      onSelectDestination(dest);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([dest.coordinates.lat, dest.coordinates.lng], 8, {
        duration: 1.2,
      });
    }
  };

  // Fly to specific region presets
  const handleJumpToRegion = (region: 'ethiopia' | 'africa' | 'global') => {
    if (!mapInstanceRef.current) return;
    if (region === 'ethiopia') {
      mapInstanceRef.current.flyTo([9.0272, 38.762], 6, { duration: 1 });
    } else if (region === 'africa') {
      mapInstanceRef.current.flyTo([2.0, 25.0], 3.8, { duration: 1 });
    } else {
      mapInstanceRef.current.flyTo([20.0, 10.0], 2.5, { duration: 1 });
    }
  };

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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 animate-in fade-in" id="tourist-map-component">
      {/* Top Banner: Context-Aware Tourism Ambassador Helper */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 border border-amber-500/30 p-5 sm:p-6 shadow-2xl text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 font-mono">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>ANE MADDOS Interactive Tourist Map</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {currentLanguage.flag} {currentLanguage.name} Context
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-white">
              Explore Landmarks & Historic Sites for {currentLanguage.name}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300">
              Interactive GPS map displaying ancient castles, rock churches, national parks, and global wonders. Tap any marker to discover historical significance, cultural customs, and speak local phrases!
            </p>
          </div>

          {/* Region Quick Navigation Buttons */}
          <div className="flex items-center gap-2 shrink-0 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleJumpToRegion('ethiopia')}
              className="px-3 py-2 bg-stone-800/90 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
            >
              🇪🇹 Focus Ethiopia
            </button>
            <button
              onClick={() => handleJumpToRegion('africa')}
              className="px-3 py-2 bg-stone-800/90 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
            >
              🌍 Focus Africa
            </button>
            <button
              onClick={() => handleJumpToRegion('global')}
              className="px-3 py-2 bg-stone-800/90 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
            >
              🌐 Global World
            </button>
          </div>
        </div>
      </div>

      {/* Iconic Ethiopian Landmark Quick Showcase Bar */}
      <div className="bg-stone-900/90 p-3 rounded-2xl border border-stone-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-amber-300 font-mono uppercase tracking-wider">
            Quick 3D AR Landmarks:
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full no-scrollbar py-0.5">
          {[
            { name: 'Lalibela', label: 'Bet Giyorgis Lalibela', icon: '⛪' },
            { name: 'Axum', label: 'Aksum Obelisks', icon: '🏛️' },
            { name: 'Gondar', label: 'Gondar Castles', icon: '🏰' },
            { name: 'Grand Ethiopian Renaissance Dam', label: 'GERD Dam', icon: '🌊' },
            { name: 'Danakil', label: 'Danakil & Erta Ale', icon: '🌋' },
            { name: 'Simien', label: 'Simien Mountains', icon: '🏔️' },
            { name: 'Harar', label: 'Harar Jugol', icon: '🕌' },
          ].map((item) => {
            const dest = TOURIST_DESTINATIONS.find((d) => d.name.toLowerCase().includes(item.name.toLowerCase()));
            if (!dest) return null;
            const isSelected = selectedDest?.id === dest.id;

            return (
              <button
                key={item.name}
                onClick={() => handleSelectDestination(dest)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md font-black ring-2 ring-amber-400/50'
                    : 'bg-stone-950 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* View Layout Switcher (Map + Dock vs Split 3D AR Guide) */}
        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 shrink-0 self-end md:self-auto">
          <button
            onClick={() => setViewLayoutMode('map_with_ar_dock')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewLayoutMode === 'map_with_ar_dock'
                ? 'bg-amber-500 text-stone-950 font-black shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Interactive Map with 3D AR Holo-Dock"
          >
            <LayoutGrid className="w-3 h-3" />
            <span className="hidden sm:inline">Map + AR Dock</span>
          </button>

          <button
            onClick={() => setViewLayoutMode('split_ar_and_map')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewLayoutMode === 'split_ar_and_map'
                ? 'bg-amber-500 text-stone-950 font-black shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Side-by-Side 3D AR Landmark Guide & Map"
          >
            <Split className="w-3 h-3" />
            <span className="hidden sm:inline">Split 3D AR Guide</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Language Filter Toggle, Category Chips & Search Bar */}
      <div className="bg-stone-900 p-3.5 rounded-2xl border border-stone-800 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-md">
        {/* Language Filter Toggle & Categories */}
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto no-scrollbar">
          {/* Toggle for Selected Language Country */}
          <button
            onClick={() => setFilterByLanguageCountry(!filterByLanguageCountry)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              filterByLanguageCountry
                ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-400/40'
                : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
            title={`Toggle filtering for ${currentLanguage.name} country locations`}
          >
            <span>{currentLanguage.flag}</span>
            <span>{currentLanguage.name} Country Sites</span>
            <span className="ml-1 px-1.5 py-0.2 bg-stone-950/30 rounded text-[10px] font-mono">
              {languageRelevantDestinations.length}
            </span>
          </button>

          {/* Category Filter Chips */}
          {[
            { id: 'all', label: 'All Sights', emoji: '🗺️' },
            { id: 'unesco', label: 'UNESCO Heritage', emoji: '🌟' },
            { id: 'historical', label: 'Historical & Castles', emoji: '🏛️' },
            { id: 'natural_wonder', label: 'Natural Wonders', emoji: '🌋' },
            { id: 'wildlife', label: 'Wildlife & Parks', emoji: '🦁' },
            { id: 'cultural', label: 'Cultural & Coffee', emoji: '☕' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-stone-100 text-stone-900 shadow-sm'
                  : 'bg-stone-950 text-stone-400 hover:bg-stone-800 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input Box */}
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search landmarks, cities, wonders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Map & Interactive Sights Layout */}
      {viewLayoutMode === 'split_ar_and_map' && selectedDest ? (
        /* SPLIT-SCREEN VIEW: 3D AR Volumetric Landmark Guide on Left, Interactive Map on Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in">
          {/* Left: Interactive 3D WebGL AR Visual Guide Container (6 Cols) */}
          <div className="lg:col-span-6 h-[580px] sm:h-[640px] flex flex-col">
            <div className="flex items-center justify-between px-1 pb-2 text-xs font-bold text-amber-300 font-mono uppercase">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>3D AR Volumetric Visual Guide</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                Interactive Three.js WebGL
              </span>
            </div>

            <div className="flex-1 min-h-0">
              <Landmark3DCanvas
                destination={selectedDest}
                onExpand={() => setIsArModalOpen(true)}
                onStartRoleplay={onStartRoleplayWithDestination}
              />
            </div>
          </div>

          {/* Right: Leaflet Map Container (6 Cols) */}
          <div className="lg:col-span-6 relative rounded-3xl overflow-hidden border border-stone-800 shadow-2xl bg-stone-950 h-[580px] sm:h-[640px] flex flex-col">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Quick Sights Floating Tag */}
            <div className="absolute top-4 left-4 z-10 bg-stone-900/90 backdrop-blur-md border border-stone-800 p-2.5 rounded-2xl shadow-xl text-white text-xs max-w-xs space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] font-mono">
                <MapPin className="w-3 h-3" />
                <span>{selectedDest.name}</span>
              </div>
              <p className="text-[10px] text-stone-300 line-clamp-2">
                {selectedDest.shortSummary}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setIsDetailDrawerOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-bold"
                >
                  Full Cultural Guide
                </button>
                {onStartRoleplayWithDestination && (
                  <button
                    onClick={() => onStartRoleplayWithDestination(selectedDest)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-[10px] font-bold"
                  >
                    AI Tour
                  </button>
                )}
              </div>
            </div>

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 z-10 bg-stone-900/90 backdrop-blur-md border border-stone-800 p-2 sm:p-2.5 rounded-2xl shadow-xl flex flex-wrap items-center gap-2 text-[10px] text-stone-300">
              <span className="font-bold text-amber-400 font-mono uppercase">Legend:</span>
              <span>🌟 UNESCO</span>
              <span>🏛️ History</span>
              <span>🌋 Nature</span>
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD VIEW: Map with In-Map 3D AR Visual Container Dock (8 Cols) + Landmark List (4 Cols) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Map Canvas Container (8 Cols on Desktop) */}
          <div className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-stone-800 shadow-2xl bg-stone-950 h-[580px] sm:h-[640px] flex flex-col">
            {/* Leaflet Map DOM Node */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Floating Map Legend Overlay */}
            <div className="absolute bottom-4 left-4 z-10 bg-stone-900/90 backdrop-blur-md border border-stone-800 p-2.5 sm:p-3 rounded-2xl shadow-xl flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-stone-300">
              <span className="font-bold text-amber-400 flex items-center gap-1 font-mono uppercase text-[10px]">
                <Layers className="w-3 h-3" /> Legend:
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> UNESCO Site
              </span>
              <span className="flex items-center gap-1">
                <span>🏛️</span> Historical
              </span>
              <span className="flex items-center gap-1">
                <span>🌋</span> Nature
              </span>
              <span className="flex items-center gap-1">
                <span>🦁</span> Safari
              </span>
              <span className="flex items-center gap-1">
                <span>☕</span> Culture
              </span>
            </div>

            {/* Active Landmark Quick Tag on top-left of Map */}
            {selectedDest && (
              <div className="absolute top-4 left-4 z-10 bg-stone-900/95 backdrop-blur-md border border-amber-500/50 p-3 rounded-2xl shadow-2xl max-w-xs animate-in fade-in slide-in-from-top-2 flex items-center justify-between gap-3 text-white">
                <div className="space-y-0.5 truncate">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>📍 Selected Landmark</span>
                  </div>
                  <div className="text-xs font-bold text-stone-100 truncate">
                    {selectedDest.name}
                  </div>
                  <div className="text-[10px] text-stone-400 truncate">
                    {selectedDest.country} {selectedDest.elevation ? `• ${selectedDest.elevation}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setIsArModalOpen(true)}
                    className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-[11px] rounded-xl transition-all shadow cursor-pointer flex items-center gap-1"
                    title="Launch 3D AR Holo-View Simulator"
                  >
                    <Sparkles className="w-3 h-3 text-stone-950" />
                    <span>3D AR</span>
                  </button>
                  <button
                    onClick={() => setIsDetailDrawerOpen(true)}
                    className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-[11px] rounded-xl transition-colors cursor-pointer"
                  >
                    Guide
                  </button>
                </div>
              </div>
            )}

            {/* In-Map AR Visual Container on Top-Right (Interactive 3D Three.js WebGL or Holo Card) */}
            {selectedDest && isArFloatingHUDOpen && (
              <div
                className="absolute top-4 right-4 z-20 w-72 sm:w-84 bg-stone-950/95 backdrop-blur-2xl border-2 border-amber-500/70 rounded-3xl p-3 shadow-2xl text-white space-y-2 animate-in fade-in slide-in-from-right-3 select-none"
              >
                {/* Header Telemetry */}
                <div className="flex items-center justify-between text-[10px] font-mono border-b border-stone-800 pb-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>AR 3D VISUAL CONTAINER</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setArDockMode(arDockMode === 'interactive_3d' ? 'compact_holo' : 'interactive_3d')}
                      className="px-1.5 py-0.5 rounded bg-stone-900 hover:bg-stone-800 text-amber-300 text-[9px] font-mono"
                      title="Toggle 3D Canvas / Photo Mode"
                    >
                      {arDockMode === 'interactive_3d' ? '3D Canvas' : 'Photo AR'}
                    </button>
                    <button
                      onClick={() => setIsArFloatingHUDOpen(false)}
                      className="text-stone-500 hover:text-stone-300 p-0.5"
                      title="Minimize AR viewport"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3D Representation / AR Guide Stage */}
                {arDockMode === 'interactive_3d' ? (
                  <div className="h-48 w-full rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 relative">
                    <Landmark3DCanvas
                      destination={selectedDest}
                      isCompact={true}
                      onExpand={() => setIsArModalOpen(true)}
                      onStartRoleplay={onStartRoleplayWithDestination}
                    />
                  </div>
                ) : (
                  <div
                    className="relative h-36 w-full rounded-2xl overflow-hidden bg-stone-900 border border-amber-500/40 flex items-center justify-center cursor-pointer group"
                    onClick={() => setIsArModalOpen(true)}
                  >
                    <img
                      src={selectedDest.coverImage}
                      alt={selectedDest.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(16,185,129,0.3)_50%,transparent_100%)] animate-pulse pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none">
                      <div className="flex justify-between text-[9px] font-mono text-emerald-300">
                        <span className="bg-black/60 px-1.5 py-0.5 rounded">GPS: {selectedDest.coordinates.lat.toFixed(2)}°N</span>
                        <span className="bg-black/60 px-1.5 py-0.5 rounded text-amber-300">ASL: {selectedDest.elevation || '2,400m'}</span>
                      </div>
                      <div className="text-center">
                        <span className="px-2 py-1 rounded-full bg-amber-500/90 text-stone-950 font-black text-[10px] shadow">
                          Tap for Full 3D AR Simulator
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* AR Bottom Tools */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <button
                    onClick={() => setIsArModalOpen(true)}
                    className="flex-1 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Expand Full 3D AR Deck</span>
                  </button>

                  <button
                    onClick={() => setViewLayoutMode('split_ar_and_map')}
                    className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                    title="Switch to Side-by-Side Split View"
                  >
                    <Split className="w-3 h-3" />
                    <span>Split</span>
                  </button>
                </div>
              </div>
            )}

            {/* Collapsed AR Launcher pill if minimized */}
            {selectedDest && !isArFloatingHUDOpen && (
              <button
                onClick={() => setIsArFloatingHUDOpen(true)}
                className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-2xl bg-stone-950/90 border border-amber-500/60 text-amber-300 hover:text-amber-200 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xl transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Show AR 3D Viewport</span>
              </button>
            )}
          </div>

          {/* Right Column: Interactive Destination List & Quick Cards (4 Cols) */}
          <div className="lg:col-span-4 space-y-3 flex flex-col h-[580px] sm:h-[640px]">
            <div className="flex items-center justify-between px-1 text-xs font-bold text-stone-400 uppercase tracking-wider">
              <span>Historical Landmarks ({filteredDestinations.length})</span>
              <span className="text-[10px] text-amber-400">Tap to view 3D AR</span>
            </div>

            {/* Scrollable list of destinations */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
              {filteredDestinations.length === 0 ? (
                <div className="p-8 text-center bg-stone-900/60 rounded-3xl border border-stone-800 text-stone-400 space-y-2">
                  <Compass className="w-8 h-8 mx-auto text-stone-600" />
                  <div className="text-xs font-bold text-stone-300">No landmarks match your search</div>
                  <p className="text-[11px] text-stone-500">
                    Try clearing the search query or toggle off the language filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setFilterByLanguageCountry(false);
                    }}
                    className="px-3 py-1.5 bg-stone-800 text-amber-300 rounded-xl text-xs font-bold"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                filteredDestinations.map((dest) => {
                  const isSelected = selectedDest?.id === dest.id;
                  return (
                    <div
                      key={dest.id}
                      onClick={() => handleSelectDestination(dest)}
                      className={`cursor-pointer p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-2 group shadow-md text-white ${
                        isSelected
                          ? 'bg-stone-900 border-amber-400 ring-2 ring-amber-400/30'
                          : 'bg-stone-900/70 border-stone-800 hover:border-stone-700 hover:bg-stone-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-amber-200 font-display">
                              {dest.name}
                            </span>
                            {dest.unescoHeritage && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase shrink-0">
                                UNESCO
                              </span>
                            )}
                          </div>
                          {dest.localName && (
                            <div className="text-[11px] text-stone-400 truncate">
                              {dest.localName}
                            </div>
                          )}
                        </div>
                        <span className="text-xs shrink-0">
                          {dest.region === 'ethiopian' ? '🇪🇹' : dest.region === 'african' ? '🌍' : '🌐'}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-300 line-clamp-2 leading-relaxed">
                        {dest.shortSummary}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-800/80">
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">{dest.country}</span>
                        </div>
                        <span className="text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>3D AR View →</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Landmark Detail Modal / Drawer */}
      {isDetailDrawerOpen && selectedDest && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
          onClick={() => setIsDetailDrawerOpen(false)}
        >
          <div
            className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl text-white space-y-6 relative"
            onClick={(e) => e.stopPropagation()}
            id="landmark-detail-drawer"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsDetailDrawerOpen(false)}
              className="absolute top-5 right-5 p-2 bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 rounded-xl transition-colors cursor-pointer"
              title="Close guide"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header of Landmark Detail */}
            <div className="space-y-2 pr-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  📍 {selectedDest.country}
                </span>
                {selectedDest.unescoHeritage && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    🌟 UNESCO World Heritage Site
                  </span>
                )}
                {selectedDest.elevation && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 text-stone-300 border border-stone-700">
                    Elevation: {selectedDest.elevation}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                {selectedDest.name}
              </h2>
              {selectedDest.localName && (
                <div className="text-sm font-semibold text-amber-400">
                  {selectedDest.localName}
                </div>
              )}
              <p className="text-xs text-stone-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{selectedDest.locationDescription}</span>
              </p>
            </div>

            {/* Action Bar: Start Live AI Ambassador Tour, 3D AR Simulator & GPS Directions */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-stone-950 rounded-2xl border border-stone-800">
              <button
                onClick={() => {
                  setIsDetailDrawerOpen(false);
                  setIsArModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
                id="drawer-launch-3d-ar-btn"
              >
                <Sparkles className="w-4 h-4 text-stone-950" />
                <span>Launch 3D AR Simulator</span>
              </button>

              {onStartRoleplayWithDestination && (
                <button
                  onClick={() => {
                    setIsDetailDrawerOpen(false);
                    onStartRoleplayWithDestination(selectedDest);
                  }}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-xs rounded-xl border border-stone-700 shadow-md transition-all active:scale-95 cursor-pointer"
                  id="start-live-ambassador-tour-btn"
                >
                  <Radio className="w-4 h-4 text-amber-400" />
                  <span>Start Live AI Spoken Guided Tour</span>
                </button>
              )}

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedDest.coordinates.lat},${selectedDest.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors shadow"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Google Maps GPS</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>

            {/* Internal Detail Tabs */}
            <div className="flex items-center gap-2 border-b border-stone-800 pb-3 overflow-x-auto no-scrollbar">
              {[
                { id: 'overview' as const, label: '🏛️ History & Highlights' },
                { id: 'culture' as const, label: '☕ Culture & Etiquette' },
                { id: 'phrases' as const, label: '🗣️ Spoken Phrases' },
                { id: 'logistics' as const, label: '📍 Travel Logistics' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDetailTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeDetailTab === tab.id
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW & HISTORY */}
            {activeDetailTab === 'overview' && (
              <div className="space-y-4 animate-in fade-in">
                {/* 3D AR Holo Experience Interactive Banner */}
                <div
                  onClick={() => {
                    setIsDetailDrawerOpen(false);
                    setIsArModalOpen(true);
                  }}
                  className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-r from-stone-950 via-amber-950/40 to-stone-950 border-2 border-amber-500/60 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer group hover:border-amber-400 transition-all"
                >
                  <div className="space-y-1.5 z-10 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 uppercase font-mono">
                      <Sparkles className="w-3 h-3" />
                      <span>AR 3D Interactive Holo-Experience</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white font-display">
                      Step Inside {selectedDest.name} in 3D
                    </h3>
                    <p className="text-xs text-stone-300 max-w-md">
                      Simulate real 3D camera orbits, LiDAR scanning point-clouds, architectural cross-sections, and spatial audio atmosphere.
                    </p>
                  </div>

                  <button
                    className="z-10 px-4 py-2.5 bg-amber-500 group-hover:bg-amber-400 text-stone-950 font-black text-xs rounded-2xl shadow-xl flex items-center gap-2 shrink-0 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Launch 3D AR Holo-View</span>
                  </button>

                  <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>Historical Chronicle & Significance</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-200 leading-relaxed bg-stone-950/80 p-4 rounded-2xl border border-stone-800">
                    {selectedDest.historyAndSignificance}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Must-See Sights & Architecture</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedDest.mustSeeAttractions.map((sight, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 flex items-start gap-2.5 text-xs text-stone-200"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{sight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CULTURE & COFFEE */}
            {activeDetailTab === 'culture' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4" />
                    <span>Cultural Etiquette & Respectful Customs</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedDest.culturalEtiquette.map((rule, idx) => (
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

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                    <Coffee className="w-4 h-4 text-amber-400" />
                    <span>Cuisine, Traditional Coffee & Hospitality</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedDest.localCuisineAndCoffee.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 text-xs text-stone-200 flex items-start gap-2"
                      >
                        <span className="text-amber-400 shrink-0">☕</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ESSENTIAL SPOKEN PHRASES */}
            {activeDetailTab === 'phrases' && (
              <div className="space-y-3 animate-in fade-in">
                <p className="text-xs text-stone-400">
                  Tap the speaker icon to hear native audio pronunciation of key phrases used in {selectedDest.name}:
                </p>
                <div className="space-y-2">
                  {selectedDest.essentialLocalPhrases.map((phraseItem, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="text-base font-bold font-display text-amber-200">
                          {phraseItem.phrase}
                        </div>
                        <div className="text-xs text-stone-400 font-mono">
                          🗣️ {phraseItem.phonetic}
                        </div>
                        <div className="text-xs text-stone-300 font-medium">
                          "{phraseItem.meaning}"
                        </div>
                      </div>

                      <button
                        onClick={() => handleSpeakPhrase(phraseItem.phrase)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
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

            {/* TAB 4: TRAVEL LOGISTICS, MINISTRY INFO & FAQS */}
            {activeDetailTab === 'logistics' && (
              <div className="space-y-4 animate-in fade-in">
                {/* Ministry & Entrance Fees Card */}
                {selectedDest.officialMinistryInfo && (
                  <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <span>🛡️ Official Ministry & Visitor Standards</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                        <span className="text-[10px] text-stone-400 block font-mono">Governing Authority</span>
                        <span className="font-bold text-stone-200">{selectedDest.officialMinistryInfo.governingBody}</span>
                      </div>
                      <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                        <span className="text-[10px] text-stone-400 block font-mono">Opening Hours</span>
                        <span className="font-bold text-emerald-300">{selectedDest.officialMinistryInfo.openingHours}</span>
                      </div>
                      <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                        <span className="text-[10px] text-stone-400 block font-mono">Local Ticket</span>
                        <span className="font-bold text-stone-200">{selectedDest.officialMinistryInfo.entryFeeLocal}</span>
                      </div>
                      <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                        <span className="text-[10px] text-stone-400 block font-mono">Foreigner Ticket</span>
                        <span className="font-bold text-amber-300">{selectedDest.officialMinistryInfo.entryFeeForeigner}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Real Transit & Directions */}
                {selectedDest.placeDirections && (
                  <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <span>🗺️ Transit & Road Instructions</span>
                    </div>

                    {selectedDest.placeDirections.byAir && (
                      <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800 text-xs">
                        <span className="text-[10px] text-amber-400 block font-mono font-bold">✈️ By Air:</span>
                        <span className="text-stone-300">{selectedDest.placeDirections.byAir}</span>
                      </div>
                    )}

                    <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800 text-xs">
                      <span className="text-[10px] text-amber-400 block font-mono font-bold">🚗 By Road:</span>
                      <span className="text-stone-300">{selectedDest.placeDirections.byRoad}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-300 pt-1">
                      <span><strong>Distance:</strong> {selectedDest.placeDirections.distanceFromAddis}</span>
                      <span><strong>Vehicle:</strong> {selectedDest.placeDirections.recommendedVehicle}</span>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-stone-950/80 rounded-2xl border border-stone-800 flex items-center gap-3 text-xs">
                  <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-stone-200 block">Best Season to Visit:</span>
                    <span className="text-stone-300">{selectedDest.bestTimeToVisit}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>Practical Travel & Transportation Tips</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedDest.practicalTravelTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 text-xs text-stone-300 flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Holographic 3D Augmented Reality Viewport Modal */}
      {selectedDest && (
        <LandmarkARViewModal
          destination={selectedDest}
          currentLanguage={currentLanguage}
          isOpen={isArModalOpen}
          onClose={() => setIsArModalOpen(false)}
          onStartRoleplay={onStartRoleplayWithDestination}
        />
      )}
    </div>
  );
};
