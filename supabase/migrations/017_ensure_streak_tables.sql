-- ============================================================================
-- STREAK TABLES MIGRATION
-- ============================================================================
-- This migration ensures all streak-related tables and columns are correct
-- Run this to fix any inconsistencies or create missing tables
-- ============================================================================

-- ============================================================================
-- 1. ENSURE USER_STATS TABLE EXISTS WITH STREAK COLUMNS
-- ============================================================================

-- Create user_stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_prayers INTEGER DEFAULT 0,
  total_dhikr INTEGER DEFAULT 0,
  total_quran_pages INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  days_active INTEGER DEFAULT 0,
  lectures_watched INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  workouts_completed INTEGER DEFAULT 0,
  meditation_sessions INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist (for existing tables)
DO $$
BEGIN
  -- Add current_streak if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'current_streak'
  ) THEN
    ALTER TABLE public.user_stats ADD COLUMN current_streak INTEGER DEFAULT 0;
  END IF;

  -- Add longest_streak if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'longest_streak'
  ) THEN
    ALTER TABLE public.user_stats ADD COLUMN longest_streak INTEGER DEFAULT 0;
  END IF;

  -- Add days_active if missing (this is the correct column name)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'days_active'
  ) THEN
    ALTER TABLE public.user_stats ADD COLUMN days_active INTEGER DEFAULT 0;
  END IF;

  -- Remove total_days_active if it exists (wrong column name)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'total_days_active'
  ) THEN
    -- Migrate data from total_days_active to days_active if needed
    UPDATE public.user_stats 
    SET days_active = COALESCE(total_days_active, days_active, 0)
    WHERE days_active = 0 AND total_days_active > 0;
    
    ALTER TABLE public.user_stats DROP COLUMN IF EXISTS total_days_active;
  END IF;

  -- Add last_active_date if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'last_active_date'
  ) THEN
    ALTER TABLE public.user_stats ADD COLUMN last_active_date DATE DEFAULT CURRENT_DATE;
  END IF;

  -- Ensure updated_at exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.user_stats ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- ============================================================================
-- 2. ENSURE USER_STREAKS TABLE EXISTS WITH MULTIPLE STREAK TYPES
-- ============================================================================

-- Create user_streaks table if it doesn't exist (supports multiple streak types)
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  -- General activity streak
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_days_active INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  -- Prayer streak (all 5 prayers completed)
  prayer_current_streak INTEGER DEFAULT 0,
  prayer_longest_streak INTEGER DEFAULT 0,
  prayer_total_days INTEGER DEFAULT 0,
  prayer_last_completed_date DATE,
  -- Workout streak
  workout_current_streak INTEGER DEFAULT 0,
  workout_longest_streak INTEGER DEFAULT 0,
  workout_total_days INTEGER DEFAULT 0,
  workout_last_completed_date DATE,
  -- Quran streak
  quran_current_streak INTEGER DEFAULT 0,
  quran_longest_streak INTEGER DEFAULT 0,
  quran_total_days INTEGER DEFAULT 0,
  quran_last_completed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to user_streaks if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_streaks' 
    AND column_name = 'current_streak'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN current_streak INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_streaks' 
    AND column_name = 'longest_streak'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN longest_streak INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_streaks' 
    AND column_name = 'total_days_active'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN total_days_active INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_streaks' 
    AND column_name = 'last_active_date'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN last_active_date DATE DEFAULT CURRENT_DATE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_streaks' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add prayer streak columns if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_streaks' 
    AND column_name = 'prayer_current_streak'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN prayer_current_streak INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_streaks' 
    AND column_name = 'prayer_longest_streak'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN prayer_longest_streak INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_streaks' 
    AND column_name = 'prayer_total_days'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN prayer_total_days INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_streaks' 
    AND column_name = 'prayer_last_completed_date'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN prayer_last_completed_date DATE;
  END IF;

  -- Add workout streak columns if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_streaks' 
    AND column_name = 'workout_current_streak'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN workout_current_streak INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_streaks' 
    AND column_name = 'workout_longest_streak'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN workout_longest_streak INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_streaks' 
    AND column_name = 'workout_total_days'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN workout_total_days INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_streaks' 
    AND column_name = 'workout_last_completed_date'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN workout_last_completed_date DATE;
  END IF;

  -- Add Quran streak columns if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_streaks' 
    AND column_name = 'quran_current_streak'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN quran_current_streak INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_streaks' 
    AND column_name = 'quran_longest_streak'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN quran_longest_streak INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_streaks' 
    AND column_name = 'quran_total_days'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN quran_total_days INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_streaks' 
    AND column_name = 'quran_last_completed_date'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN quran_last_completed_date DATE;
  END IF;
END $$;

-- ============================================================================
-- 3. CREATE/UPDATE INDEXES
-- ============================================================================

-- Indexes for user_stats
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_last_active_date ON public.user_stats(last_active_date);
CREATE INDEX IF NOT EXISTS idx_user_stats_current_streak ON public.user_stats(current_streak DESC) WHERE current_streak > 0;
CREATE INDEX IF NOT EXISTS idx_user_stats_longest_streak ON public.user_stats(longest_streak DESC) WHERE longest_streak > 0;

