import axios from 'axios';
import * as cheerio from 'cheerio';
import { CrawledContent } from '@/types';

/**
 * Crawl a URL and extract content
 */
export async function crawlUrl(url: string): Promise<CrawledContent> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; KnowledgeBaseCrawler/1.0)',
      },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);
    
    // Extract title
    const title = $('title').text().trim() || 
                  $('meta[property="og:title"]').attr('content')?.trim() ||
                  $('h1').first().text().trim() || 
                  'Untitled';

    // Extract main content
    const content = extractMainContent($);
    
    // Get last modified date
    const lastModified = response.headers['last-modified'] || 
                        $('meta[name="last-modified"]').attr('content') ||
                        new Date().toISOString();

    return {
      title,
      content: cleanText(content),
      lastModified,
    };
  } catch (error) {
    throw new Error(`Failed to crawl ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract main content from parsed HTML
 */
function extractMainContent($: ReturnType<typeof cheerio.load>): string {
  // Try different content selectors in order of preference
  const contentSelectors = [
    'article',
    'main',
    '[role="main"]',
    '.content',
    '.main-content',
    '.post-content',
    '.entry-content',
    '#content',
    '#main',
    'body',
  ];

  for (const selector of contentSelectors) {
    const element = $(selector).first();
    if (element.length > 0) {
      // Remove unwanted elements
      element.find('script, style, nav, header, footer, aside, .sidebar, .navigation, .menu').remove();
      
      const text = element.text();
      if (text.trim().length > 100) { // Ensure we have substantial content
        return text;
      }
    }
  }

  // Fallback: get all text from body, excluding common navigation elements
  $('script, style, nav, header, footer, aside, .sidebar, .navigation, .menu').remove();
  return $('body').text();
}

/**
 * Clean and normalize text
 */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n\s*\n/g, '\n') // Remove excessive line breaks
    .trim();
}

