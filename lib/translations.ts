import type { Lang } from "@/types";
import { amTranslations } from "./translations/am";

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
    audioLoading: string;
    premiumAudioLabel: string;
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
    guestAudioGate: string;
    signInForNarrationBtn: string;
    ttsDailyLimitReached: string;
    audioUnavailable: string;
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
    storyGenerationUnavailable: string;
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
    navLives: string;
    navBedtimeStories: string;
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
    ctaStartStory: string;
    heroFreeNote: string;
    heroSocialProof: string;
    heroSocialProofEthiopia: string;
    testimonialFeaturedQuoteEthiopia: string;
    testimonialFeaturedAuthorEthiopia: string;
    footerEthiopiaFree: string;
    ethiopiaFreeBadge: string;
    ethiopiaFreePlanLabel: string;
    ctaCreateFree: string;
    ctaListenSample: string;
    formTitle: string;
    formNamePlaceholder: string;
    formSettingLabel: string;
    formTraitLabel: string;
    formCategoryLabel: string;
    formSubmit: string;
    scrollPillHint: string;
    formTraitOpts: string[];
    formCategoryOpts: string[];
    formRegionOpts: string[];
    trustNarration: string;
    trustHeritage: string;
    trustSafe: string;
    testimonialFeaturedQuote: string;
    testimonialFeaturedAuthor: string;
    pricingFreeShort: string;
    pricingPremiumShort: string;
    pricingCancelNote: string;
    finalCtaLine: string;
    footerNoAds: string;
    footerFaqLink: string;
    sampleReadMore: string;
    trustStrip: string;
    problemHeadline: string;
    problemBody: string;
    howItWorksHeadline: string;
    howItWorksSteps: { title: string; sub: string }[];
    howItWorksCta: string;
    sampleHeadline: string;
    samplePlayLabel: string;
    samplePauseLabel: string;
    sampleAmLabel: string;
    sampleEnLabel: string;
    sampleAudioFallback: string;
    sampleLanguageNote: string;
    sampleToggleLabel: string;
    faqHeadline: string;
    faqItems: { q: string; a: string }[];
    finalCtaHeadline: string;
    finalCtaButton: string;
    pricingFreeCardTitle: string;
    pricingPremiumRibbon: string;
    pricingNoCard: string;
    landingGenerateButton: string;
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
    navSignUp: string;
    signupPromptHeadline: (name: string) => string;
    signupPromptSubheadline: string;
    signupPromptBenefit1: string;
    signupPromptBenefit2: string;
    signupPromptBenefit3: string;
    signupPromptEmailLink: string;
    signupPromptDismiss: string;
    navStartFree: string;
    sampleStoryLabel: string;
    sampleReadFull: string;
    generateYourOwn: string;
    globalCapBreak: string;
    upgradeToSaveStories: string;
    upgradeForChildProfiles: string;
    premiumMemberBadge: string;
    premiumBadgeShort: string;
    freeAccountLabel: string;
    upgradeUnlockFeatures: string;
    nextBilling: string;
    currentPlan: string;
    installPromptIos: string;
    installPromptAndroid: string;
    installPromptInstallBtn: string;
    installPromptDismiss: string;
    installPromptAriaLabel: string;
  }
