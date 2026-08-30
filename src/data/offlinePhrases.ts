export interface OfflinePhraseCategory {
  id: string;
  categoryName: string;
  icon: string;
  phrases: Array<{
    id: string;
    originalText: string;
    englishTranslation: string;
    phonetic: string;
    context: string;
    audioTips: string;
    tourismOrCommunityUse: string;
  }>;
}

export const OFFLINE_PHRASEBOOK: Record<string, OfflinePhraseCategory[]> = {
  // Amharic (አማርኛ)
  am: [
    {
      id: 'greetings',
      categoryName: 'Hospitality, Greetings & Tourism Ambassador',
      icon: 'HeartHandshake',
      phrases: [
        {
          id: 'am_1',
          originalText: 'እንኳን ደህና መጡ! ወደ ውቧ ኢትዮጵያ በሰላም ገቡ።',
          englishTranslation: 'Welcome! Peacefully entered into beautiful Ethiopia.',
          phonetic: 'Enkwan dehna metu! Wede wubwa Ityop’ya beselam gebu.',
          context: 'Welcoming guests, tourists, or community elders warmly.',
          audioTips: 'Deliver with a warm, welcoming tone and hands folded in greeting.',
          tourismOrCommunityUse: 'Official tourism ambassador welcome for visitors to historic sites.',
        },
        {
          id: 'am_2',
          originalText: 'ቡና ቁርስ ይሁን፤ ቡና ይጠጡ!',
          englishTranslation: 'Let there be coffee breakfast; please drink coffee!',
          phonetic: 'Buna qurs yihun; buna yit’et’u!',
          context: 'Inviting anyone into your home for the traditional coffee ceremony.',
          audioTips: 'Pronounce the "q" with gentle ejective pop.',
          tourismOrCommunityUse: 'Sacred Ethiopian hospitality invitation connecting guests with local families.',
        },
        {
          id: 'am_3',
          originalText: 'በጣም አመሰግናለሁ፣ እግዚአብሔር ይስጥልኝ!',
          englishTranslation: 'Thank you very much, may God give (bless) on my behalf!',
          phonetic: 'Betam ameseginalew, Egziabher yist’ilign!',
          context: 'Deep heartfelt gratitude after receiving assistance or hospitality.',
          audioTips: 'Emphasize "Betam" (very much).',
          tourismOrCommunityUse: 'The universally loved Ethiopian thank-you phrase.',
        },
        {
          id: 'am_4',
          originalText: 'ወደ ላሊበላ ውቅር አብያተ ክርስቲያናት እንዴት መሄድ እችላለሁ?',
          englishTranslation: 'How can I travel to the Lalibela rock-hewn churches?',
          phonetic: 'Wede Lalibela wiq’ir abyate kristiyanat endet mehed ichilalew?',
          context: 'Inquiring about UNESCO World Heritage travel route.',
          audioTips: 'Pace evenly across the multi-syllable words.',
          tourismOrCommunityUse: 'Essential for travelers exploring the historic northern circuit.',
        },
      ],
    },
    {
      id: 'education_health',
      categoryName: 'Community Classroom & Health Support',
      icon: 'GraduationCap',
      phrases: [
        {
          id: 'am_5',
          originalText: 'ትምህርት ለህይወት ብርሃን እና የህብረተሰብ ጥንካሬ ነው።',
          englishTranslation: 'Education is light for life and strength for community.',
          phonetic: 'Timhirt lehìywet birhan inna yehìbreteseb t’ink’are new.',
          context: 'Encouraging youth and adult students in community learning centers.',
          audioTips: 'Smooth delivery on "birhan" (light).',
          tourismOrCommunityUse: 'Empowerment motto for students and volunteer educators.',
        },
        {
          id: 'am_6',
          originalText: 'እባክዎ ንጹህ የመጠጥ ውሃ እና የተመጣጠነ ምግብ ያዘጋጁ።',
          englishTranslation: 'Please prepare clean drinking water and nutritious food.',
          phonetic: 'Ibakwo nits’uh yemet’et’ wiha inna yetemetat’ene migib yazegaju.',
          context: 'Community health advisor guidance for mothers and families.',
          audioTips: 'Clear articulation on "nits’uh" (clean).',
          tourismOrCommunityUse: 'Rural health worker and community wellness training.',
        },
      ],
    },
  ],

  // Afaan Oromoo
  om: [
    {
      id: 'greetings_culture',
      categoryName: 'Afaan Oromoo Hospitality & Tourism',
      icon: 'Smile',
      phrases: [
        {
          id: 'om_1',
          originalText: 'Baga nagaan dhuftan! Biyya Oromoo fi Itoophiyaatti simatamtan.',
          englishTranslation: 'Welcome peacefully! You are received with warmth in Oromia & Ethiopia.',
          phonetic: 'Baga nagaan dhuftan! Biyya Oromoo fi Itoophiyaatti simatamtan.',
          context: 'Greeting guests and eco-tourists arriving at scenic national parks.',
          audioTips: 'Pronounce double vowels (aa, oo) longer with steady pitch.',
          tourismOrCommunityUse: 'Tourism ambassador welcome at Bale Mountains, Sof Omar Caves & Wenchi.',
        },
        {
          id: 'om_2',
          originalText: 'Irreechi nagaa, jaalalaa fi tokkummaa uummataa ti.',
          englishTranslation: 'Irreecha is peace, love, and unity of the people.',
          phonetic: 'Irreechi nagaa, jaalalaa fi tokkummaa uummataa ti.',
          context: 'Explaining the UNESCO-recognized Thanksgiving and blessing festival.',
          audioTips: 'Stress "nagaa" (peace) and "jaalalaa" (love).',
          tourismOrCommunityUse: 'Cultural explanation for travelers witnessing the sacred festival.',
        },
        {
          id: 'om_3',
          originalText: 'Gadaa sirna dimokiraasii fi wal-qixxummaa addunyaa ti.',
          englishTranslation: 'Gadaa is a world system of democracy and human equality.',
          phonetic: 'Gadaa sirna dimokiraasii fi wal-qixxummaa addunyaa ti.',
          context: 'Teaching the indigenous democratic social system inscribed by UNESCO.',
          audioTips: 'Crisp "dd" sound on addunyaa.',
          tourismOrCommunityUse: 'Civic education and cultural ambassadorship.',
        },
        {
          id: 'om_4',
          originalText: 'Galatoomaa, Waaqayyo isin haa eebbisu!',
          englishTranslation: 'Thank you, may the Creator bless you!',
          phonetic: 'Galatoomaa, Waaqayyo isin haa eebbisu!',
          context: 'Expressing gratitude with sincere blessing.',
          audioTips: 'Gentle cadence on "eebbisu".',
          tourismOrCommunityUse: 'Everyday respectful gratitude in markets and gatherings.',
        },
      ],
    },
    {
      id: 'education_farming',
      categoryName: 'Community Education & Organic Farming',
      icon: 'Leaf',
      phrases: [
        {
          id: 'om_5',
          originalText: 'Barnoonni ifa jireenyaa fi furtuu guddinaati.',
          englishTranslation: 'Education is the light of life and the key to progress.',
          phonetic: 'Barnoonni ifa jireenyaa fi furtuu guddinaati.',
          context: 'Motto for schools, rural students, and teachers.',
          audioTips: 'Clear rolling "r" on Barnoonni.',
          tourismOrCommunityUse: 'Classroom empowerment for children and educators.',
        },
      ],
    },
  ],

  // Tigrinya (ትግርኛ)
  ti: [
    {
      id: 'culture_tourism',
      categoryName: 'Tigrinya Heritage & Tourism Ambassador',
      icon: 'Compass',
      phrases: [
        {
          id: 'ti_1',
          originalText: 'ጽቡቕ ምጽኣት! ናብዚ ታሪኻዊ ሃገር ብሰላም መጻእኩም።',
          englishTranslation: 'Welcome! You have arrived peacefully to this historic land.',
          phonetic: 'Tsubuq’ mits’at! Nabzi tarikawi hager bselam metsa’kum.',
          context: 'Welcoming visitors to Gheralta monasteries, Yeha, or Axum.',
          audioTips: 'Ejective "ts’" sound pronounced with gentle breath control.',
          tourismOrCommunityUse: 'Hospitality greeting for travelers exploring highland heritage.',
        },
        {
          id: 'ti_2',
          originalText: 'ኣብ ገዳማት ገራልታ እተሰርሑ ናይ ቋጥዒ ኣብያተ ክርስቲያናት መስተንክር እዮም።',
          englishTranslation: 'The rock-cut churches built in Gheralta mountains are a wonder.',
          phonetic: 'Ab gedamat Gheralta eteserhu nay q’wat’i abyate kristiyanat mestenkir iyom.',
          context: 'Guiding hikers climbing to cliffside ancient sanctuaries.',
          audioTips: 'Steady rhythmic cadence.',
          tourismOrCommunityUse: 'Mountain eco-tourism guide briefing.',
        },
        {
          id: 'ti_3',
          originalText: 'የቐንየለይ፣ ጽቡቕ መዓልቲ ይግበረልኩም!',
          englishTranslation: 'Thank you very much, have a wonderful day!',
          phonetic: 'Yeq’enyeley, tsubuq’ me’alti yigberelk’um!',
          context: 'Expressing gratitude to locals and teachers.',
          audioTips: 'Warm closing tone.',
          tourismOrCommunityUse: 'Standard polite appreciation everywhere.',
        },
      ],
    },
  ],

  // Swahili (Kiswahili)
  sw: [
    {
      id: 'safari_tourism',
      categoryName: 'Safari Wildlife & East African Tourism',
      icon: 'Sparkles',
      phrases: [
        {
          id: 'sw_1',
          originalText: 'Karibu sana Afrika Mashariki, ardhi ya ukarimu na wanyamapori!',
          englishTranslation: 'Warm welcome to East Africa, land of hospitality and wildlife!',
          phonetic: 'Kah-ree-boo sah-nah Ah-free-kah Mah-shah-ree-kee, ahr-dhee yah oo-kah-ree-moo.',
          context: 'Tour guide greeting visitors at airports or national park gates.',
          audioTips: 'Roll the "r" gently; stress the second to last syllable.',
          tourismOrCommunityUse: 'Premier tourism ambassador welcome across Kenya, Tanzania, Uganda, Rwanda.',
        },
        {
          id: 'sw_2',
          originalText: 'Tafadhali linda mazingira na wanyamapori kwa vizazi vijavyo.',
          englishTranslation: 'Please protect the environment and wildlife for future generations.',
          phonetic: 'Tah-fah-dhah-lee leen-dah mah-zeen-gee-rah nah wah-nyah-mah-poh-ree.',
          context: 'Eco-conservation message in national parks and schools.',
          audioTips: 'Smooth "dh" sound like the English "th" in "this".',
          tourismOrCommunityUse: 'Eco-tourism and conservation education.',
        },
        {
          id: 'sw_3',
          originalText: 'Asante sana kwa moyo wako wa ukarimu!',
          englishTranslation: 'Thank you very much for your generous heart!',
          phonetic: 'Ah-sahn-teh sah-nah kwah moh-yoh wah-koh wah oo-kah-ree-moo!',
          context: 'Thanking community hosts, elders, and service staff.',
          audioTips: 'Bright, cheerful intonation.',
          tourismOrCommunityUse: 'Universal polite phrase across East Africa.',
        },
      ],
    },
    {
      id: 'community_education',
      categoryName: 'Elimu & Community Empowerment',
      icon: 'BookOpen',
      phrases: [
        {
          id: 'sw_4',
          originalText: 'Elimu ni ufunguo wa maisha na ukombozi wa jamii.',
          englishTranslation: 'Education is the key to life and liberation of community.',
          phonetic: 'Eh-lee-moo nee oo-foon-gwoh wah mah-ee-shah.',
          context: 'Classroom motto inspiring young scholars.',
          audioTips: 'Clear vowels (E-li-mu).',
          tourismOrCommunityUse: 'School mentorship and literacy programs.',
        },
      ],
    },
  ],

  // Yoruba (West Africa)
  yo: [
    {
      id: 'yoruba_heritage',
      categoryName: 'Yoruba Culture & Community Arts',
      icon: 'Heart',
      phrases: [
        {
          id: 'yo_1',
          originalText: 'Ẹ kú àbọ̀ sí ilẹ̀ Yorùbá, ilẹ̀ àṣà àti ọrọ̀!',
          englishTranslation: 'Welcome to the land of Yoruba, land of rich tradition and culture!',
          phonetic: 'Eh koo ah-boh see ee-leh Yoh-roo-bah.',
          context: 'Greeting honored visitors and dignitaries.',
          audioTips: 'Tonal language: do (low), re (mid), mi (high) pitch accents.',
          tourismOrCommunityUse: 'Cultural ambassador introduction in arts & festivals.',
        },
        {
          id: 'yo_2',
          originalText: 'Ẹṣe pupọ, Ọlọ́run yóò bùkún fún yín!',
          englishTranslation: 'Thank you very much, God will bless you!',
          phonetic: 'Eh-sheh poo-poh, Oh-lor-oon yoh boo-koon foon yeen!',
          context: 'Expressing deep communal gratitude.',
          audioTips: 'Soft "sh" on Ẹṣe.',
          tourismOrCommunityUse: 'Everyday warm exchange across Nigeria and West Africa.',
        },
      ],
    },
  ],

  // Spanish (Español)
  es: [
    {
      id: 'spanish_tourism',
      categoryName: 'World Tourism & Cultural Ambassador',
      icon: 'Compass',
      phrases: [
        {
          id: 'es_1',
          originalText: '¡Bienvenidos a nuestra tierra de historia, arte y hospitalidad!',
          englishTranslation: 'Welcome to our land of history, art, and hospitality!',
          phonetic: 'Bee-en-veh-NEE-dohs ah NWEHS-trah tee-EHR-rah.',
          context: 'Welcoming tourists to historic landmarks, museums, and natural parks.',
          audioTips: 'Roll the double "rr" in "tierra".',
          tourismOrCommunityUse: 'Tourism ambassador speech at cultural centers.',
        },
        {
          id: 'es_2',
          originalText: 'La educación es el puente hacia la igualdad y el progreso comunitario.',
          englishTranslation: 'Education is the bridge toward equality and community progress.',
          phonetic: 'Lah eh-doo-kah-see-OHN ehs ehl PWEHN-teh.',
          context: 'Community workshop or teacher-student encouragement.',
          audioTips: 'Stress "educación" on the final syllable.',
          tourismOrCommunityUse: 'Educational advocacy in low-income schools and public libraries.',
        },
      ],
    },
  ],

  // French (Français)
  fr: [
    {
      id: 'french_diplomacy',
      categoryName: 'Francophone Culture, Tourism & Education',
      icon: 'Globe',
      phrases: [
        {
          id: 'fr_1',
          originalText: 'Bienvenue chaleureuse à tous nos visiteurs et amis du monde entier !',
          englishTranslation: 'A warm welcome to all our visitors and friends from around the world!',
          phonetic: 'Byen-veh-NOO shah-luh-ruhz ah too noh vee-zee-TUHR.',
          context: 'Diplomatic welcome and tourism greeting.',
          audioTips: 'Nasal vowels (en, on) pronounced smoothly.',
          tourismOrCommunityUse: 'Cultural festivals, tourism hubs across France and Francophone Africa.',
        },
        {
          id: 'fr_2',
          originalText: 'Le savoir et la solidarité sont les piliers de notre avenir commun.',
          englishTranslation: 'Knowledge and solidarity are the pillars of our shared future.',
          phonetic: 'Luh sah-vwahr ay lah soh-lee-dah-ree-tay.',
          context: 'Community youth empowerment and educational speeches.',
          audioTips: 'Soft uvular "r".',
          tourismOrCommunityUse: 'Community leadership and international exchange.',
        },
      ],
    },
  ],

  // English (Global)
  en: [
    {
      id: 'global_ambassador',
      categoryName: 'Global Tourism Ambassador & Student Mentor',
      icon: 'Globe',
      phrases: [
        {
          id: 'en_1',
          originalText: 'Welcome! We are delighted to share our living culture, history, and natural wonders with you.',
          englishTranslation: 'Welcome! We are delighted to share our living culture, history, and natural wonders with you.',
          phonetic: 'WEL-kuhm! Wee ahr dih-LY-ted too shair ow-er LIH-ving KUL-chur.',
          context: 'Tourism ambassador greeting guests worldwide.',
          audioTips: 'Speak with open chest, warm smile, and clear resonance.',
          tourismOrCommunityUse: 'Universal welcoming phrase for tourist centers and international events.',
        },
        {
          id: 'en_2',
          originalText: 'Every child deserves access to quality learning tools, regardless of economic background.',
          englishTranslation: 'Every child deserves access to quality learning tools, regardless of economic background.',
          phonetic: 'EV-ree chyld dih-ZERVZ AK-ses too KWAHL-ih-tee LER-ning toolz.',
          context: 'Advocacy for free community educational technology.',
          audioTips: 'Emphasize "quality" and "access".',
          tourismOrCommunityUse: 'Advocating for educational equality in rural and urban societies.',
        },
      ],
    },
  ],
};
