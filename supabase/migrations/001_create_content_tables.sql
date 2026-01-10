-- ============================================================================
-- SUPABASE MIGRATION: Create Content Tables
-- ============================================================================
-- This migration creates all tables needed for:
-- - Daily Verses (Quran verses)
-- - Daily Hadiths
-- - User Daily Content (tracks user's daily verse/hadith assignments)
-- - Video Categories (for lectures and recitations)
-- - Videos (lectures and recitations)
-- ============================================================================

-- ============================================================================
-- 1. DAILY VERSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.daily_verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arabic_text TEXT NOT NULL,
    translation TEXT NOT NULL,
    reference VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for active verses (common query)
CREATE INDEX IF NOT EXISTS idx_daily_verses_is_active ON public.daily_verses(is_active) WHERE is_active = true;

-- Add index for reference lookups
CREATE INDEX IF NOT EXISTS idx_daily_verses_reference ON public.daily_verses(reference);

-- Add comment
COMMENT ON TABLE public.daily_verses IS 'Stores daily Quran verses for the app';

-- ============================================================================
-- 2. DAILY HADITHS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.daily_hadiths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arabic_text TEXT,
    translation TEXT NOT NULL,
    source VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for active hadiths (common query)
CREATE INDEX IF NOT EXISTS idx_daily_hadiths_is_active ON public.daily_hadiths(is_active) WHERE is_active = true;

-- Add index for source lookups
CREATE INDEX IF NOT EXISTS idx_daily_hadiths_source ON public.daily_hadiths(source);

-- Add comment
COMMENT ON TABLE public.daily_hadiths IS 'Stores daily Hadiths for the app';

-- ============================================================================
-- 3. USER DAILY CONTENT TABLE (tracks user's daily verse/hadith assignments)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_daily_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    verse_id UUID NOT NULL REFERENCES public.daily_verses(id) ON DELETE CASCADE,
    hadith_id UUID NOT NULL REFERENCES public.daily_hadiths(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, date)
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_daily_content_user_date ON public.user_daily_content(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_user_daily_content_verse ON public.user_daily_content(verse_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_content_hadith ON public.user_daily_content(hadith_id);

-- Add comment
COMMENT ON TABLE public.user_daily_content IS 'Tracks which verse and hadith each user was assigned for each day';

-- ============================================================================
-- 4. VIDEO CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.video_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('lecture', 'recitation')),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(name, type)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_video_categories_type ON public.video_categories(type);
CREATE INDEX IF NOT EXISTS idx_video_categories_order ON public.video_categories(type, order_index);

-- Add comment
COMMENT ON TABLE public.video_categories IS 'Categories for organizing videos (lectures and recitations)';

-- ============================================================================
-- 5. VIDEOS TABLE (for lectures and recitations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    image_url TEXT,
    video_url TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES public.video_categories(id) ON DELETE CASCADE,
    duration INTEGER DEFAULT 0, -- Duration in seconds
    scholar_name VARCHAR(200), -- For lectures
    reciter_name VARCHAR(200), -- For recitations
    views INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_videos_category ON public.videos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_order ON public.videos(category_id, order_index);
CREATE INDEX IF NOT EXISTS idx_videos_views ON public.videos(views DESC);
CREATE INDEX IF NOT EXISTS idx_videos_scholar ON public.videos(scholar_name) WHERE scholar_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_videos_reciter ON public.videos(reciter_name) WHERE reciter_name IS NOT NULL;

-- Add comment
COMMENT ON TABLE public.videos IS 'Stores video content (lectures and recitations)';

-- ============================================================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.daily_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_hadiths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. RLS POLICIES - Allow public read access, authenticated write access
-- ============================================================================

-- Daily Verses: Public read, authenticated write
CREATE POLICY "Daily verses are viewable by everyone"
    ON public.daily_verses FOR SELECT
    USING (true);

CREATE POLICY "Daily verses are insertable by authenticated users"
    ON public.daily_verses FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Daily verses are updatable by authenticated users"
    ON public.daily_verses FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Daily Hadiths: Public read, authenticated write
CREATE POLICY "Daily hadiths are viewable by everyone"
    ON public.daily_hadiths FOR SELECT
    USING (true);

CREATE POLICY "Daily hadiths are insertable by authenticated users"
    ON public.daily_hadiths FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Daily hadiths are updatable by authenticated users"
    ON public.daily_hadiths FOR UPDATE
    USING (auth.role() = 'authenticated');

-- User Daily Content: Users can only see their own content
CREATE POLICY "Users can view their own daily content"
    ON public.user_daily_content FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily content"
    ON public.user_daily_content FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily content"
    ON public.user_daily_content FOR UPDATE
    USING (auth.uid() = user_id);

-- Video Categories: Public read, authenticated write
CREATE POLICY "Video categories are viewable by everyone"
    ON public.video_categories FOR SELECT
    USING (true);

CREATE POLICY "Video categories are insertable by authenticated users"
    ON public.video_categories FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Video categories are updatable by authenticated users"
    ON public.video_categories FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Videos: Public read, authenticated write
CREATE POLICY "Videos are viewable by everyone"
    ON public.videos FOR SELECT
    USING (true);

CREATE POLICY "Videos are insertable by authenticated users"
    ON public.videos FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Videos are updatable by authenticated users"
    ON public.videos FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ============================================================================
-- 8. FUNCTIONS FOR UPDATED_AT TIMESTAMP
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_daily_verses_updated_at
    BEFORE UPDATE ON public.daily_verses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_daily_hadiths_updated_at
    BEFORE UPDATE ON public.daily_hadiths
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_video_categories_updated_at
    BEFORE UPDATE ON public.video_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON public.videos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
