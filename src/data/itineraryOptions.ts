import { Itinerary3Day } from '../types';

export interface EthiopianRegionOption {
  id: string;
  name: string;
  subName: string;
  icon: string;
  description: string;
  bestMonths: string;
  defaultInterests: string[];
  keyLandmarks: string[];
  primarySpokenLanguages: string[];
}

export const ETHIOPIAN_REGIONS: EthiopianRegionOption[] = [
  {
    id: 'northern_historic',
    name: 'Northern Historic Circuit',
    subName: 'Lalibela, Gondar & Lake Tana',
    icon: '🏛️',
    description: 'Medieval rock-hewn monolithic churches, 17th-century royal castles of Fasil Ghebbi, and ancient island monasteries on Lake Tana.',
    bestMonths: 'October – April',
    defaultInterests: ['Ancient History & Castles', 'UNESCO Rock-Hewn Monolithic Churches', 'Traditional Coffee Ceremonies & Origin Stories'],
    keyLandmarks: ['Lalibela Church of Saint George', 'Fasil Ghebbi Royal Enclosure', 'Lake Tana Monasteries', 'Gondar Debre Berhan Selassie'],
    primarySpokenLanguages: ['am', 'en', 'fr', 'de'],
  },
  {
    id: 'simien_bale_highlands',
    name: 'Simien & Bale Mountain Highlands',
    subName: 'Roof of Africa, Geladas & Alpine Trekking',
    icon: '🏔️',
    description: 'Breathtaking escarpments, Ras Dashen summit, endemic Gelada baboons, Walia Ibex, and the Afro-alpine Sanetti Plateau.',
    bestMonths: 'September – May',
    defaultInterests: ['Endemic Wildlife (Gelada Baboon, Walia Ibex)', 'Highland Trekking & Spectacular Panoramas', 'Photography & Nature'],
    keyLandmarks: ['Simien Mountains National Park', 'Jinbar Waterfall', 'Chennek Camp', 'Bale Mountains Harenna Forest'],
    primarySpokenLanguages: ['am', 'om', 'en'],
  },
  {
    id: 'harar_eastern',
    name: 'Harar Jugol & Dire Dawa',
    subName: 'The 4th Holy City of Islam & Historic Coffee Gateways',
    icon: '🕌',
    description: 'UNESCO-walled ancient city with 82 mosques, vibrant spice markets, night hyena feeding rituals, and century-old coffee houses.',
    bestMonths: 'All year round (especially Nov – March)',
    defaultInterests: ['Ancient History & Castles', 'Traditional Coffee Ceremonies & Origin Stories', 'Cultural Festivals & Artisan Weaving Markets'],
    keyLandmarks: ['Harar Jugol Walled City', 'Arthur Rimbaud Cultural Center', 'Harar Hyena Man Site', 'Dire Dawa Historic Railway'],
    primarySpokenLanguages: ['am', 'om', 'so', 'ar', 'en'],
  },
  {
    id: 'addis_ababa_central',
    name: 'Addis Ababa & Central Highlands',
    subName: 'Capital of Africa, Lucy & Mount Entoto',
    icon: '🏙️',
    description: 'Hominid fossil Lucy at the National Museum, panoramic views from Entoto mountain, the sprawling Mercato market, and authentic jazz clubs.',
    bestMonths: 'All year round',
    defaultInterests: ['Authentic Ethiopian Cuisine & Injera Tasting', 'Traditional Coffee Ceremonies & Origin Stories', 'Traditional Ethio-Jazz & Azmari Music Clubs'],
    keyLandmarks: ['National Museum of Ethiopia', 'Mount Entoto & St. Mary Church', 'Mercato Open-Air Market', 'Holy Trinity Cathedral', 'Tomoca Coffee HQ'],
    primarySpokenLanguages: ['am', 'om', 'en', 'fr', 'zh'],
  },
  {
    id: 'danakil_afar',
    name: 'Danakil Depression & Afar Triangle',
    subName: 'Erta Ale Lava Lake & Dallol Hydrothermal Colors',
    icon: '🌋',
    description: 'One of the most surreal planetary landscapes on Earth: bubbling neon sulphur springs, active basaltic shield volcano, and camel salt caravans.',
    bestMonths: 'November – February (Cooler weather)',
    defaultInterests: ['Geothermal Wonders & Volcanic Expeditions', 'Highland Trekking & Spectacular Panoramas', 'Photography & Nature'],
    keyLandmarks: ['Erta Ale Active Volcano', 'Dallol Hydrothermal Springs', 'Lake Karum Salt Flats', 'Lake Assale'],
    primarySpokenLanguages: ['am', 'ti', 'en', 'fr'],
  },
  {
    id: 'omo_valley_south',
    name: 'Southern Omo Valley & Rift Valley',
    subName: 'Living Ancestral Traditions & Rift Valley Lakes',
    icon: '🌿',
    description: 'Rich living ethnographic cultures, pastoralist communities, painted body art, Lake Hawassa fish market, and Nechisar National Park.',
    bestMonths: 'June – September & Dec – March',
    defaultInterests: ['Cultural Festivals & Artisan Weaving Markets', 'Endemic Wildlife', 'Photography & Nature'],
    keyLandmarks: ['Omo Valley Cultural Villages', 'Lake Hawassa Waterfront & Fish Market', 'Nechisar National Park', 'Dorze Weaving Village in Chencha'],
    primarySpokenLanguages: ['am', 'om', 'en'],
  },
  {
    id: 'kaffa_jimma_coffee',
    name: 'Kaffa & Jimma Coffee Forests',
    subName: 'The True Birthplace of Arabica Coffee',
    icon: '☕',
    description: 'Ancient wild coffee cloud forests where Coffea Arabica was first discovered in the 9th century, royal palaces of Abba Jifar, and lush waterfalls.',
    bestMonths: 'October – March (Harvest season)',
    defaultInterests: ['Traditional Coffee Ceremonies & Origin Stories', 'Authentic Ethiopian Cuisine & Injera Tasting', 'Highland Trekking & Spectacular Panoramas'],
    keyLandmarks: ['Kaffa Biosphere Reserve', 'Bonga Wild Coffee Forest', 'Palace of King Abba Jifar in Jimma', 'Wushwush Tea & Coffee Plantations'],
    primarySpokenLanguages: ['om', 'am', 'en'],
  },
  {
    id: 'tigray_gheralta',
    name: 'Gheralta Mountains & Tigray',
    subName: 'Sky-High Rock Monasteries & Red Sandstone Spire Peaks',
    icon: '⛰️',
    description: 'Cliffs and red sandstone spires sheltering 4th-to-15th century churches carved high in rock faces, ancient Axumite stelae and biblical lore.',
    bestMonths: 'October – April',
    defaultInterests: ['UNESCO Rock-Hewn Monolithic Churches', 'Ancient History & Castles', 'Highland Trekking & Spectacular Panoramas'],
    keyLandmarks: ['Abuna Yemata Guh Cliff Church', 'Debre Damo Monastery', 'Axum Northern Stelae Park', 'Yeha Temple of the Moon'],
    primarySpokenLanguages: ['ti', 'am', 'en'],
  },
];

