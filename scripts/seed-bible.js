import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://vcdkujczzecjhdhyaedv.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjZGt1amN6emVjamhkaHlhZWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMDcwOTcsImV4cCI6MjA4NjU4MzA5N30.hY6dgNyne63segAphDR2tyuV_NFQ-bAHmoLBP65k-uQ";

console.log("Initializing Supabase client...");
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BIBLE_BOOKS = [
    { name: "Genesis", chapters: 50 }, { name: "Exodus", chapters: 40 }, { name: "Leviticus", chapters: 27 },
    { name: "Numbers", chapters: 36 }, { name: "Deuteronomy", chapters: 34 }, { name: "Joshua", chapters: 24 },
    { name: "Judges", chapters: 21 }, { name: "Ruth", chapters: 4 }, { name: "1 Samuel", chapters: 31 },
    { name: "2 Samuel", chapters: 24 }, { name: "1 Kings", chapters: 22 }, { name: "2 Kings", chapters: 25 },
    { name: "1 Chronicles", chapters: 29 }, { name: "2 Chronicles", chapters: 36 }, { name: "Ezra", chapters: 10 },
    { name: "Nehemiah", chapters: 13 }, { name: "Esther", chapters: 10 }, { name: "Job", chapters: 42 },
    { name: "Psalms", chapters: 150 }, { name: "Proverbs", chapters: 31 }, { name: "Ecclesiastes", chapters: 12 },
    { name: "Song of Solomon", chapters: 8 }, { name: "Isaiah", chapters: 66 }, { name: "Jeremiah", chapters: 52 },
    { name: "Lamentations", chapters: 5 }, { name: "Ezekiel", chapters: 48 }, { name: "Daniel", chapters: 12 },
    { name: "Hosea", chapters: 14 }, { name: "Joel", chapters: 3 }, { name: "Amos", chapters: 9 },
    { name: "Obadiah", chapters: 1 }, { name: "Jonah", chapters: 4 }, { name: "Micah", chapters: 7 },
    { name: "Nahum", chapters: 3 }, { name: "Habakkuk", chapters: 3 }, { name: "Zephaniah", chapters: 3 },
    { name: "Haggai", chapters: 2 }, { name: "Zechariah", chapters: 14 }, { name: "Malachi", chapters: 4 },
    { name: "Matthew", chapters: 28 }, { name: "Mark", chapters: 16 }, { name: "Luke", chapters: 24 },
    { name: "John", chapters: 21 }, { name: "Acts", chapters: 28 }, { name: "Romans", chapters: 16 },
    { name: "1 Corinthians", chapters: 16 }, { name: "2 Corinthians", chapters: 13 }, { name: "Galatians", chapters: 6 },
    { name: "Ephesians", chapters: 6 }, { name: "Philippians", chapters: 4 }, { name: "Colossians", chapters: 4 },
    { name: "1 Thessalonians", chapters: 5 }, { name: "2 Thessalonians", chapters: 3 }, { name: "1 Timothy", chapters: 6 },
    { name: "2 Timothy", chapters: 4 }, { name: "Titus", chapters: 3 }, { name: "Philemon", chapters: 1 },
    { name: "Hebrews", chapters: 13 }, { name: "James", chapters: 5 }, { name: "1 Peter", chapters: 5 },
    { name: "2 Peter", chapters: 3 }, { name: "1 John", chapters: 5 }, { name: "2 John", chapters: 1 },
    { name: "3 John", chapters: 1 }, { name: "Jude", chapters: 1 }, { name: "Revelation", chapters: 22 }
];

async function seedBible () {
    console.log("Starting full Bible seeding from bible-api.com...");

    for (const book of BIBLE_BOOKS) {
        console.log(`Processing ${book.name} (${book.chapters} chapters)...`);

        for (let i = 1; i <= book.chapters; i++) {
            try {
                // Check if chapter already exists to skip (simple optimization)
                // const { count } = await supabase.from("bible_verses").select("*", { count: "exact", head: true }).eq("book", book.name).eq("chapter", i);
                // if (count && count > 0) {
                //    process.stdout.write(`.`);
                //    continue;
                // }

                const res = await fetch(`https://bible-api.com/${encodeURIComponent(book.name)}+${i}?translation=kjv`);
                if (!res.ok) {
                    console.error(`\nFailed to fetch ${book.name} ${i}: ${res.statusText}`);
                    continue;
                }
                const data = await res.json();

                const verses = data.verses.map(v => ({
                    book: book.name,
                    chapter: i,
                    verse: v.verse,
                    text: v.text.trim(),
                    version: "KJV"
                }));

                const { error } = await supabase.from("bible_verses").insert(verses);
                if (error) console.error(`\nError inserting ${book.name} ${i}:`, error.message);
                else process.stdout.write(`.`); // minimal output

            } catch (e) {
                console.error(`\nException for ${book.name} ${i}`, e.message);
            }
            // Small delay to be nice to the API
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        console.log(`\nFinished ${book.name}`);
    }
    console.log("\nFull Bible seeding complete.");
}

seedBible();
