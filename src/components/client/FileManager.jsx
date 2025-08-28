"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import FileListItem from "@/components/client/FileListItem";

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [isFFmpegReady, setIsFFmpegReady] = useState(false);
  const fileId = useRef(1);

  useEffect(() => {
    const preloadFFmpeg = async () => {
      try {
        const { default: loadFfmpeg } = await import("@/utils/load-ffmpeg");
        await loadFfmpeg();
        setIsFFmpegReady(true);
      } catch (error) {
        console.warn("FFmpeg preload failed:", error);
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
    <div className="space-y-10">
      <section
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        className="flex items-center justify-center flex-col rounded-3xl border-2 border-dashed border-black dark:border-gray-300 hover:border-blue-400 cursor-pointer group"
        style={{ minHeight: 350 }}
      >
        <label
          htmlFor="filepick"
          className="flex flex-col items-center w-full cursor-pointer gap-5"
        >
          <p className="text-lg">Drop files into the Well</p>
          <input
            id="filepick"
            type="file"
            multiple
            accept="image/*,audio/*,video/*"
            className="hidden"
            onChange={onPick}
          />
          <span className="bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-800 rounded-xl px-5 py-2">
            Select files
          </span>
        </label>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          Files
        </h2>
        <div className="box-bg-color p-6 rounded-2xl shadow-lg">
          {files.length === 0 && (
            <p className=" ">
              No files yet — add some to see them listed here.
            </p>
          )}
          <ul className="space-y-2">
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
