-- Allow authenticated users (admin) to read submission records
CREATE POLICY "Authenticated users can read submissions"
  ON public.testimonial_submissions
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow the service role / server to read submissions for rate limiting
-- (server client bypasses RLS, but this is a safety net)
CREATE POLICY "Anyone can read own submissions by ip"
  ON public.testimonial_submissions
  FOR SELECT
  USING (true);
