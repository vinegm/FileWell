import converter from "@/utils/convert";
import {
  getFileIcon,
  formatFileSize,
  getFileCategory,
  getAvailableFormats,
  FORMAT_OPTIONS,
} from "@/utils/file-types";
import type { FileItem } from "@/types";

interface FileListItemProps {
  file: FileItem;
  onUpdate: (file: FileItem) => void;
  onRemove: (id: number) => void;
}

export default function FileListItem({
  file,
  onUpdate,
  onRemove,
}: FileListItemProps) {
  const handleSelectType = (selectedType: string) => {
    onUpdate({
      ...file,
      conversion: { ...file.conversion, selectedType, status: "idle" },
    });
  };

  const handleConvert = async () => {
    onUpdate({
      ...file,
      conversion: { ...file.conversion, status: "converting" },
    });

    try {
      const blob = await converter.convertFile(
        file.file,
        file.conversion.selectedType,
      );
      const url = URL.createObjectURL(blob);
      onUpdate({
        ...file,
        conversion: { ...file.conversion, status: "done", downloadUrl: url },
      });
    } catch (err) {
      onUpdate({
        ...file,
        conversion: { ...file.conversion, status: "error", error: String(err) },
      });
    }
  };

  const handleRetry = () => {
    if (file.conversion.downloadUrl) {
      URL.revokeObjectURL(file.conversion.downloadUrl);
    }
    onUpdate({
      ...file,
      conversion: { status: "idle", selectedType: "" },
    });
  };

  const handleDownload = () => {
    if (!file.conversion.downloadUrl) return;

    const link = document.createElement("a");
    link.href = file.conversion.downloadUrl;

    const ext = file.conversion.selectedType;
    const parts = file.file.name.split(".");
    if (parts.length > 1) parts[parts.length - 1] = ext;
    else parts.push(ext);

    link.download = parts.join(".");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const renderSelector = () => {
    const category = getFileCategory(file.file);
    const formats = getAvailableFormats(file.file);

    if (!formats.length) {
      return (
        <span className="text-gray-500 px-3 py-2 text-center text-sm">
          No conversions available
        </span>
      );
    }

    return (
      <select
        value={file.conversion.selectedType}
        onChange={(e) => handleSelectType(e.target.value)}
        className="bg-gray-300 dark:bg-gray-700 rounded-lg font-semibold px-3 sm:px-4 py-2 cursor-pointer text-sm sm:text-base w-full sm:w-auto"
        aria-label={`Select conversion format for ${file.file.name}`}
      >
        <option value="">Select type</option>
        {category === "image" && (
          <optgroup label="Image">
            {formats.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </optgroup>
        )}
        {category === "audio" && (
          <>
            <optgroup label="Audio">
              {formats.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Video">
              {FORMAT_OPTIONS.video.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
          </>
        )}
        {category === "video" && (
          <>
            <optgroup label="Video">
              {formats.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Audio">
              {FORMAT_OPTIONS.audio.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
          </>
        )}
      </select>
    );
  };

  const renderAction = () => {
    switch (file.conversion.status) {
      case "converting":
        return (
          <div className="flex items-center justify-center gap-2 py-1">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent"></div>
            <span className="bg-yellow-500 rounded-lg font-semibold px-3 sm:px-4 py-2 text-sm sm:text-base">
              Converting...
            </span>
          </div>
        );

      case "error":
        return (
          <button
            onClick={handleRetry}
            className="font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg cursor-pointer px-3 sm:px-4 py-2 text-sm sm:text-base w-full sm:w-auto"
            title={file.conversion.error}
          >
            Error - Retry
          </button>
        );

      case "done":
        return (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleRetry}
              className="font-semibold bg-gray-300 dark:bg-gray-700 rounded-lg cursor-pointer px-3 sm:px-4 py-2 text-sm sm:text-base"
            >
              Change type
            </button>
            <button
              onClick={handleDownload}
              className="font-semibold bg-green-500 dark:bg-green-600 rounded-lg cursor-pointer px-3 sm:px-4 py-2 text-sm sm:text-base"
            >
              Download
            </button>
          </div>
        );

      default:
        const isDisabled = !file.conversion.selectedType;
        return (
          <button
            onClick={handleConvert}
            disabled={isDisabled}
            className={`font-semibold rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base w-full sm:w-auto ${
              !isDisabled
                ? "bg-blue-500 dark:bg-blue-600 cursor-pointer"
                : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
            }`}
          >
            Convert
          </button>
        );
    }
  };

  return (
    <li>
      <div className="flex flex-col sm:flex-row sm:items-center w-full file-card-bg-color transition-colors rounded-lg p-3 sm:p-4 gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          {file.file.type?.startsWith("image/") ? (
            <img
              src={URL.createObjectURL(file.file)}
              alt={`Preview of ${file.file.name}`}
              className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg border border-gray-300 dark:border-gray-600 shrink-0"
              onLoad={(e) =>
                URL.revokeObjectURL((e.target as HTMLImageElement).src)
              }
              loading="lazy"
            />
          ) : (
            <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
              {getFileIcon(file.file)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
              {file.file.name}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {formatFileSize(file.file.size)} - {file.file.type || "unknown"}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto sm:shrink-0">
          {(!file.conversion.status || file.conversion.status === "idle") &&
            renderSelector()}
          {renderAction()}

          <button
            onClick={() => onRemove(file.id)}
            className="bg-red-500 hover:bg-red-600 rounded-lg cursor-pointer px-2 sm:px-3 py-2 flex items-center justify-center shrink-0"
            aria-label="Remove file"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );
}
