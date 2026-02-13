-- Allow public insert on bible_verses for seeding purposes
CREATE POLICY "Allow public insert on bible_verses"
ON public.bible_verses
FOR INSERT
TO public
WITH CHECK (true);
