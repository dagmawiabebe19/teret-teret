/** Landing page sample story — Liya, Addis Ababa, bedtime (~30s narration) */

export const LANDING_SAMPLE_EN = `Once upon a time, in the green hills above Addis Ababa, there lived a little girl named Liya — and she had the bravest heart in all of Ethiopia.
One morning, the smell of buna drifted through her window. Her grandmother was roasting coffee beans, and the air smelled like home.
"Liyé," her grandmother called, "today we are going to the market. But first... we must find the lion who lost his roar."
Liya's eyes grew wide. A lion? Without a roar? She grabbed her shamma, kissed her grandmother on the cheek, and ran out the door — ready for the biggest adventure of her life...`;

export const LANDING_SAMPLE_AM = `ተረት ተረት! በአዲስ አበባ ላይያ ያሉ አረንጓዴ ተራሮች ላይ ልያ የሰሚ ውለውል ልጅ ነበረች። ልቧ በመላ ኢትዮጵያ ከሁሉም ደፋር ነበረች።
አንድ ጥዋት የቡና ሽታ ባለቀ እና በመስኮቷ ወደ ውስጥ ገባ። አያቷ ቡና እያቀቀለች ነበር፣ አየሩም እንደ ቤት ሽታ ነበረው።
«ልያዬ» አያቷ ተጮኸች። «ዛሬ ወደ ገበያ እንሄዳለን። ግን መጀመሪያ አንበሳውን እናገኛለን። ጩኸቱን ካጣ አንበሳ።»
የልያዬ አይኖች ሰፉ። አንበሳ? ጩኸት የለውም? ሻማዋን ይዛ አያቷን በጉንጉንዋ ስላተኩሰች በሩን ከፍተው ወጣች። በሕይወቷ ውስጥ ለታሪካ ያለው ትልቅ ጀብዱ ጀመረ…`;

export type LandingSampleLang = "en" | "am";

export const LANDING_SAMPLE_AUDIO: Record<LandingSampleLang, string> = {
  en: "/sample-story-en.mp3",
  am: "/sample-story-am.mp3",
};

export const LANDING_SAMPLE_TEXT: Record<LandingSampleLang, string> = {
  en: LANDING_SAMPLE_EN,
  am: LANDING_SAMPLE_AM,
};

/** Short preview shown before "Read more" */
export const LANDING_SAMPLE_PREVIEW: Record<LandingSampleLang, string> = {
  en: `Once upon a time, in the green hills above Addis Ababa, there lived a little girl named Liya — and she had the bravest heart in all of Ethiopia.
One morning, the smell of buna drifted through her window.`,
  am: `ተረት ተረት! በአዲስ አበባ ላይያ ያሉ አረንጓዴ ተራሮች ላይ ልያ የሰሚ ውለውል ልጅ ነበረች። ልቧ በመላ ኢትዮጵያ ከሁሉም ደፋር ነበረች።
አንድ ጥዋት የቡና ሽታ ባለቀ እና በመስኮቷ ወደ ውስጥ ገባ።`,
};
