import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchVerses, fetchChaptersByBook } from "@/lib/queries";
import Layout from "@/components/Layout";
import VerseList from "@/components/VerseList";
import NoteEditor from "@/components/NoteEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, StickyNote } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createNote } from "@/lib/queries";
import { useToast } from "@/hooks/use-toast";
import type { BibleVerse } from "@/types/bible";

export default function BibleVersesPage() {
  const { book, chapter } = useParams<{ book: string; chapter: string }>();
  const decodedBook = decodeURIComponent(book || "");
  const chapterNum = parseInt(chapter || "1");
  const { user } = useAuth();
  const { toast } = useToast();
  const [noteVerse, setNoteVerse] = useState<BibleVerse | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: verses, isLoading } = useQuery({
    queryKey: ["verses", decodedBook, chapterNum],
    queryFn: () => fetchVerses(decodedBook, chapterNum),
    enabled: !!decodedBook && !isNaN(chapterNum),
  });

  const { data: chapters } = useQuery({
    queryKey: ["chapters", decodedBook],
    queryFn: () => fetchChaptersByBook(decodedBook),
    enabled: !!decodedBook,
  });

  // Save last read
  useEffect(() => {
    if (decodedBook && chapterNum) {
      localStorage.setItem("lastRead", JSON.stringify({ book: decodedBook, chapter: chapterNum }));
    }
  }, [decodedBook, chapterNum]);

  const maxChapter = chapters ? Math.max(...chapters) : chapterNum;
  const hasPrev = chapterNum > 1;
  const hasNext = chapterNum < maxChapter;

  const handleAddNote = async (content: string) => {
    if (!user) return;
    setSaving(true);
    try {
      await createNote({
        user_id: user.id,
        book: decodedBook,
        chapter: chapterNum,
        verse: noteVerse?.verse ?? null,
        content,
      });
      toast({ title: "Note saved" });
      setNoteVerse(null);
    } catch {
      toast({ title: "Failed to save note", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container py-6 pb-24 sm:pb-8 max-w-2xl">
        <Link
          to={`/bible/${encodeURIComponent(decodedBook)}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {decodedBook}
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            {decodedBook} {chapterNum}
          </h1>
          {user && (
            <button
              onClick={() =>
                setNoteVerse({ id: "", book: decodedBook, chapter: chapterNum, verse: 0, text: "", version: "" })
              }
              className="text-sm flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <StickyNote className="h-4 w-4" />
              Add Note
            </button>
          )}
        </div>

        {noteVerse && (
          <div className="mb-6">
            <NoteEditor
              book={decodedBook}
              chapter={chapterNum}
              verse={noteVerse.verse || null}
              onSave={handleAddNote}
              onCancel={() => setNoteVerse(null)}
              saving={saving}
            />
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : verses && verses.length > 0 ? (
          <div className="bg-scripture/50 rounded-xl p-4 sm:p-6">
            <VerseList
              verses={verses}
              onVerseClick={user ? (v) => setNoteVerse(v) : undefined}
            />
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-12">
            No verses found for this chapter.
          </p>
        )}

        {/* Chapter navigation */}
        <div className="flex items-center justify-between mt-8">
          {hasPrev ? (
            <Link
              to={`/bible/${encodeURIComponent(decodedBook)}/${chapterNum - 1}`}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Chapter {chapterNum - 1}
            </Link>
          ) : (
            <div />
          )}
          {hasNext && (
            <Link
              to={`/bible/${encodeURIComponent(decodedBook)}/${chapterNum + 1}`}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Chapter {chapterNum + 1}
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
}
