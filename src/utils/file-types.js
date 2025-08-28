export const MIME_TYPES = {
  // Images
  png: "image/png",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  tiff: "image/tiff",
  tif: "image/tiff",
  bmp: "image/bmp",
  ico: "image/x-icon",
  svg: "image/svg+xml",
  heic: "image/heic",
  raw: "application/octet-stream",

  // Audio
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  aac: "audio/aac",
  flac: "audio/flac",
  m4a: "audio/x-m4a",
  wma: "audio/x-ms-wma",

  // Video
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mkv: "video/x-matroska",
  avi: "video/x-msvideo",
  flv: "video/x-flv",
  m4v: "video/x-m4v",
  "3gp": "video/3gpp",
  "3g2": "video/3gpp2",
  wmv: "video/x-ms-wmv",
  ogv: "video/ogg",
  h264: "video/h264",
  264: "video/h264",
  hevc: "video/hevc",
  265: "video/hevc",
};

export const FORMAT_OPTIONS = {
  image: [
    { value: "png", label: "PNG" },
    { value: "jpeg", label: "JPEG" },
    { value: "webp", label: "WEBP" },
    { value: "avif", label: "AVIF" },
    { value: "tiff", label: "TIFF" },
    { value: "bmp", label: "BMP" },
    { value: "ico", label: "ICO" },
    { value: "svg", label: "SVG" },
    { value: "heic", label: "HEIC" },
    { value: "raw", label: "RAW" },
  ],
  audio: [
    { value: "mp3", label: "MP3" },
    { value: "wav", label: "WAV" },
    { value: "ogg", label: "OGG" },
    { value: "aac", label: "AAC" },
    { value: "flac", label: "FLAC" },
    { value: "m4a", label: "M4A" },
    { value: "wma", label: "WMA" },
  ],
  video: [
    { value: "mp4", label: "MP4" },
    { value: "webm", label: "WEBM" },
    { value: "mov", label: "MOV" },
    { value: "mkv", label: "MKV" },
    { value: "avi", label: "AVI" },
    { value: "flv", label: "FLV" },
    { value: "m4v", label: "M4V" },
    { value: "3gp", label: "3GP" },
    { value: "3g2", label: "3G2" },
    { value: "wmv", label: "WMV" },
    { value: "ogv", label: "OGV" },
    { value: "h264", label: "H264" },
    { value: "264", label: "264" },
    { value: "hevc", label: "HEVC" },
    { value: "265", label: "265" },
  ],
};

// File extension to file extension mapping for downloads
export const EXTENSION_MAP = {
  jpeg: "jpg",
  jpg: "jpg",
  png: "png",
  webp: "webp",
  avif: "avif",
  tiff: "tiff",
  tif: "tif",
  bmp: "bmp",
  ico: "ico",
  svg: "svg",
  heic: "heic",
  raw: "raw",
  mp3: "mp3",
  wav: "wav",
  ogg: "ogg",
  aac: "aac",
  flac: "flac",
  m4a: "m4a",
  wma: "wma",
  mp4: "mp4",
  webm: "webm",
  mov: "mov",
  mkv: "mkv",
  avi: "avi",
  flv: "flv",
  m4v: "m4v",
  "3gp": "3gp",
  "3g2": "3g2",
  wmv: "wmv",
  ogv: "ogv",
  h264: "h264",
  264: "264",
  hevc: "hevc",
  265: "265",
};

/**
 * Determines the file type category from a File object
 */
export function getFileCategory(file) {
  if (!file?.type) return "unknown";

  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("video/")) return "video";

  return "unknown";
}

/**
 * Derives the current format key from a File object
 */
export function deriveFileFormat(file) {
  if (!file) return null;

  const type = (file.type || "").toLowerCase();

  // Check common MIME type patterns
  if (type.includes("png")) return "png";
  if (type.includes("jpeg") || type.includes("jpg")) return "jpeg";
  if (type.includes("webp")) return "webp";
  if (type.includes("mpeg") || type.includes("mp3")) return "mp3";
  if (type.includes("wav")) return "wav";
  if (type.includes("ogg")) return "ogg";
  if (type.includes("aac")) return "aac";
  if (type.includes("flac")) return "flac";
  if (type.includes("m4a")) return "m4a";
  if (type.includes("wma")) return "wma";
  if (type.includes("mp4")) return "mp4";
  if (type.includes("webm")) return "webm";
  if (type.includes("quicktime") || type.includes("mov")) return "mov";
  if (type.includes("matroska") || type.includes("mkv")) return "mkv";
  if (type.includes("x-msvideo") || type.includes("avi")) return "avi";
  if (type.includes("x-flv") || type.includes("flv")) return "flv";
  if (type.includes("m4v")) return "m4v";
  if (type.includes("3gpp") || type.includes("3gp")) return "3gp";
  if (type.includes("3gpp2") || type.includes("3g2")) return "3g2";
  if (type.includes("x-ms-wmv") || type.includes("wmv")) return "wmv";
  if (type.includes("h264")) return "h264";
  if (type.includes("hevc")) return "hevc";

  // Fallback to file extension
  const name = (file.name || "").toLowerCase();
  const ext = name.split(".").pop();
  return ext || null;
}

/**
 * Gets available format options for a file, excluding its current format
 */
export function getAvailableFormats(file) {
  const category = getFileCategory(file);
  const currentFormat = deriveFileFormat(file);

  if (category === "unknown") return [];

  return (
    FORMAT_OPTIONS[category]?.filter(
      (option) => option.value !== currentFormat
    ) || []
  );
}

/**
 * Gets the appropriate file icon text based on file type
 */
export function getFileIcon(file) {
  const category = getFileCategory(file);

  switch (category) {
    case "audio":
      return "🎵";
    case "video":
      return "🎬";
    case "image":
      return "🖼️";
    default:
      return "📄";
  }
}

/**
 * Formats file size in a human-readable way
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
