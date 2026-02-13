import { useQuery } from "@tanstack/react-query";
import { fetchDailyDose } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function DailyDose() {
  const { data: dose, isLoading } = useQuery({
    queryKey: ["daily-dose"],
    queryFn: fetchDailyDose,
  });

  if (isLoading) {
    return (
      <div className="glass-card p-6 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (!dose) {
    return (
      <div className="glass-card p-6 text-center text-muted-foreground">
        <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary/50" />
        <p className="font-serif italic">No daily dose available for today.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 sm:p-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
          Daily Dose of Christ
        </h2>
      </div>

      <blockquote className="font-scripture text-xl sm:text-2xl leading-relaxed text-foreground mb-4">
        "{dose.message}"
      </blockquote>

      <p className="text-sm font-medium text-muted-foreground">
        — {dose.book} {dose.chapter}:{dose.verse}
      </p>
    </motion.div>
  );
}
