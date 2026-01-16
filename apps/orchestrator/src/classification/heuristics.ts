/**
 * Artifact Classification Heuristics
 *
 * Provides fallback pattern-based classification rules for artifacts
 * when LLM analysis is unavailable or as supplementary signals.
 *
 * Three-tier heuristic system:
 * 1. File extension patterns (highest confidence)
 * 2. Filename patterns and keywords
 * 3. Folder name patterns and path analysis
 *
 * Confidence scores: 0.6-0.8 (lower than LLM which achieves 0.9-1.0)
 */

import type { ArtifactType } from "@in-midst-my-life/schema";

/**
 * Heuristic classification result.
 */
export interface HeuristicClassificationResult {
  artifactType: ArtifactType;
  confidence: number; // 0.6-0.8 range
  reasoning: string; // Explanation of which heuristic matched
}

/**
 * Classify artifact using heuristic patterns.
 *
 * Analyzes filename, folder path, and MIME type to predict artifact type.
 * Returns a fallback classification when LLM is unavailable.
 *
 * @param filename Full filename with extension
 * @param folderPath Folder path (e.g., "/Academic/Dissertations/")
 * @param mimeType MIME type (e.g., "application/pdf")
 * @returns Heuristic classification with confidence score
 *
 * @example
 * classifyByHeuristics("dissertation.pdf", "/Academic/", "application/pdf")
 * // { artifactType: "academic_paper", confidence: 0.75, reasoning: "PDF in /Academic/ folder" }
 */
export function classifyByHeuristics(
  filename: string,
  folderPath: string | undefined,
  mimeType: string | undefined
): HeuristicClassificationResult {
  // Normalize inputs
  const lowerFilename = filename.toLowerCase();
  const lowerPath = (folderPath || "").toLowerCase();
  const lowerMime = (mimeType || "").toLowerCase();

  // Try extension-based classification first (highest confidence)
  const extensionResult = classifyByExtension(lowerFilename, lowerMime);
  if (extensionResult) {
    return extensionResult;
  }

  // Try filename pattern matching
  const filenameResult = classifyByFilenamePatterns(lowerFilename);
  if (filenameResult) {
    return filenameResult;
  }

  // Try folder path patterns
  const folderResult = classifyByFolderPatterns(lowerPath);
  if (folderResult) {
    return folderResult;
  }

  // Default fallback
  return {
    artifactType: "other",
    confidence: 0.5,
    reasoning: "No heuristic patterns matched; requires LLM analysis"
  };
}

/**
 * Classify by file extension (highest confidence heuristic).
 *
 * Maps file extensions to artifact types based on common conventions.
 *
 * @param filename Lowercase filename
 * @param mimeType Lowercase MIME type (may be empty string)
 * @returns Classification result or null if no extension match
 */
function classifyByExtension(
  filename: string,
  mimeType: string | undefined
): HeuristicClassificationResult | null {
  // Extract extension
  const match = filename.match(/\.([a-z0-9]{2,6})$/);
  if (!match) {
    return null;
  }
  const ext: string = match[1]!;

  // PDF files (likely academic papers or documents)
  if (ext === "pdf" || (mimeType && mimeType.includes("pdf"))) {
    return {
      artifactType: "academic_paper",
      confidence: 0.7,
      reasoning: "PDF file extension"
    };
  }

  // Word documents
  if (
    ext === "docx" ||
    ext === "doc" ||
    (mimeType && mimeType.includes("word")) ||
    (mimeType && mimeType.includes("document"))
  ) {
    return {
      artifactType: "creative_writing",
      confidence: 0.65,
      reasoning: "Word document (.docx)"
    };
  }

  // Presentations
  if (
    ext === "pptx" ||
    ext === "ppt" ||
    ext === "key" ||
    ext === "odp" ||
    (mimeType && mimeType.includes("presentation")) ||
    (mimeType && mimeType.includes("slideshow"))
  ) {
    return {
      artifactType: "presentation",
      confidence: 0.8,
      reasoning: "Presentation file format"
    };
  }

  // Images
  if (
    ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "tiff"].includes(ext) ||
    (mimeType?.startsWith("image/"))
  ) {
    return {
      artifactType: "visual_art",
      confidence: 0.75,
      reasoning: "Image file format"
    };
  }

  // Videos
  if (
    ["mp4", "mov", "avi", "mkv", "webm", "m4v", "flv"].includes(ext) ||
    (mimeType?.startsWith("video/"))
  ) {
    return {
      artifactType: "video",
      confidence: 0.8,
      reasoning: "Video file format"
    };
  }

  // Audio
  if (
    ["mp3", "wav", "flac", "aac", "ogg", "m4a", "wma"].includes(ext) ||
    (mimeType?.startsWith("audio/"))
  ) {
    return {
      artifactType: "audio",
      confidence: 0.8,
      reasoning: "Audio file format"
    };
  }

  // Code files
  if (
    ["js", "ts", "py", "java", "cpp", "c", "go", "rs", "rb", "php"].includes(
      ext
    ) ||
    (mimeType?.includes("text/x-")) ||
    (mimeType?.includes("application/x-"))
  ) {
    return {
      artifactType: "code_sample",
      confidence: 0.75,
      reasoning: "Programming language file"
    };
  }

  // CSV/TSV (likely dataset)
  if (
    ["csv", "tsv", "xlsx", "xls", "json", "xml"].includes(ext) ||
    (mimeType?.includes("spreadsheet")) ||
    (mimeType?.includes("sheet"))
  ) {
    return {
      artifactType: "dataset",
      confidence: 0.7,
      reasoning: "Data file format (CSV, Excel, JSON)"
    };
  }

  return null;
}

