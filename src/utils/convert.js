/**
 * FileWell - File Conversion Utility
 *
 * Handles conversion of images using Canvas API and audio/video using FFmpeg WebAssembly.
 * Supports a wide range of formats for images, audio, and video files.
 */

import loadFfmpeg from "./load-ffmpeg.js";
import { fetchFile } from "@ffmpeg/util";
import { MIME_TYPES } from "./file-types.js";

let ffmpegInstance = null;

/**
 * Extracts file extension from filename
 */
function getFileExtension(fileName) {
  const regex = /(?:\.([^.]+))?$/;
  const match = regex.exec(fileName);

  if (match && match[1]) return match[1];

  return "";
}

/**
 * Removes file extension from filename
 */
function removeFileExtension(fileName) {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex !== -1) return fileName.slice(0, lastDotIndex);

  return fileName;
}

/**
 * Gets or creates FFmpeg instance with error handling
 */
async function getFFmpegInstance() {
  if (!ffmpegInstance) {
    try {
      console.log("Loading FFmpeg...");
      ffmpegInstance = await loadFfmpeg();
      console.log("FFmpeg loaded successfully");
    } catch (error) {
      console.error("Failed to load FFmpeg:", error);
      throw new Error(
        "FFmpeg failed to load. Please refresh the page and try again."
      );
    }
  }

  return ffmpegInstance;
}

/**
 * Converts images using Canvas API (fast, browser-native)
 */
function convertImage(file, format) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const mime = MIME_TYPES[format] || `image/${format}`;

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) return reject(new Error("Failed to encode image"));
            resolve(blob);
          },
          mime,
          format === "jpeg" ? 0.92 : undefined
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for conversion"));
    };

    img.src = url;
  });
}

/**
 * Converts audio/video using FFmpeg WebAssembly
 */
async function convertVideoAudio(file, format) {
  try {
    const ffmpeg = await getFFmpegInstance();

    const input = getFileExtension(file.name);
    const output = removeFileExtension(file.name) + "." + format;

    await ffmpeg.writeFile(input, await fetchFile(file));

    let ffmpegCmd = [];

    // Special case for 3gp video with optimized encoding
    if (format === "3gp") {
      ffmpegCmd = [
        "-i",
        input,
        "-r",
        "20",
        "-s",
        "352x288",
        "-vb",
        "400k",
        "-acodec",
        "aac",
        "-strict",
        "experimental",
        "-ac",
        "1",
        "-ar",
        "8000",
        "-ab",
        "24k",
        output,
      ];
    } else {
      ffmpegCmd = ["-i", input, output];
    }

    await ffmpeg.exec(ffmpegCmd);

    const data = await ffmpeg.readFile(output);
    const mime = MIME_TYPES[format] || "application/octet-stream";
    const blob = new Blob([data], { type: mime });

    return blob;
  } catch (error) {
    console.error("FFmpeg conversion error:", error);
    throw new Error(`Failed to convert ${file.name}: ${error.message}`);
  }
}

/**
 * Main conversion function - routes to appropriate converter based on file type
 */
export async function convertFile(original, selected) {
  if (!selected) throw new Error("No target format selected");

  if (original.type && original.type.startsWith("image/")) {
    const blob = await convertImage(original, selected);
    const mime = MIME_TYPES[selected] || blob.type || "image/*";
    return { blob, mime };
  }

  if (
    original.type &&
    (original.type.startsWith("video/") || original.type.startsWith("audio/"))
  ) {
    const blob = await convertVideoAudio(original, selected);
    const mime =
      MIME_TYPES[selected] || blob.type || "application/octet-stream";
    return { blob, mime };
  }

  throw new Error(`Unsupported file type: ${original.type}`);
}

export default convertFile;
