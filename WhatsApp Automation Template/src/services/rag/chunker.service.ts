export interface DocumentChunk {
  content: string;
  chunkIndex: number;
  tokenCount: number;
}

export class TextChunkerService {
  /**
   * Splits raw text into manageable chunks with overlap while preserving sentence structure
   * @param text Raw extracted text
   * @param maxChunkSize Approximate character count per chunk (~500 tokens = ~1500 chars)
   * @param overlap Approximate character overlap between chunks (~50 tokens = ~150 chars)
   */
  static chunkText(
    text: string,
    maxChunkSize: number = 1200,
    overlap: number = 150
  ): DocumentChunk[] {
    // 1. Normalize and clean whitespace
    const cleanText = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!cleanText) return [];

    // If total length is small, return as single chunk
    if (cleanText.length <= maxChunkSize) {
      return [
        {
          content: cleanText,
          chunkIndex: 0,
          tokenCount: Math.ceil(cleanText.length / 4),
        },
      ];
    }

    const chunks: DocumentChunk[] = [];
    const paragraphs = cleanText.split(/\n\n+/);
    let currentChunk = '';
    let chunkIndex = 0;

    for (const para of paragraphs) {
      if ((currentChunk + '\n\n' + para).length <= maxChunkSize) {
        currentChunk = currentChunk ? `${currentChunk}\n\n${para}` : para;
      } else {
        // If single paragraph exceeds max size, split by sentences
        if (currentChunk) {
          chunks.push({
            content: currentChunk.trim(),
            chunkIndex: chunkIndex++,
            tokenCount: Math.ceil(currentChunk.length / 4),
          });
          // Retain overlap from end of previous chunk
          const words = currentChunk.split(' ');
          const overlapWords = words.slice(-Math.floor(overlap / 6)).join(' ');
          currentChunk = overlapWords ? `${overlapWords}\n\n${para}` : para;
        } else {
          // Paragraph itself is larger than maxChunkSize -> Split by sentence
          const sentences = para.split(/(?<=[.?!])\s+/);
          for (const sentence of sentences) {
            if ((currentChunk + ' ' + sentence).length <= maxChunkSize) {
              currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
            } else {
              if (currentChunk) {
                chunks.push({
                  content: currentChunk.trim(),
                  chunkIndex: chunkIndex++,
                  tokenCount: Math.ceil(currentChunk.length / 4),
                });
              }
              currentChunk = sentence;
            }
          }
        }
      }
    }

    if (currentChunk.trim()) {
      chunks.push({
        content: currentChunk.trim(),
        chunkIndex: chunkIndex,
        tokenCount: Math.ceil(currentChunk.length / 4),
      });
    }

    return chunks;
  }
}
