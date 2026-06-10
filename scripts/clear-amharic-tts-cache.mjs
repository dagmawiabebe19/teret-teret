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

async function listAllAmFiles() {
  const all = [];
  let offset = 0;
  const limit = 1000;
  for (;;) {
    const { data: files, error } = await supabase.storage.from("tts-cache").list("am", {
      limit,
      offset,
    });
    if (error) throw error;
    if (!files?.length) break;
    for (const f of files) {
      if (f.name) all.push(`am/${f.name}`);
    }
    if (files.length < limit) break;
    offset += limit;
  }
  return all;
}

async function main() {
  let paths;
  try {
    paths = await listAllAmFiles();
  } catch (err) {
    console.error("List failed:", err.message || err);
    process.exit(1);
  }
  if (!paths.length) {
    console.log("No files under tts-cache/am/");
    return;
  }
  const batchSize = 100;
  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize);
    const { error: removeError } = await supabase.storage.from("tts-cache").remove(batch);
    if (removeError) {
      console.error("Remove failed:", removeError.message);
      process.exit(1);
    }
  }
  console.log(`Deleted ${paths.length} file(s) from tts-cache/am/`);
}

main();
