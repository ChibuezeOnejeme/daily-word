import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua",
  "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings",
  "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job",
  "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah",
  "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
  "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians",
  "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John",
  "3 John", "Jude", "Revelation",
];

// GitHub file names differ from display names for some books
function getGithubFileName(bookName: string): string {
  const mapping: Record<string, string> = {
    "1 Samuel": "1Samuel",
    "2 Samuel": "2Samuel",
    "1 Kings": "1Kings",
    "2 Kings": "2Kings",
    "1 Chronicles": "1Chronicles",
    "2 Chronicles": "2Chronicles",
    "Song of Solomon": "SongofSolomon",
    "1 Corinthians": "1Corinthians",
    "2 Corinthians": "2Corinthians",
    "1 Thessalonians": "1Thessalonians",
    "2 Thessalonians": "2Thessalonians",
    "1 Timothy": "1Timothy",
    "2 Timothy": "2Timothy",
    "1 Peter": "1Peter",
    "2 Peter": "2Peter",
    "1 John": "1John",
    "2 John": "2John",
    "3 John": "3John",
  };
  return mapping[bookName] || bookName;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let startIndex = 0;
  let batchSize = 3;
  try {
    const body = await req.json();
    startIndex = body.startIndex ?? 0;
    batchSize = body.batchSize ?? 3;
  } catch {
    // defaults
  }

  const endIndex = Math.min(startIndex + batchSize, BIBLE_BOOKS.length);
  const booksToProcess = BIBLE_BOOKS.slice(startIndex, endIndex);
  const results: string[] = [];

  for (const bookName of booksToProcess) {
    try {
      const fileName = getGithubFileName(bookName);
      const url = `https://raw.githubusercontent.com/aruljohn/Bible-kjv/master/${fileName}.json`;
      
      const res = await fetch(url);
      if (!res.ok) {
        results.push(`FAIL: ${bookName} - ${res.status} ${res.statusText}`);
        continue;
      }
      
      const data = await res.json();
      const chapters = data.chapters;
      
      if (!chapters || chapters.length === 0) {
        results.push(`EMPTY: ${bookName}`);
        continue;
      }

      let totalVerses = 0;
      
      for (const chapter of chapters) {
        const chapterNum = parseInt(chapter.chapter);
        const verses = chapter.verses.map((v: { verse: string; text: string }) => ({
          book: bookName,
          chapter: chapterNum,
          verse: parseInt(v.verse),
          text: v.text.trim(),
          version: "KJV",
        }));

        const { error } = await supabase.from("bible_verses").upsert(verses, {
          onConflict: "book,chapter,verse,version",
        });
        
        if (error) {
          results.push(`ERR: ${bookName} ch${chapterNum} - ${error.message}`);
        } else {
          totalVerses += verses.length;
        }
      }
      
      results.push(`✓ ${bookName}: ${chapters.length} chapters, ${totalVerses} verses`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push(`EXC: ${bookName} - ${msg}`);
    }
  }

  const done = endIndex >= BIBLE_BOOKS.length;

  return new Response(
    JSON.stringify({
      done,
      processed: booksToProcess,
      nextIndex: done ? null : endIndex,
      totalBooks: BIBLE_BOOKS.length,
      results,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
