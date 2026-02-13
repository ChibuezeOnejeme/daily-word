import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { OLD_TESTAMENT, NEW_TESTAMENT } from "@/types/bible";

function BookSection({ title, books }: { title: string; books: string[] }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {books.map((book, i) => (
          <motion.div
            key={book}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.01, duration: 0.2 }}
          >
            <Link
              to={`/bible/${encodeURIComponent(book)}`}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground glass-card hover:border-primary/25 transition-all"
            >
              {book}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default function BibleBooks() {
  return (
    <Layout>
      <div className="container py-6 pb-24 sm:pb-8 max-w-2xl space-y-8">
        <h1 className="text-2xl font-bold text-foreground">Bible</h1>
        <BookSection title="Old Testament" books={OLD_TESTAMENT} />
        <BookSection title="New Testament" books={NEW_TESTAMENT} />
      </div>
    </Layout>
  );
}
