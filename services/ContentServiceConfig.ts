/**
 * ContentServiceConfig - Configuration for mapping your Supabase table/column names
 * 
 * UPDATE THIS FILE WITH YOUR ACTUAL TABLE AND COLUMN NAMES
 * The app will automatically use these mappings when fetching content
 */

export interface TableColumnMapping {
  // Table names
  dailyVersesTable: string;
  dailyHadithsTable: string;
  userDailyContentTable: string;
  videoCategoriesTable: string;
  videosTable: string;

  // Daily Verses columns
  dailyVerses: {
    id: string;
    arabic_text: string;
    translation: string;
    reference: string;
    is_active: string;
    created_at?: string;
    updated_at?: string;
  };

  // Daily Hadiths columns
  dailyHadiths: {
    id: string;
    arabic_text?: string;
    translation: string;
    source: string;
    is_active: string;
    created_at?: string;
    updated_at?: string;
  };

  // User Daily Content columns
  userDailyContent: {
    id?: string;
    user_id: string;
    date: string;
    verse_id: string;
    hadith_id: string;
  };

  // Video Categories columns
  videoCategories: {
    id: string;
    name: string;
    description?: string;
    type: string;
    order_index?: string;
  };

  // Videos columns
  videos: {
    id: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    image_url?: string;
    video_url: string;
    category_id: string;
    duration?: string;
    scholar_name?: string;
    reciter_name?: string;
    views: string;
    order_index?: string;
    created_at?: string;
    updated_at?: string;
  };
}

/**
 * DEFAULT CONFIGURATION
 * Mapped to your actual Supabase schema
 */
export const contentServiceConfig: TableColumnMapping = {
  // ============================================================================
  // TABLE NAMES - Your actual table names
  // ============================================================================
  dailyVersesTable: 'quran_verses',              // Your verses table
  dailyHadithsTable: 'hadiths',                  // Your hadiths table
  userDailyContentTable: 'user_daily_content',   // Will create if needed, or use alternative
  videoCategoriesTable: null as any,             // Categories embedded in lectures/recitations via category_id
  videosTable: 'lectures',                       // For lectures (separate from recitations)

  // ============================================================================
  // DAILY VERSES COLUMNS - Mapped from quran_verses table
  // ============================================================================
  dailyVerses: {
    id: 'id',
    arabic_text: 'arabic',                       // Maps FROM 'arabic' TO 'arabic_text'
    translation: 'translation',                  // Your column: translation
    reference: 'reference',                      // Your column: reference
    is_active: null as any,                      // NOT IN YOUR SCHEMA - will default to true
    created_at: 'created_at',                    // Your column: created_at
    updated_at: undefined,                       // Not in your schema
  },

  // ============================================================================
  // DAILY HADITHS COLUMNS - Mapped from hadiths table
  // ============================================================================
  dailyHadiths: {
    id: 'id',
    arabic_text: 'arabic',                       // Maps FROM 'arabic' TO 'arabic_text'
    translation: 'translation',                  // Your column: translation
    source: 'reference',                         // Your column: reference (we'll enhance with collection + hadith_number)
    is_active: null as any,                      // NOT IN YOUR SCHEMA - will default to true
    created_at: 'created_at',                    // Your column: created_at
    updated_at: undefined,                       // Not in your schema
  },

  // ============================================================================
  // USER DAILY CONTENT COLUMNS - Need to create this table or use alternative
  // ============================================================================
  userDailyContent: {
    id: 'id',
    user_id: 'user_id',
    date: 'date',
    verse_id: 'verse_id',
    hadith_id: 'hadith_id',
  },

  // ============================================================================
  // VIDEO CATEGORIES COLUMNS - Categories are stored as text in category_id
  // No separate categories table - categories are text values in category_id
  // ============================================================================
  videoCategories: {
    id: 'category_id',                           // category_id is text, used as both id and name
    name: 'category_id',                         // Same as id - category_id contains the name
    description: undefined,
    type: 'type',                                // Determined by table (lectures vs recitations)
    order_index: undefined,
  },

  // ============================================================================
  // VIDEOS COLUMNS - Mapped from lectures/recitations tables
  // ============================================================================
  // Note: These are used for BOTH lectures and recitations
  // For lectures: scholar_name maps to 'speaker'
  // For recitations: reciter_name maps to 'reciter'
  videos: {
    id: 'id',
    title: 'title',                              // Your column: title
    description: undefined,                      // Not in your schema
    thumbnail_url: 'thumbnail_url',              // Your column: thumbnail_url
    image_url: 'thumbnail_url',                  // Using thumbnail_url as image_url
    video_url: 'video_url',                      // Your column: video_url
    category_id: 'category_id',                  // Your column: category_id (text, not UUID)
    duration: 'duration',                        // Your column: duration (text, not integer)
    scholar_name: 'speaker',                     // For lectures: maps to 'speaker' column
    reciter_name: 'reciter',                     // For recitations: maps to 'reciter' column
    views: undefined as any,                     // NOT IN YOUR SCHEMA - will default to 0
    order_index: 'order_index',                  // Your column: order_index
    created_at: 'created_at',                    // Your column: created_at
    updated_at: 'updated_at',                    // Your column: updated_at
  },
};
