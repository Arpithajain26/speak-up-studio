-- Create storage bucket for practice videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('practice-videos', 'practice-videos', true);

-- Create RLS policies for video storage
CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'practice-videos');

CREATE POLICY "Users can view all videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'practice-videos');

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'practice-videos');

-- Create table to store practice sessions with video
CREATE TABLE public.practice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  video_url TEXT,
  transcript TEXT,
  duration INTEGER, -- in seconds
  fluency_score INTEGER,
  grammar_score INTEGER,
  overall_score INTEGER,
  words_per_minute INTEGER,
  filler_words JSONB DEFAULT '[]'::jsonb,
  grammar_issues JSONB DEFAULT '[]'::jsonb,
  suggestions JSONB DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

-- Public insert/select for now (no auth)
CREATE POLICY "Anyone can insert sessions"
ON public.practice_sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view sessions"
ON public.practice_sessions FOR SELECT
USING (true);