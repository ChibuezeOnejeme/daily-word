import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchNotes, updateNote, deleteNote } from "@/lib/queries";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Check, X, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function NotesPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => updateNote(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setEditingId(null);
      toast({ title: "Note updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({ title: "Note deleted" });
    },
  });

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
        <div className="container py-12 max-w-2xl text-center">
          <h1 className="text-2xl font-bold text-foreground mb-3">Your Notes</h1>
          <p className="text-muted-foreground mb-6">Sign in to view and manage your notes.</p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 pb-24 sm:pb-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Your Notes</h1>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : notes && notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <Link
                    to={`/bible/${encodeURIComponent(note.book)}/${note.chapter}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {note.book} {note.chapter}
                    {note.verse ? `:${note.verse}` : ""}
                  </Link>
                  <div className="flex items-center gap-1">
                    {editingId === note.id ? (
                      <>
                        <button
                          onClick={() =>
                            updateMutation.mutate({ id: note.id, content: editContent })
                          }
                          className="p-1 text-primary hover:bg-primary/10 rounded"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-muted-foreground hover:bg-muted rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(note.id);
                            setEditContent(note.content);
                          }}
                          className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(note.id)}
                          className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editingId === note.id ? (
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="text-sm bg-background"
                  />
                ) : (
                  <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
                )}

                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-12">
            No notes yet. Tap on a verse while reading to add one.
          </p>
        )}
      </div>
    </Layout>
  );
}
