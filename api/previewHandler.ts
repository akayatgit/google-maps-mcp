/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { trace } from '../utils/logger.js';
import { Request, Response } from 'express';
import axios from 'axios';
import type { AxiosError as _AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import { getPlaceDetailsReal } from '../services/complementaryServices.js';

/**
 * Express handler to fetch link metadata (title, description, image, url, favicon) from a given URL.
 */
export async function linkPreviewHandler(req: Request, res: Response): Promise<void> {
  const url = req.query.url as string | undefined;

  if (!url) {
    res.status(400).json({ error: 'Missing URL parameter' });
    return;
  }

  // Use a real browser User-Agent to avoid being blocked by Google Maps and other sites
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    const isGoogleMaps = hostname.includes('google.com') && (parsedUrl.pathname.includes('/maps/') || hostname === 'maps.google.com');

    let finalUrl = url;
    let htmlContent = '';

    // Special handling for Google Maps to avoid 429/CAPTCHA blocks
    if (isGoogleMaps) {
      trace(`[LinkPreview] Detected Google Maps URL: ${url}. Using redirect strategy.`);

      // Strategy: Follow redirects manually to find a Place ID or Place Name in the URL
      // without downloading the full body if possible, or at least being careful.
      try {
        const response = await axios.get(url, {
          headers: { 'User-Agent': USER_AGENT },
          maxRedirects: 0, // Manual redirect handling
          validateStatus: (status) => status >= 200 && status < 400
        });

        if (response.status >= 300 && response.status < 400 && response.headers.location) {
          const redirectUrl = response.headers.location;
          trace(`[LinkPreview] Maps Redirect found: ${redirectUrl}`);

          // Check if redirect URL contains useful info
          if (redirectUrl.includes('/maps/place/')) {
            // Extract name from URL: https://www.google.com/maps/place/NAME/@...
            const parts = redirectUrl.split('/maps/place/')[1].split('/');
            const name = decodeURIComponent(parts[0].replace(/\+/g, ' '));

            if (name) {
              trace(`[LinkPreview] Extracted place name from redirect: ${name}`);
              res.status(200).json({
                          title: name,
                          description: 'View location on Google Maps.',
                          url: redirectUrl,
                          image: 'https://maps.gstatic.com/tactile/basepage/pegman_sherlock.png', // Generic maps image
                          favicon: 'https://www.google.com/images/branding/product/ico/googleg_lodp.ico'
                        });
                      return;
                    }
          }

          // If it's just another CID redirect (e.g. maps.google.com/maps?cid=...), we might need to follow it again.
          // But for now, let's fall back to the generic card if we can't easily parse it.
          // Or we can try to fetch the redirect URL.
          finalUrl = redirectUrl;
        } else if (response.status === 200) {
          htmlContent = response.data;
        }
      } catch (e) {
        console.warn(`[LinkPreview] Maps redirect strategy failed:`, e);
        // Fall through to standard scraping or generic fallback
      }
    }

    // Standard Scraping (if not handled above)
    if (!htmlContent) {
      const { data } = await axios.get(finalUrl, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 5000,
      });
      htmlContent = data;
    }

    // 2. Load into parser
    const $ = cheerio.load(htmlContent);

    // 3. Extract metadata
    const metaTags = {
      // Prioritize OG title, fallback to <title>
      title: $('meta[property="og:title"]').attr('content') || $('title').text(),

      // Prioritize OG description, fallback to <meta name="description">
      description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),

      // Prioritize OG image
      image: $('meta[property="og:image"]').attr('content'),

      // Prioritize OG URL, fallback to requested URL
      url: $('meta[property="og:url"]').attr('content') || finalUrl,

      // Favicon (check multiple link tags)
      favicon: $('link[rel="icon"]').attr('href') ||
               $('link[rel="shortcut icon"]').attr('href') ||
               $('link[rel="apple-touch-icon"]').attr('href')
    };

    // Simple relative URL resolution for favicon (only if favicon exists and is relative)
    if (metaTags.favicon) {
      try {
        const baseUrl = new URL(finalUrl).origin;
        // Use URL constructor to handle relative paths gracefully, including absolute paths starting with /
        metaTags.favicon = new URL(metaTags.favicon, baseUrl).toString();
      } catch (_e) {
        // Ignore if URL construction fails (e.g., malformed URL or base URL)
      }
    }

    trace(`[LinkPreview] Successfully fetched metadata for ${url}`);
    res.status(200).json(metaTags);

  } catch (error) {
    console.error(`[LinkPreview] Failed to fetch link metadata for ${url}. Error:`, error);

    // Fallback for Google Maps URLs if scraping fails
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();
      if (hostname.includes('google.com') && (parsedUrl.pathname.includes('/maps/') || parsedUrl.pathname.includes('/place/') || parsedUrl.search.includes('cid=') || hostname === 'maps.google.com')) {
        trace(`[LinkPreview] Scraping failed for Maps URL, returning generic metadata: ${url}`);
        res.status(200).json({
          title: 'Google Maps Link',
          description: 'View location on Google Maps.',
          url: url,
          image: 'https://maps.gstatic.com/tactile/basepage/pegman_sherlock.png',
          favicon: 'https://www.google.com/images/branding/product/ico/googleg_lodp.ico'
        });
        return;
      }
    } catch (_e) {
      // Ignore URL parsing errors in catch block
    }

    let details: string | number = 'Unknown internal error';

    if (axios.isAxiosError(error)) {
      details = error.response?.status ?? 'Network error/Timeout';
    } else if (error instanceof Error) {
      details = error.message;
    }

    // Always return 422 for any failure during link processing to avoid client-side reporting of a generic 500 internal server error.
    res.status(422).json({
      error: 'Failed to process link metadata',
      details: details
    });
  }
}