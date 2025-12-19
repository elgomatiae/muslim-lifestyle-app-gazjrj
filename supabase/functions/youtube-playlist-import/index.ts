
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlaylistItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high: {
        url: string;
      };
      medium: {
        url: string;
      };
      default: {
        url: string;
      };
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { playlistUrl, categoryId } = await req.json();

    if (!playlistUrl || !categoryId) {
      return new Response(
        JSON.stringify({ error: 'Missing playlistUrl or categoryId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract playlist ID from URL
    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube playlist URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get YouTube API key from environment
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!youtubeApiKey) {
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch playlist items from YouTube API
    const videos = await fetchPlaylistVideos(playlistId, youtubeApiKey);

    if (videos.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No videos found in playlist' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert videos into database
    const insertedVideos = [];
    let successCount = 0;
    let errorCount = 0;

    for (const video of videos) {
      try {
        const { data, error } = await supabase
          .from('videos')
          .insert({
            title: video.title,
            description: video.description || '',
            thumbnail_url: video.thumbnailUrl,
            video_url: video.videoUrl,
            category_id: categoryId,
            duration: video.duration,
            scholar_name: video.channelTitle,
            views: 0,
            order_index: video.position,
          })
          .select()
          .single();

        if (error) {
          console.error('Error inserting video:', error);
          errorCount++;
        } else {
          insertedVideos.push(data);
          successCount++;
        }
      } catch (err) {
        console.error('Error processing video:', err);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${successCount} videos. ${errorCount} errors.`,
        totalVideos: videos.length,
        successCount,
        errorCount,
        videos: insertedVideos,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in youtube-playlist-import:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractPlaylistId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Handle different YouTube playlist URL formats
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('list');
    }
    
    // Handle youtu.be format (less common for playlists)
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.searchParams.get('list');
    }
    
    return null;
  } catch {
    return null;
  }
}

async function fetchPlaylistVideos(playlistId: string, apiKey: string) {
  const videos = [];
  let nextPageToken = '';
  
  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract video IDs for duration lookup
    const videoIds = data.items.map((item: PlaylistItem) => item.contentDetails.videoId).join(',');
    
    // Fetch video durations
    const durationsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`;
    const durationsResponse = await fetch(durationsUrl);
    const durationsData = await durationsResponse.json();
    
    // Create a map of video ID to duration
    const durationMap = new Map();
    durationsData.items.forEach((video: VideoDetails) => {
      durationMap.set(video.id, parseDuration(video.contentDetails.duration));
    });
    
    // Process each video
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      const videoId = item.contentDetails.videoId;
      
      videos.push({
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        channelTitle: item.snippet.channelTitle,
        duration: durationMap.get(videoId) || 0,
        position: videos.length + 1,
      });
    }
    
    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);
  
  return videos;
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
