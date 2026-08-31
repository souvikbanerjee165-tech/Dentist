import mammoth from 'mammoth';
import * as cheerio from 'cheerio';

export class DocumentExtractorService {
  /**
   * Extracts clean text from PDF buffer using dynamic import to avoid cold-start crashes
   */
  static async extractFromPdf(buffer: Buffer): Promise<string> {
    try {
      const pdfParseModule = await import('pdf-parse');
      const parser = typeof pdfParseModule === 'function' 
        ? pdfParseModule 
        : (pdfParseModule as any).default || pdfParseModule;
      
      const data = await (parser as any)(buffer);
      return data.text.trim();
    } catch (error) {
      console.warn('PDF parsing notice:', error);
      // Fallback text extraction
      return buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
    }
  }

  /**
   * Extracts clean text from Word .docx buffer
   */
  static async extractFromDocx(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    } catch (error) {
      console.error('Failed to extract text from Word document:', error);
      throw new Error('Invalid or corrupted Word (.docx) document.');
    }
  }

  /**
   * Extracts clean text from plain TXT / Markdown buffer
   */
  static extractFromTxt(buffer: Buffer): string {
    return buffer.toString('utf-8').trim();
  }

  /**
   * Scrapes clean readable text and page title from a website URL
   */
  static async extractFromUrl(url: string): Promise<{ title: string; text: string }> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const title = $('title').text().trim() || url;

      // Remove script tags, stylesheets, and navigation clutter
      $('script, style, noscript, nav, footer, header, svg').remove();

      // Extract main text content
      const text = $('body').text().replace(/\s+/g, ' ').trim();
      return { title, text };
    } catch (error: any) {
      console.error(`Failed to scrape URL "${url}":`, error.message);
      throw new Error(`Failed to crawl web URL: ${error.message}`);
    }
  }
}
