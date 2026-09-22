import { Router, Request, Response } from 'express';
import multer from 'multer';
import { ragService } from '../services/rag/rag.service.js';
import { requireStaffOrDoctorAuth } from '../middleware/auth.middleware.js';
import { SsrfGuard } from '../utils/ssrf.guard.js';

const router = Router();

const upload = multer({
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ];
    const allowedExts = /\.(pdf|docx|txt|md)$/i;
    if (allowedMimes.includes(file.mimetype) || allowedExts.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('InvalidFileType: Only PDF, DOCX, TXT, and Markdown files are permitted.'));
    }
  },
});

/**
 * POST /api/v1/knowledge/upload
 * Upload PDF, DOCX, or TXT file -> Extracts, Chunks, Embeds & Stores
 * Protected: Staff/Doctor auth required
 */
router.post('/upload', requireStaffOrDoctorAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'ValidationError', message: 'No file uploaded.' });
      return;
    }

    const businessId = (req.body.businessId as string) || 'default-business-id';
    const result = await ragService.ingestFromBuffer(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      businessId
    );

    res.status(200).json({
      success: true,
      message: `Document "${result.documentName}" ingested and vector-indexed successfully.`,
      documentName: result.documentName,
      chunksCount: result.chunksIngested,
    });
  } catch (error: any) {
    console.error('File Upload Ingestion Error:', error);
    res.status(500).json({
      error: 'IngestionError',
      message: error.message || 'Failed to process and index document.',
    });
  }
});

/**
 * POST /api/v1/knowledge/url
 * Scrapes website URL -> Cleans, Chunks, Embeds & Stores
 * Protected: Staff/Doctor auth required, SSRF validation enforced
 */
router.post('/url', requireStaffOrDoctorAuth, async (req: Request, res: Response) => {
  try {
    const { url, businessId = 'default-business-id' } = req.body;

    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'ValidationError', message: 'Valid "url" is required.' });
      return;
    }

    // SSRF Validation
    await SsrfGuard.validateUrl(url);

    const result = await ragService.ingestFromWebsiteUrl(url, businessId);

    res.status(200).json({
      success: true,
      message: `Website content from "${url}" indexed successfully.`,
      title: result.title,
      chunksCount: result.chunksIngested,
    });
  } catch (error: any) {
    console.error('URL Ingestion Error:', error);
    res.status(400).json({
      error: 'UrlIngestionError',
      message: error.message || 'Failed to scrape and index URL.',
    });
  }
});

/**
 * POST /api/v1/knowledge/query
 * Semantic vector similarity search endpoint
 */
router.post('/query', async (req: Request, res: Response) => {
  try {
    const { query, businessId = 'default-business-id', threshold = 0.45, limit = 3 } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'ValidationError', message: '"query" string is required.' });
      return;
    }

    const chunks = await ragService.searchRelevantChunks(query, businessId, threshold, limit);

    res.status(200).json({
      query,
      chunksFound: chunks.length,
      chunks,
    });
  } catch (error: any) {
    console.error('Vector Search Error:', error);
    res.status(500).json({
      error: 'SearchError',
      message: error.message || 'Failed to search knowledge base.',
    });
  }
});

export default router;
