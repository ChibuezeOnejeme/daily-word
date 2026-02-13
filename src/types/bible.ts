export interface BibleVerse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  version: string;
}

export interface DailyDose {
  id: string;
  date: string;
  book: string;
  chapter: number;
  verse: number;
  message: string;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  book: string | null;
  chapter: number | null;
  verse: number | null;
  content: string;
  title: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string | null;
}

export interface LastRead {
  book: string;
  chapter: number;
}

export const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
  "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel",
  "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
  "Ephesians", "Philippians", "Colossians",
  "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy",
  "Titus", "Philemon", "Hebrews", "James",
  "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation",
];

export const OLD_TESTAMENT = BIBLE_BOOKS.slice(0, 39);
export const NEW_TESTAMENT = BIBLE_BOOKS.slice(39);
