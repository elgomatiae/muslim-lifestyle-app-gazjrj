
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecitationRow {
  Title: string;
  Description: string | null;
  'Thumbnail url': string | null;
  'Channel name': string | null;
  Views: number | null;
  'Duration in seconds': number | null;
  'Video url': string | null;
}

interface CategoryMap {
  [key: string]: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { batchSize = 10, startIndex = 0 } = await req.json();

    console.log(`Processing batch: startIndex=${startIndex}, batchSize=${batchSize}`);

    // Fetch recitation categories
    const { data: categories, error: catError } = await supabase
      .from('video_categories')
      .select('id, name')
      .eq('type', 'recitation')
      .order('order_index');

    if (catError || !categories || categories.length === 0) {
      throw new Error('Failed to fetch recitation categories');
    }

    const categoryMap: CategoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    console.log('Available categories:', Object.keys(categoryMap));

    // Fetch batch of recitations
    const { data: recitations, error: recError } = await supabase
      .from('quran_recitations')
      .select('*')
      .range(startIndex, startIndex + batchSize - 1);

    if (recError) {
      throw new Error(`Failed to fetch recitations: ${recError.message}`);
    }

    if (!recitations || recitations.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          processed: 0,
          successCount: 0,
          errorCount: 0,
          nextStartIndex: startIndex,
          totalProcessed: 0,
          results: [],
          message: 'No more recitations to process',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${recitations.length} recitations`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const recitation of recitations as RecitationRow[]) {
      try {
        const title = recitation.Title || 'Untitled';
        let categoryId = categoryMap['Surah Recitations']; // Default category

        // Smart categorization based on title
        const titleLower = title.toLowerCase();
        
        if (titleLower.includes('full quran') || titleLower.includes('complete quran') || titleLower.includes('entire quran')) {
          categoryId = categoryMap['Full Quran'];
        } else if (titleLower.includes('juz') || titleLower.includes('para')) {
          categoryId = categoryMap['Juz Recitations'];
        } else if (titleLower.includes('tajweed') || titleLower.includes('rules') || titleLower.includes('lesson')) {
          categoryId = categoryMap['Tajweed Lessons'];
        } else if (titleLower.includes('memorization') || titleLower.includes('memorize') || titleLower.includes('hifz')) {
          categoryId = categoryMap['Memorization'];
        } else if (titleLower.includes('taraweeh') || titleLower.includes('ramadan')) {
          categoryId = categoryMap['Taraweeh'];
        } else if (titleLower.includes('tilawah') || titleLower.includes('recitation')) {
          categoryId = categoryMap['Tilawah'];
        } else if (titleLower.includes('eid') || titleLower.includes('special') || titleLower.includes('occasion')) {
          categoryId = categoryMap['Special Occasions'];
        }

        // Use OpenAI for more accurate categorization if available
        if (openaiKey && titleLower.length > 10) {
          try {
            const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                  {
                    role: 'system',
                    content: 'You are an Islamic content categorization expert. Categorize Quran recitation videos into one of these categories: Full Quran, Juz Recitations, Surah Recitations, Tilawah, Tajweed Lessons, Memorization, Taraweeh, Special Occasions. Respond with ONLY the category name, nothing else.',
                  },
                  {
                    role: 'user',
                    content: `Categorize this Quran recitation: "${title}"`,
                  },
                ],
                temperature: 0.3,
                max_tokens: 50,
              }),
            });

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              const aiCategory = aiData.choices[0]?.message?.content?.trim();
              if (aiCategory && categoryMap[aiCategory]) {
                categoryId = categoryMap[aiCategory];
                console.log(`AI categorized "${title}" as "${aiCategory}"`);
              }
            }
          } catch (aiError) {
            console.log(`AI categorization failed for "${title}", using fallback`);
          }
        }

        // Insert into videos table
        const { error: insertError } = await supabase
          .from('videos')
          .insert({
            title: title,
            description: recitation.Description || '',
            thumbnail_url: recitation['Thumbnail url'] || '',
            video_url: recitation['Video url'] || '',
            category_id: categoryId,
            duration: recitation['Duration in seconds'] || 0,
            reciter_name: recitation['Channel name'] || '',
            views: recitation.Views || 0,
            order_index: 0,
          });

        if (insertError) {
          throw new Error(insertError.message);
        }

        const categoryName = Object.keys(categoryMap).find(key => categoryMap[key] === categoryId) || 'Unknown';
        results.push({
          title: title,
          category: categoryName,
          success: true,
        });
        successCount++;
      } catch (error) {
        console.error(`Error processing recitation "${recitation.Title}":`, error);
        results.push({
          title: recitation.Title || 'Unknown',
          success: false,
          error: error.message,
        });
        errorCount++;
      }
    }

    const response = {
      success: true,
      processed: recitations.length,
      successCount,
      errorCount,
      nextStartIndex: startIndex + recitations.length,
      totalProcessed: startIndex + recitations.length,
      results,
    };

    console.log(`Batch complete: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
