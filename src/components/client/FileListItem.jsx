export default function FileListItem({
  id,
  file,
  index,
  state = {},
  setSelectedType,
  startConvert,
  returnToSelection,
  triggerDownload,
  removeFile,
}) {
  return (
    <li>
      <div className="flex items-center w-full file-card-bg-color transition-colors rounded-lg p-3 gap-4">
        {file.type && file.type.startsWith("image/") ? (
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="w-14 h-14 object-cover rounded-lg"
            onLoad={(event) => URL.revokeObjectURL(event.target.src)}
          />
        ) : (
          <span className="text-3xl">
            {file.type && file.type.startsWith("audio/")
              ? "Sound"
              : file.type && file.type.startsWith("video/")
              ? "Video"
              : "Document"}
          </span>
        )}

        <div className="flex-1">
          <div className=" ">{file.name}</div>
          <div className=" ">
            {(file.size / 1024).toFixed(1)} KB - {file.type || "unknown"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(!state.status || state.status === "idle") &&
            (() => {
              const isImage = file.type && file.type.startsWith("image/");
              const isAudio = file.type && file.type.startsWith("audio/");
              const isVideo = file.type && file.type.startsWith("video/");

              const deriveKey = (f) => {
                if (!f) return null;
                const t = (f.type || "").toLowerCase();
                if (t.includes("png")) return "png";
                if (t.includes("jpeg") || t.includes("jpg")) return "jpeg";
                if (t.includes("webp")) return "webp";
                if (t.includes("mpeg") || t.includes("mp3")) return "mp3";
                if (t.includes("wav")) return "wav";
                if (t.includes("ogg")) return "ogg";
                if (t.includes("mp4")) return "mp4";
                if (t.includes("webm")) return "webm";
                if (t.includes("quicktime") || t.includes("mov")) return "mov";
                if (t.includes("matroska") || t.includes("mkv")) return "mkv";
                if (t.includes("x-msvideo") || t.includes("avi")) return "avi";
                if (t.includes("x-flv") || t.includes("flv")) return "flv";
                if (t.includes("m4v")) return "m4v";
                const name = (f.name || "").toLowerCase();
                const ext = name.split(".").pop();
                return ext || null;
              };

              const currentKey = deriveKey(file);

              const imageOptions = [
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
              ].filter((o) => o.value !== currentKey);

              const audioOptions = [
                { value: "mp3", label: "MP3" },
                { value: "wav", label: "WAV" },
                { value: "ogg", label: "OGG" },
              ].filter((o) => o.value !== currentKey);

              const videoOptions = [
                { value: "mp4", label: "MP4" },
                { value: "webm", label: "WEBM" },
                { value: "mov", label: "MOV" },
                { value: "mkv", label: "MKV" },
                { value: "avi", label: "AVI" },
                { value: "flv", label: "FLV" },
                { value: "m4v", label: "M4V" },
              ].filter((o) => o.value !== currentKey);

              return (
                <select
                  value={state.selectedType || ""}
                  onChange={(evt) => setSelectedType(id, evt.target.value)}
                  className="bg-gray-300 dark:bg-gray-700 rounded-lg font-semibold px-4 py-2 cursor-pointer"
                >
                  <option value="">Select type</option>

                  {isImage && imageOptions.length > 0
                    ? imageOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))
                    : null}

                  {isAudio ? (
                    <>
                      {audioOptions.length > 0 ? (
                        <optgroup label="Audio">
                          {audioOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                      ) : null}

                      {videoOptions.length > 0 ? (
                        <optgroup label="Video">
                          {videoOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                      ) : null}
                    </>
                  ) : null}

                  {isVideo ? (
                    <>
                      {videoOptions.length > 0 ? (
                        <optgroup label="Video">
                          {videoOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                      ) : null}

                      {audioOptions.length > 0 ? (
                        <optgroup label="Audio">
                          {audioOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                      ) : null}
                    </>
                  ) : null}
                </select>
              );
            })()}

          {state.status === "converting" ? (
            <button
              aria-label="Converting file..."
              className="bg-yellow-500 rounded-lg font-semibold px-4 py-2"
            >
              Converting...
            </button>
          ) : state.status === "done" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  typeof returnToSelection === "function" &&
                  returnToSelection(id)
                }
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
            <button
              onClick={() => startConvert(id, state.selectedType)}
              disabled={!state.selectedType}
              aria-label="Start converting file"
              title="Start converting file"
              className={`font-semibold rounded-lg px-4 py-2 ${
                state.selectedType
                  ? "bg-blue-500 dark:bg-blue-600 cursor-pointer"
                  : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
              }`}
            >
              Convert
            </button>
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
