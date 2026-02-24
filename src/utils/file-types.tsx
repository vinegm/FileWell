export interface FormatOption {
  value: string;
  label: string;
}

export const FORMAT_OPTIONS = {
  image: [
    { value: "png", label: "PNG" },
    { value: "jpeg", label: "JPEG" },
    { value: "jpg", label: "JPG" },
    { value: "webp", label: "WEBP" },
    { value: "tiff", label: "TIFF" },
    { value: "bmp", label: "BMP" },
    { value: "ico", label: "ICO" },
  ],
  audio: [
    { value: "mp3", label: "MP3" },
    { value: "wav", label: "WAV" },
    { value: "ogg", label: "OGG" },
  ],
  video: [
    { value: "mp4", label: "MP4" },
    { value: "webm", label: "WEBM" },
    { value: "mov", label: "MOV" },
    { value: "mkv", label: "MKV" },
    { value: "avi", label: "AVI" },
    { value: "flv", label: "FLV" },
  ],
};

type FileCategory = "image" | "audio" | "video" | "unknown";

export const getFileCategory = (file: File): FileCategory => {
  if (!file?.type) return "unknown";
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("video/")) return "video";
  return "unknown";
};

export const getAvailableFormats = (file: File): FormatOption[] => {
  const category = getFileCategory(file);
  if (category === "unknown") return [];

  const options = FORMAT_OPTIONS[category];
  const currentExt = file.name.split(".").pop()?.toLowerCase() || "";

  return options.filter((opt) => opt.value !== currentExt);
};

export const getFileIcon = (file: File) => {
  const category = getFileCategory(file);
  const iconClass = "w-6 h-6";

  const icons = {
    audio: (
      <svg
        className={`${iconClass} text-blue-500`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
    video: (
      <svg
        className={`${iconClass} text-purple-500`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
    image: (
      <svg
        className={`${iconClass} text-green-500`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    ),
    unknown: (
      <svg
        className={`${iconClass} text-gray-500`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
      </svg>
    ),
  };

  return icons[category] || icons.unknown;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const kb = 1024;
  const sizes = ["B", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(kb));

  return `${(bytes / Math.pow(kb, i)).toFixed(1)} ${sizes[i]}`;
};