/**
 * Classify by filename patterns and keywords.
 *
 * Analyzes filename for keywords and patterns that indicate artifact type.
 *
 * @param filename Lowercase filename (without path)
 * @returns Classification result or null if no pattern matches
 */
function classifyByFilenamePatterns(
  filename: string
): HeuristicClassificationResult | null {
  // Academic paper patterns
  const academicPatterns = [
    /dissertation|thesis|paper|research|study|analysis|survey|conference|proceedings/i,
    /arxiv|doi|^[a-z0-9]{10,}$/
  ];

  if (
    academicPatterns.some((pattern) => filename.match(pattern)) ||
    filename.includes("_paper_") ||
    filename.includes("_research_") ||
    filename.includes("_thesis_")
  ) {
    return {
      artifactType: "academic_paper",
      confidence: 0.72,
      reasoning: "Academic filename patterns detected"
    };
  }

  // Creative writing patterns
  const writingPatterns = [
    /story|essay|novel|fiction|poem|memoir|narrative|chapter|book|draft/i,
    /short_story|creative_writing|fiction_/
  ];

  if (writingPatterns.some((pattern) => filename.match(pattern))) {
    return {
      artifactType: "creative_writing",
      confidence: 0.7,
      reasoning: "Creative writing filename patterns detected"
    };
  }

  // Presentation patterns
  const presentationPatterns = [
    /talk|presentation|slide|keynote|lecture|speech|demo/i,
    /^talk_|_presentation|_slides$/
  ];

  if (presentationPatterns.some((pattern) => filename.match(pattern))) {
    return {
      artifactType: "presentation",
      confidence: 0.75,
      reasoning: "Presentation filename patterns detected"
    };
  }

  // Visual art patterns
  const artPatterns = [
    /painting|illustration|art|design|graphic|sketch|drawing|photo|image/i,
    /^art_|_design_|_photo_/
  ];

  if (artPatterns.some((pattern) => filename.match(pattern))) {
    return {
      artifactType: "visual_art",
      confidence: 0.68,
      reasoning: "Visual art filename patterns detected"
    };
  }

  // Video patterns
  const videoPatterns = [
    /video|recording|talk_video|lecture_video|performance/i,
    /^video_|_recording$/
  ];

  if (videoPatterns.some((pattern) => filename.match(pattern))) {
    return {
      artifactType: "video",
      confidence: 0.75,
      reasoning: "Video filename patterns detected"
    };
  }

  // Audio patterns
  const audioPatterns = [
    /audio|podcast|recording|interview|speech_audio|music/i,
    /^podcast_|_audio_|_interview$/
  ];

  if (audioPatterns.some((pattern) => filename.match(pattern))) {
    return {
      artifactType: "audio",
      confidence: 0.75,
      reasoning: "Audio filename patterns detected"
    };
  }

  // Code patterns
  const codePatterns = [
    /code|repo|project|script|algorithm|library|module|package/i,
    /^src_|_code_|^lib_/
  ];

  if (codePatterns.some((pattern) => filename.match(pattern))) {
    return {
      artifactType: "code_sample",
      confidence: 0.7,
      reasoning: "Code filename patterns detected"
    };
  }

  // Dataset patterns
  const datasetPatterns = [
    /data|dataset|collection|archive|database|records|catalog/i,
    /^data_|_dataset|_archive$/
  ];

  if (datasetPatterns.some((pattern) => filename.match(pattern))) {
    return {
      artifactType: "dataset",
      confidence: 0.7,
      reasoning: "Dataset filename patterns detected"
    };
  }

  return null;
}

