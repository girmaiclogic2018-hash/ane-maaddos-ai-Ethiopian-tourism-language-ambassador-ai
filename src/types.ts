export type LanguageCode =
  // Ethiopian & Horn of Africa Languages
  | 'am' // Amharic
  | 'om' // Afaan Oromoo (Oromo)
  | 'ti' // Tigrinya
  | 'so' // Somali
  | 'aa' // Afar
  | 'wal' // Wolaytta
  | 'sid' // Sidama
  | 'gez' // Ge'ez (Classical Ethiopian)
  | 'har' // Harari
  // African Major & Regional Languages
  | 'sw' // Swahili (Kiswahili)
  | 'ha' // Hausa
  | 'yo' // Yoruba
  | 'ig' // Igbo
  | 'zu' // Zulu (isiZulu)
  | 'xh' // Xhosa (isiXhosa)
  | 'rw' // Kinyarwanda
  | 'wo' // Wolof
  | 'sn' // Shona
  | 'st' // Sesotho
  | 'ln' // Lingala
  | 'ny' // Chichewa
  | 'mg' // Malagasy
  | 'ff' // Fulani / Fula
  | 'ak' // Twi / Akan
  | 'ber' // Tamazight / Berber
  | 'af' // Afrikaans
  // Global & World Languages
  | 'es' // Spanish
  | 'fr' // French
  | 'de' // German
  | 'it' // Italian
  | 'ja' // Japanese
  | 'zh' // Mandarin Chinese
  | 'ko' // Korean
  | 'pt' // Portuguese
  | 'ru' // Russian
  | 'ar' // Arabic
  | 'en' // English
  | 'hi' // Hindi
  | 'bn' // Bengali
  | 'tr' // Turkish
  | 'vi' // Vietnamese
  | 'th' // Thai
  | 'id' // Indonesian
  | 'pl' // Polish
  | 'nl' // Dutch
  | 'el' // Greek
  | 'fa' // Persian (Farsi)
  | 'ur' // Urdu
  | 'he' // Hebrew
  | 'uk' // Ukrainian
  | 'sv' // Swedish
  | 'ro' // Romanian
  | 'tl' // Tagalog (Filipino);

export type LanguageRegion = 'ethiopian' | 'african' | 'global';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  region: LanguageRegion;
  countryOrOrigin: string;
  flag: string;
  defaultVoice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  greeting: string;
  suggestedTopics: string[];
  tourismHighlights?: string[];
  educationalNotes?: string;
  offlineSupportLevel: 'full' | 'standard';
}

export type ProficiencyLevel = 'A1_BEGINNER' | 'A2_ELEMENTARY' | 'B1_INTERMEDIATE' | 'B2_UPPER_INTERMEDIATE' | 'C1_ADVANCED';

export interface LevelInfo {
  id: ProficiencyLevel;
  label: string;
  description: string;
  speedGuide: string;
}

export interface Scenario {
  id: string;
  title: string;
  iconName: string;
  category: 'daily' | 'travel' | 'work' | 'social' | 'cultural' | 'tourism' | 'education' | 'community' | 'custom';
  level: ProficiencyLevel;
  description: string;
  partnerRole: string;
  userRole: string;
  starterPrompt: string;
  objectives: string[];
  suggestedPhrases: string[];
  culturalEtiquetteTip?: string;
  offlineGuide?: string;
}

export interface MessageTurn {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  translation?: string;
  timestamp: number;
  audioBlobUrl?: string;
  feedback?: TurnFeedback;
  isStreaming?: boolean;
}

export interface TurnCorrection {
  original: string;
  corrected: string;
  explanation: string;
  category: 'grammar' | 'vocabulary' | 'pronunciation' | 'naturalness';
}

export interface VocabularyItem {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  translation: string;
  exampleSentence: string;
  exampleTranslation: string;
  language: string;
  masteryLevel?: number; // 0 to 5
  savedAt: number;
  notes?: string;
}

export interface TurnFeedback {
  praise?: string;
  fluencyScore?: number; // 0-100
  corrections: TurnCorrection[];
  betterAlternatives: string[];
  vocabularyUsed: Array<{
    word: string;
    translation: string;
    level: string;
  }>;
  suggestedReplies?: string[];
}

