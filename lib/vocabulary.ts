import type { Lang } from "@/types";
import type { StoryPage } from "@/types";
import type { VocabWord } from "@/types";

/** Common Ethiopian story words with Amharic and Spanish translations. MVP: hardcoded lookup. */
const VOCAB_LOOKUP: Record<string, Omit<VocabWord, "word">> = {
  lion: { translation_am: "አንበሳ", translation_es: "león", exampleSentence: "The lion slept under the tree." },
  fox: { translation_am: "ቀበሮ", translation_es: "zorro", exampleSentence: "The fox was clever and kind." },
  river: { translation_am: "ወንዝ", translation_es: "río", exampleSentence: "They crossed the river together." },
  mountain: { translation_am: "ተራራ", translation_es: "montaña", exampleSentence: "The mountain was tall and green." },
  friend: { translation_am: "ወዳጅ", translation_es: "amigo", exampleSentence: "A good friend helps you." },
  kind: { translation_am: "በጎ", translation_es: "amable", exampleSentence: "She was kind to everyone." },
  brave: { translation_am: "ደፋር", translation_es: "valiente", exampleSentence: "The brave child helped the village." },
  forest: { translation_am: "ጫካ", translation_es: "bosque", exampleSentence: "They walked through the forest." },
  village: { translation_am: "መንደር", translation_es: "pueblo", exampleSentence: "The village was peaceful." },
  star: { translation_am: "ኮከብ", translation_es: "estrella", exampleSentence: "The stars shone at night." },
  moon: { translation_am: "ጨረቃ", translation_es: "luna", exampleSentence: "The moon was full and bright." },
  sun: { translation_am: "ፀሐይ", translation_es: "sol", exampleSentence: "The sun rose over the hills." },
  night: { translation_am: "ሌሊት", translation_es: "noche", exampleSentence: "At night they told stories." },
  morning: { translation_am: "ጠዋት", translation_es: "mañana", exampleSentence: "In the morning they woke early." },
  family: { translation_am: "ቤተሰብ", translation_es: "familia", exampleSentence: "Family loves you always." },
  love: { translation_am: "ፍቅር", translation_es: "amor", exampleSentence: "Love makes us strong." },
  story: { translation_am: "ተረት", translation_es: "cuento", exampleSentence: "The story had a happy ending." },
  wisdom: { translation_am: "ጥበብ", translation_es: "sabiduría", exampleSentence: "The elder shared his wisdom." },
  elder: { translation_am: "ሽማግሌ", translation_es: "anciano", exampleSentence: "The elder told a tale." },
  child: { translation_am: "ልጅ", translation_es: "niño", exampleSentence: "The child smiled with joy." },
  journey: { translation_am: "ጉዞ", translation_es: "viaje", exampleSentence: "The journey was long but fun." },
  home: { translation_am: "ቤት", translation_es: "hogar", exampleSentence: "They went home at dusk." },
  dream: { translation_am: "ህልም", translation_es: "sueño", exampleSentence: "She had a sweet dream." },
  blessing: { translation_am: "ባርከት", translation_es: "bendición", exampleSentence: "The blessing brought peace." },
  hope: { translation_am: "መጽናኛ", translation_es: "esperanza", exampleSentence: "Hope lit the way." },
  tree: { translation_am: "ዛፍ", translation_es: "árbol", exampleSentence: "The tree gave shade." },
  water: { translation_am: "ውሃ", translation_es: "agua", exampleSentence: "The water was cool and clear." },
  bird: { translation_am: "ወፍ", translation_es: "pájaro", exampleSentence: "A bird sang in the tree." },
  animal: { translation_am: "እንስሳ", translation_es: "animal", exampleSentence: "The animal was gentle." },
  bread: { translation_am: "ዳቦ", translation_es: "pan", exampleSentence: "They shared the bread." },
  fire: { translation_am: "እሳት", translation_es: "fuego", exampleSentence: "The fire kept them warm." },
  path: { translation_am: "መንገድ", translation_es: "camino", exampleSentence: "The path led to the village." },
  sky: { translation_am: "ሰማይ", translation_es: "cielo", exampleSentence: "The sky was blue and clear." },
  flower: { translation_am: "አበባ", translation_es: "flor", exampleSentence: "The flower smelled sweet." },
  heart: { translation_am: "ልብ", translation_es: "corazón", exampleSentence: "Her heart was full of joy." },
  mother: { translation_am: "እናት", translation_es: "madre", exampleSentence: "Mother told a bedtime story." },
  father: { translation_am: "አባት", translation_es: "padre", exampleSentence: "Father carried the child." },
  grandmother: { translation_am: "አያት", translation_es: "abuela", exampleSentence: "Grandmother knew many tales." },
  grandfather: { translation_am: "አያት", translation_es: "abuelo", exampleSentence: "Grandfather sat by the fire." },
  king: { translation_am: "ንጉስ", translation_es: "rey", exampleSentence: "The king was wise and fair." },
  queen: { translation_am: "ንግስት", translation_es: "reina", exampleSentence: "The queen was kind to all." },
  prince: { translation_am: "ልዑል", translation_es: "príncipe", exampleSentence: "The prince helped the village." },
  princess: { translation_am: "ልዕልት", translation_es: "princesa", exampleSentence: "The princess loved stories." },
  gift: { translation_am: "ስጦታ", translation_es: "regalo", exampleSentence: "She gave a gift of honey." },
  song: { translation_am: "ዘፈን", translation_es: "canción", exampleSentence: "They sang a song together." },
  dance: { translation_am: "ጭፈራ", translation_es: "danza", exampleSentence: "The children danced with joy." },
  smile: { translation_am: "ፈገግታ", translation_es: "sonrisa", exampleSentence: "Her smile lit the room." },
  tears: { translation_am: "ዕንባ", translation_es: "lágrimas", exampleSentence: "Tears of joy fell down." },
  happy: { translation_am: "ደስ ያለ", translation_es: "feliz", exampleSentence: "They were happy together." },
  sad: { translation_am: "ሳድ", translation_es: "triste", exampleSentence: "No one was sad that day." },
  strong: { translation_am: "ጠንካራ", translation_es: "fuerte", exampleSentence: "The strong lion helped them." },
  gentle: { translation_am: "ርኅራኄ", translation_es: "amable", exampleSentence: "She was gentle with the bird." },
  clever: { translation_am: "ብልጥ", translation_es: "listo", exampleSentence: "The clever fox found a way." },
  wise: { translation_am: "ጥበበኛ", translation_es: "sabio", exampleSentence: "The wise elder spoke." },
  beautiful: { translation_am: "ውብ", translation_es: "hermoso", exampleSentence: "The beautiful moon rose." },
  dark: { translation_am: "ጨለማ", translation_es: "oscuro", exampleSentence: "The dark night was peaceful." },
  bright: { translation_am: "ብሩህ", translation_es: "brillante", exampleSentence: "The bright star shone." },
  cold: { translation_am: "ቅዝቃዜ", translation_es: "frío", exampleSentence: "The cold morning was fresh." },
  warm: { translation_am: "ሞቃታማ", translation_es: "cálido", exampleSentence: "The warm sun felt good." },
  big: { translation_am: "ትልቅ", translation_es: "grande", exampleSentence: "A big tree stood there." },
  small: { translation_am: "ጥቃቅን", translation_es: "pequeño", exampleSentence: "The small bird flew away." },
  old: { translation_am: "አሮጌ", translation_es: "viejo", exampleSentence: "The old village was peaceful." },
  new: { translation_am: "አዲስ", translation_es: "nuevo", exampleSentence: "A new day had come." },
  good: { translation_am: "ጥሩ", translation_es: "bueno", exampleSentence: "Good friends help each other." },
  bad: { translation_am: "መጥፎ", translation_es: "malo", exampleSentence: "Nothing bad happened." },
  help: { translation_am: "ርዳታ", translation_es: "ayuda", exampleSentence: "They came to help." },
  share: { translation_am: "ማጋራት", translation_es: "compartir", exampleSentence: "We share what we have." },
  give: { translation_am: "መስጠት", translation_es: "dar", exampleSentence: "Give with a kind heart." },
  eat: { translation_am: "መብላት", translation_es: "comer", exampleSentence: "They ate together." },
  drink: { translation_am: "መጠጣት", translation_es: "beber", exampleSentence: "Drink the cool water." },
  sleep: { translation_am: "መኝታ", translation_es: "dormir", exampleSentence: "Time to sleep now." },
  walk: { translation_am: "መራራት", translation_es: "caminar", exampleSentence: "They walked home slowly." },
  run: { translation_am: "መሮጥ", translation_es: "correr", exampleSentence: "The child ran with joy." },
  fly: { translation_am: "መብረር", translation_es: "volar", exampleSentence: "Birds fly in the sky." },
  come: { translation_am: "መምጣት", translation_es: "venir", exampleSentence: "Come and sit with us." },
  go: { translation_am: "መሄድ", translation_es: "ir", exampleSentence: "They had to go home." },
  see: { translation_am: "ማየት", translation_es: "ver", exampleSentence: "She saw the stars." },
  hear: { translation_am: "ማስተዋል", translation_es: "oir", exampleSentence: "We heard the story." },
  say: { translation_am: "ማለት", translation_es: "decir", exampleSentence: "He said thank you." },
  ask: { translation_am: "መጠየቅ", translation_es: "preguntar", exampleSentence: "She asked a question." },
  answer: { translation_am: "መልስ", translation_es: "respuesta", exampleSentence: "The answer was kind." },
  door: { translation_am: "በር", translation_es: "puerta", exampleSentence: "The door was open." },
  window: { translation_am: "መስኮት", translation_es: "ventana", exampleSentence: "Light came through the window." },
  bed: { translation_am: "አልጋ", translation_es: "cama", exampleSentence: "The bed was soft." },
  blanket: { translation_am: "ጨርቅ", translation_es: "manta", exampleSentence: "The blanket kept her warm." },
  honey: { translation_am: "ማር", translation_es: "miel", exampleSentence: "The honey was sweet." },
  milk: { translation_am: "ወተት", translation_es: "leche", exampleSentence: "They drank fresh milk." },
  injera: { translation_am: "እንጀራ", translation_es: "injera", exampleSentence: "Injera is soft and round." },
  coffee: { translation_am: "ቡና", translation_es: "café", exampleSentence: "Coffee brought everyone together." },
  basket: { translation_am: "ጣሪያ", translation_es: "canasta", exampleSentence: "The basket was full." },
  lamp: { translation_am: "መብራት", translation_es: "lámpara", exampleSentence: "The lamp lit the room." },
  book: { translation_am: "መጽሐፍ", translation_es: "libro", exampleSentence: "The book had many stories." },
  bridge: { translation_am: "ድልድል", translation_es: "puente", exampleSentence: "They crossed the bridge." },
  cave: { translation_am: "ጉድጓድ", translation_es: "cueva", exampleSentence: "The cave was safe and dry." },
  wolf: { translation_am: "ተኩላ", translation_es: "lobo", exampleSentence: "The wolf was gentle in the tale." },
  hyena: { translation_am: "ጅብ", translation_es: "hiena", exampleSentence: "The hyena laughed in the story." },
  sheep: { translation_am: "በግ", translation_es: "oveja", exampleSentence: "The sheep grazed on the hill." },
  goat: { translation_am: "ፍየል", translation_es: "cabra", exampleSentence: "The goat climbed the rocks." },
  horse: { translation_am: "ፈረስ", translation_es: "caballo", exampleSentence: "The horse ran fast." },
  donkey: { translation_am: "አህያ", translation_es: "burro", exampleSentence: "The donkey carried the load." },
  snake: { translation_am: "እባብ", translation_es: "serpiente", exampleSentence: "The snake was not harmful." },
  fish: { translation_am: "ዓሣ", translation_es: "pez", exampleSentence: "The fish swam in the river." },
  butterfly: { translation_am: "ቢራቢሮ", translation_es: "mariposa", exampleSentence: "A butterfly landed on the flower." },
  bee: { translation_am: "ንቦ", translation_es: "abeja", exampleSentence: "The bee made sweet honey." },
  rain: { translation_am: "ዝናብ", translation_es: "lluvia", exampleSentence: "The rain made the land green." },
  wind: { translation_am: "ነፋስ", translation_es: "viento", exampleSentence: "The wind was cool." },
  cloud: { translation_am: "ደመና", translation_es: "nube", exampleSentence: "White clouds filled the sky." },
  rainbow: { translation_am: "ቀስተ ደመና", translation_es: "arcoíris", exampleSentence: "A rainbow appeared after rain." },
  stone: { translation_am: "ድንጋይ", translation_es: "piedra", exampleSentence: "They sat on a flat stone." },
  grass: { translation_am: "ገረብ", translation_es: "hierba", exampleSentence: "The grass was soft and green." },
  seed: { translation_am: "ዘር", translation_es: "semilla", exampleSentence: "She planted a seed." },
  harvest: { translation_am: "ማጨድ", translation_es: "cosecha", exampleSentence: "The harvest was good." },
  feast: { translation_am: "ጭብጨባ", translation_es: "fiesta", exampleSentence: "The whole village had a feast." },
  prayer: { translation_am: "ጸሎት", translation_es: "oración", exampleSentence: "They said a prayer of thanks." },
  peace: { translation_am: "ሰላም", translation_es: "paz", exampleSentence: "Peace filled the village." },
  joy: { translation_am: "ደስታ", translation_es: "alegría", exampleSentence: "Joy was in every heart." },
  courage: { translation_am: "እርካም", translation_es: "valor", exampleSentence: "Courage helped them succeed." },
  truth: { translation_am: "እውነት", translation_es: "verdad", exampleSentence: "The truth set them free." },
  promise: { translation_am: "ቃል መግባት", translation_es: "promesa", exampleSentence: "She kept her promise." },
  secret: { translation_am: "ምስጢር", translation_es: "secreto", exampleSentence: "The secret was safe." },
  magic: { translation_am: "ድግም", translation_es: "magia", exampleSentence: "A little magic helped." },
  treasure: { translation_am: "ድርሻ", translation_es: "tesoro", exampleSentence: "The treasure was friendship." },
};

