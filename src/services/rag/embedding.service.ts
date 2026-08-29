import OpenAI from 'openai';
import { config } from '../../config/env.js';

export class EmbeddingService {
  private openai: OpenAI | null = null;

  constructor() {
    if (config.openai.apiKey && !config.openai.apiKey.startsWith('sk-your_')) {
      this.openai = new OpenAI({
        apiKey: config.openai.apiKey,
      });
    }
  }

  /**
   * Generates a 1536-dimensional embedding vector for a given text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.openai) {
      return this.generateDeterministicOfflineEmbedding(text);
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.replace(/\n/g, ' '),
        encoding_format: 'float',
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('OpenAI Embedding Error, falling back to local vector generation:', error);
      return this.generateDeterministicOfflineEmbedding(text);
    }
  }

  /**
   * Generates batch embeddings for an array of texts
   */
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.openai) {
      return texts.map((t) => this.generateDeterministicOfflineEmbedding(t));
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts.map((t) => t.replace(/\n/g, ' ')),
        encoding_format: 'float',
      });

      return response.data.map((d) => d.embedding);
    } catch (error) {
      console.error('Batch Embedding Error:', error);
      return texts.map((t) => this.generateDeterministicOfflineEmbedding(t));
    }
  }

  /**
   * Deterministic 1536-dim normalized vector generator for offline/local simulation
   */
  private generateDeterministicOfflineEmbedding(text: string): number[] {
    const vector = new Array(1536).fill(0);
    const words = text.toLowerCase().split(/\W+/).filter(Boolean);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = (hash << 5) - hash + word.charCodeAt(j);
        hash |= 0;
      }
      const index = Math.abs(hash) % 1536;
      vector[index] += 1;
    }

    // L2 Normalize the vector so cosine similarity is between 0 and 1
    const magnitude = Math.sqrt(vector.reduce((acc, val) => acc + val * val, 0)) || 1;
    return vector.map((val) => val / magnitude);
  }

  /**
   * Utility to compute cosine similarity between two 1536-dim vectors
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export const embeddingService = new EmbeddingService();