export interface TouristDestination {
  id: string;
  name: string;
  localName?: string;
  region: 'ethiopian' | 'african' | 'global';
  destinationType: 'ancient_heritage' | 'modern_megaproject' | 'eco_park_recreation' | 'national_park_wildlife' | 'museum_cultural_center' | 'geological_wonder';
  country: string;
  languageCodes: string[]; // which languages this landmark is strongly associated with e.g. ['am', 'en']
  category: 'historical' | 'unesco' | 'natural_wonder' | 'cultural' | 'religious' | 'wildlife' | 'modern_landmark' | 'recreation_park';
  unescoHeritage: boolean;
  coordinates: { lat: number; lng: number };
  elevation?: string;
  locationDescription: string;
  shortSummary: string;
  historyAndSignificance: string;
  bestTimeToVisit: string;
  // Authentic Photography & Media
  images: string[];
  coverImage: string;
  videoWalkthroughUrl?: string;
  videoTitle?: string;
  virtual360Url?: string;
  // Official Ethiopian Tourism Ministry & Standard Data
  officialMinistryInfo: {
    governingBody: string;
    entryFeeLocal: string;
    entryFeeForeigner: string;
    openingHours: string;
    contactPhone?: string;
    officialWebsiteOrDesk?: string;
    certifiedGuideAvailable: boolean;
  };
  // Real Directions & Transit
  placeDirections: {
    byAir?: string;
    byRoad: string;
    distanceFromAddis: string;
    recommendedVehicle: string;
    googleMapsSearchQuery: string;
  };
  // FAQs visitors ask & want to know
  visitorFaqs: Array<{
    question: string;
    answer: string;
    category: 'planning' | 'culture' | 'photography' | 'logistics' | 'pricing' | 'safety' | 'wildlife' | 'permits' | 'general';
  }>;
  culturalEtiquette: string[];
  mustSeeAttractions: string[];
  localCuisineAndCoffee: string[];
  essentialLocalPhrases: Array<{
    phrase: string;
    phonetic: string;
    meaning: string;
  }>;
  practicalTravelTips: string[];
  rulesAndRegulations: string[];
  tags: string[];
  imagePrompt?: string;
}

export interface PartnerSettings {
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  speakingSpeed: 'slow' | 'normal' | 'natural';
  correctionStrictness: 'gentle' | 'balanced' | 'rigorous';
  autoTranslate: boolean;
  pushToTalk: boolean;
  nativeLanguage: string;
  partnerPersona: string;
  // Practice Reminder Scheduling
  reminderEnabled?: boolean;
  reminderTime?: string; // 'HH:mm' e.g. '09:00', '18:30'
  reminderFrequency?: 'daily' | 'weekdays' | 'weekends' | 'custom';
  reminderDays?: number[]; // [0,1,2,3,4,5,6] (0 = Sunday, 1 = Monday, ...)
  reminderSound?: boolean;
  reminderMotivationalMsg?: string;
}

export interface UserStats {
  totalSpeakingTimeSeconds: number;
  sessionsCompleted: number;
  wordsSpoken: number;
  correctionsLearned: number;
  streakDays: number;
  lastActiveDate: string;
}

export interface ItineraryDayActivity {
  activity: string;
  landmarkName?: string;
  description: string;
  culturalNote?: string;
  culinaryOrCoffee?: string;
  estimatedDuration?: string;
}

export interface ItineraryDailyPhrase {
  phrase: string;
  phonetic: string;
  meaning: string;
  context: string;
}

export interface ItineraryDay {
  dayNumber: number;
  dayTitle: string;
  theme: string;
  morning: ItineraryDayActivity;
  afternoon: ItineraryDayActivity;
  evening: ItineraryDayActivity;
  dailyPhrases: ItineraryDailyPhrase[];
  transportAndLogistics: string;
  culturalEtiquette: string;
}

export interface Itinerary3Day {
  id: string;
  region: string;
  targetLanguage: string;
  interests: string[];
  travelPace: string;
  title: string;
  titleNative?: string;
  summary: string;
  highlights: string[];
  days: ItineraryDay[];
  packingAndPreparation: string[];
  suggestedSpokenGuideStarter: string;
  generatedAt: string;
}
