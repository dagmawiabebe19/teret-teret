/**
 * Daily Teret: deterministic story for "today" based on date.
 * No API call — same story for everyone on the same day.
 * Scaffolding: push notifications and per-timezone dates can be added later.
 */

function dateSeed(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  return y * 10000 + m * 100 + d;
}

const SETTINGS = [
  "the beautiful Ethiopian highlands",
  "the eucalyptus forests near Addis Ababa",
  "the misty mountains of Lalibela",
  "the shores of Lake Tana",
];

const NAMES = ["Little Star", "Little Star", "Little Star", "Friend"];

export function getDailyStoryForDate(date: Date): string {
  const seed = dateSeed(date);
  const setting = SETTINGS[seed % SETTINGS.length];
  const name = NAMES[seed % NAMES.length];
  return `[AM] ተረት ተረት! ${name} በውብ የኢትዮጵያ ደጋ ነበረ። ፀሐይ ብሩህ ነበረች።
[EN] Teret teret! ${name} was in ${setting}. The sun was bright.
[ES] ¡Teret teret! ${name} estaba en ${setting}. El sol brillaba.

[AM] ${name} አንድ ወዳጅ እንስሳ አገኘች። ወዳጅነት እጅግ ጠቃሚ ነው።
[EN] ${name} met a friendly animal. Friendship is very important.
[ES] ${name} conoció un animal amigable. La amistad es muy importante.

[AM] ${name} በጎ ነገር አደረገች። ሁሉም ደስ አላቸው።
[EN] ${name} did a kind thing. Everyone was happy.
[ES] ${name} hizo algo bueno. Todos estaban contentos.

[AM] ተረቱ ሄደ ዘንቢሉ መጣ። ${name} ጣፋጭ ህልም ይስማት።
[EN] The story went, the basket came. May ${name} have sweet dreams.
[ES] El cuento se fue, la cesta llegó. Que ${name} tenga dulces sueños.`;
}

export function getTodayDateKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
