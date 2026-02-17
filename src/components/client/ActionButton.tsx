import React from "react";

interface FileConversion {
  status?: string;
  selectedType?: string;
  error?: string;
}

interface FileItem {
  id: number;
  file: File;
  conversion?: FileConversion;
}

interface ActionButtonProps {
  file: FileItem;
  startConvert: (id: number) => void;
  returnToSelection: (id: number) => void;
  triggerDownload: (id: number) => void;
}

export default function ActionButton({
  file,
  startConvert,
  returnToSelection,
  triggerDownload,
}: ActionButtonProps) {
  const status = file.conversion?.status;

  switch (status) {
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
          onClick={() => returnToSelection(file.id)}
          aria-label="Retry conversion"
          className="font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg cursor-pointer px-3 sm:px-4 py-2 text-sm sm:text-base w-full sm:w-auto"
          title={file.conversion?.error || "Conversion failed"}
        >
          Error - Retry
        </button>
      );

    case "done":
      return (
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => returnToSelection(file.id)}
            aria-label="Change file type"
            className="font-semibold bg-gray-300 dark:bg-gray-700 rounded-lg cursor-pointer px-3 sm:px-4 py-2 text-sm sm:text-base"
          >
            Change type
          </button>

          <button
            onClick={() => triggerDownload(file.id)}
            aria-label="Download converted file"
            className="font-semibold bg-green-500 dark:bg-green-600 rounded-lg cursor-pointer px-3 sm:px-4 py-2 text-sm sm:text-base"
          >
            Download
          </button>
        </div>
      );

    default: {
      const isDisabled = !file.conversion?.selectedType;
      return (
        <button
          onClick={() => startConvert(file.id)}
          disabled={isDisabled}
          aria-label="Start converting file"
          title="Start converting file"
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
  }
}
