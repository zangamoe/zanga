/**
 * Imgur URL Parser - Extract images from imgur albums/galleries
 * Works similar to guya.moe and cubari.moe
 */

export interface ImgurImage {
  url: string;
  page_number: number;
}

/**
 * Parse imgur album/gallery URL and return direct image URLs
 * Supports formats:
 * - https://imgur.com/a/ALBUM_ID
 * - https://imgur.com/gallery/GALLERY_ID
 * - Direct image URLs
 */
export async function parseImgurUrl(imgurUrl: string): Promise<ImgurImage[]> {
  try {
    // Clean the URL
    const cleanUrl = imgurUrl.trim();
    
    // Check if it's an album or gallery URL
    const albumMatch = cleanUrl.match(/imgur\.com\/a\/([a-zA-Z0-9]+)/);
    const galleryMatch = cleanUrl.match(/imgur\.com\/gallery\/([a-zA-Z0-9]+)/);
    
    let albumId: string | null = null;
    
    if (albumMatch) {
      albumId = albumMatch[1];
    } else if (galleryMatch) {
      albumId = galleryMatch[1];
    }
    
    if (albumId) {
      // Fetch album data using imgur's oembed endpoint (no API key needed)
      const response = await fetch(`https://imgur.com/a/${albumId}.json`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch imgur album');
      }
      
      const data = await response.json();
      
      // Extract images from the album data
      if (data.data && data.data.images) {
        return data.data.images.map((img: any, index: number) => ({
          url: `https://i.imgur.com/${img.hash}${img.ext}`,
          page_number: index + 1
        }));
      }
      
      // Fallback: try to parse album page HTML
      return await parseImgurAlbumHTML(albumId);
    }
    
    // If it's a direct image URL, return it as a single-page "album"
    if (cleanUrl.match(/i\.imgur\.com\/[a-zA-Z0-9]+\.(jpg|jpeg|png|gif|webp)/i)) {
      return [{
        url: cleanUrl,
        page_number: 1
      }];
    }
    
    throw new Error('Invalid imgur URL format. Please provide an album, gallery, or direct image URL.');
  } catch (error) {
    console.error('Error parsing imgur URL:', error);
    throw error;
  }
}

/**
 * Parse imgur album HTML page to extract image URLs
 * Fallback method when JSON API doesn't work
 */
async function parseImgurAlbumHTML(albumId: string): Promise<ImgurImage[]> {
  try {
    const response = await fetch(`https://imgur.com/a/${albumId}`);
    const html = await response.text();
    
    // Extract image data from the page's JSON data
    const jsonMatch = html.match(/image\s*:\s*({.*?})/s);
    if (jsonMatch) {
      const imageData = JSON.parse(jsonMatch[1]);
      if (imageData.album_images && imageData.album_images.images) {
        return imageData.album_images.images.map((img: any, index: number) => ({
          url: `https://i.imgur.com/${img.hash}${img.ext}`,
          page_number: index + 1
        }));
      }
    }
    
    // Fallback: extract from HTML img tags
    const imgRegex = /<img[^>]+src="(https?:\/\/i\.imgur\.com\/[a-zA-Z0-9]+\.[a-zA-Z]+)"/g;
    const images: ImgurImage[] = [];
    let match;
    let pageNum = 1;
    
    while ((match = imgRegex.exec(html)) !== null) {
      images.push({
        url: match[1],
        page_number: pageNum++
      });
    }
    
    if (images.length > 0) {
      return images;
    }
    
    throw new Error('Could not extract images from imgur album');
  } catch (error) {
    console.error('Error parsing imgur album HTML:', error);
    throw error;
  }
}

/**
 * Validate if a URL is a valid imgur URL
 */
export function isValidImgurUrl(url: string): boolean {
  return /imgur\.com\/(a|gallery)\/[a-zA-Z0-9]+/.test(url) || 
         /i\.imgur\.com\/[a-zA-Z0-9]+\.(jpg|jpeg|png|gif|webp)/i.test(url);
}

/**
 * Extract album ID from imgur URL
 */
export function extractImgurAlbumId(url: string): string | null {
  const albumMatch = url.match(/imgur\.com\/a\/([a-zA-Z0-9]+)/);
  const galleryMatch = url.match(/imgur\.com\/gallery\/([a-zA-Z0-9]+)/);
  return albumMatch?.[1] || galleryMatch?.[1] || null;
}