-- Indexes for user_streaks
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON public.user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_last_active_date ON public.user_streaks(last_active_date);
CREATE INDEX IF NOT EXISTS idx_user_streaks_current_streak ON public.user_streaks(current_streak DESC) WHERE current_streak > 0;
CREATE INDEX IF NOT EXISTS idx_user_streaks_longest_streak ON public.user_streaks(longest_streak DESC) WHERE longest_streak > 0;
-- Prayer streak indexes
CREATE INDEX IF NOT EXISTS idx_user_streaks_prayer_streak ON public.user_streaks(prayer_current_streak DESC) WHERE prayer_current_streak > 0;
-- Workout streak indexes
CREATE INDEX IF NOT EXISTS idx_user_streaks_workout_streak ON public.user_streaks(workout_current_streak DESC) WHERE workout_current_streak > 0;
-- Quran streak indexes
CREATE INDEX IF NOT EXISTS idx_user_streaks_quran_streak ON public.user_streaks(quran_current_streak DESC) WHERE quran_current_streak > 0;

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. CREATE/UPDATE RLS POLICIES FOR USER_STATS
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can insert their own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON public.user_stats;

-- Create policies
CREATE POLICY "Users can view their own stats" ON public.user_stats
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON public.user_stats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON public.user_stats
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 6. CREATE/UPDATE RLS POLICIES FOR USER_STREAKS
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can insert their own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can update their own streaks" ON public.user_streaks;

-- Create policies
CREATE POLICY "Users can view their own streaks" ON public.user_streaks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" ON public.user_streaks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" ON public.user_streaks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 7. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.user_stats IS 'Stores aggregated user statistics including streak data';
COMMENT ON COLUMN public.user_stats.current_streak IS 'Current consecutive days active';
COMMENT ON COLUMN public.user_stats.longest_streak IS 'Longest consecutive days active ever achieved';
COMMENT ON COLUMN public.user_stats.days_active IS 'Total number of days user has been active';
COMMENT ON COLUMN public.user_stats.last_active_date IS 'Date of last activity (YYYY-MM-DD format)';

COMMENT ON TABLE public.user_streaks IS 'Comprehensive streak tracking table with multiple streak types';
COMMENT ON COLUMN public.user_streaks.current_streak IS 'Current consecutive days active (general)';
COMMENT ON COLUMN public.user_streaks.longest_streak IS 'Longest consecutive days active ever achieved (general)';
COMMENT ON COLUMN public.user_streaks.total_days_active IS 'Total number of days user has been active (general)';
COMMENT ON COLUMN public.user_streaks.last_active_date IS 'Date of last activity (YYYY-MM-DD format)';
-- Prayer streak comments
COMMENT ON COLUMN public.user_streaks.prayer_current_streak IS 'Current consecutive days with all 5 prayers completed';
COMMENT ON COLUMN public.user_streaks.prayer_longest_streak IS 'Longest streak of days with all 5 prayers completed';
COMMENT ON COLUMN public.user_streaks.prayer_total_days IS 'Total days with all 5 prayers completed';
COMMENT ON COLUMN public.user_streaks.prayer_last_completed_date IS 'Last date all 5 prayers were completed';
-- Workout streak comments
COMMENT ON COLUMN public.user_streaks.workout_current_streak IS 'Current consecutive days with workout completed';
COMMENT ON COLUMN public.user_streaks.workout_longest_streak IS 'Longest streak of days with workouts completed';
COMMENT ON COLUMN public.user_streaks.workout_total_days IS 'Total days with workouts completed';
COMMENT ON COLUMN public.user_streaks.workout_last_completed_date IS 'Last date workout was completed';
-- Quran streak comments
COMMENT ON COLUMN public.user_streaks.quran_current_streak IS 'Current consecutive days with Quran reading';
COMMENT ON COLUMN public.user_streaks.quran_longest_streak IS 'Longest streak of days with Quran reading';
COMMENT ON COLUMN public.user_streaks.quran_total_days IS 'Total days with Quran reading';
COMMENT ON COLUMN public.user_streaks.quran_last_completed_date IS 'Last date Quran was read';

-- ============================================================================
-- 8. CREATE TRIGGER TO UPDATE updated_at TIMESTAMP
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_stats
DROP TRIGGER IF EXISTS update_user_stats_updated_at ON public.user_stats;
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_streaks
DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON public.user_streaks;
CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. VERIFICATION QUERIES (Optional - uncomment to run)
-- ============================================================================

-- Verify user_stats table structure
-- SELECT 
--   column_name, 
--   data_type, 
--   column_default,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--   AND table_name = 'user_stats'
-- ORDER BY ordinal_position;

-- Verify user_streaks table structure
-- SELECT 
--   column_name, 
--   data_type, 
--   column_default,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--   AND table_name = 'user_streaks'
-- ORDER BY ordinal_position;

-- Verify RLS is enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
--   AND tablename IN ('user_stats', 'user_streaks');

-- Verify policies exist
-- SELECT 
--   schemaname,
--   tablename,
--   policyname,
--   permissive,
--   roles,
--   cmd,
--   qual
-- FROM pg_policies
-- WHERE schemaname = 'public' 
--   AND tablename IN ('user_stats', 'user_streaks');

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- This script ensures:
-- 1. user_stats table exists with correct streak columns (days_active, not total_days_active)
-- 2. user_streaks table exists as fallback
-- 3. All indexes are created for performance
-- 4. RLS policies are set up for security
-- 5. Triggers update timestamps automatically
-- ============================================================================