const SKIP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
  "will", "would", "could", "should", "may", "might", "must", "shall", "can", "need", "dare", "to", "of", "in",
  "for", "on", "with", "at", "by", "from", "as", "into", "through", "during", "before", "after", "above", "below",
  "and", "but", "or", "nor", "so", "yet", "it", "its", "this", "that", "these", "those", "he", "she", "they", "we", "i", "you",
  "his", "her", "their", "our", "my", "your", "him", "them", "us", "me",
]);

/** Simple heuristic: extract 2–3 meaningful (noun/adjective-like) words per page from English text. */
export function extractKeyWords(englishPageTexts: string[]): VocabWord[] {
  const seen = new Set<string>();
  const result: VocabWord[] = [];

  for (const pageText of englishPageTexts) {
    const words = pageText
      .toLowerCase()
      .replace(/[.!?,;:'"()]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !SKIP_WORDS.has(w));

    let picked = 0;
    const maxPerPage = 2;
    for (const w of words) {
      if (picked >= maxPerPage) break;
      const normalized = w.replace(/ed$/, "").replace(/ing$/, "").replace(/s$/, "") || w;
      const key = normalized in VOCAB_LOOKUP ? normalized : w;
      if (key in VOCAB_LOOKUP && !seen.has(key)) {
        seen.add(key);
        result.push({ word: key, ...VOCAB_LOOKUP[key] });
        picked++;
      }
    }
  }

  return result;
}

/** Get vocabulary for a story: use pre-extracted vocabulary if present, else extract from pages (English). Max 8. */
export function getVocabForStory(
  pages: StoryPage[],
  _lang: Lang
): VocabWord[] {
  const englishTexts = pages.map((p) => p.en || p.am || "").filter(Boolean);
  const extracted = extractKeyWords(englishTexts);
  return extracted.slice(0, 8);
}
