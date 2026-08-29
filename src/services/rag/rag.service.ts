import { supabase } from '../../config/supabase.js';
import { config } from '../../config/env.js';
import { TextChunkerService } from './chunker.service.js';
import { EmbeddingService, embeddingService } from './embedding.service.js';
import { DocumentExtractorService } from './extractor.service.js';

export interface RetrievedChunk {
  id: string;
  documentName: string;
  documentType: string;
  content: string;
  similarity: number;
}

export interface IngestDocumentInput {
  businessId: string;
  documentName: string;
  documentType: 'faq' | 'pricing' | 'services' | 'policy' | 'website';
  text: string;
}

// In-memory fallback cache for local dev / offline mode
interface LocalChunk {
  id: string;
  businessId: string;
  documentName: string;
  documentType: string;
  content: string;
  embedding: number[];
}

export class RAGService {
  private localChunks: LocalChunk[] = [];

  /**
   * Ingests, chunks, embeds, and stores a document into pgvector
   */
  async ingestDocument(input: IngestDocumentInput): Promise<{ chunksIngested: number }> {
    const { businessId, documentName, documentType, text } = input;

    // 1. Chunk text
    const chunks = TextChunkerService.chunkText(text, 1000, 150);
    if (chunks.length === 0) {
      throw new Error('Document contained no readable text.');
    }

    // 2. Generate vector embeddings for all chunks
    const chunkTexts = chunks.map((c) => c.content);
    const embeddings = await embeddingService.generateBatchEmbeddings(chunkTexts);

    // 3. Prepare database payload
    const records = chunks.map((chunk, index) => ({
      business_id: businessId,
      document_name: documentName,
      document_type: documentType,
      chunk_content: chunk.content,
      chunk_index: chunk.chunkIndex,
      token_count: chunk.tokenCount,
      embedding: embeddings[index],
    }));

    // Cache locally for offline execution
    records.forEach((r, i) => {
      this.localChunks.push({
        id: `chunk-${Date.now()}-${i}`,
        businessId: r.business_id,
        documentName: r.document_name,
        documentType: r.document_type,
        content: r.chunk_content,
        embedding: embeddings[i],
      });
    });

    // 4. Insert into Supabase if properly configured with real credentials
    if (
      config.supabase.url &&
      !config.supabase.url.includes('your-project-ref') &&
      config.supabase.serviceRoleKey &&
      !config.supabase.serviceRoleKey.includes('your_supabase')
    ) {
      try {
        const { error } = await supabase.from('document_chunks').insert(records);
        if (error) {
          console.warn('Notice: Supabase insert skipped (using local vector store):', error.message);
        }
      } catch (err) {
        // Supabase offline - continue with local store
      }
    }

    return { chunksIngested: chunks.length };
  }

  /**
   * Vector Similarity Search for the most relevant context chunks
   */
  async searchRelevantChunks(
    query: string,
    businessId: string,
    matchThreshold: number = 0.20,
    matchCount: number = 4
  ): Promise<RetrievedChunk[]> {
    const queryEmbedding = await embeddingService.generateEmbedding(query);

    // Try Supabase RPC match_document_chunks if credentials configured
    if (
      config.supabase.url &&
      !config.supabase.url.includes('your-project-ref') &&
      config.supabase.serviceRoleKey &&
      !config.supabase.serviceRoleKey.includes('your_supabase')
    ) {
      try {
        const { data, error } = await supabase.rpc('match_document_chunks', {
          query_embedding: queryEmbedding,
          match_threshold: matchThreshold,
          match_count: matchCount,
          filter_business_id: businessId,
        });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            documentName: d.document_name,
            documentType: d.document_type,
            content: d.chunk_content,
            similarity: d.similarity,
          }));
        }
      } catch (err) {
        // Fallback to in-memory vector cosine similarity
      }
    }

    // Local Vector Search calculation
    const scored = this.localChunks
      .filter((c) => c.businessId === businessId || businessId === 'default-business-id' || c.businessId === 'test-business-clinic')
      .map((c) => {
        const similarity = EmbeddingService.cosineSimilarity(queryEmbedding, c.embedding);
        return {
          id: c.id,
          documentName: c.documentName,
          documentType: c.documentType,
          content: c.content,
          similarity,
        };
      })
      .filter((c) => c.similarity >= matchThreshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, matchCount);

    return scored;
  }

  /**
   * Helper to ingest from uploaded file buffer (PDF, DOCX, TXT)
   */
  async ingestFromBuffer(
    buffer: Buffer,
    originalName: string,
    mimetype: string,
    businessId: string
  ): Promise<{ documentName: string; chunksIngested: number }> {
    let text = '';
    const lowerName = originalName.toLowerCase();

    if (mimetype === 'application/pdf' || lowerName.endsWith('.pdf')) {
      text = await DocumentExtractorService.extractFromPdf(buffer);
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      lowerName.endsWith('.docx')
    ) {
      text = await DocumentExtractorService.extractFromDocx(buffer);
    } else {
      text = DocumentExtractorService.extractFromTxt(buffer);
    }

    const docType = lowerName.includes('faq')
      ? 'faq'
      : lowerName.includes('price') || lowerName.includes('rate')
      ? 'pricing'
      : 'services';

    const result = await this.ingestDocument({
      businessId,
      documentName: originalName,
      documentType: docType,
      text,
    });

    return {
      documentName: originalName,
      chunksIngested: result.chunksIngested,
    };
  }

  /**
   * Helper to ingest from website URL
   */
  async ingestFromWebsiteUrl(
    url: string,
    businessId: string
  ): Promise<{ documentName: string; chunksIngested: number; title: string }> {
    const { title, text } = await DocumentExtractorService.extractFromUrl(url);

    const result = await this.ingestDocument({
      businessId,
      documentName: title || url,
      documentType: 'website',
      text,
    });

    return {
      documentName: title || url,
      title,
      chunksIngested: result.chunksIngested,
    };
  }
}

export const ragService = new RAGService();
