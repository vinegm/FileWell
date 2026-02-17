import { useCallback } from "react";
import converter from "@/utils/convert";
import {
  getFileCategory,
  getAvailableFormats,
  getFileIcon,
  formatFileSize,
  FORMAT_OPTIONS,
  FormatOption,
} from "@/utils/file-types";
import ActionButton from "./ActionButton";

interface FileConversion {
  status: string;
  selectedType: string;
  downloadUrl?: string;
  error?: string;
}

interface FileItem {
  id: number;
  file: File;
  conversion: FileConversion;
}

interface FileListItemProps {
  id: number;
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
}

export default function FileListItem({ id, files, setFiles }: FileListItemProps) {
  const removeFile = useCallback(
    (idToRemove: number) => {
      setFiles((prevFiles) => {
        const target = prevFiles.find((file) => file.id === idToRemove);

        if (target && target.conversion && target.conversion.downloadUrl) {
          try {
            URL.revokeObjectURL(target.conversion.downloadUrl);
          } catch (error) {}
        }

        return prevFiles.filter((file) => file.id !== idToRemove);
      });
    },
    [setFiles],
  );

  const setSelectedType = useCallback(
    (id: number, selectedType: string) => {
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === id
            ? {
                ...file,
                conversion: {
                  ...file.conversion,
                  selectedType,
                  status: file.conversion?.status || "idle",
                },
              }
            : file,
        ),
      );
    },
    [setFiles],
  );

  const startConvert = useCallback(
    (id: number) => {
      (async () => {
        setFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.id === id
              ? {
                  ...file,
                  conversion: {
                    ...file.conversion,
                    status: "converting",
                  },
                }
              : file,
          ),
        );

        const entry = files.find((fileItem) => fileItem.id === id);
        if (!entry) return;

        const original = entry.file;
        const selected = entry.conversion?.selectedType || null;

        try {
          const blob = await converter.convertFile(original, selected);
          if (!blob) throw new Error("Conversion produced no blob");

          const url = URL.createObjectURL(blob);
          setFiles((prevFiles) =>
            prevFiles.map((file) =>
              file.id === id
                ? {
                    ...file,
                    conversion: {
                      ...file.conversion,
                      status: "done",
                      downloadUrl: url,
                    },
                  }
                : file,
            ),
          );
        } catch (err) {
          setFiles((prevFiles) =>
            prevFiles.map((file) =>
              file.id === id
                ? {
                    ...file,
                    conversion: {
                      ...file.conversion,
                      status: "error",
                      error: String(err),
                    },
                  }
                : file,
            ),
          );
        }
      })();
    },
    [setFiles, files],
  );

  const returnToSelection = useCallback(
    (id: number) => {
      setFiles((prevFiles) =>
        prevFiles.map((file) => {
          if (file.id !== id) return file;

          if (file.conversion && file.conversion.downloadUrl) {
            try {
              URL.revokeObjectURL(file.conversion.downloadUrl);
            } catch (error) {}
          }

          const { downloadUrl, ...rest } = file.conversion || {};
          return {
            ...file,
            conversion: {
              ...rest,
              status: "idle",
              selectedType: "",
            },
          };
        }),
      );
    },
    [setFiles],
  );

  const triggerDownload = useCallback(
    (id: number) => {
      const entry = files.find((fileItem) => fileItem.id === id);
      if (!entry || !entry.conversion) return;

      const url = entry.conversion.downloadUrl;
      if (!url) return;

      const link = document.createElement("a");
      link.href = url;

      const sel = entry.conversion.selectedType;
      const newExt = sel || null;
      let name = entry.file.name || "download";

      if (newExt) {
        const parts = name.split(".");
        if (parts.length > 1) parts[parts.length - 1] = newExt;
        else parts.push(newExt);
        name = parts.join(".");
      }

      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    [files],
  );

  const currentFile = files.find((file) => file.id === id);
  if (!currentFile) return null;

  return (
    <li>
      <div className="flex flex-col sm:flex-row sm:items-center w-full file-card-bg-color transition-colors rounded-lg p-3 sm:p-4 gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          {currentFile.file.type &&
          currentFile.file.type.startsWith("image/") ? (
            <img
              src={URL.createObjectURL(currentFile.file)}
              alt={`Preview of ${currentFile.file.name}`}
              className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg border border-gray-300 dark:border-gray-600 shrink-0"
              onLoad={(event) => URL.revokeObjectURL((event.target as HTMLImageElement).src)}
              loading="lazy"
            />
          ) : (
            <div
              className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center"
              role="img"
              aria-label={`${currentFile.file.type || "Unknown"} file icon`}
            >
              {getFileIcon(currentFile.file)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
              {currentFile.file.name}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {formatFileSize(currentFile.file.size)} -{" "}
              {currentFile.file.type || "unknown"}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto sm:shrink-0">
          {(!currentFile.conversion?.status ||
            currentFile.conversion.status === "idle") &&
            (() => {
              const fileCategory = getFileCategory(currentFile.file);
              const availableFormats = getAvailableFormats(currentFile.file);

              if (availableFormats.length === 0) {
                return (
                  <span className="text-gray-500 px-3 py-2 text-center text-sm">
                    No conversions available
                  </span>
                );
              }

              return (
                <select
                  value={currentFile.conversion?.selectedType || ""}
                  onChange={(event) => setSelectedType(id, event.target.value)}
                  className="bg-gray-300 dark:bg-gray-700 rounded-lg font-semibold px-3 sm:px-4 py-2 cursor-pointer text-sm sm:text-base w-full sm:w-auto"
                  aria-label={`Select conversion format for ${currentFile.file.name}`}
                >
                  <option value="">Select type</option>

                  {fileCategory === "image" && (
                    <optgroup label="Image">
                      {availableFormats.map((opt: FormatOption) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {fileCategory === "audio" && (
                    <>
                      <optgroup label="Audio">
                        {availableFormats.map((opt: FormatOption) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>

                      {FORMAT_OPTIONS.video.length > 0 && (
                        <optgroup label="Video">
                          {FORMAT_OPTIONS.video.map((opt: FormatOption) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </>
                  )}

                  {fileCategory === "video" && (
                    <>
                      <optgroup label="Video">
                        {availableFormats.map((opt: FormatOption) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>

                      {FORMAT_OPTIONS.audio.length > 0 && (
                        <optgroup label="Audio">
                          {FORMAT_OPTIONS.audio.map((opt: FormatOption) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </>
                  )}
                </select>
              );
            })()}

          <ActionButton
            file={currentFile}
            startConvert={startConvert}
            returnToSelection={returnToSelection}
            triggerDownload={triggerDownload}
          />

          <button
            onClick={() => removeFile(id)}
            aria-label="Remove file"
            title="Remove file"
            className="bg-red-500 hover:bg-red-600 rounded-lg cursor-pointer px-2 sm:px-3 py-2 flex items-center justify-center shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
              aria-hidden="true"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
            </svg>
            <span className="sr-only">Remove file</span>
          </button>
        </div>
      </div>
    </li>
  );
}
