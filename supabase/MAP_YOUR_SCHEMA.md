# Map Your Supabase Schema

This guide will help you map your existing Supabase tables to what the app expects.

## Quick Start - 3 Steps

### Step 1: Discover Your Tables

Run this query in your Supabase SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**List your table names here:**
- Verses table: _______________________
- Hadiths table: _______________________
- User daily content table: _______________________
- Video categories table: _______________________
- Videos table: _______________________

### Step 2: Discover Your Columns

For each table, run this query (replace `YOUR_TABLE_NAME`):

```sql
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'YOUR_TABLE_NAME'
ORDER BY ordinal_position;
```

**Example - If your verses table is called `quran_verses`, run:**

```sql
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'quran_verses'
ORDER BY ordinal_position;
```

### Step 3: Fill Out This Mapping

Copy the template below and fill it out with your actual table/column names:

```typescript
// In project/services/ContentServiceConfig.ts, update these values:

export const contentServiceConfig: TableColumnMapping = {
  // TABLE NAMES
  dailyVersesTable: 'YOUR_VERSES_TABLE_NAME',
  dailyHadithsTable: 'YOUR_HADITHS_TABLE_NAME',
  userDailyContentTable: 'YOUR_USER_CONTENT_TABLE_NAME',
  videoCategoriesTable: 'YOUR_CATEGORIES_TABLE_NAME',
  videosTable: 'YOUR_VIDEOS_TABLE_NAME',

  // DAILY VERSES COLUMNS
  dailyVerses: {
    id: 'YOUR_ID_COLUMN',              // e.g., 'id' or 'verse_id'
    arabic_text: 'YOUR_ARABIC_COLUMN',  // e.g., 'arabic' or 'arabic_text'
    translation: 'YOUR_TRANSLATION_COLUMN', // e.g., 'english' or 'translation'
    reference: 'YOUR_REFERENCE_COLUMN', // e.g., 'surah_ayah' or 'reference'
    is_active: 'YOUR_ACTIVE_COLUMN',    // e.g., 'active' or 'is_active' or 'enabled'
    created_at: 'YOUR_CREATED_COLUMN',  // Optional
    updated_at: 'YOUR_UPDATED_COLUMN',  // Optional
  },

  // ... (continue for other tables)
};
```

## What I Need From You

Share with me:

1. **Your table names** - What are your actual table names?
2. **Your column names** - What are the column names in each table?
3. **Any differences** - Are there any columns that don't exist or work differently?

### Example Sharing Format

```
DAILY VERSES TABLE:
Table name: quran_verses
Columns:
- verse_id (UUID)
- arabic (TEXT)
- english_translation (TEXT)
- surah_ayah (VARCHAR)
- enabled (BOOLEAN)

DAILY HADITHS TABLE:
Table name: prophetic_sayings
Columns:
- hadith_id (UUID)
- text_arabic (TEXT, nullable)
- text_english (TEXT)
- source_book (VARCHAR)
- active (BOOLEAN)
```

Once you share this, I'll update the configuration file for you!

## Quick Discovery Query

Run this all-in-one query to see your schema:

```sql
-- Run this to see all your tables and columns at once
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
FROM information_schema.tables t
LEFT JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;
```

Copy and share the results - I'll configure everything for you!
