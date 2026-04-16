
-- Add description column to candidates
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS description text;

-- Create storage bucket for candidate photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-photos', 'candidate-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for candidate photos
CREATE POLICY "Anyone can view candidate photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'candidate-photos');

CREATE POLICY "Anyone can upload candidate photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'candidate-photos');

CREATE POLICY "Anyone can update candidate photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'candidate-photos');

CREATE POLICY "Anyone can delete candidate photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'candidate-photos');
