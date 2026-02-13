import type { BibleVerse } from "@/types/bible";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VerseListProps {
  verses: BibleVerse[];
  selectedVerses?: string[];
  onVerseSelect?: (verse: BibleVerse) => void;
}

export default function VerseList({ verses, selectedVerses = [], onVerseSelect }: VerseListProps) {
  return (
    <div className="space-y-1">
      {verses.map((verse, i) => {
        const isSelected = selectedVerses.includes(verse.id);
        return (
          <motion.div
            key={verse.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.01, duration: 0.3 }}
            className={cn(
              "group inline relative rounded decoration-primary/30",
              isSelected && "bg-primary/20 decoration-primary box-decoration-clone px-1 -mx-1"
            )}
          >
            <span
              className={cn(
                "font-scripture text-lg leading-relaxed cursor-pointer transition-colors",
                !isSelected && "hover:bg-primary/5 rounded"
              )}
              onClick={() => onVerseSelect?.(verse)}
            >
              <sup className={cn(
                "text-xs font-sans font-semibold mr-1 select-none",
                isSelected ? "text-primary-foreground bg-primary px-1 rounded-sm" : "text-primary"
              )}>
                {verse.verse}
              </sup>
              <span className="text-foreground">{verse.text} </span>
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