export const TRAVELER_INTERESTS: string[] = [
  'Ancient History & Castles',
  'UNESCO Rock-Hewn Monolithic Churches',
  'Traditional Coffee Ceremonies & Origin Stories',
  'Authentic Ethiopian Cuisine & Injera Tasting',
  'Endemic Wildlife (Gelada Baboon, Walia Ibex)',
  'Highland Trekking & Spectacular Panoramas',
  'Geothermal Wonders & Volcanic Expeditions',
  'Cultural Festivals & Artisan Weaving Markets',
  'Traditional Ethio-Jazz & Azmari Music Clubs',
  'Photography & Nature',
];

export const TRAVEL_PACES = [
  {
    id: 'relaxed',
    label: 'Relaxed & Immersive',
    description: 'Unhurried mornings, deep cultural discussions, traditional coffee ceremonies & leisurely meals.',
  },
  {
    id: 'balanced',
    label: 'Balanced & Moderate',
    description: 'Optimal harmony of major historical landmarks, scenic walks, cultural exploration & relaxation.',
  },
  {
    id: 'adventure',
    label: 'Adventure & Action-Packed',
    description: 'Early morning starts, extensive hiking/trekking, multi-site itineraries & immersive exploration.',
  },
];

// High-quality offline fallback itineraries for instant loading or zero-data mode
export const SAMPLE_ETHIOPIAN_ITINERARIES: Record<string, Itinerary3Day> = {
  northern_historic: {
    id: 'sample_northern_historic',
    region: 'Northern Historic Circuit',
    targetLanguage: 'Amharic',
    interests: ['Ancient History & Castles', 'UNESCO Rock-Hewn Monolithic Churches', 'Traditional Coffee Ceremonies & Origin Stories'],
    travelPace: 'Balanced & Moderate',
    title: 'The Sacred Monoliths & Imperial Castles of Abyssinia',
    titleNative: 'የአቢሲኒያ ጥንታዊ ቅርሶች እና የላሊበላ ድንቅ ጉዞ',
    summary: 'A breathtaking 3-day voyage across northern Ethiopia exploring the 12th-century monolithic rock-hewn churches of Lalibela, the 17th-century fairytale stone castles of Gondar, and royal coffee hospitality.',
    highlights: [
      'Ascend into the cruciform Church of St. George (Bete Giyorgis) carved out of red volcanic tuff in Lalibela',
      'Walk through the royal stone corridors of King Fasilides Castle inside Gondar’s Fasil Ghebbi',
      'Gaze upon the ceiling of 80 winged cherub angels at Debre Berhan Selassie Church',
      'Experience a full 3-course traditional Ethiopian Buna (Coffee) ceremony with smoking frankincense and toasted barley',
    ],
    days: [
      {
        dayNumber: 1,
        dayTitle: 'Lalibela: The Jerusalem of Africa & Monolithic Rock Churches',
        theme: 'Sacred Architecture & Monolithic Wonders',
        morning: {
          activity: 'Explore the Northern Group of Rock-Hewn Churches',
          landmarkName: 'Bete Medhane Alem & Bete Maryam',
          description: 'Begin at sunrise entering Bete Medhane Alem, the largest monolithic rock-hewn church in the world, connected through subterranean stone tunnels to Bete Maryam with its ancient bas-relief carvings.',
          culturalNote: 'Remove shoes at church entry; wear modest white or light-colored attire (Netela scarf provided by guides).',
          estimatedDuration: '3.5 hours',
        },
        afternoon: {
          activity: 'Pilgrimage to Bete Giyorgis (Church of Saint George) & Traditional Coffee',
          landmarkName: 'Bete Giyorgis (Saint George)',
          description: 'Descend the narrow trench to stand before the cruciform masterpiece of Bete Giyorgis, carved downwards 12 meters into solid bedrock.',
          culinaryOrCoffee: 'Enjoy freshly roasted Buna with freshly popped popcorn (Fendisha) at Ben Abeba panoramic cliff restaurant.',
          estimatedDuration: '3 hours',
        },
        evening: {
          activity: 'Evening Acoustic Azmari Traditional Music & Tej Tasting',
          landmarkName: 'Torpedoe Tej House Lalibela',
          description: 'Listen to improvised Masenqo (single-string lute) ballads and taste golden honey wine (Tej) alongside shiro and doro wat on injera.',
          culinaryOrCoffee: 'Authentic Tej (Fermented honey wine) with fasting Beyaynetu vegan platter.',
          estimatedDuration: '2.5 hours',
        },
        dailyPhrases: [
          { phrase: 'እንደምን አደሩ (Endemen Aderu)', phonetic: 'en-deh-MIN ah-deh-ROO', meaning: 'Good morning (respectful)', context: 'Greeting priests and elders at Lalibela churches' },
          { phrase: 'ይህ ቤተክርስቲያን መቼ ተሰራ? (Yih betekristiyan meche tesera?)', phonetic: 'yih beh-teh-kris-ti-yan MEH-cheh teh-SEH-rah?', meaning: 'When was this church built?', context: 'Asking local deacon guide about history' },
          { phrase: 'ቡናው በጣም ጣፋጭ ነው (Bunaw betam t\'afach new)', phonetic: 'BOO-now beh-TAM tah-FACH noh', meaning: 'The coffee is very delicious', context: 'Complimenting the coffee ceremony hostess' },
          { phrase: 'እግዚአብሔር ይስጥልኝ (Egziabher Yistillign)', phonetic: 'eg-zee-ah-b-HER yis-ti-LIGN', meaning: 'Thank you (May God give on your behalf)', context: 'Deep polite Ethiopian gratitude' },
        ],
        transportAndLogistics: 'Short 15-minute 4WD transfer between Lalibela town and the church clusters. Sturdy walking shoes with grip are essential for smooth rock paths.',
        culturalEtiquette: 'Always use your right hand when shaking hands or passing items. Do not photograph priests during prayer without asking permission politely.',
      },
      {
        dayNumber: 2,
        dayTitle: 'Gondar: The Camelot of Africa & Fasilides Enclosure',
        theme: 'Imperial Castles, Royal Palaces & Medieval Splendor',
        morning: {
          activity: 'Royal Castle Enclosure Tour (Fasil Ghebbi)',
          landmarkName: 'Fasil Ghebbi Royal Enclosure',
          description: 'Walk through 70,000 square meters of fairytale medieval stone castles built by Emperor Fasilides and Empress Mentewab, featuring Moorish, Portuguese, and Axumite architectural fusion.',
          culturalNote: 'Observe the stone lions cages and imperial banquet halls where centuries of Ethiopian monarchs held court.',
          estimatedDuration: '3 hours',
        },
        afternoon: {
          activity: 'Debre Berhan Selassie & The Bath of King Fasilides',
          landmarkName: 'Debre Berhan Selassie Church',
          description: 'Marvel at the ceiling painted with hundreds of famous Ethiopian cherub angels, followed by a visit to the tranquil sunken stone bath of King Fasilides.',
          culinaryOrCoffee: 'Taste Gondar-style Kitfo (seasoned minced beef with spiced butter Niter Kibbeh) or Shiro Tegabino at Four Sisters Restaurant.',
          estimatedDuration: '3.5 hours',
        },
        evening: {
          activity: 'Sunset overlooking Gondar City from Goha Mountain',
          landmarkName: 'Goha Viewpoint',
          description: 'Watch the golden sunset illuminate the stone towers of Gondar while sipping spiced Ethiopian ginger tea and taking panoramic photographs.',
          culinaryOrCoffee: 'Spiced Ethiopian tea (Shai) brewed with cloves, cinnamon, and cardamom.',
          estimatedDuration: '2 hours',
        },
        dailyPhrases: [
          { phrase: 'ስለ ታሪኩ ሊነግሩኝ ይችላሉ? (Sle tariku linegrugn yichilalu?)', phonetic: 'sleh tah-REE-koo lee-neg-ROO-gn yee-chee-LAH-loo?', meaning: 'Could you tell me about the history?', context: 'Asking the museum curator' },
          { phrase: 'እባክዎ ፎቶ ላንሳዎት? (Ibakwo foto lansawoyt?)', phonetic: 'ih-BAH-kwo FO-to lahn-SAH-woyt?', meaning: 'May I take a photo with respect?', context: 'Politely requesting photo permission' },
          { phrase: 'ምግቡ እጅግ ልዩ ነው (Migi-bu ejig liyu new)', phonetic: 'mig-BOO eh-JIG lee-YOO noh', meaning: 'The food is exceptionally special', context: 'Complimenting your dinner host' },
        ],
        transportAndLogistics: 'Scenic 3-hour road trip from Lalibela to Gondar across the high mountain passes of Amhara region with breathtaking plateau vistas.',
        culturalEtiquette: 'When eating injera from a shared communal mesob platter, eat exclusively from the section directly in front of you using your right hand.',
      },
      {
        dayNumber: 3,
        dayTitle: 'Lake Tana Monasteries & Blue Nile Whispers',
        theme: 'Island Hermitages, Ancient Ge\'ez Manuscripts & Waterfalls',
        morning: {
          activity: 'Private Wooden Boat Cruise on Lake Tana to Zege Peninsula',
          landmarkName: 'Ura Kidane Mehret Monastery',
          description: 'Cruise across Lake Tana, the source of the Blue Nile, to explore the 14th-century circular monastery hidden in dense coffee forest with 400-year-old biblical frescoes.',
          culturalNote: 'Learn how wild coffee bushes grow under the canopy of ancient trees protected by monastery monks.',
          estimatedDuration: '4 hours',
        },
        afternoon: {
          activity: 'Traditional Coffee Farm Visit & Local Artisan Craft Market',
          landmarkName: 'Zege Peninsula Coffee Groves',
          description: 'Experience a raw coffee bean roasting demonstration right under the coffee trees, followed by exploring handmade silver Coptic crosses and woven shawls.',
          culinaryOrCoffee: 'Fresh whole-bean Lake Tana coffee roasted on a charcoal brazier with aromatic frankincense.',
          estimatedDuration: '2.5 hours',
        },
        evening: {
          activity: 'Lakeside Tilapia Fish Dinner & Farewell Sunset',
          landmarkName: 'Bahir Dar Lakeshore Promenade',
          description: 'Enjoy freshly caught Lake Tana fried Tilapia with fresh lime and warm injera as white pelicans glide across the water at twilight.',
          culinaryOrCoffee: 'Lake Tana grilled fish with berbere dip and fresh papaya avocado juice (Spris).',
          estimatedDuration: '2.5 hours',
        },
        dailyPhrases: [
          { phrase: 'ዋጋው ስንት ነው? (Wagaw sint new?)', phonetic: 'wah-GAOW sint noh?', meaning: 'How much does this cost?', context: 'Browsing artisan souvenir markets' },
          { phrase: 'ስላደረጋችሁልን ሁሉ እናመሰግናለን (Siladeregachulin hulu enamesegenalen)', phonetic: 'sil-ah-deh-reh-GAH-choo-lin HOO-loo eh-nah-meh-seh-geh-NAH-len', meaning: 'Thank you all deeply for everything', context: 'Bidding farewell to boat captain and guides' },
          { phrase: 'ደህና ሁኑ (Dehna Hunu)', phonetic: 'deh-NAH HOO-noo', meaning: 'Goodbye / Stay in peace', context: 'Parting blessings' },
        ],
        transportAndLogistics: 'Speedboat charter on Lake Tana with life jackets provided. Hat and sunglasses recommended for morning sun reflection on water.',
        culturalEtiquette: 'Some island monasteries are exclusively for male monks; your guide will ensure visiting the historic mixed monasteries such as Ura Kidane Mehret.',
      },
    ],
    packingAndPreparation: [
      'Slip-on footwear or sandals for removing shoes smoothly at rock churches and monasteries',
      'Lightweight cotton Netela or white scarf for head and shoulder coverage inside sacred sites',
      'Flashlight / headlamp for exploring unlit subterranean rock passages in Lalibela',
      'Ethiopian Birr cash in smaller denominations for local church donations and coffee ceremony appreciation',
      'Sun hat, high-SPF sunscreen, and reusable water bottle for high-altitude sun protection (2,500m elevation)',
    ],
    suggestedSpokenGuideStarter: 'እንኳን ወደ ታሪካዊቷ ኢትዮጵያ በደህና መጡ! Welcome to the sacred cradle of Abyssinia! I am your ANE MADDOS Tourism Ambassador AI. Shall we begin our journey into Lalibela\'s rock-hewn wonders and Gondar\'s royal castles?',
    generatedAt: new Date().toISOString(),
  },
};
