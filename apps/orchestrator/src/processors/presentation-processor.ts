/**
 * Presentation File Processor
 *
 * Extracts metadata from presentation files (PPTX, Keynote, ODP).
 * Used by CatcherAgent for classification and artifact creation.
 *
 * Supported formats:
 * - .pptx (Microsoft PowerPoint)
 * - .key (Apple Keynote) - requires additional setup on Mac
 * - .odp (OpenDocument Presentation)
 *
 * Dependencies (to be added in package.json):
 * - unzipper: For opening PPTX/ODP (ZIP-based formats)
 * - xml2js: For parsing XML metadata
 *
 * Features:
 * - Extract slide count
 * - Extract presentation title
 * - Parse first few slides for context
 * - Basic speaker notes extraction (future enhancement)
 * - Cloud API alternative for complex presentations
 *
 * Note: For .key files, consider using macOS APIs or cloud service
 */

import type { ExtractedFileMetadata } from "@in-midst-my-life/core";

/**
 * Presentation metadata.
 */
export interface PresentationMetadata extends ExtractedFileMetadata {
  slideCount?: number;
  format?: string; // PPTX, KEY, ODP
}

/**
 * Extract metadata from a presentation file.
 *
 * @param filePath Local filesystem path to presentation file (.pptx, .key, .odp)
 * @returns Extracted metadata (slide count, title, content excerpt)
 * @throws Error if presentation cannot be parsed
 *
 * @example
 * const metadata = await extractPresentationMetadata("/tmp/talk.pptx");
 * console.log(`${metadata.slideCount} slides`);
 * console.log(metadata.title);
 */
export async function extractPresentationMetadata(
  filePath: string
): Promise<PresentationMetadata> {
  const ext = filePath.toLowerCase().split(".").pop();

  switch (ext) {
    case "pptx":
      return extractPptxMetadata(filePath);
    case "key":
      return extractKeyMetadata(filePath);
    case "odp":
      return extractOdpMetadata(filePath);
    default:
      throw new Error(`Presentation Processor: Unsupported format: .${ext}`);
  }
}

/**
 * Extract metadata from .pptx (PowerPoint) file.
 * PPTX is a ZIP archive containing XML files.
 */
async function extractPptxMetadata(filePath: string): Promise<PresentationMetadata> {
  try {
    const unzipper = await import("unzipper");

    const result: PresentationMetadata = {
      format: "PPTX"
    };

    // PPTX is a ZIP file
    const dir = await unzipper.Open.file(filePath);
    const dirAsAny = dir as unknown as { files: Array<{ path: string; buffer: (encoding: string) => Promise<string> }>; close: () => Promise<void> };

    // Get slide count by counting slide files
    const slideFiles = dirAsAny.files.filter((f: { path: string }) => f.path.match(/ppt\/slides\/slide\d+\.xml/));
    result.slideCount = slideFiles.length;

    // Try to extract presentation title from docProps/core.xml
    const coreXmlFile = dirAsAny.files.find((f: { path: string }) => f.path === "docProps/core.xml");
    if (coreXmlFile) {
      const xmlContent = await coreXmlFile.buffer("utf-8");
      result.title = extractXmlValue(xmlContent, "dc:title");
    }

    // Try to extract text from first slide for context
    const firstSlideFile = slideFiles[0];
    if (firstSlideFile) {
      const slideContent = await firstSlideFile.buffer("utf-8");
      const textContent = extractTextFromPptxSlide(slideContent).slice(0, 500);
      if (textContent.length > 0 && !result.title) {
        result.title = textContent.split("\n")[0]; // Use first line as title
      }
      result.keywords = extractKeywordsFromText(textContent);
    }

    await dirAsAny.close();

    return result;
  } catch (err) {
    throw new Error(`Presentation Processor: Failed to extract PPTX metadata: ${String(err)}`);
  }
}

/**
 * Extract metadata from .key (Keynote) file.
 * Keynote files are complex - on macOS, could use native APIs.
 * For now, return basic metadata.
 */
async function extractKeyMetadata(_filePath: string): Promise<PresentationMetadata> {
  // .key files are difficult to parse without macOS-specific APIs
  // For MVP, return basic metadata

  return {
    format: "Keynote",
    textContent: "Note: Keynote presentations require macOS for full extraction"
  };
}

/**
 * Extract metadata from .odp (OpenDocument Presentation) file.
 * ODP is similar to PPTX (ZIP-based XML).
 */
async function extractOdpMetadata(filePath: string): Promise<PresentationMetadata> {
  try {
    const unzipper = await import("unzipper");

    const result: PresentationMetadata = {
      format: "ODP"
    };

    const dir = await unzipper.Open.file(filePath);
    const dirAsAny = dir as unknown as { files: Array<{ path: string; buffer: (encoding: string) => Promise<string> }>; close: () => Promise<void> };

    // Count slides
    const slideFiles = dirAsAny.files.filter((f: { path: string }) => f.path.match(/content\/slide\d+\.xml/));
    result.slideCount = slideFiles.length;

    // Extract metadata from manifest
    const manifestFile = dirAsAny.files.find((f: { path: string }) => f.path === "META-INF/metadata.xml");
    if (manifestFile) {
      const xmlContent = await manifestFile.buffer("utf-8");
      result.title = extractXmlValue(xmlContent, "dc:title");
    }

    await dirAsAny.close();

    return result;
  } catch (err) {
    throw new Error(`Presentation Processor: Failed to extract ODP metadata: ${String(err)}`);
  }
}

/**
 * Private helper: Extract XML element value.
 */
function extractXmlValue(xml: string, tagName: string): string | undefined {
  const regex = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`);
  const match = xml.match(regex);
  return match && match[1] ? match[1].trim() : undefined;
}

/**
 * Private helper: Extract text from PPTX slide XML.
 */
function extractTextFromPptxSlide(slideXml: string): string {
  // PPTX stores text in <a:t> elements within paragraph (<a:p>) elements
  const textMatches = slideXml.match(/<a:t>([^<]*)<\/a:t>/g) || [];
  return textMatches
    .map((match) => match.replace(/<a:t>|<\/a:t>/g, ""))
    .join("\n")
    .trim();
}

/**
 * Private helper: Extract keywords from text.
 */
function extractKeywordsFromText(text: string): string[] {
  // Simple heuristic: extract capitalized words (likely titles/headings)
  const words = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
  return words.slice(0, 10); // Limit to 10 keywords
}

/**
 * Heuristic confidence score for presentation classification.
 *
 * @returns Confidence score (0.0 to 1.0)
 */
export function estimatePresentationConfidence(metadata: PresentationMetadata): number {
  let confidence = 0.8; // Base confidence for presentations

  // Boost if we have slide count
  if (metadata.slideCount && metadata.slideCount > 1) confidence += 0.1;

  // Boost if we have title
  if (metadata.title) confidence += 0.05;

  // Reduce confidence for .key files (harder to parse)
  if (metadata.format === "Keynote") confidence -= 0.15;

  return Math.min(confidence, 1.0);
}
