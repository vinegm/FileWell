"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import FileListItem from "@/components/client/FileListItem";

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [isFFmpegReady, setIsFFmpegReady] = useState(false);
  const fileId = useRef(1);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (files.length > 0) {
        event.preventDefault();
        event.returnValue = "Changes you made may not be saved.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [files]);

  useEffect(() => {
    const preloadFFmpeg = async () => {
      try {
        const { default: loadFfmpeg } = await import("@/utils/load-ffmpeg");
        await loadFfmpeg();
        setIsFFmpegReady(true);
      } catch (error) {
        setIsFFmpegReady(true);
      }
    };

    preloadFFmpeg();
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const list = Array.from(event.dataTransfer?.files || []);
    if (list.length)
      setFiles((prevFiles) =>
        prevFiles.concat(
          list.map((file) => ({
            id: fileId.current++,
            file,
            conversion: { status: "idle", selectedType: "" },
          }))
        )
      );
  }, []);

  const onPick = useCallback((event) => {
    const list = Array.from(event.target.files || []);
    if (list.length)
      setFiles((prevFiles) =>
        prevFiles.concat(
          list.map((file) => ({
            id: fileId.current++,
            file,
            conversion: { status: "idle", selectedType: "" },
          }))
        )
      );
  }, []);

  return (
    <div className="space-y-8 sm:space-y-10">
      <section
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        className="relative flex items-center justify-center flex-col rounded-2xl sm:rounded-3xl border-2 border-dashed border-black dark:border-gray-300 hover:border-blue-400 cursor-pointer group transition-colors overflow-hidden"
        style={{ minHeight: "250px" }}
      >
        <label
          htmlFor="filepick"
          className="absolute inset-0 flex flex-col items-center justify-center w-full h-full cursor-pointer gap-4 sm:gap-5 p-4 sm:p-6"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              document.getElementById("filepick").click();
            }
          }}
        >
          <p className="text-base sm:text-lg text-center px-2">
            Drop files into the Well
          </p>
          <input
            id="filepick"
            type="file"
            multiple
            accept="image/*,audio/*,video/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={onPick}
            aria-label="Select files to convert"
          />
          <span className="bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-800 rounded-xl px-4 sm:px-5 py-2 text-sm sm:text-base font-medium transition-colors pointer-events-none">
            Select files
          </span>
        </label>
      </section>

      <section>
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
          Files:
        </h2>
        <div className="box-bg-color p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg">
          {files.length === 0 && (
            <p className="text-center py-6 sm:py-8 text-sm sm:text-base">
              The well is dry, add some files to see them listed here.
            </p>
          )}
          <ul className="space-y-2 sm:space-y-3">
            {files.map(({ id }, index) => (
              <FileListItem
                key={id}
                id={id}
                index={index}
                files={files}
                setFiles={setFiles}
                isFFmpegReady={isFFmpegReady}
              />
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
