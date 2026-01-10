-- ============================================================================
-- ACHIEVEMENTS SYSTEM SETUP
-- ============================================================================
-- This script creates all tables and seeds achievements for the app

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS achievement_progress CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;

-- ============================================================================
-- 1. ACHIEVEMENTS TABLE
-- ============================================================================
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  requirement_type TEXT NOT NULL,  -- 'total_prayers', 'total_dhikr', 'streak', etc.
  requirement_value INTEGER NOT NULL,
  points INTEGER DEFAULT 50,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  category TEXT DEFAULT 'general' CHECK (category IN ('ibadah', 'ilm', 'amanah', 'general')),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  unlock_message TEXT,
  next_steps TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. USER_ACHIEVEMENTS TABLE
-- ============================================================================
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================================================
-- 3. ACHIEVEMENT_PROGRESS TABLE
-- ============================================================================
CREATE TABLE achievement_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  current_value INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_achievement_progress_user_id ON achievement_progress(user_id);
CREATE INDEX idx_achievement_progress_achievement_id ON achievement_progress(achievement_id);
CREATE INDEX idx_achievements_active ON achievements(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_order ON achievements(order_index);

-- ============================================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================================================
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_progress ENABLE ROW LEVEL SECURITY;

-- Achievements: Public read access
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (is_active = TRUE);

-- User achievements: Users can view their own
CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- User achievements: Users can insert their own
CREATE POLICY "Users can unlock their own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievement progress: Users can view their own
CREATE POLICY "Users can view their own progress" ON achievement_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Achievement progress: Users can update their own
CREATE POLICY "Users can update their own progress" ON achievement_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Achievement progress: System can insert/upsert (via service role)
CREATE POLICY "Users can insert their own progress" ON achievement_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 6. SEED ACHIEVEMENTS DATA
-- ============================================================================

-- IBADAH (Worship) Achievements
-- Prayer Achievements
INSERT INTO achievements (title, description, icon_name, requirement_type, requirement_value, points, tier, category, order_index, unlock_message, next_steps) VALUES
('First Prayer', 'Complete your first prayer', 'moon.fill', 'total_prayers', 1, 10, 'bronze', 'ibadah', 1, 'You have taken your first step on the path of prayer!', 'Aim for 5 prayers a day to maintain consistency.'),
('Prayer Beginner', 'Complete 25 prayers', 'moon.stars.fill', 'total_prayers', 25, 25, 'bronze', 'ibadah', 2, 'Great start! You are building a strong foundation.', 'Keep it up! Try to reach 50 prayers.'),
('Prayer Apprentice', 'Complete 50 prayers', 'sun.max.fill', 'total_prayers', 50, 50, 'silver', 'ibadah', 3, 'Excellent progress! Prayer is becoming a habit.', 'You are halfway to 100 prayers!'),
('Prayer Champion', 'Complete 100 prayers', 'sun.haze.fill', 'total_prayers', 100, 100, 'silver', 'ibadah', 4, 'Outstanding! 100 prayers completed!', 'Continue to 250 prayers to become a Master.'),
('Prayer Master', 'Complete 250 prayers', 'star.fill', 'total_prayers', 250, 250, 'gold', 'ibadah', 5, 'Incredible dedication! You are a Prayer Master!', 'Push forward to 500 prayers for Legend status.'),
('Prayer Legend', 'Complete 500 prayers', 'star.circle.fill', 'total_prayers', 500, 500, 'gold', 'ibadah', 6, 'Legendary achievement! 500 prayers!', 'Reach 1000 prayers to become an Icon.'),
('Prayer Icon', 'Complete 1000 prayers', 'crown.fill', 'total_prayers', 1000, 1000, 'platinum', 'ibadah', 7, '🏆 ICON STATUS! 1000 prayers completed!', 'You have achieved mastery in prayer. Continue your journey!'),

-- Dhikr Achievements
('First Dhikr', 'Complete 100 dhikr recitations', 'hand.raised.fill', 'total_dhikr', 100, 10, 'bronze', 'ibadah', 10, 'You have discovered the power of dhikr!', 'Continue to 1,000 recitations.'),
('Dhikr Beginner', 'Complete 1,000 dhikr recitations', 'hand.raised.slash.fill', 'total_dhikr', 1000, 25, 'bronze', 'ibadah', 11, 'Great start with dhikr! Keep remembering Allah.', 'Aim for 5,000 recitations next.'),
('Dhikr Enthusiast', 'Complete 5,000 dhikr recitations', 'sparkles', 'total_dhikr', 5000, 50, 'silver', 'ibadah', 12, 'Excellent! Your heart is being purified through dhikr.', 'Reach 10,000 to become a Master.'),
('Dhikr Master', 'Complete 10,000 dhikr recitations', 'sparkle', 'total_dhikr', 10000, 100, 'silver', 'ibadah', 13, 'Masterful! 10,000 dhikr recitations!', 'Continue to 25,000 for Champion status.'),
('Dhikr Champion', 'Complete 25,000 dhikr recitations', 'star.fill', 'total_dhikr', 25000, 250, 'gold', 'ibadah', 14, 'Champion level! 25,000 recitations!', 'Push to 50,000 to become a Legend.'),
('Dhikr Legend', 'Complete 50,000 dhikr recitations', 'star.circle.fill', 'total_dhikr', 50000, 500, 'gold', 'ibadah', 15, 'Legendary! 50,000 dhikr recitations!', 'Reach 100,000 to become an Icon.'),
('Dhikr Icon', 'Complete 100,000 dhikr recitations', 'crown.fill', 'total_dhikr', 100000, 1000, 'platinum', 'ibadah', 16, '🏆 ICON! 100,000 dhikr recitations!', 'You have achieved mastery in remembrance!'),

-- Quran Achievements
('First Page', 'Read your first page of Quran', 'book.fill', 'total_quran_pages', 1, 10, 'bronze', 'ibadah', 20, 'The journey of a thousand miles begins with one step!', 'Aim to read 10 pages next.'),
('Quran Beginner', 'Read 10 pages of Quran', 'book.closed.fill', 'total_quran_pages', 10, 25, 'bronze', 'ibadah', 21, 'Excellent start! The Quran is opening its treasures to you.', 'Continue to 30 pages.'),
('Quran Reader', 'Read 30 pages of Quran', 'text.book.closed.fill', 'total_quran_pages', 30, 50, 'silver', 'ibadah', 22, 'Great progress! You are developing a strong reading habit.', 'Aim for 100 pages to become a Lover.'),
('Quran Lover', 'Read 100 pages of Quran', 'heart.text.square.fill', 'total_quran_pages', 100, 100, 'silver', 'ibadah', 23, 'Beautiful! Your love for the Quran is growing.', 'Continue to 300 pages to become a Devotee.'),
('Quran Devotee', 'Read 300 pages of Quran', 'text.bubble.fill', 'total_quran_pages', 300, 250, 'gold', 'ibadah', 24, 'Devoted! You are deeply connected with the Quran.', 'Complete the full Quran (604 pages) next!'),
('Quran Completer', 'Complete the full Quran (604 pages)', 'checkmark.seal.fill', 'total_quran_pages', 604, 500, 'gold', 'ibadah', 25, '🎉 CONGRATULATIONS! You completed the entire Quran!', 'Read it again to become a Master.'),
('Quran Master', 'Read the Quran twice (1,208 pages)', 'crown.fill', 'total_quran_pages', 1208, 1000, 'platinum', 'ibadah', 26, '🏆 MASTER! You have read the Quran twice!', 'Continue your beautiful journey of recitation!');

-- ILM (Knowledge) Achievements
INSERT INTO achievements (title, description, icon_name, requirement_type, requirement_value, points, tier, category, order_index, unlock_message, next_steps) VALUES
('First Lesson', 'Watch your first lecture', 'play.circle.fill', 'lectures_watched', 1, 10, 'bronze', 'ilm', 30, 'Knowledge begins with a single step!', 'Watch 5 lectures to become a Knowledge Seeker.'),
('Knowledge Seeker', 'Watch 5 lectures', 'book.fill', 'lectures_watched', 5, 25, 'bronze', 'ilm', 31, 'Great start! You are seeking knowledge!', 'Continue to 10 lectures to become a Student.'),
('Knowledge Student', 'Watch 10 lectures', 'studentdesk', 'lectures_watched', 10, 50, 'silver', 'ilm', 32, 'Excellent! You are a dedicated student of knowledge.', 'Aim for 25 lectures to become a Scholar.'),
('Knowledge Scholar', 'Watch 25 lectures', 'graduationcap.fill', 'lectures_watched', 25, 100, 'silver', 'ilm', 33, 'Impressive! You are becoming a scholar!', 'Reach 50 lectures to become a Master.'),
('Knowledge Master', 'Watch 50 lectures', 'brain.head.profile', 'lectures_watched', 50, 250, 'gold', 'ilm', 34, 'Masterful! 50 lectures watched!', 'Continue to 100 lectures for Expert status.'),
('Knowledge Expert', 'Watch 100 lectures', 'lightbulb.fill', 'lectures_watched', 100, 500, 'gold', 'ilm', 35, 'Expert level! Your knowledge is vast!', 'Reach 200 lectures to become an Icon.'),
('Knowledge Icon', 'Watch 200 lectures', 'crown.fill', 'lectures_watched', 200, 1000, 'platinum', 'ilm', 36, '🏆 ICON! 200 lectures completed!', 'You are a true seeker of knowledge!'),

-- Quiz Achievements
('First Quiz', 'Complete your first quiz', 'questionmark.circle.fill', 'quizzes_completed', 1, 10, 'bronze', 'ilm', 40, 'You have taken your first quiz!', 'Complete 5 quizzes to become a Quiz Taker.'),
('Quiz Taker', 'Complete 5 quizzes', 'checkmark.circle.fill', 'quizzes_completed', 5, 25, 'bronze', 'ilm', 41, 'Great! You are testing your knowledge!', 'Aim for 10 quizzes to become an Enthusiast.'),
('Quiz Enthusiast', 'Complete 10 quizzes', 'sparkles', 'quizzes_completed', 10, 50, 'silver', 'ilm', 42, 'Excellent! You love learning through quizzes!', 'Reach 25 quizzes to become a Master.'),
('Quiz Master', 'Complete 25 quizzes', 'star.fill', 'quizzes_completed', 25, 100, 'silver', 'ilm', 43, 'Masterful! 25 quizzes completed!', 'Continue to 50 quizzes for Champion status.'),
('Quiz Champion', 'Complete 50 quizzes', 'star.circle.fill', 'quizzes_completed', 50, 250, 'gold', 'ilm', 44, 'Champion level! 50 quizzes!', 'Push to 100 quizzes to become a Legend.'),
('Quiz Legend', 'Complete 100 quizzes', 'crown.fill', 'quizzes_completed', 100, 500, 'gold', 'ilm', 45, 'Legendary! 100 quizzes completed!', 'You have mastered the quiz system!');

-- AMANAH (Well-Being) Achievements
INSERT INTO achievements (title, description, icon_name, requirement_type, requirement_value, points, tier, category, order_index, unlock_message, next_steps) VALUES
-- Workout Achievements
('First Workout', 'Complete your first workout', 'figure.run', 'workouts_completed', 1, 10, 'bronze', 'amanah', 50, 'Great start! Physical health is part of faith!', 'Complete 5 workouts to become a Beginner.'),
('Fitness Beginner', 'Complete 5 workouts', 'figure.walk', 'workouts_completed', 5, 25, 'bronze', 'amanah', 51, 'Well done! You are building healthy habits!', 'Aim for 10 workouts to become an Enthusiast.'),
('Fitness Enthusiast', 'Complete 10 workouts', 'figure.strengthtraining.functional', 'workouts_completed', 10, 50, 'silver', 'amanah', 52, 'Excellent! Fitness is becoming a routine!', 'Reach 25 workouts to become a Champion.'),
('Fitness Champion', 'Complete 25 workouts', 'figure.yoga', 'workouts_completed', 25, 100, 'silver', 'amanah', 53, 'Champion level! 25 workouts!', 'Continue to 50 workouts for Master status.'),
('Fitness Master', 'Complete 50 workouts', 'figure.mind.and.body', 'workouts_completed', 50, 250, 'gold', 'amanah', 54, 'Masterful! 50 workouts completed!', 'Push to 100 workouts to become a Legend.'),
('Fitness Legend', 'Complete 100 workouts', 'crown.fill', 'workouts_completed', 100, 500, 'gold', 'amanah', 55, 'Legendary! 100 workouts!', 'You have achieved fitness mastery!'),

-- Meditation Achievements
('First Meditation', 'Complete your first meditation session', 'brain.head.profile', 'meditation_sessions', 1, 10, 'bronze', 'amanah', 60, 'You have started your mindfulness journey!', 'Complete 5 sessions to become a Beginner.'),
('Mindfulness Beginner', 'Complete 5 meditation sessions', 'leaf.fill', 'meditation_sessions', 5, 25, 'bronze', 'amanah', 61, 'Great start! Mindfulness is growing!', 'Aim for 10 sessions to become a Practitioner.'),
('Mindfulness Practitioner', 'Complete 10 meditation sessions', 'sparkles', 'meditation_sessions', 10, 50, 'silver', 'amanah', 62, 'Excellent! You are practicing regularly!', 'Reach 25 sessions to become a Master.'),
('Mindfulness Master', 'Complete 25 meditation sessions', 'star.fill', 'meditation_sessions', 25, 100, 'silver', 'amanah', 63, 'Masterful! 25 meditation sessions!', 'Continue to 50 sessions for Champion status.'),
('Mindfulness Champion', 'Complete 50 meditation sessions', 'star.circle.fill', 'meditation_sessions', 50, 250, 'gold', 'amanah', 64, 'Champion level! 50 sessions!', 'Push to 100 sessions to become a Legend.'),
('Mindfulness Legend', 'Complete 100 meditation sessions', 'crown.fill', 'meditation_sessions', 100, 500, 'gold', 'amanah', 65, 'Legendary! 100 meditation sessions!', 'You have achieved mindfulness mastery!');

-- GENERAL Achievements
INSERT INTO achievements (title, description, icon_name, requirement_type, requirement_value, points, tier, category, order_index, unlock_message, next_steps) VALUES
-- Streak Achievements
('Three Day Streak', 'Maintain a 3-day activity streak', 'flame.fill', 'streak', 3, 25, 'bronze', 'general', 70, 'Great! You are building consistency!', 'Aim for 7 days to become a Week Warrior.'),
('Week Warrior', 'Maintain a 7-day activity streak', 'flame.circle.fill', 'streak', 7, 50, 'bronze', 'general', 71, 'Excellent! One full week of consistency!', 'Continue to 14 days to become a Two Week Champion.'),
('Two Week Champion', 'Maintain a 14-day activity streak', 'star.fill', 'streak', 14, 100, 'silver', 'general', 72, 'Outstanding! Two weeks of dedication!', 'Reach 30 days for Month of Dedication.'),
('Month of Dedication', 'Maintain a 30-day activity streak', 'calendar.badge.checkmark', 'streak', 30, 250, 'silver', 'general', 73, 'Incredible! A full month of consistency!', 'Continue to 60 days for Two Month Master.'),
('Two Month Master', 'Maintain a 60-day activity streak', 'star.circle.fill', 'streak', 60, 500, 'gold', 'general', 74, 'Masterful! 60 days of dedication!', 'Push to 90 days to become a Three Month Legend.'),
('Three Month Legend', 'Maintain a 90-day activity streak', 'crown.fill', 'streak', 90, 750, 'gold', 'general', 75, 'Legendary! 90 days of consistency!', 'Aim for 180 days for Half Year Icon.'),
('Half Year Icon', 'Maintain a 180-day activity streak', 'crown.fill', 'streak', 180, 1000, 'platinum', 'general', 76, '🏆 ICON! Half a year of dedication!', 'Continue to 365 days for Year of Excellence!'),
('Year of Excellence', 'Maintain a 365-day activity streak', 'crown.fill', 'streak', 365, 2000, 'platinum', 'general', 77, '🏆🏆🏆 LEGENDARY! A FULL YEAR OF EXCELLENCE!', 'You have achieved the ultimate consistency!'),

-- Days Active Achievements
('First Day', 'Be active for your first day', 'sun.max.fill', 'days_active', 1, 10, 'bronze', 'general', 80, 'Welcome! Your journey begins today!', 'Continue to be active and build your streak.');

-- ============================================================================
-- 7. VERIFICATION QUERIES
-- ============================================================================
-- Check achievements were created
SELECT COUNT(*) as total_achievements, category, tier
FROM achievements
GROUP BY category, tier
ORDER BY category, tier;

-- Show sample achievements
SELECT id, title, category, tier, requirement_type, requirement_value
FROM achievements
ORDER BY category, order_index
LIMIT 20;
