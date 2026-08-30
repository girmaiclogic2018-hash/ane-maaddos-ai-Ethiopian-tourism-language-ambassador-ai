import React, { useState, useEffect, useRef } from 'react';
import { TouristDestination, LanguageInfo } from '../types';
import { Landmark3DCanvas } from './Landmark3DCanvas';
import {
  Compass,
  MapPin,
  Sparkles,
  Volume2,
  VolumeX,
  Camera,
  Layers,
  RotateCcw,
  Sun,
  Moon,
  Sunset,
  CloudRain,
  Eye,
  Radio,
  X,
  Maximize2,
  Minimize2,
  ChevronRight,
  Info,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  ExternalLink,
  Play,
  Pause,
  Box,
} from 'lucide-react';

interface LandmarkARViewModalProps {
  destination: TouristDestination;
  currentLanguage: LanguageInfo;
  isOpen: boolean;
  onClose: () => void;
  onStartRoleplay?: (dest: TouristDestination) => void;
}

type ARMode = 'hologram' | 'lidar' | 'thermal' | 'drone';
type LightingPreset = 'daylight' | 'golden_hour' | 'twilight' | 'night' | 'mystic';

interface Hotspot3D {
  id: string;
  title: string;
  category: string;
  description: string;
  xPercent: number; // 0 to 100 on image plane
  yPercent: number; // 0 to 100
  zOffset: number; // 3D depth translation in px
}

