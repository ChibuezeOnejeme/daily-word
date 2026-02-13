import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchChaptersByBook } from "@/lib/queries";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function BibleChapters() {
  const { book } = useParams<{ book: string }>();
  const decodedBook = decodeURIComponent(book || "");

  const { data: chapters, isLoading } = useQuery({
    queryKey: ["chapters", decodedBook],
    queryFn: () => fetchChaptersByBook(decodedBook),
    enabled: !!decodedBook,
  });

  return (
    <Layout>
      <div className="container py-6 pb-24 sm:pb-8 max-w-2xl">
        <Link
          to="/bible"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Books
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-6">{decodedBook}</h1>

        {isLoading ? (
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
            {(chapters || []).map((ch, i) => (
              <motion.div
                key={ch}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01 }}
              >
                <Link
                  to={`/bible/${encodeURIComponent(decodedBook)}/${ch}`}
                  className="flex items-center justify-center h-12 rounded-lg text-sm font-medium text-foreground bg-card border border-border hover:bg-accent/60 hover:border-primary/30 transition-colors"
                >
                  {ch}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
