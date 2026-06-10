import type { StoryPage } from "@/types";

/** Hardcoded sample for "See an example" — Kasa, 6, Simien Mountains, bedtime */
export const SAMPLE_STORY_RAW = `[AM] ተረት ተረት! ካሳ በስሜን ተራሮች ላይ ነበረች። ጸሐይም በረፍ ላይ ብሩህ ነበረች።
[EN] Teret teret! Kasa was in the Simien Mountains. The sun was bright over the misty cliffs.
[ES] ¡Teret teret! Kasa estaba en las montañas Simien. El sol brillaba sobre los acantilados.

[AM] ካሳ ውብ የጄላዳ ቤተሰብ አየች። በጎ ነበረችና ለእንስሳቱ ውሃ አመጣች።
[EN] Kasa saw a beautiful gelada family. She was kind and brought water for the animals.
[ES] Kasa vio una hermosa familia de geladas. Fue amable y trajo agua para los animales.`;

export const SAMPLE_STORY_PAGES: StoryPage[] = [
  {
    am: "ተረት ተረት! ካሳ በስሜን ተራሮች ላይ ነበረች። ጸሐይም በረፍ ላይ ብሩህ ነበረች።",
    en: "Teret teret! Kasa was in the Simien Mountains. The sun was bright over the misty cliffs.",
    es: "¡Teret teret! Kasa estaba en las montañas Simien. El sol brillaba sobre los acantilados.",
  },
  {
    am: "ካሳ ውብ የጄላዳ ቤተሰብ አየች። በጎ ነበረችና ለእንስሳቱ ውሃ አመጣች።",
    en: "Kasa saw a beautiful gelada family. She was kind and brought water for the animals.",
    es: "Kasa vio una hermosa familia de geladas. Fue amable y trajo agua para los animales.",
  },
];

export const SAMPLE_CHILD_NAME = "Kasa";
export const SAMPLE_REGION = "Simien Mountains";
