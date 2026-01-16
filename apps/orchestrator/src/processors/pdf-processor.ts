/**
 * PDF File Processor
 *
 * Extracts text content and metadata from PDF files.
 * Used by CatcherAgent for classification and artifact creation.
 *
 * Dependencies (to be added in package.json):
 * - pdf-parse: PDF text extraction
 *
 * Features:
 * - Extract full text content
 * - Parse PDF metadata (title, author, creation date, keywords)
 * - Handle encrypted/protected PDFs gracefully
 * - Truncate content for LLM classification (first 5000 chars)
 */

import type { ExtractedFileMetadata } from "@in-midst-my-life/core";

/**
 * Extract metadata and text from a PDF file.
 *
 * @param filePath Local filesystem path to PDF file
 * @returns Extracted metadata (text content, title, author, etc.)
 * @throws Error if PDF cannot be parsed (encrypted, corrupted, etc.)
 *
 * @example
 * const metadata = await extractPdfMetadata("/tmp/dissertation.pdf");
 * console.log(metadata.title, metadata.author);
 * console.log(metadata.textContent?.slice(0, 100));
 */
export async function extractPdfMetadata(filePath: string): Promise<ExtractedFileMetadata> {
  try {
    // Dynamic import to avoid requiring pdf-parse if not installed
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as Record<string, unknown>)['default'] as (buffer: Buffer) => Promise<Record<string, unknown>>;
    const fs = await import("node:fs/promises");

    const fileBuffer = await fs.readFile(filePath);

    // Parse PDF
    const pdf = await pdfParse(fileBuffer as Buffer);

    // Extract text content (first 5000 chars for LLM classification)
    const fullText = (pdf['text'] as string) || "";
    const textContent = fullText.slice(0, 5000);

    // Extract metadata
    const info = (pdf['info'] as Record<string, unknown>) || {};
    const metadata = (pdf['metadata'] as Record<string, unknown>) || {};

    return {
      textContent,
      title: (info['Title'] as string) || (metadata['Title'] as string) || undefined,
      author: (info['Author'] as string) || (metadata['Author'] as string) || undefined,
      keywords: extractKeywords((info['Keywords'] as string) || (metadata['Keywords'] as string) || ""),
      pageCount: (pdf['numpages'] as number) || 0,
      wordCount: fullText.split(/\s+/).length
    };
  } catch (err) {
    const error = err as Error;

    // Check if PDF is encrypted
    if (error.message.includes("encrypted") || error.message.includes("password")) {
      throw new Error(`PDF Processor: Encrypted PDF (unsupported): ${String(err)}`);
    }

    // Check if PDF is corrupted
    if (error.message.includes("Invalid PDF")) {
      throw new Error(`PDF Processor: Invalid PDF file: ${String(err)}`);
    }

    throw new Error(`PDF Processor: Failed to extract PDF metadata: ${String(err)}`);
  }
}

/**
 * Private helper: Extract keywords from PDF keyword field.
 * Keyword field often contains comma-separated values.
 */
function extractKeywords(keywordString: string): string[] {
  if (!keywordString || typeof keywordString !== "string") {
    return [];
  }

  return keywordString
    .split(/[,;]/)
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
    .slice(0, 10); // Limit to 10 keywords
}

/**
 * Heuristic confidence score for PDF classification.
 * PDFs with more metadata get higher confidence.
 *
 * @returns Confidence score (0.0 to 1.0)
 */
export function estimatePdfConfidence(metadata: ExtractedFileMetadata): number {
  let confidence = 0.7; // Base confidence for PDFs (relatively reliable format)

  // Boost if we have author
  if (metadata.author) confidence += 0.1;

  // Boost if we have title
  if (metadata.title) confidence += 0.1;

  // Boost if we have many pages (likely substantial work)
  if (metadata.pageCount && metadata.pageCount > 5) confidence += 0.05;

  // Boost if we have keywords
  if (metadata.keywords && metadata.keywords.length > 0) confidence += 0.05;

  return Math.min(confidence, 1.0);
}
