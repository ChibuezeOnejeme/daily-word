import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import DailyDose from "@/components/DailyDose";
import type { LastRead } from "@/types/bible";

function getLastRead(): LastRead | null {
  try {
    const stored = localStorage.getItem("lastRead");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export default function Index() {
  const lastRead = getLastRead();

  return (
    <Layout>
      <div className="container py-8 sm:py-12 pb-24 sm:pb-12 max-w-2xl space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-card mb-2">
            <BookOpen className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Scripture
          </h1>
          <p className="text-muted-foreground text-lg">
            Read. Reflect. Grow.
          </p>
        </motion.div>

        {/* Daily Dose */}
        <DailyDose />

        {/* Continue Reading */}
        {lastRead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              to={`/bible/${encodeURIComponent(lastRead.book)}/${lastRead.chapter}`}
              className="glass-card p-4 flex items-center justify-between group hover:border-primary/30 transition-colors"
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                  Continue Reading
                </p>
                <p className="font-serif text-lg text-foreground">
                  {lastRead.book} {lastRead.chapter}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </motion.div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/bible"
            className="glass-card p-4 text-center hover:border-primary/30 transition-colors"
          >
            <BookOpen className="h-5 w-5 mx-auto mb-2 text-primary" />
            <span className="text-sm font-medium text-foreground">Read Bible</span>
          </Link>
          <Link
            to="/search"
            className="glass-card p-4 text-center hover:border-primary/30 transition-colors"
          >
            <span className="text-xl mb-1 block">🔍</span>
            <span className="text-sm font-medium text-foreground">Search</span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
