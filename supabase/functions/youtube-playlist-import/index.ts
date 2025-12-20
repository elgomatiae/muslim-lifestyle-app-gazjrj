
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  playlistUrl: string;
  targetType: 'lecture' | 'recitation';
}

interface PlaylistItem {
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
    resourceId: {
      videoId: string;
    };
    channelTitle: string;
  };
  contentDetails: {
    videoId: string;
  };
}

interface VideoDetails {
  id: string;
  contentDetails: {
    duration: string;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
  type: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('YouTube Playlist Import: Starting...');

    // Parse request body
    const body: RequestBody = await req.json();
    const { playlistUrl, targetType } = body;

    console.log('Request body:', { playlistUrl, targetType });

    // Validate input
    if (!playlistUrl || !targetType) {
      console.error('Missing required fields:', { playlistUrl, targetType });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Missing required fields: playlistUrl and targetType' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (targetType !== 'lecture' && targetType !== 'recitation') {
      console.error('Invalid targetType:', targetType);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'targetType must be either "lecture" or "recitation"' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract playlist ID
    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      console.error('Invalid playlist URL:', playlistUrl);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid YouTube playlist URL. Please provide a valid playlist URL.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Extracted playlist ID:', playlistId);

    // Get API keys
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!youtubeApiKey) {
      console.error('YOUTUBE_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'YouTube API key not configured. Please contact administrator.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'OpenAI API key not configured. Please contact administrator.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Supabase credentials not configured. Please contact administrator.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch categories for the target type
    console.log('Fetching categories for type:', targetType);
    const { data: categories, error: categoriesError } = await supabase
      .from('video_categories')
      .select('id, name, description, type')
      .eq('type', targetType)
      .order('order_index');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to fetch categories from database.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!categories || categories.length === 0) {
      console.error('No categories found for type:', targetType);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `No categories found for ${targetType}s. Please create categories first.` 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found ${categories.length} categories`);

    // Fetch playlist videos from YouTube
    console.log('Fetching playlist videos from YouTube...');
    const videos = await fetchPlaylistVideos(playlistId, youtubeApiKey);

    if (videos.length === 0) {
      console.log('No videos found in playlist');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'No videos found in the playlist.' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found ${videos.length} videos in playlist`);

    // Process videos with AI categorization
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      console.log(`Processing video ${i + 1}/${videos.length}: ${video.title}`);

      try {
        // Use AI to determine the best category
        const categoryId = await categorizeVideo(
          video.title,
          video.description,
          categories as Category[],
          openaiApiKey
        );

        console.log(`AI selected category ID: ${categoryId}`);

        // Insert video into database
        const videoData: any = {
          title: video.title,
          description: video.description || '',
          thumbnail_url: video.thumbnailUrl,
          video_url: video.videoUrl,
          category_id: categoryId,
          duration: video.duration,
          views: 0,
          order_index: i,
        };

        // Add scholar_name or reciter_name based on type
        if (targetType === 'lecture') {
          videoData.scholar_name = video.channelTitle;
        } else {
          videoData.reciter_name = video.channelTitle;
        }

        const { error: insertError } = await supabase
          .from('videos')
          .insert(videoData);

        if (insertError) {
          console.error(`Error inserting video "${video.title}":`, insertError);
          errorCount++;
          errors.push(`${video.title}: ${insertError.message}`);
        } else {
          console.log(`Successfully inserted video: ${video.title}`);
          successCount++;
        }
      } catch (error: any) {
        console.error(`Error processing video "${video.title}":`, error);
        errorCount++;
        errors.push(`${video.title}: ${error.message}`);
      }
    }

    console.log(`Import complete. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${successCount} out of ${videos.length} videos.`,
        totalVideos: videos.length,
        successCount,
        errorCount,
        errors: errorCount > 0 ? errors : undefined,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Unhandled error in youtube-playlist-import:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unexpected error occurred.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function extractPlaylistId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Handle different YouTube playlist URL formats
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      const listParam = urlObj.searchParams.get('list');
      if (listParam) {
        return listParam;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

async function fetchPlaylistVideos(playlistId: string, apiKey: string) {
  const videos: any[] = [];
  let nextPageToken = '';
  
  try {
    do {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
      
      console.log('Fetching playlist page...');
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('YouTube API error:', errorText);
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        break;
      }
      
      // Extract video IDs for duration lookup
      const videoIds = data.items
        .map((item: PlaylistItem) => item.contentDetails.videoId)
        .filter((id: string) => id)
        .join(',');
      
      // Fetch video durations
      const durationsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`;
      const durationsResponse = await fetch(durationsUrl);
      
      if (!durationsResponse.ok) {
        console.error('Error fetching video durations');
      }
      
      const durationsData = await durationsResponse.json();
      
      // Create a map of video ID to duration
      const durationMap = new Map<string, number>();
      if (durationsData.items) {
        durationsData.items.forEach((video: VideoDetails) => {
          durationMap.set(video.id, parseDuration(video.contentDetails.duration));
        });
      }
      
      // Process each video
      for (const item of data.items) {
        const videoId = item.contentDetails.videoId;
        
        videos.push({
          title: item.snippet.title,
          description: item.snippet.description || '',
          thumbnailUrl: 
            item.snippet.thumbnails.high?.url || 
            item.snippet.thumbnails.medium?.url || 
            item.snippet.thumbnails.default?.url ||
            `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          channelTitle: item.snippet.channelTitle,
          duration: durationMap.get(videoId) || 0,
        });
      }
      
      nextPageToken = data.nextPageToken || '';
    } while (nextPageToken);
    
    return videos;
  } catch (error: any) {
    console.error('Error fetching playlist videos:', error);
    throw error;
  }
}

function parseDuration(duration: string): number {
  // Parse ISO 8601 duration format (e.g., PT1H2M10S)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

async function categorizeVideo(
  title: string,
  description: string,
  categories: Category[],
  openaiApiKey: string
): Promise<string> {
  try {
    // Build category list for AI
    const categoryList = categories
      .map((cat, idx) => `${idx + 1}. ${cat.name}: ${cat.description}`)
      .join('\n');

    const prompt = `You are an Islamic content categorization expert. Based on the video title and description, select the MOST appropriate category from the list below.

Video Title: "${title}"
Video Description: "${description}"

Available Categories:
${categoryList}

Instructions:
- Analyze the title and description carefully
- Choose the single most relevant category
- Respond with ONLY the category number (e.g., "1" or "3")
- Do not include any explanation or additional text

Your response (number only):`;

    console.log('Calling OpenAI for categorization...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at categorizing Islamic educational content. Always respond with only a number corresponding to the category.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content?.trim() || '';
    
    console.log('AI response:', aiResponse);

    // Parse the category number
    const categoryIndex = parseInt(aiResponse) - 1;
    
    if (categoryIndex >= 0 && categoryIndex < categories.length) {
      return categories[categoryIndex].id;
    } else {
      console.warn(`Invalid category index ${categoryIndex}, using first category as fallback`);
      return categories[0].id;
    }
  } catch (error: any) {
    console.error('Error in AI categorization:', error);
    // Fallback to first category if AI fails
    console.log('Using first category as fallback');
    return categories[0].id;
  }
}
