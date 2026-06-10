/** Landing page sample story — Liya, Addis Ababa, bedtime (~30s narration) */

export const LANDING_SAMPLE_EN = `Once upon a time, in the green hills above Addis Ababa, there lived a little girl named Liya — and she had the bravest heart in all of Ethiopia.
One morning, the smell of buna drifted through her window. Her grandmother was roasting coffee beans, and the air smelled like home.
"Liyé," her grandmother called, "today we are going to the market. But first... we must find the lion who lost his roar."
Liya's eyes grew wide. A lion? Without a roar? She grabbed her shamma, kissed her grandmother on the cheek, and ran out the door — ready for the biggest adventure of her life...`;

export const LANDING_SAMPLE_AM = `ተረት ተረት! በአዲስ አበባ ላይባል ያሉት አረንጓዴ ተራሮች ላይ ልያ የተባለች ትንሽ ልጅ ነበረች። ልቷም በመላው ኢትዮጵያ ከሁሉ ደፋር ነበር።
አንድ ጥዋት የቡና ሽታ በመስኮቷ ተንሸራተተ። አያቷ ቡና እየቀቀለች ነበር፣ አየርም እንደ ቤት የሚሰማ ሽታ ነበረው።
«ልያዬ» አያቷ ጮኸች። «ዛሬ ወደ ገበያ እንሄዳለን። ግን መጀመሪያ… ጩኸቱን የጣች አንበሳውን ማግኘት አለብን።»
የልያዬ አይኖች ሰፉ። አንበሳ? ጩኸት የለውም? ሻማዋን ያዘች፣ አያቷን በጉንጉንዋ ስለ ነቀሰች በርዋን ከፍተው ወጣች — በሕይወቷ ውስጥ ለታሪካዋ ትልቁን ጀብዱ ተዘጋጃች…`;

export type LandingSampleLang = "en" | "am";

export const LANDING_SAMPLE_AUDIO: Record<LandingSampleLang, string> = {
  en: "/sample-story-en.mp3",
  am: "/sample-story-am.mp3",
};

export const LANDING_SAMPLE_TEXT: Record<LandingSampleLang, string> = {
  en: LANDING_SAMPLE_EN,
  am: LANDING_SAMPLE_AM,
};
