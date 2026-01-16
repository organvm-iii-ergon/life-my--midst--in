/**
 * File Processor Exports
 *
 * Processors extract metadata from different file types.
 * Used by CatcherAgent for artifact classification and content extraction.
 */

export * from "./pdf-processor";
export * from "./image-processor";
export * from "./docx-processor";
export * from "./presentation-processor";

/**
 * Unified processor interface.
 * Dynamically route files to appropriate processor based on MIME type.
 */
export async function processFile(
  filePath: string,
  mimeType: string
): Promise<{
  metadata: unknown;
  confidence: number;
}> {
  switch (true) {
    case mimeType === "application/pdf":
      const { extractPdfMetadata, estimatePdfConfidence } = await import("./pdf-processor");
      const pdfMeta = await extractPdfMetadata(filePath);
      return {
        metadata: pdfMeta,
        confidence: estimatePdfConfidence(pdfMeta)
      };

    case mimeType.startsWith("image/"):
      const { extractImageMetadata, estimateImageConfidence } = await import("./image-processor");
      const imageMeta = await extractImageMetadata(filePath);
      return {
        metadata: imageMeta,
        confidence: estimateImageConfidence(imageMeta)
      };

    case mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      const { extractDocxMetadata, estimateDocxConfidence } = await import("./docx-processor");
      const docxMeta = await extractDocxMetadata(filePath);
      return {
        metadata: docxMeta,
        confidence: estimateDocxConfidence(docxMeta)
      };

    case mimeType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      const { extractPresentationMetadata, estimatePresentationConfidence } = await import(
        "./presentation-processor"
      );
      const pptxMeta = await extractPresentationMetadata(filePath);
      return {
        metadata: pptxMeta,
        confidence: estimatePresentationConfidence(pptxMeta)
      };

    default:
      // Unsupported file type
      return {
        metadata: { textContent: undefined },
        confidence: 0.5
      };
  }
}
