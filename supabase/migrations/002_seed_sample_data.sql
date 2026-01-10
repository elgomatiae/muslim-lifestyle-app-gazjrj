-- ============================================================================
-- SUPABASE MIGRATION: Seed Sample Data
-- ============================================================================
-- This migration adds sample data for testing and demonstration
-- You can modify this data or add your own content
-- ============================================================================

-- ============================================================================
-- 1. SEED SAMPLE DAILY VERSES
-- ============================================================================

INSERT INTO public.daily_verses (arabic_text, translation, reference, is_active) VALUES
(
    'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنْسَ إِلَّا لِيَعْبُدُونِ',
    'And I did not create the jinn and mankind except to worship Me.',
    'Quran 51:56',
    true
),
(
    'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
    'O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous.',
    'Quran 2:183',
    true
),
(
    'وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ',
    'And remind, for indeed, the reminder benefits the believers.',
    'Quran 51:55',
    true
),
(
    'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    'Indeed, with hardship [will be] ease.',
    'Quran 94:6',
    true
),
(
    'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    'Our Lord, give us good in this world and good in the Hereafter and save us from the punishment of the Fire.',
    'Quran 2:201',
    true
),
(
    'وَمَنْ يَتَّقِ اللَّهَ يَجْعَلْ لَهُ مَخْرَجًا',
    'And whoever fears Allah - He will make for him a way out.',
    'Quran 65:2',
    true
),
(
    'وَمَنْ يَتَّقِ اللَّهَ يَجْعَلْ لَهُ مِنْ أَمْرِهِ يُسْرًا',
    'And whoever fears Allah - He will make for him of his matter ease.',
    'Quran 65:4',
    true
),
(
    'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.',
    'Quran 2:255 (Ayat al-Kursi)',
    true
),
(
    'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ',
    'And my success is not but through Allah.',
    'Quran 11:88',
    true
),
(
    'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    'And say, "My Lord, increase me in knowledge."',
    'Quran 20:114',
    true
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. SEED SAMPLE DAILY HADITHS
-- ============================================================================

INSERT INTO public.daily_hadiths (arabic_text, translation, source, is_active) VALUES
(
    'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    'Actions are but by intention and every man shall have but that which he intended.',
    'Sahih al-Bukhari 1',
    true
),
(
    'مَنْ سَنَّ فِي الإِسْلاَمِ سُنَّةً حَسَنَةً فَلَهُ أَجْرُهَا وَأَجْرُ مَنْ عَمِلَ بِهَا بَعْدَهُ',
    'Whoever initiates a good practice that is followed by others will be credited with its reward and the reward of those who act upon it.',
    'Sahih Muslim 1017',
    true
),
(
    'لاَ يَزَالُ اللِّسَانُ رَطْبًا بِذِكْرِ اللَّهِ',
    'Keep your tongue moist with the remembrance of Allah.',
    'At-Tirmidhi 3375',
    true
),
(
    'الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ',
    'The merciful will be shown mercy by the Most Merciful.',
    'At-Tirmidhi 1924',
    true
),
(
    'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
    'Seeking knowledge is an obligation upon every Muslim.',
    'Ibn Majah 224',
    true
),
(
    'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    'The best among you is the one who learns the Quran and teaches it.',
    'Sahih al-Bukhari 4739',
    true
),
(
    'مَنْ لَمْ يَشْكُرِ النَّاسَ لَمْ يَشْكُرِ اللَّهَ',
    'He who does not thank people does not thank Allah.',
    'At-Tirmidhi 1955',
    true
),
(
    'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ سُرُورٌ تُدْخِلُهُ عَلَى مُسْلِمٍ',
    'The most beloved deeds to Allah are those that bring joy to a Muslim.',
    'Al-Mu''jam al-Awsat 8690',
    true
),
(
    'الصَّبْرُ عِنْدَ الصَّدْمَةِ الأُولَى',
    'Patience is at the first strike.',
    'Sahih al-Bukhari 1302',
    true
),
(
    'الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا',
    'A believer to another believer is like a building whose different parts enforce each other.',
    'Sahih al-Bukhari 481',
    true
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. SEED SAMPLE VIDEO CATEGORIES
-- ============================================================================

-- Lecture categories
INSERT INTO public.video_categories (name, description, type, order_index) VALUES
('Tafsir', 'Quranic exegesis and interpretation', 'lecture', 1),
('Hadith Studies', 'Study of prophetic traditions', 'lecture', 2),
('Fiqh', 'Islamic jurisprudence and rulings', 'lecture', 3),
('Aqeedah', 'Islamic creed and beliefs', 'lecture', 4),
('Seerah', 'Life of Prophet Muhammad (peace be upon him)', 'lecture', 5),
('Contemporary Issues', 'Modern Islamic topics and discussions', 'lecture', 6),
('Ramadan Specials', 'Special lectures for Ramadan', 'lecture', 7),
('Youth & Family', 'Lectures for youth and families', 'lecture', 8)
ON CONFLICT (name, type) DO NOTHING;

-- Recitation categories
INSERT INTO public.video_categories (name, description, type, order_index) VALUES
('Quran Complete', 'Complete Quran recitations', 'recitation', 1),
('Juz Amma', '30th part of the Quran', 'recitation', 2),
('Selected Surahs', 'Individual surahs and selections', 'recitation', 3),
('Taraweeh', 'Special Ramadan night prayers', 'recitation', 4),
('Qiyam al-Layl', 'Night prayers and recitations', 'recitation', 5)
ON CONFLICT (name, type) DO NOTHING;

-- ============================================================================
-- 4. SEED SAMPLE VIDEOS (LECTURES)
-- ============================================================================
-- Note: Replace these with your actual video URLs and content

-- Get category IDs (we'll use a subquery)
INSERT INTO public.videos (title, description, video_url, thumbnail_url, category_id, duration, scholar_name, views, order_index)
SELECT 
    'Introduction to Tafsir',
    'A comprehensive introduction to Quranic exegesis',
    'https://www.youtube.com/watch?v=example1', -- Replace with actual URL
    'https://i.ytimg.com/vi/example1/maxresdefault.jpg',
    id,
    3600, -- 1 hour in seconds
    'Sheikh Example',
    1000,
    1
FROM public.video_categories WHERE name = 'Tafsir' AND type = 'lecture' LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEEDING COMPLETE
-- ============================================================================
-- Note: Add more sample videos as needed. The app will work once you have:
-- 1. At least a few daily verses with is_active = true
-- 2. At least a few daily hadiths with is_active = true
-- 3. Video categories (lecture and recitation types)
-- 4. Videos linked to those categories
-- ============================================================================
