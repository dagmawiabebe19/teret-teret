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
    paywallValueLine: string;
    dailyTeretTitle: string;
    dailyTeretSubtitle: string;
    completedTonightTeret: string;
    streakDays: (n: number) => string;
    myLibrary: string;
    favorites: string;
    allStories: string;
    levelLabel: string;
    xpToNext: (n: number) => string;
    // Homepage
    heroLine: string;
    createStoryHeading: string;
    createStorySub: string;
    // Daily Teret
    readTonightBtn: string;
    dailyTeretTryAgain: string;
    completionComeBack: string;
    // Audio
    listenModeTitle: string;
    listenModeSub: string;
    playBtn: string;
    pauseBtn: string;
    restartBtn: string;
    speedLabel: string;
    listeningProgress: (n: number) => string;
    audioError: string;
    premiumAudioNote: string;
    audioPreviewNote: string;
    // Language learning
    learnModeTitle: string;
    learnModeSub: string;
    tapToReveal: string;
    wordsLearnedToday: string;
    practiceVocabulary: string;
    saveWord: string;
    wordSaved: string;
    keyPhrases: string;
    learnEmptyWords: string;
    lessonComplete: (n: number) => string;
    // Progress / achievements
    milestoneTitle: (name: string) => string;
    milestoneSub: string;
    achievementsTitle: string;
    achievementsSub: string;
    // Library
    librarySub: string;
    libraryEmptyTitle: string;
    libraryEmptySub: string;
    favoritesEmpty: string;
    recentlyViewed: string;
    filterBedtime: string;
    filterLearning: string;
    // Family
    ourFamily: string;
    familySub: string;
    whoIsListening: string;
    addChild: string;
    switchTo: (name: string) => string;
    childProgress: (name: string) => string;
    familyEmpty: string;
    // Story packs
    packsTitle: string;
    packsSub: string;
    packBedtimeTitle: string;
    packBedtimeDesc: string;
    packFolktalesTitle: string;
    packFolktalesDesc: string;
    packLanguageTitle: string;
    packLanguageDesc: string;
    packBraveTitle: string;
    packBraveDesc: string;
    getPackBtn: string;
    packOwned: string;
    packPrice: (price: string) => string;
    // Printable
    createPrintable: string;
    exportPdf: string;
    printableSub: string;
    personalizeCover: (name: string) => string;
    myPrintables: string;
    myDownloads: string;
    printablePremiumNote: string;
    printableSuccess: string;
    // Schools
    schoolsTitle: string;
    schoolsSub: string;
    schoolsOfferHeading: string;
    schoolsOfferBody: string;
    schoolsContactHeading: string;
    schoolsContactSub: string;
    schoolsCta: string;
    schoolsFormPlaceholder: string;
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
    paywallValueLine: "የመጽለፊያ ልምድ · ቋንቋ መማር · የቤተሰብ ታሪኮች",
    dailyTeretTitle: "የዛሬ ተረት",
    dailyTeretSubtitle: "ለዛሬ ሌሊት ትምህርት እና የመጽለፊያ ታሪክ",
    completedTonightTeret: "የዛሬ ተረት አጠናቀህል።",
    streakDays: (n) => (n === 1 ? "1 ቀን" : `${n} ቀናት`),
    myLibrary: "መጽሐፍ ቤቴ",
    favorites: "የምወዳቸው",
    allStories: "ሁሉም",
    levelLabel: "ደረጃ",
    xpToNext: (n) => `ቀጣዩ ደረጃ ${n} XP`,
    heroLine: "አንድ ታሪክ በጊዜ፣ አንድ ሌሊት በጊዜ።",
    createStoryHeading: "ለእነሱ ብቻ ታሪክ ፍጠር",
    createStorySub: "የልጅዎን ስም ይግለጹ እና ከደጋ ታሪክ ውስጥ እናስገባቸዋለን።",
    readTonightBtn: "የዛሬ ሌሊት ታሪክ አንብብ",
    dailyTeretTryAgain: "የዛሬ ታሪክ በመንገድ ላይ ነው። ትንሽ በኋላ ይሞክሩ።",
    completionComeBack: "ለሌላ ነገ ተመልሰው ይግኙ።",
    listenModeTitle: "አድምጥ",
    listenModeSub: "ጫን አድርግ፣ ዓይኖችህን ዝጋ፣ ታሪኩ ወደ እንቅልፍ ይውሰዳቸው።",
    playBtn: "ጫን",
    pauseBtn: "አቁም",
    restartBtn: "እንደገና ጀምር",
    speedLabel: "ፍጥነት",
    listeningProgress: (n) => `በመስማት ላይ… ${n}%`,
    audioError: "ስሙን ማምጣት አልቻልንም። እንደገና ይሞክሩ።",
    premiumAudioNote: "በፕሪሚየም ያልተገደበ መስማት።",
    audioPreviewNote: "ቅድመ እይታ ይስሙ። ፕሪሚየም ሙሉ ስሙን ይከፍትልዎታል።",
    learnModeTitle: "በዚህ ታሪክ ይማሩ",
    learnModeSub: "ትርጉሞችን ለማየት ቃላትን ይንካ። በታሪክ ውስጥ በተፈጥሮ ይማሩ።",
    tapToReveal: "ትርጉም ለማየት ይንካ።",
    wordsLearnedToday: "ዛሬ ያጠናቃቸው ቃላት",
    practiceVocabulary: "እነዚህን ቃላት ይለማምዱ",
    saveWord: "ቃል አስቀምጥ",
    wordSaved: "ተቀምጧል",
    keyPhrases: "ከዚህ ታሪክ ዋና ሐረጎች",
    learnEmptyWords: "እስካሁን ምንም ቃል አልቀረጥክም። ለማስቀጠል ታሪክ ውስጥ ማንኛውንም ቃል ይንካ።",
    lessonComplete: (n) => `ከዚህ ታሪክ ${n} ቃላት ተማርክ።`,
    milestoneTitle: (name) => `${name} ደርሰሃል`,
    milestoneSub: "ይቀጥሉ። ቀጣዩ ታሪክ እየጠበቀ ነው።",
    achievementsTitle: "ጉዞዎ",
    achievementsSub: "እያንዳንዱ ታሪክ እና እያንዳንዱ ቃል ይቆጥራል።",
    librarySub: "የተቀመጡ ታሪኮችዎ እና ተወዳጆች። በፍላጎት ሲኖርዎ እዚህ ናቸው።",
    libraryEmptyTitle: "እስካሁን ታሪኮች የሉም",
    libraryEmptySub: "ታሪክ ፍጠር ወይም አስቀምጥ እና እዚህ ይታያል።",
    favoritesEmpty: "ታሪክን ኮከት ለማግኘት ኮከት ይጫኑ።",
    recentlyViewed: "በቅርብ የታዩ",
    filterBedtime: "መጽለፊያ",
    filterLearning: "ቋንቋ መማር",
    ourFamily: "ቤተሰባችን",
    familySub: "አንድ መለያ። ለእያንዳንዱ ልጅ የተለየ ታሪክ እና እድገት።",
    whoIsListening: "ዛሬ ሌሊት ማን ነው የሚስማው?",
    addChild: "ልጅ ጨምር",
    switchTo: (name) => `ወደ ${name} ቀይር`,
    childProgress: (name) => `የ${name} እድገት`,
    familyEmpty: "ለመጀመር የመጀመሪያ ልጅዎን ይጨምሩ።",
    packsTitle: "የታሪክ ጥቅሎች",
    packsSub: "የተመረጡ ስብስቦች። አንድ ጊዜ ይግዙ። ለዘለቄታው ይድረስዎ።",
    packBedtimeTitle: "የመጽለፊያ ታሪኮች ጥቅል",
    packBedtimeDesc: "ለማረፋፈል የተሠሩ ግሩም ታሪኮች። ለእያንዳንዱ ሌሊት ተስማሚ።",
    packFolktalesTitle: "የኢትዮጵያ ተረቶች ጥቅል",
    packFolktalesDesc: "ከደጋ የተለዩ ታሪኮች። በእያንዳንዱ ውስጥ ጥበብ እና ተገረም።",
    packLanguageTitle: "የቋንቋ መማር ጥቅል",
    packLanguageDesc: "አማርኛ እና እንግሊዝኛ አንድ ላይ ለማማር የተሠሩ ታሪኮች።",
    packBraveTitle: "የደፋር ልጆች ታሪኮች ጥቅል",
    packBraveDesc: "ለደፋር ልቦች የሚገቡ ታሪኮች። ብርታት እና ደግነት።",
    getPackBtn: "ይህን ጥቅል ያግኙ",
    packOwned: "በመጽሐፍ ቤትዎ ውስጥ",
    packPrice: (price) => `${price} አንድ ጊዜ`,
    createPrintable: "ለማተም ፍጠር",
    exportPdf: "እንደ PDF ላክ",
    printableSub: "ይህን ታሪክ ማተም የሚችል መጽሐፍ ያድርጉበት።",
    personalizeCover: (name) => `በሽፋኑ ላይ የ${name} ስም ይጨምሩ`,
    myPrintables: "የኔ ለማተም ታሪኮች",
    myDownloads: "እያወረዱ",
    printablePremiumNote: "በፕሪሚየም ለማተም መጽሐፍ ይክፈቱ።",
    printableSuccess: "የታሪክ መጽሐፍዎ ለማውረድ ዝግጁ ነው።",
    schoolsTitle: "ለትምህርት ቤቶች እና መምህራን",
    schoolsSub: "ተረት ተረትን ወደ ክፍልዎ ያምጡ። ታሪኮች፣ ቋንቋ እና ባህል በአንድ ቦታ።",
    schoolsOfferHeading: "ታሪክ ማስረዳት እና ቋንቋ መማር በክፍል",
    schoolsOfferBody: "ለክፍልዎ አንድ ቀላል እቅድ። የኢትዮጵያ ታሪኮች፣ ብዙ ቋንቋዎች እና ለማተም ሀብቶች። ለባህላዊ ጥናት እና ባለሁለት ቋንቋ ፕሮግራሞች ተስማሚ።",
    schoolsContactHeading: "ያግኙን",
    schoolsContactSub: "ስለ ክፍልዎ ወይም ትምህርት ቤትዎ ይንገሩን። ለማስተካከል እንረዳዎታለን።",
    schoolsCta: "ፍላጎት አለኝ",
    schoolsFormPlaceholder: "ስምዎ፣ ትምህርት ቤት እና ተረት ተረትን እንዴት ማጠቃለል እንደሚፈልጉ",
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
    paywallValueLine: "Bedtime ritual · Language learning · Family stories · Cultural connection",
    dailyTeretTitle: "Tonight's Teret",
    dailyTeretSubtitle: "A new story for tonight's learning and bedtime",
    completedTonightTeret: "You completed tonight's Teret",
    streakDays: (n) => (n === 1 ? "1 day" : `${n} days`),
    myLibrary: "My Library",
    favorites: "Favorites",
    allStories: "All",
    levelLabel: "Level",
    xpToNext: (n) => `${n} XP to next level`,
    heroLine: "One story at a time. One night at a time.",
    createStoryHeading: "Create a story just for them",
    createStorySub: "Tell us your child's name and we'll weave them into a tale from the highlands.",
    readTonightBtn: "Read tonight's story",
    dailyTeretTryAgain: "Today's story is on its way. Try again in a moment.",
    completionComeBack: "Come back tomorrow for another.",
    listenModeTitle: "Listen",
    listenModeSub: "Press play. Close eyes. Let the story carry them to sleep.",
    playBtn: "Play",
    pauseBtn: "Pause",
    restartBtn: "Start over",
    speedLabel: "Speed",
    listeningProgress: (n) => `Listening… ${n}%`,
    audioError: "We couldn't load the audio. Try again.",
    premiumAudioNote: "Unlimited listening with Premium.",
    audioPreviewNote: "Listen to a preview. Unlock full audio with Premium.",
    learnModeTitle: "Learn with this story",
    learnModeSub: "Tap words and lines to see meanings. Learn naturally, inside the story.",
    tapToReveal: "Tap to see translation",
    wordsLearnedToday: "Words you learned today",
    practiceVocabulary: "Practice these words",
    saveWord: "Save word",
    wordSaved: "Saved",
    keyPhrases: "Key phrases from this story",
    learnEmptyWords: "No words saved yet. Tap any word in the story to save it.",
    lessonComplete: (n) => `You learned ${n} words from this story.`,
    milestoneTitle: (name) => `You reached ${name}`,
    milestoneSub: "Keep reading. The next story is waiting.",
    achievementsTitle: "Your journey",
    achievementsSub: "Every story and every word counts.",
    librarySub: "Your saved stories and favorites. Always here when you need them.",
    libraryEmptyTitle: "No stories yet",
    libraryEmptySub: "Create or save a story and it'll show up here.",
    favoritesEmpty: "Star a story to find it here.",
    recentlyViewed: "Recently viewed",
    filterBedtime: "Bedtime",
    filterLearning: "Language learning",
    ourFamily: "Our family",
    familySub: "One account. Separate stories and progress for each child.",
    whoIsListening: "Who is listening tonight?",
    addChild: "Add a child",
    switchTo: (name) => `Switch to ${name}`,
    childProgress: (name) => `${name}'s progress`,
    familyEmpty: "Add your first child to get started.",
    packsTitle: "Story packs",
    packsSub: "Curated collections. One-time purchase. Yours forever.",
    packBedtimeTitle: "Bedtime Stories Pack",
    packBedtimeDesc: "Gentle, calming stories made for winding down. Perfect for every night.",
    packFolktalesTitle: "Ethiopian Folktales Pack",
    packFolktalesDesc: "Classic tales from the highlands. Wisdom and wonder in every one.",
    packLanguageTitle: "Language Learning Pack",
    packLanguageDesc: "Stories built for learning Amharic and English together.",
    packBraveTitle: "Brave Kids Stories Pack",
    packBraveDesc: "Adventures for brave hearts. Courage and kindness in every story.",
    getPackBtn: "Get this pack",
    packOwned: "In your library",
    packPrice: (price) => `${price} one-time`,
    createPrintable: "Create printable",
    exportPdf: "Export as PDF",
    printableSub: "Turn this story into a beautiful storybook you can print or keep.",
    personalizeCover: (name) => `Add ${name}'s name on the cover`,
    myPrintables: "My printables",
    myDownloads: "Downloads",
    printablePremiumNote: "Unlock printable storybooks with Premium.",
    printableSuccess: "Your storybook is ready to download.",
    schoolsTitle: "For schools & teachers",
    schoolsSub: "Bring Teret-Teret into your classroom. Stories, language, and culture in one place.",
    schoolsOfferHeading: "Classroom storytelling & language learning",
    schoolsOfferBody: "One simple plan for your class. Ethiopian stories, multiple languages, and printable resources. Perfect for cultural studies and bilingual programs.",
    schoolsContactHeading: "Get in touch",
    schoolsContactSub: "Tell us about your class or school. We'll help you get set up.",
    schoolsCta: "I'm interested",
    schoolsFormPlaceholder: "Your name, school, and how you'd like to use Teret-Teret",
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
    paywallValueLine: "Rutina de sueño · Aprender idiomas · Cuentos en familia · Conexión cultural",
    dailyTeretTitle: "El Teret de hoy",
    dailyTeretSubtitle: "Un cuento nuevo para aprender y dormir esta noche",
    completedTonightTeret: "Completaste el Teret de hoy",
    streakDays: (n) => (n === 1 ? "1 día" : `${n} días`),
    myLibrary: "Mi biblioteca",
    favorites: "Favoritos",
    allStories: "Todos",
    levelLabel: "Nivel",
    xpToNext: (n) => `${n} XP al siguiente nivel`,
    heroLine: "Un cuento a la vez. Una noche a la vez.",
    createStoryHeading: "Crea un cuento solo para ellos",
    createStorySub: "Dinos el nombre de tu hijo/a y lo tejemos en un cuento de las tierras altas.",
    readTonightBtn: "Leer el cuento de esta noche",
    dailyTeretTryAgain: "El cuento de hoy está en camino. Intenta en un momento.",
    completionComeBack: "Vuelve mañana por otro.",
    listenModeTitle: "Escuchar",
    listenModeSub: "Dale a play. Cierra los ojos. Deja que el cuento los lleve a dormir.",
    playBtn: "Reproducir",
    pauseBtn: "Pausa",
    restartBtn: "Empezar de nuevo",
    speedLabel: "Velocidad",
    listeningProgress: (n) => `Escuchando… ${n}%`,
    audioError: "No pudimos cargar el audio. Intenta de nuevo.",
    premiumAudioNote: "Escucha ilimitada con Premium.",
    audioPreviewNote: "Escucha una vista previa. Desbloquea el audio completo con Premium.",
    learnModeTitle: "Aprende con este cuento",
    learnModeSub: "Toca palabras y líneas para ver significados. Aprende naturalmente, dentro del cuento.",
    tapToReveal: "Toca para ver la traducción",
    wordsLearnedToday: "Palabras que aprendiste hoy",
    practiceVocabulary: "Practica estas palabras",
    saveWord: "Guardar palabra",
    wordSaved: "Guardado",
    keyPhrases: "Frases clave de este cuento",
    learnEmptyWords: "Aún no hay palabras guardadas. Toca cualquier palabra del cuento para guardarla.",
    lessonComplete: (n) => `Aprendiste ${n} palabras de este cuento.`,
    milestoneTitle: (name) => `Llegaste a ${name}`,
    milestoneSub: "Sigue leyendo. El próximo cuento te espera.",
    achievementsTitle: "Tu camino",
    achievementsSub: "Cada cuento y cada palabra cuenta.",
    librarySub: "Tus cuentos guardados y favoritos. Siempre aquí cuando los necesitas.",
    libraryEmptyTitle: "Aún no hay cuentos",
    libraryEmptySub: "Crea o guarda un cuento y aparecerá aquí.",
    favoritesEmpty: "Marca un cuento con estrella para encontrarlo aquí.",
    recentlyViewed: "Vistos recientemente",
    filterBedtime: "Hora de dormir",
    filterLearning: "Aprender idiomas",
    ourFamily: "Nuestra familia",
    familySub: "Una cuenta. Cuentos y progreso separados para cada niño/a.",
    whoIsListening: "¿Quién escucha esta noche?",
    addChild: "Añadir niño/a",
    switchTo: (name) => `Cambiar a ${name}`,
    childProgress: (name) => `Progreso de ${name}`,
    familyEmpty: "Añade tu primer hijo/a para empezar.",
    packsTitle: "Packs de cuentos",
    packsSub: "Colecciones curadas. Compra única. Tuyos para siempre.",
    packBedtimeTitle: "Pack Cuentos para Dormir",
    packBedtimeDesc: "Cuentos suaves y calmados para relajarse. Perfectos para cada noche.",
    packFolktalesTitle: "Pack Cuentos Etíopes",
    packFolktalesDesc: "Cuentos clásicos de las tierras altas. Sabiduría y asombro en cada uno.",
    packLanguageTitle: "Pack Aprender Idiomas",
    packLanguageDesc: "Cuentos hechos para aprender amárico e inglés juntos.",
    packBraveTitle: "Pack Cuentos de Niños Valientes",
    packBraveDesc: "Aventuras para corazones valientes. Valentía y bondad en cada cuento.",
    getPackBtn: "Obtener este pack",
    packOwned: "En tu biblioteca",
    packPrice: (price) => `${price} pago único`,
    createPrintable: "Crear imprimible",
    exportPdf: "Exportar como PDF",
    printableSub: "Convierte este cuento en un libro que puedes imprimir o guardar.",
    personalizeCover: (name) => `Añadir el nombre de ${name} en la portada`,
    myPrintables: "Mis imprimibles",
    myDownloads: "Descargas",
    printablePremiumNote: "Desbloquea libros imprimibles con Premium.",
    printableSuccess: "Tu libro está listo para descargar.",
    schoolsTitle: "Para colegios y profesores",
    schoolsSub: "Lleva Teret-Teret a tu clase. Cuentos, idiomas y cultura en un solo lugar.",
    schoolsOfferHeading: "Cuentos y aprendizaje de idiomas en el aula",
    schoolsOfferBody: "Un plan sencillo para tu clase. Cuentos etíopes, varios idiomas y recursos imprimibles. Ideal para estudios culturales y programas bilingües.",
    schoolsContactHeading: "Contacto",
    schoolsContactSub: "Cuéntanos sobre tu clase o colegio. Te ayudamos a empezar.",
    schoolsCta: "Me interesa",
    schoolsFormPlaceholder: "Tu nombre, colegio y cómo te gustaría usar Teret-Teret",
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
