/**
 * Image File Processor
 *
 * Extracts metadata from image files including EXIF data.
 * Used by CatcherAgent for classification and artifact creation.
 *
 * Dependencies (to be added in package.json):
 * - exifr: EXIF data extraction
 * - sharp: Image processing, dimensions, format detection
 *
 * Features:
 * - Extract image dimensions
 * - Parse EXIF metadata (camera, GPS, creation date override)
 * - Identify image format and color space
 * - Preserve creation date from EXIF or file stats
 * - Generate thumbnails (future: Phase 8)
 */

import type { ExtractedFileMetadata } from "@in-midst-my-life/core";

/**
 * Image metadata extracted via processors.
 */
export interface ImageMetadata extends ExtractedFileMetadata {
  dimensions?: { width: number; height: number };
  colorSpace?: string; // RGB, CMYK, Grayscale, etc.
  format?: string; // JPEG, PNG, WebP, etc.
  exif?: {
    camera?: string; // Camera model
    lensModel?: string;
    iso?: number;
    aperture?: string; // f/2.8, f/4.0, etc.
    shutterSpeed?: string; // 1/125, etc.
    focalLength?: string; // 35mm, 50mm, etc.
    dateTime?: string; // ISO 8601 timestamp from EXIF
    gps?: {
      latitude?: number;
      longitude?: number;
      altitude?: number;
    };
    flashUsed?: boolean;
    software?: string; // Camera/editor software
  };
}

/**
 * Extract metadata from an image file.
 *
 * Preserves EXIF creation date (DateTime) which often represents
 * the original photo capture time.
 *
 * @param filePath Local filesystem path to image file
 * @returns Extracted metadata (dimensions, EXIF, color space, etc.)
 * @throws Error if image cannot be processed
 *
 * @example
 * const metadata = await extractImageMetadata("/tmp/photo.jpg");
 * console.log(metadata.dimensions);
 * console.log(metadata.exif?.dateTime); // Original photo date
 */
export async function extractImageMetadata(filePath: string): Promise<ImageMetadata> {
  try {
    const sharp = await import("sharp");
    const exifr = await import("exifr");

    // Get image dimensions and format via sharp
    const image = sharp.default(filePath);
    const metadata = await image.metadata();

    // Extract EXIF data
    let exifData: Record<string, unknown> | null = null;
    try {
      exifData = await exifr.default.parse(filePath);
    } catch {
      // No EXIF data or error parsing, continue without it
    }

    // Build result
    const result: ImageMetadata = {
      dimensions: metadata.width && metadata.height ? {
        width: metadata.width,
        height: metadata.height
      } : undefined,
      colorSpace: metadata.space,
      format: metadata.format?.toUpperCase()
    };

    // Parse EXIF if available
    if (exifData) {
      result.exif = parseExifData(exifData);
    }

    // Extract keywords/title from EXIF description if available
    if (exifData && typeof exifData['ImageDescription'] === "string") {
      result.keywords = [exifData['ImageDescription']].concat(
        result.keywords || []
      );
    }

    // Use EXIF DateTimeOriginal as creation date if available
    if (exifData && exifData['DateTimeOriginal']) {
      // EXIF dates are in format "YYYY:MM:DD HH:MM:SS"
      const dateStr = String(exifData['DateTimeOriginal']).replace(/:/g, "-").replace(" ", "T");
      result.title = `Photo - ${dateStr}`;
    }

    return result;
  } catch (err) {
    throw new Error(`Image Processor: Failed to extract image metadata: ${String(err)}`);
  }
}

/**
 * Private helper: Parse EXIF data into structured format.
 */
function parseExifData(exif: Record<string, unknown>): ImageMetadata["exif"] {
  return {
    camera: exif['Model'] ? String(exif['Model']) : (exif['Make'] ? String(exif['Make']) : undefined),
    lensModel: exif['LensModel'] ? String(exif['LensModel']) : undefined,
    iso: typeof exif['ISO'] === "number" ? exif['ISO'] : undefined,
    aperture: exif['FNumber'] ? `f/${exif['FNumber']}` : undefined,
    shutterSpeed: exif['ExposureTime'] ? formatShutterSpeed(exif['ExposureTime'] as number) : undefined,
    focalLength: exif['FocalLength'] ? `${exif['FocalLength']}mm` : undefined,
    dateTime: exif['DateTimeOriginal']
      ? formatExifDateTime(String(exif['DateTimeOriginal']))
      : undefined,
    flashUsed: Boolean(exif['Flash']),
    software: exif['Software'] ? String(exif['Software']) : undefined,
    gps: exif['latitude'] && exif['longitude'] ? {
      latitude: Number(exif['latitude']),
      longitude: Number(exif['longitude']),
      altitude: exif['altitude'] ? Number(exif['altitude']) : undefined
    } : undefined
  };
}

/**
 * Private helper: Format shutter speed for display.
 * Example: 0.00625 → "1/160"
 */
function formatShutterSpeed(speed: number): string {
  if (speed >= 1) {
    return `${speed}s`;
  }
  const denominator = Math.round(1 / speed);
  return `1/${denominator}`;
}

/**
 * Private helper: Convert EXIF DateTime to ISO 8601.
 * EXIF format: "YYYY:MM:DD HH:MM:SS"
 * ISO 8601:   "YYYY-MM-DDTHH:MM:SSZ"
 */
function formatExifDateTime(exifDate: string): string {
  const [date, time] = exifDate.split(" ");
  if (!date || !time) {
    return new Date().toISOString();
  }
  const [year, month, day] = date.split(":");
  const [hours, minutes, seconds] = time.split(":");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
}

/**
 * Heuristic confidence score for image classification.
 *
 * @returns Confidence score (0.0 to 1.0)
 */
export function estimateImageConfidence(metadata: ImageMetadata): number {
  let confidence = 0.8; // Base confidence for images

  // Boost if EXIF has camera info (likely professional photo)
  if (metadata.exif?.camera) confidence += 0.1;

  // Boost if has EXIF date (timestamp validation)
  if (metadata.exif?.dateTime) confidence += 0.05;

  // Boost if has GPS (geotagged - specific context)
  if (metadata.exif?.gps) confidence += 0.05;

  // Reduce if dimensions are very small (screenshot, icon, etc.)
  if (metadata.dimensions && metadata.dimensions.width < 200 && metadata.dimensions.height < 200) {
    confidence -= 0.2;
  }

  return Math.min(confidence, 1.0);
}