export const LandmarkARViewModal: React.FC<LandmarkARViewModalProps> = ({
  destination,
  currentLanguage,
  isOpen,
  onClose,
  onStartRoleplay,
}) => {
  // Rendering engine mode: Three.js procedural WebGL 3D vs Spatial Hologram
  const [engineMode, setEngineMode] = useState<'threejs' | 'spatial_photo'>('threejs');

  // 3D Camera Controls State
  const [pitch, setPitch] = useState<number>(12); // -35 to 55 deg
  const [yaw, setYaw] = useState<number>(15); // 0 to 360 deg
  const [zoom, setZoom] = useState<number>(1.0); // 0.7 to 2.0
  const [isOrbiting, setIsOrbiting] = useState<boolean>(true);
  const [orbitSpeed, setOrbitSpeed] = useState<number>(0.35);
  const [isLidarActive, setIsLidarActive] = useState<boolean>(false);
  const [arMode, setArMode] = useState<ARMode>('hologram');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('golden_hour');
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot3D | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isAudioAmbienceActive, setIsAudioAmbienceActive] = useState<boolean>(false);
  const [isSpeakingGuide, setIsSpeakingGuide] = useState<boolean>(false);
  const [snapshotTaken, setSnapshotTaken] = useState<boolean>(false);
  const [isGyroEnabled, setIsGyroEnabled] = useState<boolean>(false);
  const [laserScanY, setLaserScanY] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startRotationRef = useRef<{ pitch: number; yaw: number }>({ pitch: 12, yaw: 15 });
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientOscRef = useRef<OscillatorNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const requestAnimRef = useRef<number | null>(null);

  // Generate landmark-specific 3D architectural hotspots
  const architecturalHotspots: Hotspot3D[] = React.useMemo(() => {
    const list: Hotspot3D[] = [];
    const nameLower = destination.name.toLowerCase();

    if (nameLower.includes('lalibela') || nameLower.includes('church') || nameLower.includes('giorgis')) {
      list.push(
        {
          id: 'sp1',
          title: 'Monolithic Volcanic Tuff Extraction',
          category: 'Architectural Engineering',
          description: 'Carved 12 meters straight down into solid red volcanic scoria rock with subterranean drainage trenches without a single block of external mortar.',
          xPercent: 50,
          yPercent: 45,
          zOffset: 40,
        },
        {
          id: 'sp2',
          title: 'Greek Cruciform Roof Relief',
          category: 'Sacred Symbolism',
          description: 'Top-down carved triple equal-armed Greek cross roof with continuous water run-off channels carved directly into the stone.',
          xPercent: 52,
          yPercent: 28,
          zOffset: 70,
        },
        {
          id: 'sp3',
          title: 'Catacomb & Relic Passageways',
          category: 'Subterranean Chambers',
          description: 'Hidden underground rock-tunnel networks connecting 11 distinct monolithic churches across the symbolic Jordan River.',
          xPercent: 28,
          yPercent: 68,
          zOffset: 20,
        }
      );
    } else if (nameLower.includes('gerd') || nameLower.includes('dam') || nameLower.includes('renaissance')) {
      list.push(
        {
          id: 'sp1',
          title: 'Main Roller-Compacted Concrete Crest',
          category: 'Hydro Engineering',
          description: '145-meter-high concrete gravity barrier spanning 1,780 meters across the Blue Nile gorge with automated spillways.',
          xPercent: 48,
          yPercent: 42,
          zOffset: 50,
        },
        {
          id: 'sp2',
          title: 'Deep Hydro-Turbine Powerhouses',
          category: 'Clean Energy',
          description: 'Twin powerhouses generating 5,150 MW of clean renewable energy powering East Africa and regional power pools.',
          xPercent: 72,
          yPercent: 58,
          zOffset: 35,
        },
        {
          id: 'sp3',
          title: '74-Billion m³ Reservoir Archipelago',
          category: 'Eco-Tourism & Lake Basin',
          description: 'Vast man-made freshwater reservoir hosting over 70 island biomes, eco-lodges, and catamaran cruising channels.',
          xPercent: 25,
          yPercent: 32,
          zOffset: -20,
        }
      );
    } else if (nameLower.includes('axum') || nameLower.includes('obelisk') || nameLower.includes('stelae')) {
      list.push(
        {
          id: 'sp1',
          title: 'Monolithic Granite Stela (24m)',
          category: 'Ancient Megalith',
          description: 'Single block of solid nepheline syenite granite weighing over 160 tons, intricately carved to simulate multi-story palace architecture.',
          xPercent: 48,
          yPercent: 35,
          zOffset: 65,
        },
        {
          id: 'sp2',
          title: 'Underground Royal Necropolis',
          category: 'Crypt & Tombs',
          description: 'Subterranean mortuary chambers with precision-fitted granite lintels and false wooden beams carved in stone.',
          xPercent: 35,
          yPercent: 72,
          zOffset: 25,
        },
        {
          id: 'sp3',
          title: 'Ancient Ge\'ez Trilingual Inscriptions',
          category: 'Epigraphy',
          description: 'Royal victory chronicles inscribed in Ge\'ez, Sabaean, and Ancient Greek by King Ezana in the 4th Century AD.',
          xPercent: 68,
          yPercent: 60,
          zOffset: 30,
        }
      );
    } else if (nameLower.includes('gondar') || nameLower.includes('castle') || nameLower.includes('fasil')) {
      list.push(
        {
          id: 'sp1',
          title: 'Emperor Fasilides Main Keep',
          category: 'Gondarine Architecture',
          description: 'Three-story dressed-brown-basalt castle with four octagonal domed corner watchtowers blending Portuguese, Moorish, and Aksumite styles.',
          xPercent: 46,
          yPercent: 40,
          zOffset: 55,
        },
        {
          id: 'sp2',
          title: 'Imperial Archives & Chancery',
          category: 'Historical Bureau',
          description: 'Royal library and diplomatic quarters that governed the Solomonic empire throughout the 17th and 18th centuries.',
          xPercent: 70,
          yPercent: 52,
          zOffset: 30,
        },
        {
          id: 'sp3',
          title: 'Fasilides Sunken Bathing Pool',
          category: 'Ceremonial Center',
          description: 'Sunken ceremonial reservoir surrounded by ancient banyan trees, center of the annual Timkat epiphany celebrations.',
          xPercent: 24,
          yPercent: 65,
          zOffset: 15,
        }
      );
    } else {
      // General landmark highlights
      list.push(
        {
          id: 'sp1',
          title: destination.mustSeeAttractions[0] || 'Central Architectural Focal Point',
          category: 'Key Feature',
          description: destination.shortSummary,
          xPercent: 50,
          yPercent: 45,
          zOffset: 45,
        },
        {
          id: 'sp2',
          title: destination.mustSeeAttractions[1] || 'Scenic Viewpoint & Topography',
          category: 'Landscape & Vistas',
          description: `Elevation: ${destination.elevation || 'Variable'}. Situated in ${destination.locationDescription}`,
          xPercent: 28,
          yPercent: 35,
          zOffset: 20,
        },
        {
          id: 'sp3',
          title: destination.mustSeeAttractions[2] || 'Cultural & Historic Significance',
          category: 'Heritage',
          description: destination.historyAndSignificance.slice(0, 140) + '...',
          xPercent: 72,
          yPercent: 62,
          zOffset: 35,
        }
      );
    }

    return list;
  }, [destination]);

  // Ambient sound synthesizer
  const toggleAmbientSound = () => {
    if (isAudioAmbienceActive) {
      if (ambientOscRef.current) {
        try {
          ambientOscRef.current.stop();
          ambientOscRef.current.disconnect();
        } catch (e) {}
        ambientOscRef.current = null;
      }
      setIsAudioAmbienceActive(false);
    } else {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        // Create warm ambient drone / breeze synthesizer
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, ctx.currentTime); // Low A

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, ctx.currentTime);

        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 1.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        ambientOscRef.current = osc;
        ambientGainRef.current = gain;
        setIsAudioAmbienceActive(true);
      } catch (err) {
        console.warn('AudioContext not permitted or supported', err);
      }
    }
  };

  // Holographic audio voice guide
  const handleSpokenARGuide = () => {
    if ('speechSynthesis' in window) {
      if (isSpeakingGuide) {
        window.speechSynthesis.cancel();
        setIsSpeakingGuide(false);
        return;
      }

      window.speechSynthesis.cancel();
      const narrative = `Welcome to the augmented reality scan of ${destination.name}. Located in ${destination.country} at an altitude of ${destination.elevation || 'moderate elevation'}. ${destination.shortSummary} Key architectural highlight: ${destination.mustSeeAttractions.slice(0, 2).join('. ')}`;
      const utterance = new SpeechSynthesisUtterance(narrative);
      utterance.rate = 0.9;
      setIsSpeakingGuide(true);
      utterance.onend = () => setIsSpeakingGuide(false);
      utterance.onerror = () => setIsSpeakingGuide(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto-orbit animation loop
  useEffect(() => {
    if (!isOpen) return;

    let lastTime = performance.now();
    const updateOrbit = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isOrbiting && !isDraggingRef.current) {
        setYaw((prev) => (prev + orbitSpeed * delta * 20) % 360);
      }

      // Laser scanline animation
      setLaserScanY((prev) => (prev + 40 * delta) % 100);

      requestAnimRef.current = requestAnimationFrame(updateOrbit);
    };

    requestAnimRef.current = requestAnimationFrame(updateOrbit);
    return () => {
      if (requestAnimRef.current) {
        cancelAnimationFrame(requestAnimRef.current);
      }
    };
  }, [isOpen, isOrbiting, orbitSpeed]);

  // Clean up audio on unmount or close
  useEffect(() => {
    return () => {
      if (ambientOscRef.current) {
        try {
          ambientOscRef.current.stop();
          ambientOscRef.current.disconnect();
        } catch (e) {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Gyroscope / Device orientation
  useEffect(() => {
    if (!isGyroEnabled || typeof window === 'undefined') return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        // Gamma is left-to-right tilt (-90 to 90)
        // Beta is front-to-back tilt (-180 to 180)
        const targetYaw = ((e.gamma * 2) + 360) % 360;
        const targetPitch = Math.max(-25, Math.min(50, e.beta - 45));
        setYaw(targetYaw);
        setPitch(targetPitch);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isGyroEnabled]);

  // Mouse & Touch interaction handlers for 3D rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    startRotationRef.current = { pitch, yaw };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartPosRef.current.x;
    const deltaY = e.clientY - dragStartPosRef.current.y;

    const newYaw = (startRotationRef.current.yaw + deltaX * 0.45 + 360) % 360;
    const newPitch = Math.max(-30, Math.min(55, startRotationRef.current.pitch - deltaY * 0.35));

    setYaw(newYaw);
    setPitch(newPitch);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      dragStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      startRotationRef.current = { pitch, yaw };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStartPosRef.current.x;
    const deltaY = e.touches[0].clientY - dragStartPosRef.current.y;

    const newYaw = (startRotationRef.current.yaw + deltaX * 0.5 + 360) % 360;
    const newPitch = Math.max(-30, Math.min(55, startRotationRef.current.pitch - deltaY * 0.4));

    setYaw(newYaw);
    setPitch(newPitch);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Snapshot flash trigger
  const handleCaptureSnapshot = () => {
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 800);
  };

  // Convert yaw to 8-point compass bearing
  const getCompassHeading = (degree: number) => {
    const d = (degree + 360) % 360;
    if (d >= 337.5 || d < 22.5) return 'N (000°)';
    if (d >= 22.5 && d < 67.5) return 'NE (045°)';
    if (d >= 67.5 && d < 112.5) return 'E (090°)';
    if (d >= 112.5 && d < 157.5) return 'SE (135°)';
    if (d >= 157.5 && d < 202.5) return 'S (180°)';
    if (d >= 202.5 && d < 247.5) return 'SW (225°)';
    if (d >= 247.5 && d < 292.5) return 'W (270°)';
    return 'NW (315°)';
  };

  // Lighting environment themes
  const getLightingStyles = () => {
    switch (lightingPreset) {
      case 'daylight':
        return {
          sky: 'from-sky-900/60 via-stone-900 to-stone-950',
          glow: 'rgba(255, 240, 200, 0.25)',
          filter: 'brightness(1.05) contrast(1.02)',
        };
      case 'golden_hour':
        return {
          sky: 'from-amber-950/70 via-orange-950/40 to-stone-950',
          glow: 'rgba(245, 158, 11, 0.35)',
          filter: 'sepia(0.2) saturate(1.25) brightness(1.02)',
        };
      case 'twilight':
        return {
          sky: 'from-indigo-950/80 via-purple-950/50 to-stone-950',
          glow: 'rgba(147, 51, 234, 0.3)',
          filter: 'hue-rotate(290deg) saturate(1.1) brightness(0.85)',
        };
      case 'night':
        return {
          sky: 'from-blue-950/90 via-stone-950 to-black',
          glow: 'rgba(56, 189, 248, 0.2)',
          filter: 'brightness(0.7) contrast(1.2) hue-rotate(200deg)',
        };
      case 'mystic':
        return {
          sky: 'from-emerald-950/80 via-teal-950/50 to-stone-950',
          glow: 'rgba(16, 185, 129, 0.35)',
          filter: 'hue-rotate(120deg) saturate(1.2) brightness(0.9)',
        };
    }
  };

  const lighting = getLightingStyles();
  const currentImage = destination.images[activeImageIndex] || destination.coverImage;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
      id="ar-landmark-view-modal"
    >
      {/* Modal Container */}
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[850px] bg-stone-950 rounded-3xl border border-amber-500/40 shadow-2xl flex flex-col overflow-hidden text-white select-none">
        {/* Flash overlay for AR camera capture */}
        {snapshotTaken && (
          <div className="absolute inset-0 z-50 bg-white animate-out fade-out duration-700 pointer-events-none" />
        )}

        {/* Top AR HUD Header Bar */}
        <div className="relative z-30 px-4 py-3 bg-stone-900/90 backdrop-blur-md border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Landmark Name & AR Tag */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold font-mono shrink-0">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="space-y-0.5 truncate">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white font-display truncate">
                  {destination.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 uppercase tracking-wider font-mono">
                  3D AR HOLO-VIEW
                </span>
              </div>
              <div className="text-[11px] text-stone-400 font-mono truncate">
                📍 {destination.country} • Elevation: {destination.elevation || 'ASL Standard'}
              </div>
            </div>
          </div>

          {/* AR View Mode Switcher & 3D WebGL Engine Toggle */}
          <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setEngineMode('threejs')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                engineMode === 'threejs'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md font-black'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Interactive Three.js Procedural WebGL 3D Geometry"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Geometry</span>
            </button>

            <button
              onClick={() => setEngineMode('spatial_photo')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                engineMode === 'spatial_photo'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md font-black'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="3D Tilt Hologram with Spatial Hotspots"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Spatial Holo</span>
            </button>
          </div>

          {engineMode === 'spatial_photo' && (
            <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800">
              {[
                { id: 'hologram', label: '3D Holo', icon: Sparkles },
                { id: 'lidar', label: 'LiDAR', icon: Layers },
                { id: 'thermal', label: 'Thermal IR', icon: Eye },
                { id: 'drone', label: 'Drone', icon: Compass },
              ].map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setArMode(mode.id as ARMode)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      arMode === mode.id
                        ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Action Tools & Close */}
          <div className="flex items-center gap-2">
            {/* Audio Ambient Synth */}
            <button
              onClick={toggleAmbientSound}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isAudioAmbienceActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
              }`}
              title={isAudioAmbienceActive ? 'Mute 3D Spatial Audio' : 'Enable 3D Spatial Audio Atmosphere'}
            >
              {isAudioAmbienceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Spoken Voice Guide */}
            <button
              onClick={handleSpokenARGuide}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isSpeakingGuide
                  ? 'bg-amber-500 text-stone-950 border-amber-400 animate-pulse'
                  : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border-stone-700'
              }`}
              title="Listen to Spoken Architectural Audio Guide"
            >
              <Radio className="w-4 h-4" />
            </button>

            {/* Snapshot Camera */}
            <button
              onClick={handleCaptureSnapshot}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors cursor-pointer"
              title="Capture AR 3D Viewfinder Snapshot"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-rose-900/80 text-stone-300 hover:text-white border border-stone-700 transition-colors cursor-pointer"
              title="Exit AR View"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main 3D AR Viewport Area */}
        {engineMode === 'threejs' ? (
          <div className="relative flex-1 w-full h-full min-h-0 bg-stone-950">
            <Landmark3DCanvas
              destination={destination}
              onStartRoleplay={onStartRoleplay}
            />
          </div>
        ) : (
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`relative flex-1 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing bg-gradient-to-b ${lighting.sky} transition-all duration-700`}
            style={{ perspective: '1200px' }}
          >
          {/* Cybernetic AR HUD Laser Grid & Reticles */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* Top Left Telemetry Readout */}
            <div className="absolute top-4 left-4 p-3 rounded-2xl bg-stone-950/75 backdrop-blur-md border border-stone-800/80 text-[11px] font-mono space-y-1 text-stone-300">
              <div className="text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>AR TELEMETRY ENGINE</span>
              </div>
              <div>BEARING: <span className="text-white font-bold">{getCompassHeading(yaw)}</span></div>
              <div>TILT / PITCH: <span className="text-white font-bold">{pitch.toFixed(1)}°</span></div>
              <div>ZOOM FACTOR: <span className="text-white font-bold">{zoom.toFixed(2)}x</span></div>
              <div>COORDINATES: <span className="text-amber-300 font-bold">{destination.coordinates.lat.toFixed(4)}°N, {destination.coordinates.lng.toFixed(4)}°E</span></div>
            </div>

            {/* Top Right Historical & Architectural Classification */}
            <div className="absolute top-4 right-4 p-3 rounded-2xl bg-stone-950/75 backdrop-blur-md border border-stone-800/80 text-[11px] font-mono space-y-1 text-right text-stone-300 max-w-xs">
              <div className="text-emerald-400 font-bold uppercase">
                {destination.unescoHeritage ? '★ UNESCO World Heritage' : '★ Verified National Landmark'}
              </div>
              <div className="text-white font-bold truncate">
                {destination.localName || destination.name}
              </div>
              <div className="text-[10px] text-stone-400">
                Range: ~34.2m | Mesh Polygons: 18,400
              </div>
            </div>

            {/* Center Target Scanning Reticle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-amber-500/20 rounded-full flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 border border-dashed border-amber-400/30 rounded-full animate-spin duration-10000" />
              <div className="absolute w-2 h-2 bg-amber-400/60 rounded-full" />
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-400" />
            </div>

            {/* Sweeping Laser Scan Line */}
            {(arMode === 'lidar' || isLidarActive) && (
              <div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] pointer-events-none transition-all"
                style={{ top: `${laserScanY}%` }}
              />
            )}

            {/* Bottom Floating Compass Strip */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-800 text-[10px] font-mono text-stone-400 flex items-center gap-3">
              <span>W (270°)</span>
              <span>•</span>
              <span className="text-amber-400 font-bold font-display">{getCompassHeading(yaw)}</span>
              <span>•</span>
              <span>E (090°)</span>
            </div>
          </div>

          {/* 3D Transform World Container */}
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
            style={{
              transformStyle: 'preserve-3d',
              transform: `scale(${zoom})`,
            }}
          >
            {/* 3D Rotatable Stage */}
            <div
              className="relative w-[340px] sm:w-[480px] md:w-[620px] aspect-video rounded-3xl transition-transform duration-100 ease-out flex items-center justify-center"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${pitch}deg) rotateY(${yaw}deg)`,
              }}
            >
              {/* Layer 1: Ground LiDAR Perspective Grid */}
              <div
                className="absolute w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] rounded-full pointer-events-none"
                style={{
                  transform: 'rotateX(90deg) translateZ(-160px)',
                  background:
                    arMode === 'lidar'
                      ? 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.08) 50%, transparent 70%)'
                      : arMode === 'thermal'
                      ? 'radial-gradient(circle, rgba(244, 63, 94, 0.25) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.05) 50%, transparent 70%)',
                  border: '1px dashed rgba(245, 158, 11, 0.25)',
                }}
              />

              {/* Layer 2: Main 3D Landmark Extruded Surface */}
              <div
                className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-2 transition-all duration-500"
                style={{
                  transform: 'translateZ(0px)',
                  borderColor:
                    arMode === 'lidar'
                      ? 'rgba(16, 185, 129, 0.8)'
                      : arMode === 'thermal'
                      ? 'rgba(244, 63, 94, 0.8)'
                      : 'rgba(245, 158, 11, 0.6)',
                  boxShadow: `0 25px 50px -12px ${lighting.glow}`,
                  filter:
                    arMode === 'lidar'
                      ? 'invert(0.9) hue-rotate(90deg) contrast(1.4)'
                      : arMode === 'thermal'
                      ? 'invert(0.8) hue-rotate(240deg) saturate(2)'
                      : arMode === 'drone'
                      ? 'contrast(1.1) brightness(1.05)'
                      : lighting.filter,
                }}
              >
                <img
                  src={currentImage}
                  alt={destination.name}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  draggable={false}
                />

                {/* Wireframe Overlay when in LiDAR Mode */}
                {arMode === 'lidar' && (
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#059669_1px,transparent_1px),linear-gradient(to_bottom,#059669_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
                )}

                {/* Shading / Depth Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/20" />
              </div>

              {/* Layer 3: Interactive 3D Spatial Hotspots */}
              {architecturalHotspots.map((spot, idx) => (
                <div
                  key={spot.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedHotspot(spot);
                  }}
                  className="absolute z-30 group cursor-pointer"
                  style={{
                    left: `${spot.xPercent}%`,
                    top: `${spot.yPercent}%`,
                    transform: `translateZ(${spot.zOffset}px) translate(-50%, -50%)`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Floating Holographic 3D Marker */}
                  <div className="relative flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-amber-500/90 text-stone-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-125 transition-transform animate-bounce">
                      <span>{idx + 1}</span>
                    </div>
                    <div className="absolute -bottom-1 w-2 h-2 bg-amber-400 rotate-45" />

                    {/* Quick Hover Label */}
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-xl bg-stone-900/95 border border-amber-400/60 text-[10px] font-bold text-amber-200 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {spot.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Hotspot Holographic Inspection Popup */}
          {selectedHotspot && (
            <div className="absolute bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-stone-900/95 backdrop-blur-xl border-2 border-amber-500/80 p-4 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-3 duration-200 text-white space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                    {selectedHotspot.category}
                  </span>
                  <h4 className="text-sm font-bold text-white font-display">
                    {selectedHotspot.title}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedHotspot(null)}
                  className="text-stone-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed bg-stone-950/80 p-3 rounded-2xl border border-stone-800">
                {selectedHotspot.description}
              </p>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    if ('speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                      const u = new SpeechSynthesisUtterance(selectedHotspot.description);
                      u.rate = 0.9;
                      window.speechSynthesis.speak(u);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen to Fact</span>
                </button>

                {onStartRoleplay && (
                  <button
                    onClick={() => {
                      onClose();
                      onStartRoleplay(destination);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Ask AI Guide</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

        {/* Bottom Control Deck for Spatial Photo Mode */}
        {engineMode === 'spatial_photo' && (
          <div className="relative z-30 p-4 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Lighting Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-mono uppercase text-stone-400 mr-1 hidden sm:inline">Lighting:</span>
              {[
                { id: 'daylight', label: 'Day', icon: Sun },
                { id: 'golden_hour', label: 'Golden Hour', icon: Sunset },
                { id: 'twilight', label: 'Twilight', icon: Moon },
                { id: 'night', label: 'Night Starfield', icon: Sparkles },
                { id: 'mystic', label: 'Mist Scan', icon: CloudRain },
              ].map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => setLightingPreset(p.id as LightingPreset)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      lightingPreset === p.id
                        ? 'bg-stone-800 text-amber-300 border border-amber-500/50 font-bold'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 3D Motion Controls (Auto-Orbit, Reset, Zoom) */}
            <div className="flex items-center gap-2">
              {/* Auto Orbit Toggle */}
              <button
                onClick={() => setIsOrbiting(!isOrbiting)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isOrbiting
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {isOrbiting ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isOrbiting ? 'Auto-Orbiting' : 'Orbit Paused'}</span>
              </button>

              {/* Reset Camera Position */}
              <button
                onClick={() => {
                  setPitch(12);
                  setYaw(15);
                  setZoom(1.0);
                }}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors cursor-pointer"
                title="Reset 3D Camera Angle"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Zoom Out & In */}
              <div className="flex items-center bg-stone-950 p-0.5 rounded-xl border border-stone-800">
                <button
                  onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
                  className="px-2 py-1 text-stone-400 hover:text-white font-bold"
                  title="Zoom Out"
                >
                  -
                </button>
                <span className="px-1 text-[10px] font-mono text-amber-300">{zoom.toFixed(1)}x</span>
                <button
                  onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
                  className="px-2 py-1 text-stone-400 hover:text-white font-bold"
                  title="Zoom In"
                >
                  +
                </button>
              </div>

              {/* Image Angle Switcher */}
              {destination.images.length > 1 && (
                <div className="flex items-center gap-1 pl-2 border-l border-stone-800">
                  {destination.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'bg-amber-500 text-stone-950'
                          : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
