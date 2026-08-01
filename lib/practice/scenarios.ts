export type PracticeScenarioId =
  | "doctor"
  | "job-interview"
  | "grocery"
  | "phone-call"
  | "neighbor"
  | "free";

export type PracticeScenario = {
  id: PracticeScenarioId;
  titleEn: string;
  titleAm: string;
  descriptionAm: string;
  descriptionEn: string;
  /** Short role brief for the AI partner. */
  partnerBrief: string;
};

export const PRACTICE_SCENARIOS: PracticeScenario[] = [
  {
    id: "doctor",
    titleEn: "At the doctor",
    titleAm: "በክሊኒክ / ሐኪም",
    descriptionAm: "ስለ ሕመምዎ ይናገሩ፣ ጥያቄ ይጠይቁ።",
    descriptionEn: "Talk about symptoms and ask questions.",
    partnerBrief:
      "You are a kind clinic nurse or doctor. Help the patient explain how they feel and answer simply.",
  },
  {
    id: "job-interview",
    titleEn: "A job interview",
    titleAm: "የሥራ ቃለ መጠይቅ",
    descriptionAm: "ስለ ራስዎ እና ልምድዎ በእንግሊዝኛ ይናገሩ።",
    descriptionEn: "Talk about yourself and your experience.",
    partnerBrief:
      "You are a friendly hiring manager. Ask simple interview questions one at a time and respond warmly.",
  },
  {
    id: "grocery",
    titleEn: "At the grocery store",
    titleAm: "በሱቅ / ግሮሰሪ",
    descriptionAm: "ዕቃ ይጠይቁ፣ ዋጋ ይጠይቁ፣ ይግዙ።",
    descriptionEn: "Ask for items, prices, and check out.",
    partnerBrief:
      "You are a helpful grocery store clerk. Help the customer find items and answer price questions.",
  },
  {
    id: "phone-call",
    titleEn: "A phone call",
    titleAm: "በስልክ (ለምሳሌ ስለ ቢል)",
    descriptionAm: "ስለ ቢል ወይም አገልግሎት በስልክ ይደውሉ።",
    descriptionEn: "Call about a bill or service.",
    partnerBrief:
      "You are a calm customer-service agent on the phone. Help with a bill or account question, speak clearly and slowly.",
  },
  {
    id: "neighbor",
    titleEn: "Small talk with a neighbor",
    titleAm: "ከጎረቤት ጋር ውይይት",
    descriptionAm: "ሰላምታ፣ የአየር ሁኔታ፣ ቀላል ውይይት።",
    descriptionEn: "Greetings, weather, light chat.",
    partnerBrief:
      "You are a friendly neighbor. Make warm small talk — weather, weekend, kids, the building. Keep it light.",
  },
  {
    id: "free",
    titleEn: "Free conversation",
    titleAm: "ነጻ ውይይት",
    descriptionAm: "ያለ ልዩ ሁኔታ — በማንኛውም ርዕስ ይለማመዱ።",
    descriptionEn: "No set situation — practice any topic.",
    partnerBrief:
      "You are a warm English conversation partner. Follow the learner's lead on any everyday topic.",
  },
];

export function getPracticeScenario(
  id: string
): PracticeScenario | undefined {
  return PRACTICE_SCENARIOS.find((s) => s.id === id);
}
