import { supabase } from "@/integrations/supabase/client";
import type { BibleVerse, DailyDose, Note } from "@/types/bible";

// Bible queries
export async function fetchBooks(): Promise<string[]> {
  const { data, error } = await supabase
    .from("bible_verses")
    .select("book")
    .order("book");

  if (error) throw error;
  const unique = [...new Set((data || []).map((d: { book: string }) => d.book))];
  return unique;
}

export async function fetchChaptersByBook(book: string): Promise<number[]> {
  const { data, error } = await supabase
    .from("bible_verses")
    .select("chapter")
    .eq("book", book)
    .order("chapter");

  if (error) throw error;
  const unique = [...new Set((data || []).map((d: { chapter: number }) => d.chapter))].sort((a, b) => a - b);
  return unique;
}

export async function fetchVerses(book: string, chapter: number): Promise<BibleVerse[]> {
  const { data, error } = await supabase
    .from("bible_verses")
    .select("*")
    .eq("book", book)
    .eq("chapter", chapter)
    .order("verse");

  if (error) throw error;
  return (data || []) as BibleVerse[];
}

export async function searchVerses(query: string): Promise<BibleVerse[]> {
  // Try exact reference search first (e.g. "John 3:16")
  const refMatch = query.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (refMatch) {
    const [, book, chapter, verse] = refMatch;
    const { data, error } = await supabase
      .from("bible_verses")
      .select("*")
      .ilike("book", `%${book.trim()}%`)
      .eq("chapter", parseInt(chapter))
      .eq("verse", parseInt(verse))
      .limit(20);

    if (error) throw error;
    if (data && data.length > 0) return data as BibleVerse[];
  }

  // Try book + chapter search (e.g. "John 3")
  const chapterMatch = query.match(/^(.+?)\s+(\d+)$/);
  if (chapterMatch) {
    const [, book, chapter] = chapterMatch;
    const { data, error } = await supabase
      .from("bible_verses")
      .select("*")
      .ilike("book", `%${book.trim()}%`)
      .eq("chapter", parseInt(chapter))
      .order("verse")
      .limit(200);

    if (error) throw error;
    if (data && data.length > 0) return data as BibleVerse[];
  }

  // Try book name search (e.g. "Genesis")
  const { data: bookData, error: bookError } = await supabase
    .from("bible_verses")
    .select("*")
    .ilike("book", `%${query}%`)
    .eq("chapter", 1)
    .order("verse")
    .limit(50);

  if (bookError) throw bookError;
  if (bookData && bookData.length > 0) return bookData as BibleVerse[];

  // Keyword search in verse text
  const { data, error } = await supabase
    .from("bible_verses")
    .select("*")
    .ilike("text", `%${query}%`)
    .limit(50);

  if (error) throw error;
  return (data || []) as BibleVerse[];
}

// Daily Dose
export async function fetchDailyDose(): Promise<DailyDose | null> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("daily_dose")
    .select("*")
    .eq("date", today)
    .maybeSingle();

  if (error) throw error;
  return data as DailyDose | null;
}

// Notes
export async function fetchNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Note[];
}

export async function createNote(note: Omit<Note, "id" | "created_at" | "updated_at">): Promise<Note> {
  const { data, error } = await supabase
    .from("notes")
    .insert(note)
    .select()
    .single();

  if (error) throw error;
  return data as Note;
}

export async function updateNote(id: string, note: Partial<Note>): Promise<Note> {
  const { data, error } = await supabase
    .from("notes")
    .update({ ...note, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Note;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw error;
}

export async function transcribeAudio(audioBlob: Blob): Promise<{ text: string }> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');

  const { data, error } = await supabase.functions.invoke('transcribe', {
    body: formData,
  });

  if (error) throw error;
  return data;
}
