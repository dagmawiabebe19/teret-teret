import type { Lang } from "@/types";

export const FREE_STORY_LIMIT = 3;

export const UI: Record<
  Lang,
  {
    appTitle: string;
    subtitle: string;
    badge: string;
    savedBtn: string;
    guestNotice: string;
    nameLabel: string;
    namePlaceholder: string;
    ageLabel: string;
    traitLabel: string;
    regionLabel: string;
    inspirationLabel: string;
    inspirationOpts: string[];
    generateBtn: string;
    freeLeft: (n: number) => string;
    loading: string[];
    exitBtn: string;
    continueHint: string;
    finishHint: string;
    endTitle: string;
    endSub: string;
    anotherBtn: string;
    homeBtn: string;
    copyBtn: string;
    copiedBtn: string;
    saveBtn: string;
    savedConfirm: string;
    ageOpts: string[];
    traits: string[];
    illustrationLabel: string;
    noSavedStories: string;
    signInToSync: string;
    limitReached: string;
    paywallTitle: string;
    paywallSub: string;
    paywallSubSoon: string;
    paywallPriceSub: string;
    paywallPriceUnit: string;
    paywallSubscribeBtn: string;
    paywallLaterBtn: string;
  }
> = {
  am: {
    appTitle: "ተረት ተረት",
    subtitle: "አስማታዊ የኢትዮጵያ የጸሎተ ሌሊት ታሪኮች ✨",
    badge: "G · ለሁሉም ዕድሜ · ለልጆች ደህና",
    savedBtn: "📚 የተቀመጡ ታሪኮቼ",
    guestNotice: "በጥንቃቄ ለተቀመጡ ታሪኮች በዚህ መሣሪያ ላይ ይቆያሉ። ከመግቢያ በኋላ እንደገና ያስቀምጡ ብቻ በመሣሪያዎች መካከል ያዋህዱ።",
    nameLabel: "⭐ የልጅዎ ስም",
    namePlaceholder: "ለምሳሌ: ሰላም, ዳዊት, ምህረት, ሊያ...",
    ageLabel: "🎂 የዕድሜ ቡድን",
    traitLabel: "💫 ባህሪያቸው...",
    regionLabel: "🏔️ ታሪኩ የት ይካሄድ?",
    inspirationLabel: "✨ የታሪክ መነሻ",
    inspirationOpts: ["የኢትዮጵያ ተረት", "የመጽሐፍ ቅዱስ ርዕዮት", "የእንስሳት ወሬ", "የወዳጅነት ታሪክ"],
    generateBtn: "🌙 ታሪክ ንገሩኝ!",
    freeLeft: (n) => `${n} ነፃ ታሪክ ቀሩ`,
    loading: [
      "ጥንታዊ ተረተኛውን እየጠሩ...",
      "ከደጋ ታሪኮችን እየሰበሰቡ...",
      "ወዳጅ አንበሳ እያዳመጠ...",
      "ለታሪኩ ጃቤና እያፈሉ...",
      "የኢትዮጵያ ኮከቦች እየሰለፉ...",
      "ልጅዎን ወደ ታሪኩ እየጠቀሙ...",
      "ሽማግሌዎቹ ጥበብ እያካፈሉ...",
      "ዝግጅቱ ተጠናቀቀ — እሳቱ ተቀጣጠለ...",
      "በዩካሊፕቱስ ዛፍ ውስጥ ነፋስ...",
      "ጄላዳ ዝንጀሮዎቹ እየዘፈኑ...",
    ],
    exitBtn: "✕ ውጣ",
    continueHint: "ለቀጣዩ ጫን",
    finishHint: "ለመጨረሻ ጫን",
    endTitle: "ጣፋጭ ህልም",
    endSub: "ታሪኩ ሄደ ዘንቢሉ መጣ",
    anotherBtn: "✨ ሌላ ታሪክ!",
    homeBtn: "← ዋና ገጽ",
    copyBtn: "📋 ቅዳ",
    copiedBtn: "✅ ተቀድቷል",
    saveBtn: "💾 ቀምጥ",
    savedConfirm: "⭐ ተቀምጧል!",
    ageOpts: ["2–4 ዓ", "5–7 ዓ", "8–12 ዓ"],
    traits: [
      "በጣም ደፋር ነው",
      "እንስሳትን ይወዳል",
      "ለሁሉ ነገር ጉጉ ነው",
      "ለሁሉም ደግ ነው",
      "መደነስ ይወዳል",
      "በጣም አስቂኝ ነው",
      "ከአያቱ ጋር እንጀራ ማዘጋጀት ይወዳል",
      "ብዙ ጥያቄዎችን ይጠይቃሉ",
      "አብራሪ መሆን ይፈልጋሉ",
      "እግር ኳስ ይወዳሉ",
      "አያቱን ከኢትዮጵያ ናፍቃቸዋል",
      "መሳል እና ቀለም መቀባት ይወዳል",
      "በክፍሉ ፈጣኑ ሯጭ ነው",
      "መዘፈን ይወዳል",
      "አስቸጋሪ ነው ግን እጅግ ብልህ ነው",
      "ጀብደኝነትን ይወዳል",
    ],
    illustrationLabel: "ምስል",
    noSavedStories: "ገና ምንም ታሪክ አልቀመጥክም።",
    signInToSync: "መግቢያ ተያይዘው ታሪኮችን ያስቀምጡ።",
    limitReached: "የዚህ ወር ነፃ ታሪኮች አልቀሩም።",
    paywallTitle: "3 ነፃ ታሪኮችዎን ተጠቀሙ",
    paywallSub: "ያልተወሰነ አስማታዊ ታሪኮች ያግኙ። የልጆችዎን ህልም ያብሩ።",
    paywallSubSoon: "በቅርብ ጊዜ ይመጣል።",
    paywallPriceSub: "ያልተወሰነ · ሁሉም ዕድሜ · ማቋረጥ ይቻላል",
    paywallPriceUnit: "ወር",
    paywallSubscribeBtn: "አሁን ይመዝገቡ",
    paywallLaterBtn: "ለቆይ",
  },
  en: {
    appTitle: "Teret Teret",
    subtitle: "Magical Ethiopian Bedtime Stories ✨",
    badge: "G · ALL AGES · CHILD SAFE",
    savedBtn: "📚 My Saved Stories",
    guestNotice: "Stories you save as a guest stay on this device. Sign in and save again to sync across devices.",
    nameLabel: "⭐ Child's name",
    namePlaceholder: "e.g. Selam, Dawit, Mekdes, Liya...",
    ageLabel: "🎂 Age group",
    traitLabel: "💫 They are...",
    regionLabel: "🏔️ Where should the story happen?",
    inspirationLabel: "✨ Story Inspiration",
    inspirationOpts: ["Ethiopian Folklore", "Bible Moral Story", "Animal Adventure", "Friendship Story"],
    generateBtn: "🌙 Tell Me a Story!",
    freeLeft: (n) => `${n} free ${n === 1 ? "story" : "stories"} left`,
    loading: [
      "Calling the ancient storyteller...",
      "Gathering tales from the highlands...",
      "The friendly lion is listening...",
      "Brewing jebena for the story circle...",
      "The stars over Ethiopia are aligning...",
      "Weaving your child into the story...",
      "The wise elder is sharing wisdom...",
      "Almost ready — the fire is lit...",
      "Listening to the wind in the eucalyptus...",
      "The gelada baboons are singing...",
    ],
    exitBtn: "✕ Exit",
    continueHint: "tap to continue",
    finishHint: "tap to finish",
    endTitle: "Sweet Dreams",
    endSub: "The story went, the basket came",
    anotherBtn: "✨ Tell Another Story!",
    homeBtn: "← Home",
    copyBtn: "📋 Copy",
    copiedBtn: "✅ Copied",
    saveBtn: "💾 Save",
    savedConfirm: "⭐ Saved!",
    ageOpts: ["2–4 yrs", "5–7 yrs", "8–12 yrs"],
    traits: [
      "is very brave",
      "loves animals",
      "is curious about everything",
      "is kind to everyone",
      "loves to dance",
      "is very funny",
      "loves to cook injera with grandma",
      "asks too many questions",
      "wants to be a pilot",
      "loves football",
      "misses grandma in Ethiopia",
      "loves to draw and paint",
      "is the fastest runner in class",
      "loves singing",
      "is very shy but very smart",
      "loves adventure",
    ],
    illustrationLabel: "Illustration",
    noSavedStories: "No saved stories yet.",
    signInToSync: "Sign in to sync stories across devices.",
    limitReached: "You've reached this month's free story limit.",
    paywallTitle: "You've used your free stories",
    paywallSub: "Unlock unlimited magical stories for your little ones. Give them endless bedtime adventures.",
    paywallSubSoon: "Coming soon.",
    paywallPriceSub: "Unlimited · All ages · Cancel anytime",
    paywallPriceUnit: "month",
    paywallSubscribeBtn: "Subscribe Now",
    paywallLaterBtn: "Maybe later",
  },
  es: {
    appTitle: "Teret Teret",
    subtitle: "Cuentos mágicos etíopes para dormir ✨",
    badge: "G · TODAS EDADES · SEGURO",
    savedBtn: "📚 Mis cuentos guardados",
    guestNotice: "Los cuentos que guardas como invitado se quedan en este dispositivo. Inicia sesión y guarda de nuevo para sincronizar.",
    nameLabel: "⭐ Nombre del niño/a",
    namePlaceholder: "ej. Selam, Dawit, Mekdes, Liya...",
    ageLabel: "🎂 Grupo de edad",
    traitLabel: "💫 Él/ella es...",
    regionLabel: "🏔️ ¿Dónde ocurre el cuento?",
    inspirationLabel: "✨ Inspiración del cuento",
    inspirationOpts: ["Folclore etíope", "Historia moral bíblica", "Aventura de animales", "Historia de amistad"],
    generateBtn: "🌙 ¡Cuéntame un cuento!",
    freeLeft: (n) =>
      `${n} cuento${n === 1 ? "" : "s"} gratis restante${n === 1 ? "" : "s"}`,
    loading: [
      "Llamando al cuentista ancestral...",
      "Reuniendo historias de las montañas...",
      "El amigable león está escuchando...",
      "Preparando jebena para el círculo...",
      "Las estrellas de Etiopía se alinean...",
      "Tejiendo a tu hijo/a en el cuento...",
      "El anciano sabio comparte su sabiduría...",
      "Casi listo — el fuego está encendido...",
      "Escuchando el viento en los eucaliptos...",
      "Los gelada están cantando...",
    ],
    exitBtn: "✕ Salir",
    continueHint: "toca para continuar",
    finishHint: "toca para terminar",
    endTitle: "Dulces Sueños",
    endSub: "El cuento se fue, la cesta llegó",
    anotherBtn: "✨ ¡Otro cuento!",
    homeBtn: "← Inicio",
    copyBtn: "📋 Copiar",
    copiedBtn: "✅ Copiado",
    saveBtn: "💾 Guardar",
    savedConfirm: "⭐ ¡Guardado!",
    ageOpts: ["2–4 años", "5–7 años", "8–12 años"],
    traits: [
      "es muy valiente",
      "ama a los animales",
      "es curioso/a sobre todo",
      "es amable con todos",
      "ama bailar",
      "es muy gracioso/a",
      "cocina injera con su abuela",
      "hace demasiadas preguntas",
      "quiere ser piloto",
      "ama el fútbol",
      "extraña a su abuela en Etiopía",
      "ama dibujar y pintar",
      "es el/la más rápido/a de su clase",
      "ama cantar",
      "es muy tímido/a pero muy inteligente",
      "ama la aventura",
    ],
    illustrationLabel: "Ilustración",
    noSavedStories: "Aún no hay cuentos guardados.",
    signInToSync: "Inicia sesión para sincronizar tus cuentos.",
    limitReached: "Has llegado al límite gratuito de este mes.",
    paywallTitle: "Usaste tus cuentos gratis",
    paywallSub: "Desbloquea cuentos mágicos ilimitados para tus pequeños. Dales aventuras infinitas.",
    paywallSubSoon: "Próximamente.",
    paywallPriceSub: "Ilimitado · Todas edades · Cancela cuando quieras",
    paywallPriceUnit: "mes",
    paywallSubscribeBtn: "Suscribirse ahora",
    paywallLaterBtn: "Quizás luego",
  },
};

