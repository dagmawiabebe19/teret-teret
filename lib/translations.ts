import type { Lang } from "@/types";

/** Region keys (English) — used for API/storage; display via regionNames */
export const REGION_KEYS = [
  "Addis Ababa",
  "Lalibela",
  "Axum",
  "Gondar",
  "Lake Tana",
  "Simien Mountains",
  "Bale Mountains",
  "Harar",
  "Omo Valley",
  "Kaffa forests",
  "Afar lowlands",
  "Rift Valley lakes",
  "Tigray highlands",
  "Gambella wetlands",
  "Dire Dawa",
] as const;

export const translations: Record<
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
    categoryLabel: string;
    categoryOpts: string[];
    topicLabel: string;
    topicPlaceholder: string;
    storyGoalLabel: string;
    storyGoalOpts: string[];
    whyStoriesTeach: string;
    learningTopicsLine: string;
    categorySuggestions: string[];
    generateBtn: string;
    freeLeft: (n: number) => string;
    freeLeftToday: (n: number) => string;
    limitReached: string;
    limitReachedToday: string;
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
    paywallTitle: string;
    paywallSub: string;
    paywallSubSoon: string;
    paywallPriceSub: string;
    paywallPriceUnit: string;
    paywallSubscribeBtn: string;
    paywallLaterBtn: string;
    paywallValueLine: string;
    paywallLimitTitle: string;
    paywallLimitSubtitle: string;
    paywallBenefit1: string;
    paywallBenefit2: string;
    paywallBenefit3: string;
    paywallBenefit4: string;
    paywallUpgradeCta: string;
    paywallMaybeLater: string;
    subscriptionSuccessMessage: string;
    premiumActivating: string;
    signInToUpgrade: string;
    planFree: string;
    planPremium: string;
    manageSubscription: string;
    upgradeToPremium: string;
    checkoutCancelled: string;
    signInToSubscribe: string;
    subscriptionComingSoon: string;
    noSubscriptionFound: string;
    unlimitedStories: string;
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
    stopBtn: string;
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
    // Account / auth
    authNotConfiguredTitle: string;
    authNotConfiguredSub: string;
    authLoading: string;
    authErrorInvalidLogin: string;
    authErrorWeakPassword: string;
    authErrorDuplicate: string;
    authErrorEmailNotConfirmed: string;
    authErrorGeneric: string;
    signUpSuccess: string;
    forgotPasswordBtn: string;
    forgotPasswordSent: string;
    signInSuccess: string;
    signOut: string;
    accountSubtitle: string;
    accountBenefit1: string;
    accountBenefit2: string;
    accountBenefit3: string;
    accountGuestNote: string;
    continueWithGoogle: string;
    shareTeretBtn: string;
    shareTeretTitle: string;
    shareTeretText: string;
    shareSuccess: string;
    shareCopied: string;
    regionNames: string[];
    defaultRegion: string;
    navAccount: string;
    backToApp: string;
    accountTitle: string;
    subscriptionLabel: string;
    unlimitedStoriesLabel: string;
    emailLabel: string;
    passwordLabel: string;
    signUpBtn: string;
    signInBtn: string;
    orSignInWithEmail: string;
    alreadyHaveAccount: string;
    createAccount: string;
    exportTxtBtn: string;
    premiumAudioGate: string;
    readInsteadBtn: string;
    upgradeBtn: string;
    ttsPauseAria: string;
    ttsResumeAria: string;
    ttsListenAria: string;
    errorSaveFailed: string;
    errorExportFailed: string;
    errorExported: string;
    errorNetwork: string;
    errorGeneric: string;
    errorTryAgain: string;
    errorCouldNotSaveWord: string;
    errorStoryDisplayFailed: string;
    copyFailed: string;
    langNameAm: string;
    langNameEn: string;
    langNameEs: string;
    listeningActive: string;
    wordsInStory: string;
    wordsSavedLabel: string;
    learningLabel: string;
    tapSentenceTranslation: string;
    noSentencesPage: string;
    noVocabYet: string;
    storyForName: (name: string) => string;
    removeFavoriteAria: string;
    addFavoriteAria: string;
    deleteStoryAria: string;
    openStoryAria: (name: string) => string;
    storyGoalNone: string;
    pricePerMonth: string;
    prevPageAria: string;
    nextPageAria: string;
    finishStoryAria: string;
    selectLanguageAria: string;
    dailyTeretLoadError: string;
    dailyTeretDisplayError: string;
    navMyStories: string;
    navProfile: string;
    whoIsStoryFor: string;
    libraryEmptyPrompt: string;
    recentlyPlayedTitle: string;
    statTotalStories: string;
    statFavoriteLocation: string;
    statFavoriteCategory: string;
    generationStreakNights: (n: number) => string;
    linkToMyStories: string;
    manageChildren: string;
    editChild: string;
    deleteChild: string;
    saveChild: string;
    cancel: string;
    selectAvatar: string;
    noneYet: string;
    // Landing page
    heroHeadline: string;
    heroSubheadline: string;
    ctaCreateFree: string;
    ctaSeeExample: string;
    trustTrilingual: string;
    trustEthiopian: string;
    trustChildSafe: string;
    freeBannerDefault: string;
    freeBannerOneLeft: string;
    freeBannerUpgrade: string;
    tellMeStoryTonight: string;
    quickNamePlaceholder: string;
    customizeStoryToggle: string;
    socialProofHeading: string;
    testimonial1Quote: string;
    testimonial1Author: string;
    testimonial2Quote: string;
    testimonial2Author: string;
    testimonial3Quote: string;
    testimonial3Author: string;
    pricingHeading: string;
    pricingFreeTitle: string;
    pricingFreeFeatures: string[];
    pricingPremiumTitle: string;
    pricingPremiumFeatures: string[];
    pricingCta: string;
    navSignIn: string;
    navStartFree: string;
    sampleStoryLabel: string;
    sampleReadFull: string;
    generateYourOwn: string;
    globalCapBreak: string;
    upgradeToSaveStories: string;
    upgradeForChildProfiles: string;
  }
