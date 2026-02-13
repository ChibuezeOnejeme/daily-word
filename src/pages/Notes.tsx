import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchNotes, createNote, updateNote, deleteNote } from "@/lib/queries";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, LogIn, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { NoteDialog } from "@/components/NoteDialog";
import { AudioRecorder } from "@/components/AudioRecorder";
import { ShareButton } from "@/components/ShareButton";
import { Note } from "@/types/bible";

export default function NotesPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null);

  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({ title: "Note created" });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Failed to create note", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: Partial<Note> }) => updateNote(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setEditingNote(null);
      setIsDialogOpen(false);
      toast({ title: "Note updated" });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Failed to update note", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({ title: "Note deleted" });
    },
  });

  const handleSave = async (noteData: Partial<Note>) => {
    if (editingNote && editingNote.id) {
      await updateMutation.mutateAsync({ id: editingNote.id, note: noteData });
    } else {
      // For create, we need to ensure required fields for DB
      await createMutation.mutateAsync({
        content: noteData.content || "",
        title: noteData.title || null,
        tags: noteData.tags || [],
        user_id: user!.id,
        book: null,
        chapter: null,
        verse: null
      } as any);
    }
  };

  const openNewNote = () => {
    setEditingNote(null);
    setIsDialogOpen(true);
  };

  const openEditNote = (note: Note) => {
    setEditingNote(note);
    setIsDialogOpen(true);
  };

  const handleTranscription = (text: string) => {
    setEditingNote({
      content: text,
      title: "Sermon Transcription",
      tags: ["sermon"],
    });
    setIsDialogOpen(true);
  };

  // Correction: NoteDialog checks `if (note)`.
  // If I pass a dummy note with content, it will treat it as EDIT mode (implies UPDATE).
  // But I want CREATE mode with prefilled content.
  // I should add `initialContent` prop to NoteDialog or update state logic.
  // I'll update NoteDialog to accept `initialValues`.

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-6 max-w-2xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container py-12 max-w-2xl text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Pencil className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Your Spiritual Journal</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sign in to capture your thoughts, prayers, and reflections as you study the Word.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <LogIn className="h-4 w-4" />
            Sign In to Start
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 pb-24 sm:pb-8 max-w-3xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold font-serif text-foreground">Notes</h1>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <AudioRecorder onTranscriptionComplete={handleTranscription} />
            <Button onClick={openNewNote} className="gap-2 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex-1 sm:flex-none">
              <Plus className="h-4 w-4" />
              New Note
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        ) : notes && notes.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {notes.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="glass-card p-5 flex flex-col group relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                    <ShareButton
                      title={note.title || "My Note"}
                      text={note.content}
                      className="h-7 w-7 rounded-full bg-background/50 hover:bg-background"
                      size="icon"
                    />
                    <button
                      onClick={() => openEditNote(note)}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(note.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mb-3">
                    {note.book ? (
                      <Link
                        to={`/bible/${encodeURIComponent(note.book)}/${note.chapter}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/80 text-[10px] font-semibold text-secondary-foreground hover:bg-secondary transition-colors mb-2"
                      >
                        {note.book} {note.chapter}
                        {note.verse ? `:${note.verse}` : ""}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/50 text-[10px] font-semibold text-muted-foreground mb-2">
                        General
                      </span>
                    )}

                    <h3 className="font-serif font-bold text-lg leading-tight line-clamp-1 pr-16">
                      {note.title || (note.content ? note.content.substring(0, 30) + "..." : "Untitled")}
                    </h3>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                    {note.content}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground/60 mt-auto">
                    <span>{new Date(note.created_at).toLocaleDateString()}</span>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex gap-1">
                        {note.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] bg-secondary/50 px-1.5 py-0.5 rounded-sm">#{tag}</span>
                        ))}
                        {note.tags.length > 2 && <span>+{note.tags.length - 2}</span>}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Pencil className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No notes yet</h3>
            <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
              Start capturing your thoughts and prayers today.
            </p>
            <Button onClick={openNewNote} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Note
            </Button>
          </div>
        )}

        <NoteDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          note={editingNote}
          onSave={handleSave}
        />
      </div>
    </Layout>
  );
}
