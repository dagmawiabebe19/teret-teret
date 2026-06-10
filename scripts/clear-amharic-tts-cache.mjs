/**
 * Delete all cached Amharic TTS files from Supabase Storage (tts-cache/am/).
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage: node scripts/clear-amharic-tts-cache.mjs
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const { data: files, error: listError } = await supabase.storage.from("tts-cache").list("am", {
    limit: 1000,
  });
  if (listError) {
    console.error("List failed:", listError.message);
    process.exit(1);
  }
  if (!files?.length) {
    console.log("No files under tts-cache/am/");
    return;
  }
  const paths = files.map((f) => `am/${f.name}`);
  const { error: removeError } = await supabase.storage.from("tts-cache").remove(paths);
  if (removeError) {
    console.error("Remove failed:", removeError.message);
    process.exit(1);
  }
  console.log(`Deleted ${paths.length} file(s) from tts-cache/am/`);
}

main();
