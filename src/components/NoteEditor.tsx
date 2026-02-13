import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

interface NoteEditorProps {
  initialContent?: string;
  book: string;
  chapter: number;
  verse?: number | null;
  onSave: (content: string) => void;
  onCancel: () => void;
  saving?: boolean;
}

export default function NoteEditor({
  initialContent = "",
  book,
  chapter,
  verse,
  onSave,
  onCancel,
  saving,
}: NoteEditorProps) {
  const [content, setContent] = useState(initialContent);

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {book} {chapter}
          {verse ? `:${verse}` : ""}
        </p>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note..."
        className="min-h-[100px] font-sans text-sm bg-background"
      />
      <div className="flex justify-end">
        <Button
          onClick={() => content.trim() && onSave(content.trim())}
          disabled={!content.trim() || saving}
          size="sm"
        >
          {saving ? "Saving..." : "Save Note"}
        </Button>
      </div>
    </div>
  );
}
