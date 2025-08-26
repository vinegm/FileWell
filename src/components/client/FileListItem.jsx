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
    <li key={id}>
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

              return (
                <select
                  value={state.selectedType || ""}
                  onChange={(evt) => setSelectedType(id, evt.target.value)}
                  className="bg-gray-300 dark:bg-gray-700 rounded-lg font-semibold px-4 py-2 cursor-pointer"
                >
                  <option value="">Select type</option>

                  {isImage ? (
                    <>
                      <option value="png">PNG</option>
                      <option value="jpeg">JPEG</option>
                      <option value="webp">WEBP</option>
                    </>
                  ) : null}

                  {isAudio ? (
                    <>
                      <optgroup label="Audio">
                        <option value="mp3">MP3</option>
                        <option value="wav">WAV</option>
                        <option value="ogg">OGG</option>
                      </optgroup>
                      <optgroup label="Video">
                        <option value="mp4">MP4</option>
                        <option value="webm">WEBM</option>
                      </optgroup>
                    </>
                  ) : null}

                  {isVideo ? (
                    <>
                      <optgroup label="Video">
                        <option value="mp4">MP4</option>
                        <option value="webm">WEBM</option>
                      </optgroup>
                      <optgroup label="Audio">
                        <option value="mp3">MP3</option>
                        <option value="wav">WAV</option>
                        <option value="ogg">OGG</option>
                      </optgroup>
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
              onClick={() => startConvert(id)}
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
            onClick={() => removeFile(index)}
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
