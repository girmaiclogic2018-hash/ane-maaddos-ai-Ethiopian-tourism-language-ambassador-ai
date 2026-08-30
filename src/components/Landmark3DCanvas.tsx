import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { TouristDestination } from '../types';
import {
  Sparkles,
  Layers,
  RotateCcw,
  Sun,
  Moon,
  Sunset,
  Volume2,
  VolumeX,
  Radio,
  Eye,
  Camera,
  Maximize2,
  Minimize2,
  X,
  Play,
  Pause,
  Compass,
  Zap,
} from 'lucide-react';

export interface Landmark3DCanvasProps {
  destination: TouristDestination;
  isCompact?: boolean;
  onExpand?: () => void;
  onStartRoleplay?: (dest: TouristDestination) => void;
}

export type ARVisualMode = 'realistic' | 'lidar' | 'hologram' | 'thermal' | 'wireframe';
export type TimeOfDayPreset = 'day' | 'golden_hour' | 'twilight' | 'night';

interface LandmarkHotspot {
  id: string;
  title: string;
  category: string;
  description: string;
  position: THREE.Vector3;
}

export const Landmark3DCanvas: React.FC<Landmark3DCanvasProps> = ({
  destination,
  isCompact = false,
  onExpand,
  onStartRoleplay,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const landmarkGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const scanRingRef = useRef<THREE.Mesh | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Interaction State
  const [visualMode, setVisualMode] = useState<ARVisualMode>('realistic');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDayPreset>('golden_hour');
  const [isOrbiting, setIsOrbiting] = useState<boolean>(true);
  const [orbitSpeed, setOrbitSpeed] = useState<number>(0.4);
  const [selectedHotspot, setSelectedHotspot] = useState<LandmarkHotspot | null>(null);
  const [hotspotScreenPositions, setHotspotScreenPositions] = useState<{ id: string; x: number; y: number; visible: boolean }[]>([]);
  const [isAudioAmbienceActive, setIsAudioAmbienceActive] = useState<boolean>(false);
  const [isSpeakingGuide, setIsSpeakingGuide] = useState<boolean>(false);
  const [snapshotEffect, setSnapshotEffect] = useState<boolean>(false);

  // Camera Orbit State
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: 0.6,
    phi: 0.45,
    radius: 12,
  });

  const hotspotsRef = useRef<LandmarkHotspot[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientOscRef = useRef<OscillatorNode | null>(null);

  // Determine architectural hotspots for the selected destination
  const getLandmarkHotspots = useCallback((dest: TouristDestination): LandmarkHotspot[] => {
    const nameLower = (dest.name + ' ' + (dest.localName || '')).toLowerCase();

    if (nameLower.includes('lalibela') || nameLower.includes('church') || nameLower.includes('giorgis')) {
      return [
        {
          id: 'l1',
          title: 'Monolithic Volcanic Quarry Pit',
          category: 'Rock-Hewn Excavation',
          description: 'Carved 12 meters straight down into solid red scoria basalt without external mortar, surrounded by drainage trenches.',
          position: new THREE.Vector3(0, -1.8, 2.5),
        },
        {
          id: 'l2',
          title: 'Greek Cruciform Roof Relief',
          category: 'Sacred Symbolism',
          description: 'Three-tiered concentric Greek crosses carved into the planar roof stone with subtle pitch slopes for rain run-off.',
          position: new THREE.Vector3(0, 2.2, 0),
        },
        {
          id: 'l3',
          title: 'Underground Catacombs & Tunnels',
          category: 'Subterranean Network',
          description: 'Subterranean corridors connecting the 11 rock churches, symbolizing the holy city of New Jerusalem.',
          position: new THREE.Vector3(-2.8, -1.5, -1.2),
        },
      ];
    } else if (nameLower.includes('axum') || nameLower.includes('aksum') || nameLower.includes('stela') || nameLower.includes('obelisk')) {
      return [
        {
          id: 'a1',
          title: 'Great Stele Monolithic Apex',
          category: 'Aksumite Megalith (24m)',
          description: 'Single solid block of syenite granite weighing over 160 tons, sculpted with intricate palace facade reliefs.',
          position: new THREE.Vector3(0, 3.8, 0),
        },
        {
          id: 'a2',
          title: 'Multi-Story Palace Windows ("Monkey Heads")',
          category: 'Ancient Architecture',
          description: 'Carved false windows imitating traditional Aksumite timber and stone framing with round protruding beam ends.',
          position: new THREE.Vector3(0, 0.5, 0.9),
        },
        {
          id: 'a3',
          title: 'Royal Tombs & Sacrificial Basins',
          category: 'Necropolis & Crypt',
          description: 'Basal granite platform with ceremonial libation cups and underground mortuary chambers from the 4th Century CE.',
          position: new THREE.Vector3(1.6, -2.6, 1.4),
        },
      ];
    } else if (nameLower.includes('gondar') || nameLower.includes('fasil') || nameLower.includes('castle')) {
      return [
        {
          id: 'g1',
          title: 'Emperor Fasilides Main Keep',
          category: 'Imperial Castle',
          description: 'Three-story dressed basalt castle with four corner domed watchtowers blending Portuguese, Moorish, and Aksumite styles.',
          position: new THREE.Vector3(0, 2.0, 0),
        },
        {
          id: 'g2',
          title: 'Octagonal Corner Turrets',
          category: 'Fortification',
          description: 'Spherical egg-shaped cupolas providing 360-degree panoramic vigilance across the historic capital.',
          position: new THREE.Vector3(-2.2, 2.6, 2.2),
        },
        {
          id: 'g3',
          title: 'Sunken Fasilides Epiphany Bath',
          category: 'Ceremonial Complex',
          description: 'Rectangular ceremonial pool fed by the Qaha River, center of the annual Timkat epiphany festival.',
          position: new THREE.Vector3(2.5, -1.8, -1.5),
        },
      ];
    } else if (nameLower.includes('dam') || nameLower.includes('gerd') || nameLower.includes('renaissance')) {
      return [
        {
          id: 'd1',
          title: 'Main Roller-Compacted Concrete Crest',
          category: 'Hydro Engineering',
          description: '145m high gravity wall spanning 1,780m across the Blue Nile gorge with automated spillways.',
          position: new THREE.Vector3(0, 1.5, 0),
        },
        {
          id: 'd2',
          title: 'Twin Hydro-Turbine Powerhouses',
          category: '5,150 MW Clean Energy',
          description: 'Deep subterranean turbine galleries delivering clean renewable electricity to the East African Power Pool.',
          position: new THREE.Vector3(2.8, -1.0, 1.2),
        },
        {
          id: 'd3',
          title: '74-Billion m³ Freshwater Archipelago',
          category: 'Eco-Basin & Islands',
          description: 'Vast reservoir basin featuring over 70 island biomes, eco-tourism lodges, and aquatic observation routes.',
          position: new THREE.Vector3(-2.5, 0.8, -2.0),
        },
      ];
    } else {
      return [
        {
          id: 'gen1',
          title: dest.mustSeeAttractions[0] || 'Central Architectural Monument',
          category: 'Key Feature',
          description: dest.shortSummary,
          position: new THREE.Vector3(0, 1.2, 0),
        },
        {
          id: 'gen2',
          title: dest.mustSeeAttractions[1] || 'Scenic Topography',
          category: 'Geographic Context',
          description: `Elevation: ${dest.elevation || 'Variable'}. Situated in ${dest.locationDescription}`,
          position: new THREE.Vector3(-2.2, 0, 1.8),
        },
        {
          id: 'gen3',
          title: dest.mustSeeAttractions[2] || 'Heritage & Cultural Value',
          category: 'Historical Significance',
          description: dest.historyAndSignificance.slice(0, 120) + '...',
          position: new THREE.Vector3(2.0, -1.2, -1.4),
        },
      ];
    }
  }, []);

  // Procedurally generate landmark 3D meshes based on destination type
  const buildLandmarkModel = useCallback((dest: TouristDestination, mode: ARVisualMode): THREE.Group => {
    const group = new THREE.Group();
    const nameLower = (dest.name + ' ' + (dest.localName || '')).toLowerCase();

    // Material definitions based on visualMode
    const getMaterial = (baseColor: number, roughness = 0.8, metalness = 0.2, emissive = 0x000000) => {
      if (mode === 'wireframe') {
        return new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          wireframe: true,
          emissive: 0x0284c7,
          emissiveIntensity: 0.4,
        });
      }
      if (mode === 'lidar') {
        return new THREE.MeshStandardMaterial({
          color: 0x10b981,
          wireframe: true,
          emissive: 0x059669,
          emissiveIntensity: 0.6,
        });
      }
      if (mode === 'hologram') {
        return new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          transparent: true,
          opacity: 0.85,
          wireframe: false,
          emissive: 0xd97706,
          emissiveIntensity: 0.5,
        });
      }
      if (mode === 'thermal') {
        return new THREE.MeshStandardMaterial({
          color: 0xf43f5e,
          emissive: 0x8b5cf6,
          emissiveIntensity: 0.5,
          roughness: 0.4,
        });
      }
      // Realistic default
      return new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness,
        metalness,
        emissive,
        emissiveIntensity: 0.1,
      });
    };

    // 1. LALIBELA CRUCIFORM CHURCH (Bet Giyorgis)
    if (nameLower.includes('lalibela') || nameLower.includes('church') || nameLower.includes('giorgis')) {
      // Ground pit trench (sunken quarry rock)
      const pitGeo = new THREE.BoxGeometry(9, 3.5, 9);
      const pitMat = getMaterial(0x8c4338, 0.9, 0.1);
      const pitMesh = new THREE.Mesh(pitGeo, pitMat);
      pitMesh.position.y = -2.8;
      group.add(pitMesh);

      // Inner excavated void box
      const trenchFloorGeo = new THREE.BoxGeometry(6.2, 0.4, 6.2);
      const floorMat = getMaterial(0x612822, 0.95, 0.05);
      const floorMesh = new THREE.Mesh(trenchFloorGeo, floorMat);
      floorMesh.position.y = -1.5;
      group.add(floorMesh);

      // Monolithic Cruciform Structure (Main cross body)
      const crossArmMat = getMaterial(0xa85344, 0.85, 0.15);

      // Vertical arm of cross
      const vertGeo = new THREE.BoxGeometry(1.6, 4.2, 4.4);
      const vertMesh = new THREE.Mesh(vertGeo, crossArmMat);
      vertMesh.position.y = 0.5;
      vertMesh.castShadow = true;
      vertMesh.receiveShadow = true;
      group.add(vertMesh);

      // Horizontal arm of cross
      const horizGeo = new THREE.BoxGeometry(4.4, 4.2, 1.6);
      const horizMesh = new THREE.Mesh(horizGeo, crossArmMat);
      horizMesh.position.y = 0.5;
      horizMesh.castShadow = true;
      horizMesh.receiveShadow = true;
      group.add(horizMesh);

      // Roof Greek Cross Step Relief
      const roofCrossGeo = new THREE.BoxGeometry(4.6, 0.2, 1.8);
      const roofMat = getMaterial(0xc26857, 0.7, 0.2);
      const roofHoriz = new THREE.Mesh(roofCrossGeo, roofMat);
      roofHoriz.position.y = 2.65;
      group.add(roofHoriz);

      const roofVertGeo = new THREE.BoxGeometry(1.8, 0.2, 4.6);
      const roofVert = new THREE.Mesh(roofVertGeo, roofMat);
      roofVert.position.y = 2.65;
      group.add(roofVert);

      // Stepped base plinth
      const baseGeo = new THREE.BoxGeometry(5.0, 0.6, 5.0);
      const baseMesh = new THREE.Mesh(baseGeo, getMaterial(0x78352d, 0.9, 0.1));
      baseMesh.position.y = -1.4;
      group.add(baseMesh);

      // Subterranean Entrance Arch
      const archGeo = new THREE.BoxGeometry(0.8, 1.4, 0.5);
      const archMat = getMaterial(0x2d1411, 1.0, 0.0);
      const archMesh = new THREE.Mesh(archGeo, archMat);
      archMesh.position.set(0, -0.7, 2.3);
      group.add(archMesh);
    }
    // 2. AKSUM OBELISK / GREAT STELA
    else if (nameLower.includes('axum') || nameLower.includes('aksum') || nameLower.includes('stela') || nameLower.includes('obelisk')) {
      const graniteMat = getMaterial(0x9ca3af, 0.75, 0.35);

      // Main Tapered Monolithic Column
      const obeliskGeo = new THREE.CylinderGeometry(0.7, 1.2, 7.5, 4);
      const obeliskMesh = new THREE.Mesh(obeliskGeo, graniteMat);
      obeliskMesh.position.y = 1.2;
      obeliskMesh.rotation.y = Math.PI / 4;
      obeliskMesh.castShadow = true;
      group.add(obeliskMesh);

      // Rounded Apex Summit (Semi-circular capstone)
      const capGeo = new THREE.SphereGeometry(0.68, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      const capMat = getMaterial(0xd1d5db, 0.6, 0.5, mode === 'hologram' ? 0xf59e0b : 0x000000);
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.y = 4.95;
      capMesh.rotation.y = Math.PI / 4;
      group.add(capMesh);

      // Carved False Window Tiers (Aksumite architectural ribs)
      for (let i = 0; i < 6; i++) {
        const windowGeo = new THREE.BoxGeometry(0.95, 0.15, 0.95);
        const windowMat = getMaterial(0x4b5563, 0.9, 0.1);
        const windowRib = new THREE.Mesh(windowGeo, windowMat);
        windowRib.position.y = -1.2 + i * 0.95;
        windowRib.rotation.y = Math.PI / 4;
        group.add(windowRib);
      }

      // Base False Doorway
      const doorGeo = new THREE.BoxGeometry(0.8, 1.2, 0.3);
      const doorMat = getMaterial(0x1f2937, 0.9, 0.1);
      const doorMesh = new THREE.Mesh(doorGeo, doorMat);
      doorMesh.position.set(0, -1.8, 0.85);
      group.add(doorMesh);

      // Basal Platform & Sacrificial Granite Cup-marks
      const platformGeo = new THREE.BoxGeometry(4.5, 0.5, 4.5);
      const platformMat = getMaterial(0x6b7280, 0.8, 0.2);
      const platformMesh = new THREE.Mesh(platformGeo, platformMat);
      platformMesh.position.y = -2.6;
      group.add(platformMesh);

      // Subterranean Crypt Foundation
      const cryptGeo = new THREE.BoxGeometry(6.0, 0.8, 6.0);
      const cryptMat = getMaterial(0x374151, 0.95, 0.05);
      const cryptMesh = new THREE.Mesh(cryptGeo, cryptMat);
      cryptMesh.position.y = -3.2;
      group.add(cryptMesh);
    }
    // 3. GONDAR CASTLE / FASIL GHEBBI
    else if (nameLower.includes('gondar') || nameLower.includes('fasil') || nameLower.includes('castle')) {
      const stoneMat = getMaterial(0x78553d, 0.85, 0.2);
      const domeMat = getMaterial(0xa16207, 0.5, 0.6);

      // Main Fortress Keep Body
      const keepGeo = new THREE.BoxGeometry(3.6, 3.8, 3.6);
      const keepMesh = new THREE.Mesh(keepGeo, stoneMat);
      keepMesh.position.y = 0.2;
      keepMesh.castShadow = true;
      group.add(keepMesh);

      // Crenelated Top Battlement
      const roofGeo = new THREE.BoxGeometry(4.0, 0.4, 4.0);
      const roofMesh = new THREE.Mesh(roofGeo, stoneMat);
      roofMesh.position.y = 2.2;
      group.add(roofMesh);

      // 4 Octagonal Corner Watchtowers with Cupola Domes
      const towerPositions = [
        [-1.8, 1.8],
        [1.8, 1.8],
        [-1.8, -1.8],
        [1.8, -1.8],
      ];

      towerPositions.forEach(([tx, tz]) => {
        const towerGeo = new THREE.CylinderGeometry(0.65, 0.75, 4.8, 8);
        const towerMesh = new THREE.Mesh(towerGeo, stoneMat);
        towerMesh.position.set(tx, 0.6, tz);
        towerMesh.castShadow = true;
        group.add(towerMesh);

        // Spherical Domed Cap
        const domeGeo = new THREE.SphereGeometry(0.68, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMesh = new THREE.Mesh(domeGeo, domeMat);
        domeMesh.position.set(tx, 3.0, tz);
        group.add(domeMesh);
      });

      // Ground Courtyard Platform
      const courtGeo = new THREE.BoxGeometry(7.5, 0.4, 7.5);
      const courtMesh = new THREE.Mesh(courtGeo, getMaterial(0x523e2b, 0.9, 0.1));
      courtMesh.position.y = -1.8;
      group.add(courtMesh);

      // Fasilides Sunken Bath Basin
      const bathGeo = new THREE.BoxGeometry(3.0, 0.3, 2.0);
      const bathMat = getMaterial(0x0284c7, 0.2, 0.8, 0x0369a1);
      const bathMesh = new THREE.Mesh(bathGeo, bathMat);
      bathMesh.position.set(3.2, -1.7, 0);
      group.add(bathMesh);
    }
    // 4. GERD (GRAND ETHIOPIAN RENAISSANCE DAM)
    else if (nameLower.includes('dam') || nameLower.includes('gerd') || nameLower.includes('renaissance')) {
      const concreteMat = getMaterial(0x9ca3af, 0.7, 0.2);
      const waterMat = getMaterial(0x0369a1, 0.2, 0.9, 0x0284c7);

      // Curved RCC Dam Wall
      const damGeo = new THREE.CylinderGeometry(5.5, 6.0, 3.2, 24, 1, false, Math.PI * 0.7, Math.PI * 0.6);
      const damMesh = new THREE.Mesh(damGeo, concreteMat);
      damMesh.position.set(0, 0, -1.0);
      damMesh.castShadow = true;
      group.add(damMesh);

      // Reservoir Water Basin
      const reservoirGeo = new THREE.CylinderGeometry(5.2, 5.2, 0.5, 24, 1, false, Math.PI * 0.7, Math.PI * 0.6);
      const resMesh = new THREE.Mesh(reservoirGeo, waterMat);
      resMesh.position.set(0, 0.8, -1.2);
      group.add(resMesh);

      // Spillway Crest Chute
      const spillGeo = new THREE.BoxGeometry(1.6, 2.8, 2.0);
      const spillMesh = new THREE.Mesh(spillGeo, getMaterial(0x6b7280, 0.8, 0.2));
      spillMesh.position.set(0, -0.2, 1.2);
      group.add(spillMesh);

      // Powerhouse Units at Base
      const powerGeo = new THREE.BoxGeometry(1.4, 1.0, 1.2);
      const powerMesh = new THREE.Mesh(powerGeo, getMaterial(0x4b5563, 0.6, 0.4));
      powerMesh.position.set(1.8, -1.2, 1.5);
      group.add(powerMesh);

      const powerMesh2 = new THREE.Mesh(powerGeo, getMaterial(0x4b5563, 0.6, 0.4));
      powerMesh2.position.set(-1.8, -1.2, 1.5);
      group.add(powerMesh2);
    }
    // 5. GENERAL / NATURAL MONUMENT (Simien, Danakil, Bale, Harar, etc.)
    else {
      // Natural Escarpment / Terraced Plateau Base
      const terr1 = new THREE.CylinderGeometry(3.5, 4.5, 1.2, 7);
      const geoMat1 = getMaterial(0x57534e, 0.9, 0.1);
      const mesh1 = new THREE.Mesh(terr1, geoMat1);
      mesh1.position.y = -1.8;
      group.add(mesh1);

      const terr2 = new THREE.CylinderGeometry(2.4, 3.2, 1.6, 6);
      const geoMat2 = getMaterial(0x78716c, 0.85, 0.15);
      const mesh2 = new THREE.Mesh(terr2, geoMat2);
      mesh2.position.y = -0.5;
      mesh2.castShadow = true;
      group.add(mesh2);

      // Peak Pinnacle / Monumental Tower
      const peakGeo = new THREE.ConeGeometry(1.6, 2.8, 6);
      const peakMat = getMaterial(0xa8a29e, 0.8, 0.2);
      const peakMesh = new THREE.Mesh(peakGeo, peakMat);
      peakMesh.position.y = 1.4;
      peakMesh.castShadow = true;
      group.add(peakMesh);

      // Surrounding decorative markers
      for (let i = 0; i < 4; i++) {
        const rad = (i * Math.PI) / 2;
        const colGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.2, 6);
        const colMesh = new THREE.Mesh(colGeo, getMaterial(0xd97706, 0.5, 0.4, 0x92400e));
        colMesh.position.set(Math.cos(rad) * 2.2, 0.2, Math.sin(rad) * 2.2);
        group.add(colMesh);
      }
    }

    // Add Base Ambient Ring / AR Stage Platform
    const stageGeo = new THREE.CylinderGeometry(5.2, 5.4, 0.3, 32);
    const stageMat = new THREE.MeshStandardMaterial({
      color: mode === 'lidar' ? 0x064e3b : mode === 'hologram' ? 0x451a03 : 0x1c1917,
      roughness: 0.9,
      metalness: 0.3,
      wireframe: mode === 'wireframe',
    });
    const stageMesh = new THREE.Mesh(stageGeo, stageMat);
    stageMesh.position.y = -3.2;
    stageMesh.receiveShadow = true;
    group.add(stageMesh);

    return group;
  }, []);

  // Update lighting conditions based on timeOfDay
  const updateSceneLighting = useCallback((scene: THREE.Scene, time: TimeOfDayPreset) => {
    // Clear existing lights
    const lightsToRemove: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if (child instanceof THREE.Light) {
        lightsToRemove.push(child);
      }
    });
    lightsToRemove.forEach((l) => scene.remove(l));

    let ambientColor = 0xffffff;
    let ambientIntensity = 0.8;
    let sunColor = 0xfffaed;
    let sunIntensity = 1.6;
    let sunPos = new THREE.Vector3(8, 12, 10);
    let rimColor = 0x38bdf8;
    let rimIntensity = 0.5;

    switch (time) {
      case 'day':
        ambientColor = 0xf1f5f9;
        ambientIntensity = 1.0;
        sunColor = 0xffffff;
        sunIntensity = 2.0;
        sunPos.set(5, 14, 8);
        break;
      case 'golden_hour':
        ambientColor = 0xfef3c7;
        ambientIntensity = 0.9;
        sunColor = 0xf59e0b;
        sunIntensity = 2.4;
        sunPos.set(10, 6, 8);
        rimColor = 0xf97316;
        rimIntensity = 1.0;
        break;
      case 'twilight':
        ambientColor = 0x312e81;
        ambientIntensity = 0.6;
        sunColor = 0xa855f7;
        sunIntensity = 1.2;
        sunPos.set(-8, 5, -6);
        rimColor = 0x06b6d4;
        rimIntensity = 1.2;
        break;
      case 'night':
        ambientColor = 0x0f172a;
        ambientIntensity = 0.4;
        sunColor = 0x38bdf8;
        sunIntensity = 0.8;
        sunPos.set(-6, 8, 10);
        rimColor = 0x10b981;
        rimIntensity = 0.9;
        break;
    }

    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(sunColor, sunIntensity);
    dirLight.position.copy(sunPos);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(rimColor, rimIntensity);
    rimLight.position.set(-sunPos.x, -sunPos.y * 0.5, -sunPos.z);
    scene.add(rimLight);

    // Glowing point light under the model
    const underGlow = new THREE.PointLight(0xf59e0b, 1.2, 8);
    underGlow.position.set(0, -2.5, 0);
    scene.add(underGlow);
  }, []);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 300;
    const height = mountRef.current.clientHeight || 240;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Clean old canvas if any
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lighting
    updateSceneLighting(scene, timeOfDay);

    // 5. Build Procedural Landmark Mesh
    const landmarkGroup = buildLandmarkModel(destination, visualMode);
    landmarkGroupRef.current = landmarkGroup;
    scene.add(landmarkGroup);

    // 6. Particle Systems (Floating Atmospheric Star dust / AR LiDAR Grid)
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
      particlePositions[i + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i + 2] = (Math.random() - 0.5) * 14;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    particlesRef.current = particles;
    scene.add(particles);

    // 7. Scanning Laser Ring
    const ringGeo = new THREE.RingGeometry(4.2, 4.4, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const scanRing = new THREE.Mesh(ringGeo, ringMat);
    scanRing.rotation.x = Math.PI / 2;
    scanRingRef.current = scanRing;
    scene.add(scanRing);

    // 8. Update Hotspots
    hotspotsRef.current = getLandmarkHotspots(destination);

    // 9. Resize Observer
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountRef.current);

    // 10. Animation Render Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Auto-Orbit camera
      if (isOrbiting && !isDraggingRef.current) {
        cameraAngleRef.current.theta += orbitSpeed * delta;
      }

      // Compute camera 3D position
      const { theta, phi, radius } = cameraAngleRef.current;
      const x = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.cos(theta);

      camera.position.set(x, y, z);
      camera.lookAt(0, 0.2, 0);

      // Animate scan ring
      if (scanRingRef.current) {
        scanRingRef.current.position.y = Math.sin(elapsed * 2) * 2.8;
        scanRingRef.current.rotation.z += 0.01;
      }

      // Slowly rotate particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.002;
      }

      // Project 3D Hotspot Coordinates to 2D Screen Space
      if (mountRef.current && cameraRef.current) {
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        const projected = hotspotsRef.current.map((spot) => {
          const v = spot.position.clone();
          v.project(cameraRef.current!);
          // Check if hotspot is in front of camera
          const isVisible = v.z < 1.0;
          const screenX = ((v.x + 1) * w) / 2;
          const screenY = ((-v.y + 1) * h) / 2;
          return {
            id: spot.id,
            x: screenX,
            y: screenY,
            visible: isVisible,
          };
        });
        setHotspotScreenPositions(projected);
      }

      renderer.render(scene, camera);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [destination, visualMode, timeOfDay, isOrbiting, orbitSpeed, buildLandmarkModel, getLandmarkHotspots, updateSceneLighting]);

  // Handle Drag / Touch Rotation on 3D canvas
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

    cameraAngleRef.current.theta += deltaX * 0.008;
    cameraAngleRef.current.phi = Math.max(
      0.15,
      Math.min(Math.PI / 2 - 0.05, cameraAngleRef.current.phi - deltaY * 0.008)
    );
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraAngleRef.current.radius = Math.max(
      6,
      Math.min(22, cameraAngleRef.current.radius + e.deltaY * 0.015)
    );
  };

  // Reset 3D camera
  const handleResetCamera = () => {
    cameraAngleRef.current = { theta: 0.6, phi: 0.45, radius: 12 };
  };

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

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 1.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        ambientOscRef.current = osc;
        setIsAudioAmbienceActive(true);
      } catch (err) {
        console.warn('AudioContext not permitted', err);
      }
    }
  };

  // Spoken voice guide
  const handleVoiceGuide = () => {
    if ('speechSynthesis' in window) {
      if (isSpeakingGuide) {
        window.speechSynthesis.cancel();
        setIsSpeakingGuide(false);
        return;
      }
      window.speechSynthesis.cancel();
      const narrative = `3D Augmented Reality scan for ${destination.name}. ${destination.shortSummary} Notable architectural features: ${destination.mustSeeAttractions.slice(0, 2).join(', ')}`;
      const utterance = new SpeechSynthesisUtterance(narrative);
      utterance.rate = 0.9;
      setIsSpeakingGuide(true);
      utterance.onend = () => setIsSpeakingGuide(false);
      utterance.onerror = () => setIsSpeakingGuide(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Snapshot flash
  const handleCaptureSnapshot = () => {
    setSnapshotEffect(true);
    setTimeout(() => setSnapshotEffect(false), 600);
  };

  const getCompassDegree = () => {
    const deg = Math.round(((-cameraAngleRef.current.theta * 180) / Math.PI + 360) % 360);
    return `${deg}°`;
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col bg-stone-950 rounded-3xl border border-amber-500/50 shadow-2xl overflow-hidden select-none font-sans text-white group ${
        isCompact ? 'p-2 sm:p-3' : 'p-3 sm:p-4'
      }`}
      id={`ar-landmark-canvas-${destination.id}`}
    >
      {/* Snapshot flash layer */}
      {snapshotEffect && (
        <div className="absolute inset-0 z-50 bg-white animate-out fade-out duration-500 pointer-events-none" />
      )}

      {/* Top AR Header & Telemetry Bar */}
      <div className="relative z-20 flex items-center justify-between gap-2 pb-2 border-b border-stone-800/80">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="truncate space-y-0.5">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-xs sm:text-sm font-extrabold text-white font-display truncate">
                {destination.name}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500 text-stone-950 font-mono tracking-wider">
                3D AR
              </span>
            </div>
            <div className="text-[10px] text-stone-400 font-mono flex items-center gap-2 truncate">
              <span>📍 {destination.country}</span>
              <span>•</span>
              <span className="text-amber-300">ASL: {destination.elevation || '2,400m'}</span>
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Spatial Audio Synth */}
          <button
            onClick={toggleAmbientSound}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              isAudioAmbienceActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-400 border-stone-800'
            }`}
            title="3D Spatial Atmosphere Audio"
          >
            {isAudioAmbienceActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Voice Guide */}
          <button
            onClick={handleVoiceGuide}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              isSpeakingGuide
                ? 'bg-amber-500 text-stone-950 border-amber-400 animate-pulse'
                : 'bg-stone-900 hover:bg-stone-800 text-amber-300 border-stone-800'
            }`}
            title="Listen to Spoken Architectural Audio Guide"
          >
            <Radio className="w-3.5 h-3.5" />
          </button>

          {/* Snapshot tool */}
          <button
            onClick={handleCaptureSnapshot}
            className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors cursor-pointer"
            title="Capture AR Frame"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen / Expand */}
          {onExpand && (
            <button
              onClick={onExpand}
              className="p-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-colors cursor-pointer shadow"
              title="Expand Full AR Holo-Deck"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main 3D WebGL Stage Area */}
      <div
        className="relative flex-1 w-full min-h-[220px] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing touch-none my-2"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      >
        {/* Three.js Canvas Mount */}
        <div ref={mountRef} className="absolute inset-0 w-full h-full" />

        {/* HUD Cybernetic Reticle Overlays */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Top Left Compass & Orbit Telemetry */}
          <div className="absolute top-2 left-2 px-2 py-1 rounded-xl bg-stone-950/80 backdrop-blur-md border border-stone-800 text-[10px] font-mono text-stone-300 space-y-0.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>BEARING: {getCompassDegree()}</span>
            </div>
            <div className="text-stone-400 text-[9px]">
              GPS: {destination.coordinates.lat.toFixed(2)}°N, {destination.coordinates.lng.toFixed(2)}°E
            </div>
          </div>

          {/* Top Right UNESCO / Heritage Flag */}
          <div className="absolute top-2 right-2 px-2 py-1 rounded-xl bg-stone-950/80 backdrop-blur-md border border-stone-800 text-[9px] font-mono font-bold text-emerald-400 uppercase">
            {destination.unescoHeritage ? '★ UNESCO World Heritage' : '★ National Heritage'}
          </div>

          {/* Center Target Scanning Box */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-amber-500/20 rounded-full flex items-center justify-center">
            <div className="w-20 h-20 border border-dashed border-amber-400/30 rounded-full animate-spin duration-10000" />
            <div className="w-1.5 h-1.5 bg-amber-400/80 rounded-full" />
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400" />
          </div>

          {/* Bottom Floating Mode Badge */}
          <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-stone-900/90 border border-stone-700 text-[9px] font-mono text-amber-300 uppercase">
            MODE: {visualMode} | SUN: {timeOfDay.replace('_', ' ')}
          </div>
        </div>

        {/* 2D Projected Hotspot Tags in 3D Space */}
        {hotspotsRef.current.map((spot, idx) => {
          const screenPos = hotspotScreenPositions.find((p) => p.id === spot.id);
          if (!screenPos || !screenPos.visible) return null;

          return (
            <div
              key={spot.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedHotspot(spot);
              }}
              style={{
                left: `${screenPos.x}px`,
                top: `${screenPos.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-30 cursor-pointer pointer-events-auto group/spot transition-transform hover:scale-125"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 font-black text-[11px] flex items-center justify-center shadow-lg border border-white animate-bounce">
                  <span>{idx + 1}</span>
                </div>
                <div className="absolute -bottom-1 w-1.5 h-1.5 bg-amber-400 rotate-45" />

                {/* Tooltip on hover */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-lg bg-stone-900/95 border border-amber-500/70 text-[9px] font-bold text-amber-200 shadow-xl opacity-0 group-hover/spot:opacity-100 transition-opacity pointer-events-none">
                  {spot.title}
                </div>
              </div>
            </div>
          );
        })}

        {/* Selected Hotspot Inspection Card */}
        {selectedHotspot && (
          <div className="absolute bottom-3 left-3 right-3 z-40 bg-stone-900/95 backdrop-blur-xl border-2 border-amber-500/80 p-3 rounded-2xl shadow-2xl text-white space-y-1.5 animate-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  {selectedHotspot.category}
                </span>
                <h4 className="text-xs font-bold text-white font-display">
                  {selectedHotspot.title}
                </h4>
              </div>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="text-stone-400 hover:text-white p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-stone-300 leading-relaxed bg-stone-950/80 p-2 rounded-xl border border-stone-800">
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
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3 h-3" />
                <span>Audio Fact</span>
              </button>

              {onStartRoleplay && (
                <button
                  onClick={() => onStartRoleplay(destination)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Radio className="w-3 h-3" />
                  <span>Ask AI Guide</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom AR Mode & Lighting Deck */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 pt-1">
        {/* AR Visual Scan Modes */}
        <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-xl border border-stone-800">
          {[
            { id: 'realistic', label: '3D Solid' },
            { id: 'lidar', label: 'LiDAR' },
            { id: 'hologram', label: 'Holo' },
            { id: 'thermal', label: 'IR' },
            { id: 'wireframe', label: 'Mesh' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setVisualMode(mode.id as ARVisualMode)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                visualMode === mode.id
                  ? 'bg-amber-500 text-stone-950 shadow font-black'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Orbit & Camera tools */}
        <div className="flex items-center gap-1">
          {/* Orbit toggle */}
          <button
            onClick={() => setIsOrbiting(!isOrbiting)}
            className={`p-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              isOrbiting ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-300'
            }`}
            title={isOrbiting ? 'Pause 360° Camera Auto-Orbit' : 'Start 360° Camera Auto-Orbit'}
          >
            {isOrbiting ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>

          {/* Reset Camera */}
          <button
            onClick={handleResetCamera}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors cursor-pointer"
            title="Reset Camera Angle"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Time of Day Lighting Presets */}
          <div className="flex items-center gap-0.5 bg-stone-900 p-0.5 rounded-xl border border-stone-800">
            {[
              { id: 'day', icon: Sun, title: 'Daylight Sun' },
              { id: 'golden_hour', icon: Sunset, title: 'Golden Hour' },
              { id: 'twilight', icon: Moon, title: 'Twilight' },
              { id: 'night', icon: Sparkles, title: 'Night Starfield' },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTimeOfDay(t.id as TimeOfDayPreset)}
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                    timeOfDay === t.id ? 'bg-stone-800 text-amber-300' : 'text-stone-500 hover:text-stone-300'
                  }`}
                  title={t.title}
                >
                  <Icon className="w-3 h-3" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
