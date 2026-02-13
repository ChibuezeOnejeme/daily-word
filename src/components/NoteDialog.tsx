import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Note } from "@/types/bible";

interface NoteDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    note?: Partial<Note> | null;
    onSave: (note: Partial<Note>) => Promise<void>;
}

export function NoteDialog({ isOpen, onOpenChange, note, onSave }: NoteDialogProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (note) {
            setTitle(note.title || "");
            setContent(note.content || "");
            setTags(note.tags?.join(", ") || "");
        } else {
            setTitle("");
            setContent("");
            setTags("");
        }
    }, [note, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave({
                title,
                content,
                tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save note:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] glass-card border-none">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold font-serif">
                        {note ? "Edit Note" : "New Note"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-muted-foreground">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Note title..."
                            className="glass-input bg-background/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content" className="text-muted-foreground">Content</Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your thoughts..."
                            className="min-h-[150px] glass-input bg-background/50 resize-y"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tags" className="text-muted-foreground">Tags</Label>
                        <Input
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="faith, study, prayer (comma separated)"
                            className="glass-input bg-background/50"
                        />
                    </div>
                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="hover:bg-destructive/10 hover:text-destructive"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            {isSubmitting ? "Saving..." : "Save Note"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
