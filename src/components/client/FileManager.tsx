"use client";

import { useState, useEffect } from "react";
import FileListItem from "@/components/client/FileListItem";
import type { FileItem } from "@/types";

// Pseudo-unique ID generator, who cares ykwim
function generateId() {
  return Date.now() + Math.random();
}

export default function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (files.length > 0) {
        event.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [files.length]);

  const addFiles = (newFiles: File[]) => {
    if (!newFiles.length) return;
    setFiles((prev) => [
      ...prev,
      ...newFiles.map((file) => ({
        id: generateId(),
        file,
        conversion: { status: "idle", selectedType: "" },
      })),
    ]);
  };

  const onDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    addFiles(Array.from(event.dataTransfer?.files || []));
  };

  const onPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files || []));
  };

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
              document.getElementById("filepick")?.click();
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
            {files.map((file) => (
              <FileListItem
                key={file.id}
                file={file}
                onUpdate={(updatedFile) =>
                  setFiles((prev) =>
                    prev.map((f) => (f.id === file.id ? updatedFile : f)),
                  )
                }
                onRemove={(id) =>
                  setFiles((prev) => {
                    const target = prev.find((f) => f.id === id);
                    if (target?.conversion?.downloadUrl) {
                      URL.revokeObjectURL(target.conversion.downloadUrl);
                    }
                    return prev.filter((f) => f.id !== id);
                  })
                }
              />
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
