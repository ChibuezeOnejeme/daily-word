
-- Fix bible_verses: drop restrictive, create permissive
DROP POLICY IF EXISTS "Allow public read access to bible_verses" ON public.bible_verses;
CREATE POLICY "Allow public read access to bible_verses" ON public.bible_verses FOR SELECT USING (true);

-- Fix daily_dose: drop restrictive, create permissive
DROP POLICY IF EXISTS "Allow public read access to daily_dose" ON public.daily_dose;
CREATE POLICY "Allow public read access to daily_dose" ON public.daily_dose FOR SELECT USING (true);

-- Fix notes: drop restrictive, create permissive
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can view their own notes" ON public.notes;

CREATE POLICY "Users can view their own notes" ON public.notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notes" ON public.notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.notes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add composite indexes
CREATE INDEX IF NOT EXISTS idx_bible_verses_book_chapter ON public.bible_verses(book, chapter);
CREATE INDEX IF NOT EXISTS idx_daily_dose_date ON public.daily_dose(date);