export const AGES = [
  {
    value: "2-4",
    detail:
      "very short (under 200 words), extremely simple words, one tiny gentle challenge, very soothing",
  },
  {
    value: "5-7",
    detail:
      "short (250-350 words), simple words, one clear challenge with a happy resolution",
  },
  {
    value: "8-12",
    detail:
      "medium (400-550 words), richer vocabulary, more interesting challenge, deeper moral lesson",
  },
] as const;

export const TRAITS_EN = UI.en.traits;

export const REGIONS = [
  {
    name: "Addis Ababa",
    detail:
      "the busy, colorful streets and eucalyptus forests of Ethiopia's capital city",
  },
  {
    name: "Lalibela",
    detail: "the ancient rock-hewn churches and misty mountains of Lalibela",
  },
  {
    name: "Axum",
    detail:
      "the ancient kingdom of Axum with its towering obelisks and stone ruins",
  },
  {
    name: "Gondar",
    detail: "the royal castles and highland meadows of Gondar",
  },
  {
    name: "Lake Tana",
    detail:
      "the shores of Lake Tana where hippos rest and monasteries sit on islands",
  },
  {
    name: "Simien Mountains",
    detail:
      "the dramatic cliffs and misty peaks of the Simien Mountains",
  },
  {
    name: "Bale Mountains",
    detail:
      "the cloud forests and alpine meadows of the Bale Mountains",
  },
  {
    name: "Harar",
    detail:
      "the ancient walled city of Harar with its colorful markets and narrow alleys",
  },
  {
    name: "Omo Valley",
    detail:
      "the lush Omo Valley where the great river meets ancient communities",
  },
  {
    name: "Kaffa forests",
    detail:
      "the dense green forests of Kaffa — the birthplace of coffee itself",
  },
  {
    name: "Afar lowlands",
    detail:
      "the volcanic Afar lowlands where hot springs bubble and salt caravans pass",
  },
  {
    name: "Rift Valley lakes",
    detail:
      "the Rift Valley lakes where thousands of flamingos paint the water pink",
  },
  {
    name: "Tigray highlands",
    detail:
      "the rugged red rock highlands of Tigray dotted with cliff-top churches",
  },
  {
    name: "Gambella wetlands",
    detail:
      "the lush wetlands of Gambella where the Nile begins its long journey",
  },
  {
    name: "Dire Dawa",
    detail: "the warm, bustling crossroads city of Dire Dawa",
  },
] as const;

export const ANIMALS = [
  "🦁",
  "🐊",
  "🦅",
  "🐆",
  "🐘",
  "🦒",
  "🦓",
  "🦔",
  "🐒",
  "🦩",
];

export const ALLOWED_AGES = ["2-4", "5-7", "8-12"] as const;
export const ALLOWED_REGIONS = REGIONS.map((r) => r.name);
export const ALLOWED_STORY_INSPIRATIONS = [
  "ethiopian_folklore",
  "bible_moral",
  "animal_adventure",
  "friendship_story",
] as const;
export const TRAIT_INDICES = TRAITS_EN.map((_, i) => i);
