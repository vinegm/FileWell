import { useCallback } from "react";
import convertFile from "@/utils/convert";
import {
  getFileCategory,
  getAvailableFormats,
  getFileIcon,
  formatFileSize,
  EXTENSION_MAP,
  FORMAT_OPTIONS,
} from "@/utils/file-types";

export default function FileListItem({
  id,
  index,
  files,
  setFiles,
  isFFmpegReady,
}) {
  const removeFile = useCallback(
    (idToRemove) => {
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
    [setFiles]
  );

  const setSelectedType = useCallback(
    (id, selectedType) => {
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
            : file
        )
      );
    },
    [setFiles]
  );

  const startConvert = useCallback(
    (id) => {
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
              : file
          )
        );

        const entry = files.find((fileItem) => fileItem.id === id);
        if (!entry) return;

        const original = entry.file;
        const selected = entry.conversion?.selectedType || null;

        try {
          const { blob } = await convertFile(original, selected);
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
                : file
            )
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
                : file
            )
          );
        }
      })();
    },
    [setFiles, files]
  );

  const returnToSelection = useCallback(
    (id) => {
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
        })
      );
    },
    [setFiles]
  );

  const triggerDownload = useCallback(
    (id) => {
      const entry = files.find((fileItem) => fileItem.id === id);
      if (!entry || !entry.conversion) return;

      const url = entry.conversion.downloadUrl;
      if (!url) return;

      const a = document.createElement("a");
      a.href = url;

      const sel = entry.conversion.selectedType;
      const newExt = sel ? EXTENSION_MAP[sel] || sel : null;
      let name = entry.file.name || "download";

      if (newExt) {
        const parts = name.split(".");
        if (parts.length > 1) parts[parts.length - 1] = newExt;
        else parts.push(newExt);
        name = parts.join(".");
      }

      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
    [files]
  );

  // Get the current file state from the files array
  const currentFile = files.find((f) => f.id === id);
  if (!currentFile) return null;

  return (
    <li>
      <div className="flex items-center w-full file-card-bg-color transition-colors rounded-lg p-3 gap-4">
        {currentFile.file.type && currentFile.file.type.startsWith("image/") ? (
          <img
            src={URL.createObjectURL(currentFile.file)}
            alt={currentFile.file.name}
            className="w-14 h-14 object-cover rounded-lg"
            onLoad={(event) => URL.revokeObjectURL(event.target.src)}
          />
        ) : (
          <span className="text-3xl">{getFileIcon(currentFile.file)}</span>
        )}

        <div className="flex-1">
          <div className=" ">{currentFile.file.name}</div>
          <div className=" ">
            {formatFileSize(currentFile.file.size)} -{" "}
            {currentFile.file.type || "unknown"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(!currentFile.conversion?.status ||
            currentFile.conversion.status === "idle") &&
            (() => {
              const fileCategory = getFileCategory(currentFile.file);
              const availableFormats = getAvailableFormats(currentFile.file);

              if (availableFormats.length === 0) {
                return (
                  <span className="text-gray-500 px-4 py-2">
                    No conversions available
                  </span>
                );
              }

              return (
                <select
                  value={currentFile.conversion?.selectedType || ""}
                  onChange={(event) => setSelectedType(id, event.target.value)}
                  className="bg-gray-300 dark:bg-gray-700 rounded-lg font-semibold px-4 py-2 cursor-pointer"
                >
                  <option value="">Select type</option>

                  {fileCategory === "image" && (
                    <optgroup label="Image">
                      {availableFormats.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {fileCategory === "audio" && (
                    <>
                      <optgroup label="Audio">
                        {availableFormats.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>

                      {FORMAT_OPTIONS.video.length > 0 && (
                        <optgroup label="Video">
                          {FORMAT_OPTIONS.video.map((opt) => (
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
                        {availableFormats.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>

                      {FORMAT_OPTIONS.audio.length > 0 && (
                        <optgroup label="Audio">
                          {FORMAT_OPTIONS.audio.map((opt) => (
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

          {currentFile.conversion?.status === "converting" ? (
            <button
              aria-label="Converting file..."
              className="bg-yellow-500 rounded-lg font-semibold px-4 py-2"
            >
              Converting...
            </button>
          ) : currentFile.conversion?.status === "done" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => returnToSelection(id)}
                aria-label="Change file type"
                className="font-semibold bg-gray-300 dark:bg-gray-700 rounded-lg cursor-pointer px-4 py-2"
              >
                Change type
              </button>

              <button
                onClick={() => triggerDownload(id)}
                aria-label="Download converted file"
                className="font-semibold bg-green-500 dark:bg-green-600 rounded-lg cursor-pointer px-4 py-2"
              >
                Download
              </button>
            </div>
          ) : (
            (() => {
              const fileCategory = getFileCategory(currentFile.file);
              const isAudioVideo =
                fileCategory === "audio" || fileCategory === "video";
              const isDisabled =
                !currentFile.conversion?.selectedType ||
                (isAudioVideo && !isFFmpegReady);
              const buttonText =
                isAudioVideo && !isFFmpegReady ? "Loading..." : "Convert";

              return (
                <button
                  onClick={() => startConvert(id)}
                  disabled={isDisabled}
                  aria-label="Start converting file"
                  title="Start converting file"
                  className={`font-semibold rounded-lg px-4 py-2 ${
                    !isDisabled
                      ? "bg-blue-500 dark:bg-blue-600 cursor-pointer"
                      : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                  }`}
                >
                  {buttonText}
                </button>
              );
            })()
          )}

          <button
            onClick={() => removeFile(id)}
            aria-label="Remove file"
            title="Remove file"
            className="bg-red-500 hover:bg-red-600 rounded-lg cursor-pointer px-3 py-2 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-5 h-5 text-white"
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