> = {
  am: amTranslations,
  en: {
    appTitle: "Teret Stories",
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
    audioLoading: "Loading narration…",
    premiumAudioLabel: "AI narration",
    premiumAudioNote: "Warm Azure & ElevenLabs voices when you're signed in.",
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
    schoolsSub: "Bring Teret Stories into your classroom. Stories, language, and culture in one place.",
    schoolsOfferHeading: "Classroom storytelling & language learning",
    schoolsOfferBody: "One simple plan for your class. Ethiopian stories, multiple languages, and printable resources. Perfect for cultural studies and bilingual programs.",
    schoolsContactHeading: "Get in touch",
    schoolsContactSub: "Tell us about your class or school. We'll help you get set up.",
    schoolsCta: "I'm interested",
    schoolsFormPlaceholder: "Your name, school, and how you'd like to use Teret Stories",
    authNotConfiguredTitle: "Account sync is not available yet",
    authNotConfiguredSub: "You can still use Teret Stories in this browser and save stories locally.",
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
    accountSubtitle: "Sign in for AI narration, unlimited saves, and your family's story library.",
    accountBenefit1: "1 personalized story per day",
    accountBenefit2: "Premium AI narration in Amharic, English & Spanish",
    accountBenefit3: "Save unlimited stories to your library",
    accountGuestNote: "You can use the app as a guest; stories are saved in this browser only. Sign in for AI narration, cloud saves, and 1 new story per day.",
    continueWithGoogle: "Continue with Google",
    shareTeretBtn: "Share this Teret",
    shareTeretTitle: "Tonight's Teret from Teret Stories 📖",
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
    backToApp: "← Back to Teret Stories",
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
    guestAudioGate: "Sign in to hear the full story with AI narration.",
    signInForNarrationBtn: "Sign in free",
    ttsDailyLimitReached: "Daily audio limit reached. Upgrade to Premium for unlimited.",
    audioUnavailable: "Audio temporarily unavailable. Please try again in a moment.",
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
    storyGenerationUnavailable: "Story creation is busy — please try again in a moment",
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
    navLives: "Lives",
    navBedtimeStories: "Stories",
    navProfile: "Profile",
    whoIsStoryFor: "Who's the story for?",
    libraryEmptyPrompt: "No stories yet — create your first tonight 🌙",
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
    heroHeadline: "Amharic bedtime stories where your child is the hero",
    heroSubheadline:
      "Help your child learn Amharic, fall in love with Ethiopian culture, and look forward to bedtime.",
    ctaStartStory: "✨ Start a story",
    heroFreeNote: "Free · No card needed",
    heroSocialProof: "⭐⭐⭐⭐⭐ Loved by Ethiopian families in LA, DC, London",
    heroSocialProofEthiopia: "⭐⭐⭐⭐⭐ Loved by families in Addis Ababa, Bahir Dar, Hawassa",
    testimonialFeaturedQuoteEthiopia:
      "My daughter asks for a new story every night. She is proud to hear her name in Amharic.",
    testimonialFeaturedAuthorEthiopia: "Hanna, mom of Sara (5) — Addis Ababa",
    footerEthiopiaFree: "Free for families in Ethiopia · No ads, no tracking",
    ethiopiaFreeBadge: "🇪🇹 Free in Ethiopia",
    ethiopiaFreePlanLabel: "Full access — free for families in Ethiopia",
    formTitle: "Who's the story for?",
    formNamePlaceholder: "Type your child's name",
    formSettingLabel: "Where should the story happen?",
    formTraitLabel: "Your child is...",
    formCategoryLabel: "Tonight's story is about...",
    formSubmit: "✨ Make my story",
    scrollPillHint: "drag to see more →",
    formTraitOpts: ["Brave", "Kind", "Curious", "Creative", "Funny", "Adventurous"],
    formCategoryOpts: ["Bedtime", "History", "Science", "Faith", "Culture", "Surprise me"],
    formRegionOpts: ["Simien Mountains", "Lalibela", "Axum", "Lake Tana", "Addis Ababa", "Danakil", "Bale Mountains", "Harar"],
    trustNarration: "Warm AI narration",
    trustHeritage: "Ethiopian heritage",
    trustSafe: "Safe for kids",
    testimonialFeaturedQuote: "My daughter learned 'ሰላም አያቴ' from a story and used it with my mom on FaceTime.",
    testimonialFeaturedAuthor: "Mekdes, mom of Liya (6)",
    pricingFreeShort: "1 story/day + AI narration",
    pricingPremiumShort: "Unlimited stories + profiles",
    pricingCancelNote: "Cancel anytime — one click",
    finalCtaLine: "Bedtime is waiting.",
    footerNoAds: "No ads, no tracking",
    footerFaqLink: "FAQ",
    sampleReadMore: "Read more →",
    ctaCreateFree: "🎁 Create your first story free",
    ctaListenSample: "Listen to a sample →",
    trustStrip: "🦁 Ethiopian heritage · 🎙️ Warm AI narration · 🌙 4-6 minute bedtime stories",
    problemHeadline: "Your child responds in English. You wish they understood Amharic.",
    problemBody: "Every diaspora parent knows the feeling. You speak to them in Amharic. They answer in English. The language is slipping away — and with it, your culture. Teret Stories is built to bring it back, one bedtime story at a time.",
    howItWorksHeadline: "How it works",
    howItWorksSteps: [
      { title: "Enter your child's name and age", sub: "30 seconds" },
      { title: "Pick an Ethiopian setting", sub: "Lalibela, Axum, Simien Mountains, and more" },
      { title: "Get a personalized story in Amharic", sub: "Read aloud with warm AI narration" },
    ],
    howItWorksCta: "🎁 Start your free story →",
    sampleHeadline: "Listen to a story",
    samplePlayLabel: "Play 30-second sample",
    samplePauseLabel: "Pause",
    sampleAmLabel: "Amharic",
    sampleEnLabel: "English",
    sampleAudioFallback: "Sample audio loading soon — read the text above",
    sampleLanguageNote: "Spanish narration also available in the app.",
    sampleToggleLabel: "Sample language",
    faqHeadline: "Common questions",
    faqItems: [
      { q: "Is the Amharic actually good?", a: "Yes — written in natural conversational Amharic, not robotic translation. Listen to the sample above." },
      { q: "What if my child only speaks English?", a: "Stories are created in English too. Many parents use English first, then add Amharic words as the child gets curious." },
      { q: "Can I cancel anytime?", a: "Yes — from your account page, one click, no questions." },
      { q: "Is it safe for kids?", a: "Every story is reviewed for age-appropriate content. No ads, no tracking, no chat features." },
      { q: "How long are the stories?", a: "4–6 pages, about 5 minutes of read-aloud time. Perfect for bedtime." },
    ],
    finalCtaHeadline: "Tonight is one bedtime closer to losing the language. Or starting to save it.",
    finalCtaButton: "🎁 Create your first story free →",
    pricingFreeCardTitle: "Try tonight",
    pricingPremiumRibbon: "Most parents choose this",
    pricingNoCard: "Start free — no card required",
    landingGenerateButton: "🎁 Create story",
    freeBannerDefault: "1 free story today — no account needed",
    freeBannerOneLeft: "1 free story left today",
    freeBannerUpgrade: "No free stories left today — unlock unlimited",
    tellMeStoryTonight: "✨ Tell me a story tonight!",
    quickNamePlaceholder: "Kasa, Liya, Dawit...",
    customizeStoryToggle: "Customize your story",
    socialProofHeading: "Loved by Ethiopian families worldwide",
    testimonial1Quote: "My 6-year-old now asks for her 'Teret' every night. She learned to say 'ሰላም አያቴ' (hello grandma) from a story and used it with my mom on FaceTime. My mom cried.",
    testimonial1Author: "Mekdes B., mother of 2, Los Angeles",
    testimonial2Quote: "We've tried Duolingo, books, classes. Nothing stuck. The first time my son heard his name in an Amharic story he sat up and said 'that's me!' He's hooked.",
    testimonial2Author: "Dawit K., father of 3, London",
    testimonial3Quote: "I was scared my kids wouldn't connect to Ethiopia. Last week my daughter asked who Empress Taytu was — because of a Teret Stories story. This is what I've been looking for.",
    testimonial3Author: "Sara H., mother of 1, Washington DC",
    pricingHeading: "Start free tonight",
    pricingFreeTitle: "Free",
    pricingFreeFeatures: [
      "1 personalized story per day",
      "Premium AI narration in Amharic, English & Spanish",
      "Save unlimited stories to your library",
    ],
    pricingPremiumTitle: "Premium",
    pricingPremiumFeatures: [
      "Unlimited daily stories",
      "Premium AI narration",
      "Up to 4 child profiles",
      "Future language learning features",
    ],
    pricingCta: "Start free →",
    navSignIn: "Sign in",
    navSignUp: "Sign up",
    signupPromptHeadline: (name) => `Save ${name}'s story forever`,
    signupPromptSubheadline:
      "Sign up free to keep this story, create more, and unlock your child's library.",
    signupPromptBenefit1: "Save unlimited stories",
    signupPromptBenefit2: "Premium AI narration in Amharic, English & Spanish",
    signupPromptBenefit3: "Pick up where you left off on any device",
    signupPromptEmailLink: "Or sign up with email",
    signupPromptDismiss: "Maybe later",
    navStartFree: "Start free",
    sampleStoryLabel: "Sample story",
    sampleReadFull: "Read full story",
    generateYourOwn: "Create your own →",
    globalCapBreak: "We're taking a short break — check back tomorrow! 🌙",
    upgradeToSaveStories: "Sign in to save your stories",
    upgradeForChildProfiles: "Upgrade to Premium to create child profiles",
    premiumMemberBadge: "✨ Premium Member",
    premiumBadgeShort: "✨ Premium",
    freeAccountLabel: "Free account",
    upgradeUnlockFeatures: "Upgrade to unlock all features",
    nextBilling: "Next billing",
    currentPlan: "Current plan",
    installPromptIos:
      "Add Teret Stories to your home screen for one-tap bedtime stories ↓ Tap the share icon then 'Add to Home Screen'",
    installPromptAndroid: "Add Teret Stories to your home screen",
    installPromptInstallBtn: "Install",
    installPromptDismiss: "Dismiss",
    installPromptAriaLabel: "Add to home screen instructions",
  },
  es: {
    appTitle: "Teret Stories",
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
    audioLoading: "Cargando narración…",
    premiumAudioLabel: "Narración IA",
    premiumAudioNote: "Voces Azure y ElevenLabs al iniciar sesión.",
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
    schoolsSub: "Lleva Teret Stories a tu clase. Cuentos, idiomas y cultura en un solo lugar.",
    schoolsOfferHeading: "Cuentos y aprendizaje de idiomas en el aula",
    schoolsOfferBody: "Un plan sencillo para tu clase. Cuentos etíopes, varios idiomas y recursos imprimibles. Ideal para estudios culturales y programas bilingües.",
    schoolsContactHeading: "Contacto",
    schoolsContactSub: "Cuéntanos sobre tu clase o colegio. Te ayudamos a empezar.",
    schoolsCta: "Me interesa",
    schoolsFormPlaceholder: "Tu nombre, colegio y cómo te gustaría usar Teret Stories",
    authNotConfiguredTitle: "La sincronización de cuenta no está disponible aún",
    authNotConfiguredSub: "Puedes seguir usando Teret Stories en este navegador y guardar cuentos localmente.",
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
    accountBenefit1: "1 cuento personalizado al día",
    accountBenefit2: "Narración premium en amárico, inglés y español",
    accountBenefit3: "Guarda cuentos ilimitados en tu biblioteca",
    accountGuestNote: "Como invitado, los cuentos solo se guardan en este navegador. Inicia sesión para narración IA, guardar en la nube y 1 cuento nuevo al día.",
    continueWithGoogle: "Continuar con Google",
    shareTeretBtn: "Compartir este Teret",
    shareTeretTitle: "El Teret de hoy de Teret Stories 📖",
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
    backToApp: "← Volver a Teret Stories",
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
    guestAudioGate: "Inicia sesión para escuchar el cuento completo con narración IA.",
    signInForNarrationBtn: "Iniciar sesión gratis",
    ttsDailyLimitReached: "Límite diario de audio alcanzado. Mejora a Premium para ilimitado.",
    audioUnavailable: "Audio no disponible por el momento. Inténtalo de nuevo.",
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
    storyGenerationUnavailable: "La creación de cuentos está ocupada — inténtalo de nuevo en un momento",
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
    navLives: "Vidas",
    navBedtimeStories: "Cuentos",
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
    heroHeadline: "Cuentos de dormir en amárico donde tu hijo es el héroe",
    heroSubheadline:
      "Ayuda a tu hijo a aprender amárico, enamorarse de la cultura etíope y esperar con ilusión la hora de dormir.",
    ctaStartStory: "✨ Empezar un cuento",
    heroFreeNote: "Gratis · Sin tarjeta",
    heroSocialProof: "⭐⭐⭐⭐⭐ Querido por familias etíopes en LA, DC y Londres",
    heroSocialProofEthiopia: "⭐⭐⭐⭐⭐ Querido por familias en Addis Abeba, Bahir Dar y Hawassa",
    testimonialFeaturedQuoteEthiopia:
      "Mi hija pide un cuento nuevo cada noche. Le encanta escuchar su nombre en amárico.",
    testimonialFeaturedAuthorEthiopia: "Hanna, mamá de Sara (5) — Addis Abeba",
    footerEthiopiaFree: "Gratis para familias en Etiopía · Sin anuncios, sin rastreo",
    ethiopiaFreeBadge: "🇪🇹 Gratis en Etiopía",
    ethiopiaFreePlanLabel: "Acceso completo — gratis para familias en Etiopía",
    formTitle: "¿Para quién es el cuento?",
    formNamePlaceholder: "Escribe el nombre de tu hijo",
    formSettingLabel: "¿Dónde ocurre el cuento?",
    formTraitLabel: "Tu hijo es...",
    formCategoryLabel: "El cuento de esta noche trata de...",
    formSubmit: "✨ Crear mi cuento",
    scrollPillHint: "desliza para ver más →",
    formTraitOpts: ["Valiente", "Amable", "Curioso", "Creativo", "Divertido", "Aventurero"],
    formCategoryOpts: ["Para dormir", "Historia", "Ciencia", "Fe", "Cultura", "Sorpresa"],
    formRegionOpts: ["Montañas Simien", "Lalibela", "Axum", "Lago Tana", "Addis Abeba", "Danakil", "Montañas Bale", "Harar"],
    trustNarration: "Narración IA cálida",
    trustHeritage: "Herencia etíope",
    trustSafe: "Seguro para niños",
    testimonialFeaturedQuote: "Mi hija aprendió 'ሰላም አያቴ' de un cuento y lo usó con mi mamá en FaceTime.",
    testimonialFeaturedAuthor: "Mekdes, mamá de Liya (6)",
    pricingFreeShort: "1 cuento/día + narración IA",
    pricingPremiumShort: "Cuentos ilimitados + perfiles",
    pricingCancelNote: "Cancela cuando quieras",
    finalCtaLine: "La hora de dormir te espera.",
    footerNoAds: "Sin anuncios, sin rastreo",
    footerFaqLink: "Preguntas frecuentes",
    sampleReadMore: "Leer más →",
    ctaCreateFree: "🎁 Crea tu primer cuento gratis",
    ctaListenSample: "Escucha una muestra →",
    trustStrip: "🦁 Herencia etíope · 🎙️ Narración IA cálida · 🌙 Cuentos de 4-6 minutos",
    problemHeadline: "Tu hijo responde en inglés. Deseas que entendiera amárico.",
    problemBody: "Todo padre de la diáspora conoce esa sensación. Les hablas en amárico. Responden en inglés. El idioma se escapa — y con él, tu cultura. Teret Stories existe para recuperarlo, un cuento cada noche.",
    howItWorksHeadline: "Cómo funciona",
    howItWorksSteps: [
      { title: "Ingresa el nombre y la edad de tu hijo", sub: "30 segundos" },
      { title: "Elige un escenario etíope", sub: "Lalibela, Axum, montañas Simien y más" },
      { title: "Recibe un cuento personalizado en amárico", sub: "Léelo en voz alta con narración IA cálida" },
    ],
    howItWorksCta: "🎁 Empieza tu cuento gratis →",
    sampleHeadline: "Escucha un cuento",
    samplePlayLabel: "Reproducir muestra de 30 s",
    samplePauseLabel: "Pausar",
    sampleAmLabel: "Amárico",
    sampleEnLabel: "Inglés",
    sampleAudioFallback: "Audio de muestra pronto — lee el texto arriba",
    sampleLanguageNote: "Narración en español también disponible en la app.",
    sampleToggleLabel: "Idioma de la muestra",
    faqHeadline: "Preguntas frecuentes",
    faqItems: [
      { q: "¿El amárico es de verdad bueno?", a: "Sí — escrito en amárico conversacional natural, no traducción robótica. Escucha la muestra arriba." },
      { q: "¿Y si mi hijo solo habla inglés?", a: "Los cuentos también se crean en inglés. Muchos padres empiezan en inglés y añaden palabras en amárico cuando el niño muestra curiosidad." },
      { q: "¿Puedo cancelar cuando quiera?", a: "Sí — desde tu cuenta, un clic, sin preguntas." },
      { q: "¿Es seguro para niños?", a: "Cada cuento es apropiado para su edad. Sin anuncios, sin rastreo, sin chat." },
      { q: "¿Cuánto duran los cuentos?", a: "4–6 páginas, unos 5 minutos de lectura en voz alta. Perfecto para dormir." },
    ],
    finalCtaHeadline: "Esta noche estás un paso más cerca de perder el idioma. O de empezar a salvarlo.",
    finalCtaButton: "🎁 Crea tu primer cuento gratis →",
    pricingFreeCardTitle: "Prueba esta noche",
    pricingPremiumRibbon: "La mayoría elige esto",
    pricingNoCard: "Empieza gratis — sin tarjeta",
    landingGenerateButton: "🎁 Crear cuento",
    freeBannerDefault: "1 cuento gratis hoy — sin cuenta",
    freeBannerOneLeft: "1 cuento gratis queda hoy",
    freeBannerUpgrade: "No quedan cuentos gratis hoy — desbloquea ilimitados",
    tellMeStoryTonight: "✨ ¡Cuéntame un cuento esta noche!",
    quickNamePlaceholder: "Kasa, Liya, Dawit...",
    customizeStoryToggle: "Personaliza tu cuento",
    socialProofHeading: "Amado por familias etíopes en todo el mundo",
    testimonial1Quote: "Mi hija de 6 años pide su «Teret» cada noche. Aprendió «ሰላም አያቴ» en un cuento y se lo dijo a mi mamá por FaceTime. Mi mamá lloró.",
    testimonial1Author: "Mekdes B., madre de 2, Los Ángeles",
    testimonial2Quote: "Probamos Duolingo, libros, clases. Nada funcionó. La primera vez que mi hijo oyó su nombre en un cuento en amárico dijo «¡soy yo!». Enganchado.",
    testimonial2Author: "Dawit K., padre de 3, Londres",
    testimonial3Quote: "Temía que mis hijos no conectaran con Etiopía. La semana pasada mi hija preguntó quién era la emperatriz Taytu — por un cuento de Teret Stories. Esto es lo que buscaba.",
    testimonial3Author: "Sara H., madre de 1, Washington DC",
    pricingHeading: "Empieza gratis esta noche",
    pricingFreeTitle: "Gratis",
    pricingFreeFeatures: [
      "1 cuento personalizado al día",
      "Narración premium en amárico, inglés y español",
      "Guarda cuentos ilimitados en tu biblioteca",
    ],
    pricingPremiumTitle: "Premium",
    pricingPremiumFeatures: [
      "Cuentos ilimitados al día",
      "Narración premium con IA",
      "Hasta 4 perfiles de niños",
      "Futuras funciones de aprendizaje",
    ],
    pricingCta: "Empieza gratis →",
    navSignIn: "Iniciar sesión",
    navSignUp: "Regístrate",
    signupPromptHeadline: (name) => `Guarda el cuento de ${name} para siempre`,
    signupPromptSubheadline:
      "Regístrate gratis para guardar este cuento, crear más y abrir la biblioteca de tu hijo.",
    signupPromptBenefit1: "Guarda cuentos sin límite",
    signupPromptBenefit2: "Narración premium en amárico, inglés y español",
    signupPromptBenefit3: "Sigue donde lo dejaste en cualquier dispositivo",
    signupPromptEmailLink: "O regístrate con correo",
    signupPromptDismiss: "Quizá después",
    navStartFree: "Empezar gratis",
    sampleStoryLabel: "Cuento de ejemplo",
    sampleReadFull: "Leer cuento completo",
    generateYourOwn: "Crea el tuyo →",
    globalCapBreak: "Tomamos un breve descanso — ¡vuelve mañana! 🌙",
    upgradeToSaveStories: "Inicia sesión para guardar tus cuentos",
    upgradeForChildProfiles: "Mejora a Premium para crear perfiles de niños",
    premiumMemberBadge: "✨ Miembro Premium",
    premiumBadgeShort: "✨ Premium",
    freeAccountLabel: "Cuenta gratis",
    upgradeUnlockFeatures: "Mejora para desbloquear todas las funciones",
    nextBilling: "Próximo cobro",
    currentPlan: "Plan actual",
    installPromptIos:
      "Añade Teret Stories a tu pantalla de inicio para cuentos con un toque ↓ Toca compartir y luego «Añadir a pantalla de inicio»",
    installPromptAndroid: "Añade Teret Stories a tu pantalla de inicio",
    installPromptInstallBtn: "Instalar",
    installPromptDismiss: "Cerrar",
    installPromptAriaLabel: "Instrucciones para añadir a la pantalla de inicio",
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
