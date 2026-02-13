import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchVerses, fetchChaptersByBook } from "@/lib/queries";
import Layout from "@/components/Layout";
import VerseList from "@/components/VerseList";
import NoteEditor from "@/components/NoteEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, StickyNote, Share2, X, Copy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createNote } from "@/lib/queries";
import { useToast } from "@/hooks/use-toast";
import type { BibleVerse } from "@/types/bible";
import { ShareButton } from "@/components/ShareButton";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function BibleVersesPage() {
  const { book, chapter } = useParams<{ book: string; chapter: string }>();
  const decodedBook = decodeURIComponent(book || "");
  const chapterNum = parseInt(chapter || "1");
  const { user } = useAuth();
  const { toast } = useToast();
  // We keep noteVerse for the single-click legacy flow if no selection, OR for the note editor context
  const [noteVerse, setNoteVerse] = useState<BibleVerse | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<string[]>([]);

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

  // Clear selection when changing chapter
  useEffect(() => {
    setSelectedVerses([]);
    setNoteVerse(null);
  }, [decodedBook, chapterNum]);

  const maxChapter = chapters ? Math.max(...chapters) : chapterNum;
  const hasPrev = chapterNum > 1;
  const hasNext = chapterNum < maxChapter;

  const handleVerseSelect = (verse: BibleVerse) => {
    if (noteVerse) return; // Don't select if note editor is open

    setSelectedVerses(prev => {
      const isSelected = prev.includes(verse.id);
      if (isSelected) {
        return prev.filter(id => id !== verse.id);
      } else {
        return [...prev, verse.id];
      }
    });
  };

  const getSelectedVerseObjects = () => {
    if (!verses) return [];
    return verses.filter(v => selectedVerses.includes(v.id)).sort((a, b) => a.verse - b.verse);
  };

  const handleAddNote = async (content: string) => {
    if (!user) return;
    setSaving(true);
    try {
      // If we have selected verses, we might want to link to the first one or store the range.
      // For now, we link to the primary verse (first selected or clicked)
      // If noteVerse is set (editor mode), use that.
      // If noteVerse is NOT set but we have selection, use the first selected verse.

      const targetVerse = noteVerse || getSelectedVerseObjects()[0];
      const verseNum = targetVerse?.verse ?? null;

      // We could append all selected verse texts to the content if it's new?
      // For now, just link to the chapter/book

      await createNote({
        user_id: user.id,
        book: decodedBook,
        chapter: chapterNum,
        verse: verseNum,
        content,
        title: null,
        tags: [],
      });
      toast({ title: "Note saved" });
      setNoteVerse(null);
      setSelectedVerses([]);
    } catch {
      toast({ title: "Failed to save note", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    const selected = getSelectedVerseObjects();
    if (selected.length === 0) return;

    const textToCopy = selected.map(v => `[${v.verse}] ${v.text}`).join("\n");
    const ref = `${decodedBook} ${chapterNum}:${selected.map(v => v.verse).join(",")}`;
    const fullText = `${textToCopy}\n\n${ref}`;

    try {
      await navigator.clipboard.writeText(fullText);
      toast({ title: "Verses copied to clipboard" });
      setSelectedVerses([]);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="container py-6 pb-32 sm:pb-8 max-w-2xl relative">
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
          <div className="flex items-center gap-2">
            <ShareButton
              title={`${decodedBook} ${chapterNum}`}
              text={`Read ${decodedBook} ${chapterNum} on Daily Word.`}
              size="sm"
              className="rounded-full"
            />
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
        </div>

        {noteVerse ? (
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
        ) : null}

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : verses && verses.length > 0 ? (
          <div className="glass-card p-5 sm:p-7 select-none">
            <VerseList
              verses={verses}
              selectedVerses={selectedVerses}
              onVerseSelect={handleVerseSelect}
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

        {/* Selection Action Bar */}
        <AnimatePresence>
          {selectedVerses.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }} // Smooth exit animation
              className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 glass-nav px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-primary/20"
            >
              <span className="text-sm font-semibold text-primary pl-1 pr-2 border-r border-border">
                {selectedVerses.length} selected
              </span>

              <Button size="icon" variant="ghost" onClick={handleCopy} className="rounded-full hover:bg-primary/10 hover:text-primary">
                <Copy className="h-4 w-4" />
              </Button>

              <ShareButton
                title={`${decodedBook} ${chapterNum}`}
                text={getSelectedVerseObjects().map(v => `[${v.verse}] ${v.text}`).join("\n")}
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-primary/10 hover:text-primary"
              />

              {user && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setNoteVerse(getSelectedVerseObjects()[0])}
                  className="rounded-full hover:bg-primary/10 hover:text-primary"
                >
                  <StickyNote className="h-4 w-4" />
                </Button>
              )}

              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedVerses([])}
                className="rounded-full hover:bg-destructive/10 hover:text-destructive ml-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