> = {
  am: {
    appTitle: "ተረት ተረት",
    subtitle: "በታሪክ ይማሩ ✨ አስማታዊ ታሪኮች የሚያስተምሩ",
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
    categoryLabel: "ምን ዓይነት ታሪክ?",
    categoryOpts: ["መጽለፊያ", "ሒሳብ", "ሳይንስ", "ታሪክ", "እምነት", "ቋንቋ መማር", "ባህል እና እሴቶች"],
    topicLabel: "ርዕስ ወይም ጽንሰ-ሀሳብ (አማራጭ)",
    topicPlaceholder: "ለምሳሌ: ስለ ጭብጨባ ታሪክ፣ ስለ አድዋ፣ ማባዛት...",
    storyGoalLabel: "የታሪኩ ግብ",
    storyGoalOpts: ["ጽንሰ-ሀሳብ ማስተማር", "ርዕዮት ማስተማር", "ቃላት ማስተማር", "ታሪክ በታሪክ ማስተማር", "እምነት/እሴት ማስተማር"],
    whyStoriesTeach: "ታሪኮች ይማራሉ። ትምህርት በታሪክ ይብራራል።",
    learningTopicsLine: "መጽለፊያ · ሒሳብ · ሳይንስ · ታሪክ · እምነት · ቋንቋ · ባህል",
    categorySuggestions: [
      "ለዚህ ሌሊት ጨዋ ታሪክ",
      "ማባዛት በታሪክ ውስጥ",
      "ስበት ለምን ነገሮችን ወደ ታች ይጎትታል?",
      "ስለ አድዋ ለልጆች ታሪክ",
      "የመጽሐፍ ቅዱስ ተጨባቢ ብርታት",
      "አማርኛ-እንግሊዝኛ ቃላት በታሪክ",
      "የወዳጅነት እና ደግነት ታሪክ",
    ],
    generateBtn: "🌙 ታሪክ ንገሩኝ!",
    freeLeft: (n) => `${n} ነፃ ታሪክ ቀሩ`,
    freeLeftToday: (n) => (n === 1 ? "1 ነፃ ታሪክ ዛሬ ቀርቷል" : `${n} ነፃ ታሪኮች ዛሬ ቀርተዋል`),
    limitReached: "የዚህ ወር ነፃ ታሪኮች አልቀሩም።",
    limitReachedToday: "የዛሬ ነፃ ታሪኮች አልቀሩም።",
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
    paywallTitle: "3 ነፃ ታሪኮችዎን ተጠቀሙ",
    paywallSub: "ያልተወሰነ አስማታዊ ታሪኮች ያግኙ። የልጆችዎን ህልም ያብሩ።",
    paywallSubSoon: "በቅርብ ጊዜ ይመጣል።",
    paywallPriceSub: "ያልተወሰነ · ሁሉም ዕድሜ · ማቋረጥ ይቻላል",
    paywallPriceUnit: "ወር",
    paywallSubscribeBtn: "አሁን ይመዝገቡ",
    paywallLaterBtn: "ለቆይ",
    paywallValueLine: "የመጽለፊያ ልምድ · ቋንቋ መማር · የቤተሰብ ታሪኮች",
    paywallLimitTitle: "ነፃ ታሪኮችዎን ተጠቀሙ",
    paywallLimitSubtitle: "ያልተገደበ ትምህርታዊ እና የመጽለፊያ ታሪኮች ለቤተሰብዎ ይክፈቱ።",
    paywallBenefit1: "ያልተወሰነ ትምህርታዊ እና የመጽለፊያ ታሪኮች",
    paywallBenefit2: "ተወዳጅ ታሪኮች ያስቀምጡ እና እንደገና ይጎትቱ",
    paywallBenefit3: "በታሪኮች ቋንቋ እና ባህል ይማሩ",
    paywallBenefit4: "ታሪኮችን በማንኛውም መሣሪያ ይድረሱ",
    paywallUpgradeCta: "በ$4.99/ወር ይለግሱ",
    paywallMaybeLater: "ለቆይ",
    subscriptionSuccessMessage: "ያልተገደበ ተረት እንኳን በደህና መጡ።",
    premiumActivating: "የፕሪሚየም መዳረሻዎ እየተጫነ ነው...",
    signInToUpgrade: "ለማሻሻል እና ታሪኮችዎን በሁሉም መሣሪያ ለማስቀጠል ይግቡ።",
    planFree: "ነፃ",
    planPremium: "ፕሪሚየም",
    manageSubscription: "የደንበኝነት ምዝገባ አስተዳድር",
    upgradeToPremium: "ወደ ፕሪሚየም ይለግሱ",
    checkoutCancelled: "ግዢው ተሰርዟል።",
    signInToSubscribe: "ለመመዝገብ ይግቡ።",
    subscriptionComingSoon: "የደንበኝነት ምዝገባ በቅርብ ጊዜ ይመጣል።",
    noSubscriptionFound: "ንቁ የደንበኝነት ምዝገባ አልተገኘም። እባክዎ በመጀመር ይመዝገቡ።",
    unlimitedStories: "ያልተገደበ",
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
    createStoryHeading: "ትምህርት በታሪክ ውስጥ ፍጠር",
    createStorySub: "ምን ይማር እንደሚፈልጉ ይምረጡ፣ ስም ያስገቡ፣ ታሪክ ያግኙ።",
    readTonightBtn: "የዛሬ ሌሊት ታሪክ አንብብ",
    dailyTeretTryAgain: "የዛሬ ታሪክ በመንገድ ላይ ነው። ትንሽ በኋላ ይሞክሩ።",
    completionComeBack: "ለሌላ ነገ ተመልሰው ይግኙ።",
    listenModeTitle: "አድምጥ",
    listenModeSub: "ጫን አድርግ፣ ዓይኖችህን ዝጋ፣ ታሪኩ ወደ እንቅልፍ ይውሰዳቸው።",
    playBtn: "ጫን",
    pauseBtn: "አቁም",
    restartBtn: "እንደገና ጀምር",
    stopBtn: "አቁም",
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
    authNotConfiguredTitle: "የመለያ ማስመሳሰል ገና አይገኝም",
    authNotConfiguredSub: "ተረት ተረትን በዚህ መሣሪያ ላይ መጠቀም እና ታሪኮችን በአካባቢ ማስቀጠል ትችላለህ።",
    authLoading: "በመጫን ላይ...",
    authErrorInvalidLogin: "ኢሜይል ወይም የይለፍ ቃል አልተሳካም። እባክዎ ይሞክሩ።",
    authErrorWeakPassword: "የይለፍ ቃል ቢያንስ ፮ ቁምፊ ይሁን።",
    authErrorDuplicate: "በዚህ ኢሜይል የተመዘገበ መለያ አለ። ይግቡ ወይም ሌላ ኢሜይል ይጠቀሙ።",
    authErrorEmailNotConfirmed: "ኢሜይልዎን ያረጋግጡ። የማረጋገጫ አገናኝ በኢሜይልዎ ይመልከቱ።",
    authErrorGeneric: "አንድ ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።",
    signUpSuccess: "ይመልከቱ ኢሜይልዎን ለማረጋገጥ፣ ከዚያ ይግቡ።",
    forgotPasswordBtn: "የይለፍ ቃል ረሱ?",
    forgotPasswordSent: "የይለፍ ቃል ዳግም ማስጀመር አገናኝ በኢሜይልዎ ተላልፏል።",
    signInSuccess: "በተሳካ ሁኔታ ገብተዋል።",
    signOut: "ውጣ",
    accountSubtitle: "መግቢያ ተያይዘው ተወዳጅ ታሪኮችዎን ያስቀምጡ፣ እድገት ይከታተሉ፣ እና ለቤተሰብዎ ያልተገደበ ተረት ይክፈቱ።",
    accountBenefit1: "ለመጽለፊያ ታሪኮች ያስቀምጡ",
    accountBenefit2: "የቋንቋ መማር እድገት ይከታተሉ",
    accountBenefit3: "ታሪኮችዎን በማንኛውም መሣሪያ ይድረሱ",
    accountGuestNote: "ተረት ተረትን እንደ እንግዳ መጠቀም ትችላለህ፤ ታሪኮች በዚህ መሣሪያ ላይ ይቀራሉ። መግቢያ ለማድረግ እና ለማስቀጠል ያልተወሰነ ታሪኮች ይመዝገቡ።",
    continueWithGoogle: "በጉግል ይቀጥሉ",
    shareTeretBtn: "ይህን ተረት አጋራ",
    shareTeretTitle: "የዛሬ ተረት ከተረት ተረት 📖",
    shareTeretText: "አስማታዊ የመጽለፊያ ታሪክ በተጨማሪ ቋንቋ የሚያስተምር።",
    shareSuccess: "ተጋርቷል!",
    shareCopied: "ቅዳ ተቀድቷል",
    regionNames: [
      "አዲስ አበባ", "ላሊበላ", "አክሱም", "ጎንደር", "ታና ሀይቅ",
      "ስሜን ተራሮች", "ባሌ ተራሮች", "ሐረር", "ኦሞ ሸለቆ", "ቃፋ ደጋ",
      "አፋር ዝቅ ሰፋላ", "ሪፍት ሸለቆ ሀይቆች", "ትግራይ ደጋ", "ጋምቤላ በረሃ", "ድሬ ዳዋ",
    ],
    defaultRegion: "የኢትዮጵያ ደጋ",
    navAccount: "መለያ",
    backToApp: "← ወደ ተረት ተረት ተመለስ",
    accountTitle: "መለያ",
    subscriptionLabel: "የደንበኝነት ምዝገባ",
    unlimitedStoriesLabel: "ያልተገደበ ታሪኮች",
    emailLabel: "ኢሜይል",
    passwordLabel: "የይለፍ ቃል",
    signUpBtn: "ተመዝገብ",
    signInBtn: "ግባ",
    orSignInWithEmail: "— ወይም በኢሜይል ግባ —",
    alreadyHaveAccount: "መለያ አለዎት? ግቡ",
    createAccount: "መለያ ፍጠር",
    exportTxtBtn: "📄 ፋይል አውርድ (.txt)",
    premiumAudioGate: "በፕሪሚየም የታሪኩን ቀሪ ክፍል ይስሙ።",
    readInsteadBtn: "📖 ለማንበብ ቀይር",
    upgradeBtn: "ይለግሱ",
    ttsPauseAria: "አቁም",
    ttsResumeAria: "ቀጥል",
    ttsListenAria: "ገጹን አድምጥ",
    errorSaveFailed: "ማስቀመጥ አልተሳካም",
    errorExportFailed: "ማውረድ አልተሳካም",
    errorExported: "ተወርዷል!",
    errorNetwork: "የአውታረ መረብ ስህተት። እንደገና ይሞክሩ።",
    errorGeneric: "የሆነ ችግር ተፈጥሯል። እንደገና ይሞክሩ።",
    errorTryAgain: "እንደገና ይሞክሩ",
    errorCouldNotSaveWord: "ቃሉን ማስቀመጥ አልተቻለም",
    errorStoryDisplayFailed: "ይህ ታሪክ እንደ ገጾች ማሳየት አልተቻለም።",
    copyFailed: "ማቅረብ አልተሳካም",
    langNameAm: "አማርኛ",
    langNameEn: "እንግሊዝኛ",
    langNameEs: "ስፓኒሽ",
    listeningActive: "🎙️ በመስማት ላይ...",
    wordsInStory: "🌍 በዚህ ታሪክ ውስጥ ያሉ ቃላት",
    wordsSavedLabel: "የተቀመጡ ቃላት",
    learningLabel: "መማር:",
    tapSentenceTranslation: "ትርጉም ለማየት ማንኛውንም ዓረፍተ ነገር ይንኩ",
    noSentencesPage: "በዚህ ገጽ ላይ ዓረፍተ ነገር የለም።",
    noVocabYet: "ለዚህ ታሪክ ገና ቃላት የሉም።",
    storyForName: (name) => `የ${name} ታሪክ`,
    removeFavoriteAria: "ከተወዳጆች አስወግድ",
    addFavoriteAria: "ወደ ተወዳጆች ጨምር",
    deleteStoryAria: "ታሪክ ሰርዝ",
    openStoryAria: (name) => `የ${name} ታሪክ ክፈት`,
    storyGoalNone: "—",
    pricePerMonth: "$4.99/ወር",
    prevPageAria: "ቀዳዳ ገጽ",
    nextPageAria: "ቀጣይ ገጽ",
    finishStoryAria: "ታሪኩን አጠናቅቅ",
    selectLanguageAria: "ቋንቋ ምረጥ",
    dailyTeretLoadError: "የዛሬ ታሪክ መጫን አልተሳካም።",
    dailyTeretDisplayError: "ታሪኩ ማሳየት አልተቻለም።",
    navMyStories: "የእኔ ታሪኮች",
    navProfile: "መገለጫ",
    whoIsStoryFor: "ተረቱ ለማን ነው?",
    libraryEmptyPrompt: "ገና ታሪክ የለም — የመጀመሪያዎን ዛሬ ሌሊት ይፍጠሩ 🌙",
    recentlyPlayedTitle: "በቅርብ የተነበቡ",
    statTotalStories: "ጠቅላላ ታሪኮች",
    statFavoriteLocation: "ተወዳጅ ቦታ",
    statFavoriteCategory: "ተወዳጅ ምድብ",
    generationStreakNights: (n) => `${n} ሌሊቶች በተከታታይ 🔥`,
    linkToMyStories: "የእኔ ታሪኮች ቤተ-መጽሐፍት →",
    manageChildren: "የልጆች መገለጫዎች",
    editChild: "አርትዕ",
    deleteChild: "ሰርዝ",
    saveChild: "አስቀምጥ",
    cancel: "ሰርዝ",
    selectAvatar: "አቫታር ምረጥ",
    noneYet: "ገና የለም",
    heroHeadline: "እያንዳንዱ ልጅ የራሱ ታሪክ ኮከብ መሆን ይገባዋል",
    heroSubheadline: "ልጅዎን አማርኛ፣ የኢትዮጵያ ባህል እና ታሪክ በግል የመጽለፊያ ታሪኮች ያስማሩ",
    ctaCreateFree: "✨ ነፃ ታሪክ ፍጠር",
    ctaSeeExample: "ምሳሌ ይመልከቱ",
    trustTrilingual: "🌍 ሶስት ቋንቋ",
    trustEthiopian: "🦁 የኢትዮጵያ ቦታዎች",
    trustChildSafe: "✅ ለልጆች ደህንነት",
    freeBannerDefault: "ዛሬ 1 ነፃ ታሪክ — መለያ አያስፈልግም",
    freeBannerOneLeft: "ዛሬ 1 ነፃ ታሪክ ቀርቷል",
    freeBannerUpgrade: "የዛሬ ነፃ ታሪኮች አልቀሩም — ያልተገደበ ታሪኮች ይክፈቱ",
    tellMeStoryTonight: "✨ ዛሬ ሌሊት ታሪክ ንገሩኝ!",
    quickNamePlaceholder: "ካሳ፣ ሊያ፣ ዳዊት...",
    customizeStoryToggle: "ወይም ታሪክዎን ያብጁ",
    socialProofHeading: "በዓለም ዙሪያ በኢትዮጵያ ቤተሰቦች የተወደደ",
    testimonial1Quote: "ካሳ አሁን በየሌሊቱ ተረት ተረት ይጠይቃል 🥹",
    testimonial1Author: "መቅዱስ፣ LA",
    testimonial2Quote: "ልጆቼን በታሪክ አማርኛ ለማስተማር መንገድ አገኘሁ",
    testimonial2Author: "ዳዊት፣ ለንደን",
    testimonial3Quote: "ልጅቴ ስለ አድዋ ታሪክ ተማረች እና ተጨማሪ መማር ፈለገች",
    testimonial3Author: "ሳራ፣ DC",
    pricingHeading: "ቀላል ዋጋ",
    pricingFreeTitle: "ነፃ",
    pricingFreeFeatures: ["በቀን 1 ታሪክ", "ሶስት ቋንቋዎች", "መደበኛ ጥራት ታሪኮች", "ማስቀመጥ የለም"],
    pricingPremiumTitle: "ፕሪሚየም",
    pricingPremiumFeatures: ["ያልተገደበ ታሪኮች", "ሶስት ቋንቋዎች", "ፕሪሚየም ጥራት ታሪኮች (Claude Sonnet)", "ተወዳጆችን አስቀምጥ", "የልጅ መገለጫዎች"],
    pricingCta: "ነፃ ይጀምሩ፣ በማንኛውም ጊዜ ይለግሱ",
    navSignIn: "ግባ",
    navStartFree: "ነፃ ጀምር",
    sampleStoryLabel: "የምሳሌ ታሪክ",
    sampleReadFull: "ሙሉውን አንብብ",
    generateYourOwn: "የራስዎን ይፍጠሩ →",
    globalCapBreak: "አጭር እረፍት እየወሰድን ነው — ነገ እንመለሳለን! 🌙",
    upgradeToSaveStories: "ታሪኮችዎን ለማስቀመጥ ወደ ፕሪሚየም ይለግሱ",
    upgradeForChildProfiles: "የልጅ መገለጫዎችን ለመፍጠር ወደ ፕሪሚየም ይለግሱ",
  },
  en: {
    appTitle: "Teret Teret",
    subtitle: "Learn through stories ✨ Magical tales that teach",
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
    categoryLabel: "What kind of story?",
    categoryOpts: ["Bedtime", "Math", "Science", "History", "Faith", "Language Learning", "Culture & Values"],
    topicLabel: "Topic or concept (optional)",
    topicPlaceholder: "e.g. gravity, multiplication, Battle of Adwa, kindness...",
    storyGoalLabel: "Story goal",
    storyGoalOpts: ["Teach a concept", "Teach a moral", "Teach vocabulary", "Teach history through narrative", "Teach faith or values"],
    whyStoriesTeach: "Stories teach. Learning feels magical.",
    learningTopicsLine: "Bedtime · Math · Science · History · Faith · Language · Culture",
    categorySuggestions: [
      "A gentle story for tonight",
      "Multiplication through a story",
      "Why does gravity pull things down?",
      "The Battle of Adwa for children",
      "A gentle Bible story about courage",
      "Amharic–English vocabulary story",
      "A story about friendship and kindness",
    ],
    generateBtn: "🌙 Tell Me a Story!",
    freeLeft: (n) => `${n} free ${n === 1 ? "story" : "stories"} left`,
    freeLeftToday: (n) => `${n} free ${n === 1 ? "story" : "stories"} left today`,
    limitReached: "You've reached this month's free story limit.",
    limitReachedToday: "You've used your free stories for today.",
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
    paywallTitle: "You've used your free stories",
    paywallSub: "Unlock unlimited magical stories for your little ones. Give them endless bedtime adventures.",
    paywallSubSoon: "Coming soon.",
    paywallPriceSub: "Unlimited · All ages · Cancel anytime",
    paywallPriceUnit: "month",
    paywallSubscribeBtn: "Subscribe Now",
    paywallLaterBtn: "Maybe later",
    paywallValueLine: "Bedtime ritual · Language learning · Family stories · Cultural connection",
    paywallLimitTitle: "You've used your free stories",
    paywallLimitSubtitle: "Unlock unlimited learning and bedtime stories for your family.",
    paywallBenefit1: "Unlimited educational & bedtime stories",
    paywallBenefit2: "Save and revisit favorite stories",
    paywallBenefit3: "Learn language and culture through stories",
    paywallBenefit4: "Access stories on any device",
    paywallUpgradeCta: "Upgrade for $4.99/month",
    paywallMaybeLater: "Maybe later",
    subscriptionSuccessMessage: "Welcome to unlimited Teret.",
    premiumActivating: "Your premium access is being activated...",
    signInToUpgrade: "Sign in to upgrade and keep your stories across devices.",
    planFree: "Free",
    planPremium: "Premium",
    manageSubscription: "Manage subscription",
    upgradeToPremium: "Upgrade to Premium",
    checkoutCancelled: "Checkout cancelled.",
    signInToSubscribe: "Sign in to subscribe.",
    subscriptionComingSoon: "Subscription coming soon.",
    noSubscriptionFound: "No active subscription found. Please subscribe first.",
    unlimitedStories: "Unlimited",
    dailyTeretTitle: "Tonight's Teret",
    dailyTeretSubtitle: "A new story for tonight's learning and bedtime",
    completedTonightTeret: "You completed tonight's Teret",
    streakDays: (n) => (n === 1 ? "1 day" : `${n} days`),
    myLibrary: "My Library",
    favorites: "Favorites",
    allStories: "All",
    levelLabel: "Level",
    xpToNext: (n) => `${n} XP to next level`,
    heroLine: "One story at a time. Learning and bedtime in one place.",
    createStoryHeading: "Create a story that teaches",
    createStorySub: "Choose what to learn, add a name, and get a magical story.",
    readTonightBtn: "Read tonight's story",
    dailyTeretTryAgain: "Today's story is on its way. Try again in a moment.",
    completionComeBack: "Come back tomorrow for another.",
    listenModeTitle: "Listen",
    listenModeSub: "Press play. Close eyes. Let the story carry them to sleep.",
    playBtn: "Play",
    pauseBtn: "Pause",
    restartBtn: "Start over",
    stopBtn: "Stop",
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
    authNotConfiguredTitle: "Account sync is not available yet",
    authNotConfiguredSub: "You can still use Teret-Teret in this browser and save stories locally.",
    authLoading: "Loading...",
    authErrorInvalidLogin: "Email or password is incorrect. Please try again.",
    authErrorWeakPassword: "Password must be at least 6 characters.",
    authErrorDuplicate: "An account with this email already exists. Sign in or use a different email.",
    authErrorEmailNotConfirmed: "Please check your email and confirm your account before signing in.",
    authErrorGeneric: "Something went wrong. Please try again.",
    signUpSuccess: "Check your email to confirm your account, then sign in.",
    forgotPasswordBtn: "Forgot password?",
    forgotPasswordSent: "Check your email for a password reset link.",
    signInSuccess: "Signed in.",
    signOut: "Sign out",
    accountSubtitle: "Sign in to save your favorite stories, track progress, and unlock unlimited Teret for your family.",
    accountBenefit1: "Save stories for bedtime",
    accountBenefit2: "Track language learning progress",
    accountBenefit3: "Access your stories on any device",
    accountGuestNote: "You can use the app as a guest; stories are saved in this browser. Sign in to sync across devices and subscribe for unlimited stories.",
    continueWithGoogle: "Continue with Google",
    shareTeretBtn: "Share this Teret",
    shareTeretTitle: "Tonight's Teret from Teret-Teret 📖",
    shareTeretText: "A magical bedtime story that also teaches language.",
    shareSuccess: "Shared!",
    shareCopied: "Link copied to clipboard",
    regionNames: [
      "Addis Ababa", "Lalibela", "Axum", "Gondar", "Lake Tana",
      "Simien Mountains", "Bale Mountains", "Harar", "Omo Valley", "Kaffa forests",
      "Afar lowlands", "Rift Valley lakes", "Tigray highlands", "Gambella wetlands", "Dire Dawa",
    ],
    defaultRegion: "Ethiopian highlands",
    navAccount: "Account",
    backToApp: "← Back to Teret Teret",
    accountTitle: "Account",
    subscriptionLabel: "Subscription",
    unlimitedStoriesLabel: "stories",
    emailLabel: "Email",
    passwordLabel: "Password",
    signUpBtn: "Sign up",
    signInBtn: "Sign in",
    orSignInWithEmail: "— or sign in with email —",
    alreadyHaveAccount: "Already have an account? Sign in",
    createAccount: "Create an account",
    exportTxtBtn: "📄 Export .txt",
    premiumAudioGate: "Listen to more of this story with Premium.",
    readInsteadBtn: "📖 Read instead",
    upgradeBtn: "Upgrade",
    ttsPauseAria: "Pause",
    ttsResumeAria: "Resume",
    ttsListenAria: "Listen to page",
    errorSaveFailed: "Save failed",
    errorExportFailed: "Export failed",
    errorExported: "Exported!",
    errorNetwork: "Network error. Try again.",
    errorGeneric: "Something went wrong. Please try again.",
    errorTryAgain: "Try again",
    errorCouldNotSaveWord: "Could not save word",
    errorStoryDisplayFailed: "This saved story could not be displayed as pages.",
    copyFailed: "Copy failed",
    langNameAm: "Amharic",
    langNameEn: "English",
    langNameEs: "Spanish",
    listeningActive: "🎙️ Listening...",
    wordsInStory: "🌍 Words in this story",
    wordsSavedLabel: "Words you've saved",
    learningLabel: "Learning:",
    tapSentenceTranslation: "Tap any sentence to see translation",
    noSentencesPage: "No sentences on this page.",
    noVocabYet: "No vocabulary for this story yet.",
    storyForName: (name) => `${name}'s story`,
    removeFavoriteAria: "Remove from favorites",
    addFavoriteAria: "Add to favorites",
    deleteStoryAria: "Delete story",
    openStoryAria: (name) => `Open story for ${name}`,
    storyGoalNone: "—",
    pricePerMonth: "$4.99/month",
    prevPageAria: "Previous page",
    nextPageAria: "Next page",
    finishStoryAria: "Finish story",
    selectLanguageAria: "Select language",
    dailyTeretLoadError: "Could not load today's story.",
    dailyTeretDisplayError: "Story could not be displayed.",
    navMyStories: "My Stories",
    navProfile: "Profile",
    whoIsStoryFor: "Who's the story for?",
    libraryEmptyPrompt: "No stories yet — generate your first tonight 🌙",
    recentlyPlayedTitle: "Recently played",
    statTotalStories: "Stories created",
    statFavoriteLocation: "Favorite place",
    statFavoriteCategory: "Favorite type",
    generationStreakNights: (n) => `${n} nights in a row 🔥`,
    linkToMyStories: "My Stories library →",
    manageChildren: "Child profiles",
    editChild: "Edit",
    deleteChild: "Delete",
    saveChild: "Save",
    cancel: "Cancel",
    selectAvatar: "Choose avatar",
    noneYet: "None yet",
    heroHeadline: "Every child deserves to be the star of their own story",
    heroSubheadline: "Help your child learn Amharic, Ethiopian Culture, and history through personalized bedtime stories",
    ctaCreateFree: "✨ Create a story free",
    ctaSeeExample: "See an example",
    trustTrilingual: "🌍 Trilingual",
    trustEthiopian: "🦁 Ethiopian settings",
    trustChildSafe: "✅ Child safe",
    freeBannerDefault: "1 free story today — no account needed",
    freeBannerOneLeft: "1 free story left today",
    freeBannerUpgrade: "No free stories left today — unlock unlimited",
    tellMeStoryTonight: "✨ Tell me a story tonight!",
    quickNamePlaceholder: "Kasa, Liya, Dawit...",
    customizeStoryToggle: "or customize your story",
    socialProofHeading: "Loved by Ethiopian families worldwide",
    testimonial1Quote: "Kasa asks for Teret Teret every night now 🥹",
    testimonial1Author: "Mekdes, LA",
    testimonial2Quote: "Finally a way to teach my kids Amharic through stories",
    testimonial2Author: "Dawit, London",
    testimonial3Quote: "My daughter learned about the Battle of Adwa and wanted to know more",
    testimonial3Author: "Sara, DC",
    pricingHeading: "Simple pricing",
    pricingFreeTitle: "Free",
    pricingFreeFeatures: ["1 story per day", "All 3 languages", "Standard quality stories", "No saving"],
    pricingPremiumTitle: "Premium",
    pricingPremiumFeatures: ["Unlimited stories", "All 3 languages", "Premium quality stories (Claude Sonnet)", "Save favorites", "Child profiles"],
    pricingCta: "Start free, upgrade anytime",
    navSignIn: "Sign in",
    navStartFree: "Start free",
    sampleStoryLabel: "Sample story",
    sampleReadFull: "Read full story",
    generateYourOwn: "Generate your own →",
    globalCapBreak: "We're taking a short break — check back tomorrow! 🌙",
    upgradeToSaveStories: "Upgrade to Premium to save your stories",
    upgradeForChildProfiles: "Upgrade to Premium to create child profiles",
  },
  es: {
    appTitle: "Teret Teret",
    subtitle: "Aprende con cuentos ✨ Historias mágicas que enseñan",
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
    categoryLabel: "¿Qué tipo de cuento?",
    categoryOpts: ["Para dormir", "Matemáticas", "Ciencia", "Historia", "Fe", "Idiomas", "Cultura y valores"],
    topicLabel: "Tema o concepto (opcional)",
    topicPlaceholder: "ej. gravedad, multiplicación, Batalla de Adwa, bondad...",
    storyGoalLabel: "Objetivo del cuento",
    storyGoalOpts: ["Enseñar un concepto", "Enseñar una moraleja", "Enseñar vocabulario", "Enseñar historia con relato", "Enseñar fe o valores"],
    whyStoriesTeach: "Los cuentos enseñan. Aprender es mágico.",
    learningTopicsLine: "Dormir · Matemáticas · Ciencia · Historia · Fe · Idiomas · Cultura",
    categorySuggestions: [
      "Un cuento suave para esta noche",
      "La multiplicación en un cuento",
      "¿Por qué la gravedad atrae las cosas?",
      "La Batalla de Adwa para niños",
      "Un cuento bíblico sobre el valor",
      "Cuento de vocabulario amárico e inglés",
      "Un cuento sobre amistad y bondad",
    ],
    generateBtn: "🌙 ¡Cuéntame un cuento!",
    freeLeft: (n) =>
      `${n} cuento${n === 1 ? "" : "s"} gratis restante${n === 1 ? "" : "s"}`,
    freeLeftToday: (n) =>
      `${n} cuento${n === 1 ? "" : "s"} gratis hoy`,
    limitReached: "Has llegado al límite gratuito de este mes.",
    limitReachedToday: "Usaste tus cuentos gratis de hoy.",
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
    paywallTitle: "Usaste tus cuentos gratis",
    paywallSub: "Desbloquea cuentos mágicos ilimitados para tus pequeños. Dales aventuras infinitas.",
    paywallSubSoon: "Próximamente.",
    paywallPriceSub: "Ilimitado · Todas edades · Cancela cuando quieras",
    paywallPriceUnit: "mes",
    paywallSubscribeBtn: "Suscribirse ahora",
    paywallLaterBtn: "Quizás luego",
    paywallValueLine: "Rutina de sueño · Aprender idiomas · Cuentos en familia · Conexión cultural",
    paywallLimitTitle: "Usaste tus cuentos gratis",
    paywallLimitSubtitle: "Desbloquea cuentos educativos y para dormir ilimitados para tu familia.",
    paywallBenefit1: "Cuentos educativos y para dormir ilimitados",
    paywallBenefit2: "Guarda y vuelve a tus cuentos favoritos",
    paywallBenefit3: "Aprende idiomas y cultura con los cuentos",
    paywallBenefit4: "Accede a tus cuentos en cualquier dispositivo",
    paywallUpgradeCta: "Suscribirse por $4.99/mes",
    paywallMaybeLater: "Quizás luego",
    subscriptionSuccessMessage: "Bienvenido a Teret ilimitado.",
    premiumActivating: "Tu acceso premium se está activando...",
    signInToUpgrade: "Inicia sesión para mejorar y mantener tus cuentos en todos tus dispositivos.",
    planFree: "Gratis",
    planPremium: "Premium",
    manageSubscription: "Administrar suscripción",
    upgradeToPremium: "Mejorar a Premium",
    checkoutCancelled: "Pago cancelado.",
    signInToSubscribe: "Inicia sesión para suscribirte.",
    subscriptionComingSoon: "Suscripción próximamente.",
    noSubscriptionFound: "No se encontró suscripción activa. Suscríbete primero.",
    unlimitedStories: "Ilimitado",
    dailyTeretTitle: "El Teret de hoy",
    dailyTeretSubtitle: "Un cuento nuevo para aprender y dormir esta noche",
    completedTonightTeret: "Completaste el Teret de hoy",
    streakDays: (n) => (n === 1 ? "1 día" : `${n} días`),
    myLibrary: "Mi biblioteca",
    favorites: "Favoritos",
    allStories: "Todos",
    levelLabel: "Nivel",
    xpToNext: (n) => `${n} XP al siguiente nivel`,
    heroLine: "Un cuento a la vez. Aprendizaje y sueño en un solo lugar.",
    createStoryHeading: "Crea un cuento que enseñe",
    createStorySub: "Elige qué aprender, añade un nombre y recibe un cuento mágico.",
    readTonightBtn: "Leer el cuento de esta noche",
    dailyTeretTryAgain: "El cuento de hoy está en camino. Intenta en un momento.",
    completionComeBack: "Vuelve mañana por otro.",
    listenModeTitle: "Escuchar",
    listenModeSub: "Dale a play. Cierra los ojos. Deja que el cuento los lleve a dormir.",
    playBtn: "Reproducir",
    pauseBtn: "Pausa",
    restartBtn: "Empezar de nuevo",
    stopBtn: "Detener",
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
    authNotConfiguredTitle: "La sincronización de cuenta no está disponible aún",
    authNotConfiguredSub: "Puedes seguir usando Teret-Teret en este navegador y guardar cuentos localmente.",
    authLoading: "Cargando...",
    authErrorInvalidLogin: "El correo o la contraseña no son correctos. Intenta de nuevo.",
    authErrorWeakPassword: "La contraseña debe tener al menos 6 caracteres.",
    authErrorDuplicate: "Ya existe una cuenta con este correo. Inicia sesión o usa otro correo.",
    authErrorEmailNotConfirmed: "Revisa tu correo y confirma tu cuenta antes de iniciar sesión.",
    authErrorGeneric: "Algo salió mal. Intenta de nuevo.",
    signUpSuccess: "Revisa tu correo para confirmar tu cuenta, luego inicia sesión.",
    forgotPasswordBtn: "¿Olvidaste tu contraseña?",
    forgotPasswordSent: "Revisa tu correo para el enlace de restablecimiento.",
    signInSuccess: "Sesión iniciada.",
    signOut: "Cerrar sesión",
    accountSubtitle: "Inicia sesión para guardar tus cuentos favoritos, seguir tu progreso y desbloquear Teret ilimitado para tu familia.",
    accountBenefit1: "Guarda cuentos para la hora de dormir",
    accountBenefit2: "Sigue tu progreso en idiomas",
    accountBenefit3: "Accede a tus cuentos en cualquier dispositivo",
    accountGuestNote: "Puedes usar la app como invitado; los cuentos se guardan en este navegador. Inicia sesión para sincronizar y suscribirte a cuentos ilimitados.",
    continueWithGoogle: "Continuar con Google",
    shareTeretBtn: "Compartir este Teret",
    shareTeretTitle: "El Teret de hoy de Teret-Teret 📖",
    shareTeretText: "Un cuento mágico para dormir que también enseña idiomas.",
    shareSuccess: "¡Compartido!",
    shareCopied: "Enlace copiado",
    regionNames: [
      "Addis Abeba", "Lalibela", "Axum", "Gondar", "Lago Tana",
      "Montañas Simien", "Montañas Bale", "Harar", "Valle del Omo", "Bosques de Kaffa",
      "Tierras bajas de Afar", "Lagos del Valle del Rift", "Tierras altas de Tigray", "Humedales de Gambella", "Dire Dawa",
    ],
    defaultRegion: "Tierras altas de Etiopía",
    navAccount: "Cuenta",
    backToApp: "← Volver a Teret Teret",
    accountTitle: "Cuenta",
    subscriptionLabel: "Suscripción",
    unlimitedStoriesLabel: "cuentos",
    emailLabel: "Correo",
    passwordLabel: "Contraseña",
    signUpBtn: "Registrarse",
    signInBtn: "Iniciar sesión",
    orSignInWithEmail: "— o inicia sesión con correo —",
    alreadyHaveAccount: "¿Ya tienes cuenta? Inicia sesión",
    createAccount: "Crear una cuenta",
    exportTxtBtn: "📄 Exportar .txt",
    premiumAudioGate: "Escucha más de este cuento con Premium.",
    readInsteadBtn: "📖 Leer en su lugar",
    upgradeBtn: "Mejorar plan",
    ttsPauseAria: "Pausar",
    ttsResumeAria: "Reanudar",
    ttsListenAria: "Escuchar página",
    errorSaveFailed: "No se pudo guardar",
    errorExportFailed: "No se pudo exportar",
    errorExported: "¡Exportado!",
    errorNetwork: "Error de red. Intenta de nuevo.",
    errorGeneric: "Algo salió mal. Intenta de nuevo.",
    errorTryAgain: "Intenta de nuevo",
    errorCouldNotSaveWord: "No se pudo guardar la palabra",
    errorStoryDisplayFailed: "Este cuento guardado no se pudo mostrar en páginas.",
    copyFailed: "No se pudo copiar",
    langNameAm: "Amárico",
    langNameEn: "Inglés",
    langNameEs: "Español",
    listeningActive: "🎙️ Escuchando...",
    wordsInStory: "🌍 Palabras en este cuento",
    wordsSavedLabel: "Palabras guardadas",
    learningLabel: "Aprendiendo:",
    tapSentenceTranslation: "Toca cualquier frase para ver la traducción",
    noSentencesPage: "No hay frases en esta página.",
    noVocabYet: "Aún no hay vocabulario para este cuento.",
    storyForName: (name) => `Cuento de ${name}`,
    removeFavoriteAria: "Quitar de favoritos",
    addFavoriteAria: "Añadir a favoritos",
    deleteStoryAria: "Eliminar cuento",
    openStoryAria: (name) => `Abrir cuento de ${name}`,
    storyGoalNone: "—",
    pricePerMonth: "$4.99/mes",
    prevPageAria: "Página anterior",
    nextPageAria: "Página siguiente",
    finishStoryAria: "Terminar cuento",
    selectLanguageAria: "Seleccionar idioma",
    dailyTeretLoadError: "No se pudo cargar el cuento de hoy.",
    dailyTeretDisplayError: "No se pudo mostrar el cuento.",
    navMyStories: "Mis cuentos",
    navProfile: "Perfil",
    whoIsStoryFor: "¿Para quién es el cuento?",
    libraryEmptyPrompt: "Aún no hay cuentos — crea el primero esta noche 🌙",
    recentlyPlayedTitle: "Reproducidos recientemente",
    statTotalStories: "Cuentos creados",
    statFavoriteLocation: "Lugar favorito",
    statFavoriteCategory: "Tipo favorito",
    generationStreakNights: (n) => `${n} noches seguidas 🔥`,
    linkToMyStories: "Biblioteca de cuentos →",
    manageChildren: "Perfiles de niños",
    editChild: "Editar",
    deleteChild: "Eliminar",
    saveChild: "Guardar",
    cancel: "Cancelar",
    selectAvatar: "Elegir avatar",
    noneYet: "Ninguno aún",
    heroHeadline: "Todo niño merece ser la estrella de su propia historia",
    heroSubheadline: "Ayuda a tu hijo a aprender amárico, cultura etíope e historia con cuentos personalizados para dormir",
    ctaCreateFree: "✨ Crear un cuento gratis",
    ctaSeeExample: "Ver un ejemplo",
    trustTrilingual: "🌍 Trilingüe",
    trustEthiopian: "🦁 Escenarios etíopes",
    trustChildSafe: "✅ Seguro para niños",
    freeBannerDefault: "1 cuento gratis hoy — sin cuenta",
    freeBannerOneLeft: "1 cuento gratis queda hoy",
    freeBannerUpgrade: "No quedan cuentos gratis hoy — desbloquea ilimitados",
    tellMeStoryTonight: "✨ ¡Cuéntame un cuento esta noche!",
    quickNamePlaceholder: "Kasa, Liya, Dawit...",
    customizeStoryToggle: "o personaliza tu cuento",
    socialProofHeading: "Amado por familias etíopes en todo el mundo",
    testimonial1Quote: "Kasa pide Teret Teret cada noche 🥹",
    testimonial1Author: "Mekdes, LA",
    testimonial2Quote: "Por fin una forma de enseñar amárico a mis hijos con cuentos",
    testimonial2Author: "Dawit, Londres",
    testimonial3Quote: "Mi hija aprendió sobre la Batalla de Adwa y quiso saber más",
    testimonial3Author: "Sara, DC",
    pricingHeading: "Precios simples",
    pricingFreeTitle: "Gratis",
    pricingFreeFeatures: ["1 cuento al día", "Los 3 idiomas", "Cuentos de calidad estándar", "Sin guardar"],
    pricingPremiumTitle: "Premium",
    pricingPremiumFeatures: ["Cuentos ilimitados", "Los 3 idiomas", "Cuentos premium (Claude Sonnet)", "Guardar favoritos", "Perfiles de niños"],
    pricingCta: "Empieza gratis, mejora cuando quieras",
    navSignIn: "Iniciar sesión",
    navStartFree: "Empezar gratis",
    sampleStoryLabel: "Cuento de ejemplo",
    sampleReadFull: "Leer cuento completo",
    generateYourOwn: "Crea el tuyo →",
    globalCapBreak: "Tomamos un breve descanso — ¡vuelve mañana! 🌙",
    upgradeToSaveStories: "Mejora a Premium para guardar tus cuentos",
    upgradeForChildProfiles: "Mejora a Premium para crear perfiles de niños",
  },
};

/** Type of one language's UI strings. */
export type UITranslations = typeof translations.en;

export function getTranslations(lang: Lang): UITranslations {
  const en = translations.en as Record<string, unknown>;
  const target = (translations[lang] ?? en) as Record<string, unknown>;
  return new Proxy(target, {
    get(_, key: string) {
      const v = target[key] ?? en[key];
      return v !== undefined ? v : key;
    },
  }) as UITranslations;
}

/** @deprecated Use getTranslations — kept for compatibility */
export const getT = getTranslations;

export function getRegionLabel(regionKey: string, lang: Lang): string {
  const t = getTranslations(lang);
  const idx = REGION_KEYS.indexOf(regionKey as (typeof REGION_KEYS)[number]);
  if (idx >= 0) return t.regionNames[idx];
  if (regionKey === "Ethiopian highlands") return t.defaultRegion;
  return regionKey;
}