/**
 * Classify by folder path patterns.
 *
 * Analyzes the containing folder structure to infer artifact type.
 * Folder organization often indicates content type.
 *
 * @param folderPath Lowercase folder path
 * @returns Classification result or null if no pattern matches
 *
 * @example
 * classifyByFolderPatterns("/academic/dissertations/")
 * // { artifactType: "academic_paper", confidence: 0.7, ... }
 */
function classifyByFolderPatterns(
  folderPath: string
): HeuristicClassificationResult | null {
  if (!folderPath) {
    return null;
  }

  // Academic folders
  if (
    folderPath.match(
      /academic|research|papers|dissertations|theses|conference|publications|scholarly/
    )
  ) {
    return {
      artifactType: "academic_paper",
      confidence: 0.68,
      reasoning: "Stored in academic/research folder"
    };
  }

  // Creative writing folders
  if (folderPath.match(/writing|stories|fiction|novels|essays|poetry|prose|memoir/)) {
    return {
      artifactType: "creative_writing",
      confidence: 0.68,
      reasoning: "Stored in creative writing folder"
    };
  }

  // Visual art folders
  if (folderPath.match(/art|images|photos|paintings|designs|graphics|illustrations/)) {
    return {
      artifactType: "visual_art",
      confidence: 0.7,
      reasoning: "Stored in visual art/images folder"
    };
  }

  // Presentations
  if (folderPath.match(/presentations|talks|slides|keynotes|lectures/)) {
    return {
      artifactType: "presentation",
      confidence: 0.75,
      reasoning: "Stored in presentations folder"
    };
  }

  // Videos
  if (folderPath.match(/videos|recordings|lectures_video|talks_video/)) {
    return {
      artifactType: "video",
      confidence: 0.75,
      reasoning: "Stored in videos folder"
    };
  }

  // Audio
  if (folderPath.match(/audio|podcasts|music|interviews|recordings/)) {
    return {
      artifactType: "audio",
      confidence: 0.75,
      reasoning: "Stored in audio/podcast folder"
    };
  }

  // Code repositories
  if (folderPath.match(/code|repos|github|projects|src|libraries|scripts/)) {
    return {
      artifactType: "code_sample",
      confidence: 0.7,
      reasoning: "Stored in code/repository folder"
    };
  }

  // Datasets
  if (folderPath.match(/data|datasets|archives|collections|databases/)) {
    return {
      artifactType: "dataset",
      confidence: 0.7,
      reasoning: "Stored in data/dataset folder"
    };
  }

  return null;
}

/**
 * Aggregate heuristic classification with LLM-based classification.
 *
 * Combines heuristic confidence (0.6-0.8) with LLM confidence (0.9-1.0)
 * to produce a final confidence score.
 *
 * Used when both heuristic and LLM analyses are available.
 *
 * @param heuristicConfidence Heuristic confidence (0.6-0.8)
 * @param llmConfidence LLM confidence (0.9-1.0)
 * @returns Combined confidence score (0.6-1.0)
 *
 * @example
 * aggregateConfidence(0.75, 0.95) // 0.90 (LLM wins, but heuristic influences)
 */
export function aggregateConfidence(
  heuristicConfidence: number,
  llmConfidence: number
): number {
  // Weight LLM more heavily (it's more reliable)
  const weight = 0.7; // LLM weight
  return heuristicConfidence * (1 - weight) + llmConfidence * weight;
}

/**
 * Validate and normalize artifact type.
 *
 * Ensures the provided artifact type is valid.
 * Returns "other" if validation fails.
 *
 * @param type Artifact type string
 * @returns Valid artifact type or "other"
 */
export function normalizeArtifactType(type: string): ArtifactType {
  const validTypes: ArtifactType[] = [
    "academic_paper",
    "creative_writing",
    "visual_art",
    "presentation",
    "video",
    "audio",
    "dataset",
    "code_sample",
    "other"
  ];

  return validTypes.includes(type as ArtifactType) ? (type as ArtifactType) : "other";
}
