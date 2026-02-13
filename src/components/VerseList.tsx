import type { BibleVerse } from "@/types/bible";
import { motion } from "framer-motion";

interface VerseListProps {
  verses: BibleVerse[];
  onVerseClick?: (verse: BibleVerse) => void;
}

export default function VerseList({ verses, onVerseClick }: VerseListProps) {
  return (
    <div className="space-y-1">
      {verses.map((verse, i) => (
        <motion.div
          key={verse.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.02, duration: 0.3 }}
          className="group inline"
        >
          <span
            className={`font-scripture text-lg leading-relaxed ${
              onVerseClick ? "cursor-pointer hover:bg-accent/50 rounded transition-colors" : ""
            }`}
            onClick={() => onVerseClick?.(verse)}
          >
            <sup className="text-xs font-sans font-semibold text-primary mr-1">
              {verse.verse}
            </sup>
            <span className="text-foreground">{verse.text} </span>
          </span>
        </motion.div>
      ))}
    </div>
  );
}
