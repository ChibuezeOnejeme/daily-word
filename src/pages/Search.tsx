import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchVerses } from "@/lib/queries";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", searchTerm],
    queryFn: () => searchVerses(searchTerm),
    enabled: searchTerm.length >= 2,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) setSearchTerm(query.trim());
  };

  return (
    <Layout>
      <div className="container py-6 pb-24 sm:pb-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Search Scripture</h1>

        <form onSubmit={handleSubmit} className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search by keyword or reference (e.g. "John 3:16")'
            className="pl-10 bg-card"
          />
        </form>

        {isLoading && (
          <p className="text-sm text-muted-foreground">Searching...</p>
        )}

        {results && results.length === 0 && (
          <p className="text-muted-foreground text-center py-12">
            No results found for "{searchTerm}"
          </p>
        )}

        {results && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            {results.map((verse, i) => (
              <motion.div
                key={verse.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/bible/${encodeURIComponent(verse.book)}/${verse.chapter}`}
                  className="block glass-card p-4 hover:border-primary/30 transition-colors"
                >
                  <p className="text-xs font-semibold text-primary mb-1">
                    {verse.book} {verse.chapter}:{verse.verse}
                  </p>
                  <p className="font-scripture text-foreground leading-relaxed">
                    {verse.text}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
