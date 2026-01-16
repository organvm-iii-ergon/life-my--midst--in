/**
 * DOCX File Processor
 *
 * Extracts text content and metadata from Microsoft Word (.docx) files.
 * Used by CatcherAgent for classification and artifact creation.
 *
 * Dependencies (to be added in package.json):
 * - mammoth: DOCX to HTML/text conversion
 *
 * Features:
 * - Extract full text content
 * - Parse document metadata (title, author, creation date)
 * - Convert to Markdown format
 * - Handle corrupted documents gracefully
 */

import type { ExtractedFileMetadata } from "@in-midst-my-life/core";

/**
 * Extract metadata and text from a DOCX file.
 *
 * @param filePath Local filesystem path to DOCX file
 * @returns Extracted metadata (text content, title, author, creation date)
 * @throws Error if DOCX cannot be parsed
 *
 * @example
 * const metadata = await extractDocxMetadata("/tmp/essay.docx");
 * console.log(metadata.title, metadata.author);
 * console.log(metadata.textContent?.slice(0, 100));
 */
export async function extractDocxMetadata(filePath: string): Promise<ExtractedFileMetadata> {
  try {
    const mammoth = await import("mammoth");
    const fs = await import("node:fs/promises");

    // Read file buffer
    const fileBuffer = await fs.readFile(filePath);

    // Convert DOCX to HTML
    const result = await mammoth.convertToHtml({ arrayBuffer: fileBuffer.buffer });

    // Extract plain text from HTML
    const html = result.value || "";
    const textContent = htmlToPlainText(html).slice(0, 5000);

    // Try to extract metadata from document properties
    // Mammoth doesn't directly expose metadata, so we'd need additional libraries
    // For now, return basic metadata
    const metadata: ExtractedFileMetadata = {
      textContent,
      wordCount: textContent.split(/\s+/).length
    };

    // Try to extract title from first heading (heuristic)
    const headingMatch = html.match(/<h[1-6]>(.*?)<\/h[1-6]>/);
    if (headingMatch && headingMatch[1]) {
      metadata.title = headingMatch[1].replace(/<[^>]*>/g, "");
    }

    return metadata;
  } catch (err) {
    throw new Error(`DOCX Processor: Failed to extract DOCX metadata: ${String(err)}`);
  }
}

/**
 * Private helper: Convert HTML to plain text.
 * Removes HTML tags and decodes entities.
 */
function htmlToPlainText(html: string): string {
  // Remove HTML tags
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "") // Remove styles
    .replace(/<[^>]+>/g, " ") // Remove HTML tags
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Collapse multiple spaces
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/**
 * Heuristic confidence score for DOCX classification.
 * Documents with substantial content and metadata get higher confidence.
 *
 * @returns Confidence score (0.0 to 1.0)
 */
export function estimateDocxConfidence(metadata: ExtractedFileMetadata): number {
  let confidence = 0.75; // Base confidence for DOCX

  // Boost if we have author (indicates metadata was filled in)
  if (metadata.author) confidence += 0.1;

  // Boost if we have title
  if (metadata.title) confidence += 0.1;

  // Boost if we have substantial word count (likely meaningful content)
  if (metadata.wordCount && metadata.wordCount > 500) confidence += 0.05;

  return Math.min(confidence, 1.0);
}

/**
 * Extract metadata from DOCX using Office Open XML structure.
 *
 * This is an alternative approach that parses the XML metadata
 * from inside the DOCX file (DOCX is actually a ZIP archive).
 *
 * @param filePath Path to DOCX file
 * @returns Document metadata (author, title, created date)
 */
export async function extractDocxProperties(
  filePath: string
): Promise<{
  title?: string;
  author?: string;
  subject?: string;
  created?: string;
  modified?: string;
}> {
  try {
    // Dynamic import to avoid requiring unzip if not needed
    const unzipper = await import("unzipper");

    const properties: Record<string, string> = {};

    // DOCX is a ZIP file containing docProps/core.xml
    const dir = await unzipper.Open.file(filePath);
    const dirAsAny = dir as unknown as { files: Array<{ path: string; buffer: (encoding: string) => Promise<string> }>; close: () => Promise<void> };

    // Find core.xml file
    const coreXmlFile = dirAsAny.files.find((f: { path: string }) => f.path === "docProps/core.xml");

    if (coreXmlFile) {
      const xmlContent = await coreXmlFile.buffer("utf-8");

      // Simple XML parsing (in production, would use proper XML parser)
      const title = extractXmlValue(xmlContent, "dc:title");
      const author = extractXmlValue(xmlContent, "dc:creator");
      const subject = extractXmlValue(xmlContent, "dc:subject");
      const created = extractXmlValue(xmlContent, "dcterms:created");
      const modified = extractXmlValue(xmlContent, "dcterms:modified");
      
      if (title) properties['title'] = title;
      if (author) properties['author'] = author;
      if (subject) properties['subject'] = subject;
      if (created) properties['created'] = created;
      if (modified) properties['modified'] = modified;
    }

    await dirAsAny.close();

    return properties;
  } catch (err) {
    // If we can't extract properties, that's OK - return empty
    return {};
  }
}

/**
 * Private helper: Extract value from XML element.
 * Simple regex-based parsing (proper XML parser would be better).
 */
function extractXmlValue(xml: string, tagName: string): string | undefined {
  const regex = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`);
  const match = xml.match(regex);
  return match ? match[1] : undefined;
}
