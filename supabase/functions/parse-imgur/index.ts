import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImgurImage {
  hash: string;
  ext: string;
  title?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imgurUrl } = await req.json();

    if (!imgurUrl) {
      throw new Error('No imgur URL provided');
    }

    console.log('Parsing imgur URL:', imgurUrl);

    // Extract album ID from URL
    const albumMatch = imgurUrl.match(/imgur\.com\/a\/([a-zA-Z0-9]+)/);
    const galleryMatch = imgurUrl.match(/imgur\.com\/gallery\/([a-zA-Z0-9]+)/);
    
    const albumId = albumMatch?.[1] || galleryMatch?.[1];
    
    if (!albumId) {
      throw new Error('Invalid imgur URL format');
    }

    console.log('Album ID:', albumId);

    // Try to fetch the album page
    const albumResponse = await fetch(`https://imgur.com/a/${albumId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });

    if (!albumResponse.ok) {
      throw new Error(`Failed to fetch imgur album: ${albumResponse.status}`);
    }

    const html = await albumResponse.text();
    
    // Extract image data from the page's embedded JSON
    // Imgur embeds album data in a script tag with window.postDataJSON
    const jsonMatch = html.match(/window\.postDataJSON\s*=\s*"([^"]+)"/);
    
    if (jsonMatch) {
      // Decode the escaped JSON string
      const jsonStr = jsonMatch[1]
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
      
      const data = JSON.parse(jsonStr);
      console.log('Found postDataJSON data');
      
      if (data.media && Array.isArray(data.media)) {
        const images = data.media.map((img: any, index: number) => ({
          url: `https://i.imgur.com/${img.hash}${img.ext}`,
          page_number: index + 1,
          hash: img.hash,
          ext: img.ext
        }));
        
        console.log(`Found ${images.length} images`);
        
        return new Response(
          JSON.stringify({ success: true, images }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Alternative: Try to extract from image.album_images
    const altMatch = html.match(/"album_images":\s*\{[^}]*"images":\s*(\[[^\]]+\])/);
    
    if (altMatch) {
      const imagesJson = JSON.parse(altMatch[1]);
      console.log('Found album_images data');
      
      const images = imagesJson.map((img: ImgurImage, index: number) => ({
        url: `https://i.imgur.com/${img.hash}${img.ext}`,
        page_number: index + 1,
        hash: img.hash,
        ext: img.ext
      }));
      
      console.log(`Found ${images.length} images`);
      
      return new Response(
        JSON.stringify({ success: true, images }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Last resort: try to find all direct image URLs in the HTML
    const imgRegex = /https?:\/\/i\.imgur\.com\/([a-zA-Z0-9]+)\.(jpg|jpeg|png|gif|webp)/gi;
    const foundImages = new Set<string>();
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
      foundImages.add(match[0]);
    }
    
    if (foundImages.size > 0) {
      const images = Array.from(foundImages).map((url, index) => ({
        url,
        page_number: index + 1
      }));
      
      console.log(`Found ${images.length} images via regex`);
      
      return new Response(
        JSON.stringify({ success: true, images }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Could not extract images from imgur album');

  } catch (error) {
    console.error('Error parsing imgur:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
