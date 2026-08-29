import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import * as cheerio from 'cheerio';

export class DocumentExtractorService {
  /**
   * Extracts clean text from PDF buffer
   */
  static async extractFromPdf(buffer: Buffer): Promise<string> {
    try {
      // Handle both ES module default import and CJS function export
      const parser = typeof pdfParse === 'function' ? pdfParse : (pdfParse as any).default || pdfParse;
      const data = await (parser as any)(buffer);
      return data.text.trim();
    } catch (error) {
      console.error('Failed to extract text from PDF:', error);
      throw new Error('Invalid or corrupted PDF file.');
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
   * Scrapes, cleans, and extracts main readable text from any website URL
   */
  static async extractFromUrl(url: string): Promise<{ title: string; text: string }> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'WhatsAppSalesBot-RAG-Crawler/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch website (HTTP status ${response.status})`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Strip non-content tags
      $('script, style, noscript, nav, footer, header, svg, form, iframe, button').remove();

      const title = $('title').text().trim() || url;
      
      // Extract text with clean paragraph line breaks
      const text = $('body')
        .find('p, h1, h2, h3, h4, h5, h6, li, td, th')
        .map((_, el) => $(el).text().trim())
        .get()
        .filter((line) => line.length > 0)
        .join('\n\n');

      return {
        title,
        text: text.trim(),
      };
    } catch (error: any) {
      console.error(`Failed to scrape URL "${url}":`, error);
      throw new Error(`Could not extract content from URL: ${error.message}`);
    }
  }
}
