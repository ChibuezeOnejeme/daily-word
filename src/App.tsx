import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BibleBooks from "./pages/BibleBooks";
import BibleChapters from "./pages/BibleChapters";
import BibleVersesPage from "./pages/BibleVerses";
import SearchPage from "./pages/Search";
import NotesPage from "./pages/Notes";
import AuthPage from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/bible" element={<BibleBooks />} />
          <Route path="/bible/:book" element={<BibleChapters />} />
          <Route path="/bible/:book/:chapter" element={<BibleVersesPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
