"use client";

import { useCallback, useState } from "react";
import FileListItem from "./FileListItem";

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [conversionStates, setConversionStates] = useState({});

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const list = Array.from(event.dataTransfer?.files || []);
    if (list.length)
      setFiles((prevFiles) =>
        prevFiles.concat(
          list.map((file) => ({ id: `${Date.now()}-${Math.random()}`, file }))
        )
      );
  }, []);

  const onPick = useCallback((event) => {
    const list = Array.from(event.target.files || []);
    if (list.length)
      setFiles((prevFiles) =>
        prevFiles.concat(
          list.map((file) => ({ id: `${Date.now()}-${Math.random()}`, file }))
        )
      );
  }, []);

  const removeFile = (removeIndex) => {
    setFiles((prevFiles) => {
      const target = prevFiles[removeIndex];
      if (
        target &&
        conversionStates[target.id] &&
        conversionStates[target.id].downloadUrl
      ) {
        try {
          URL.revokeObjectURL(conversionStates[target.id].downloadUrl);
        } catch (err) {}
      }
      const next = prevFiles.filter((_, index) => index !== removeIndex);
      // also cleanup conversion state
      setConversionStates((prevStates) => {
        const copy = { ...prevStates };
        if (target) delete copy[target.id];
        return copy;
      });
      return next;
    });
  };

  const setSelectedType = (id, selectedType) => {
    setConversionStates((prevStates) => ({
      ...(prevStates || {}),
      [id]: {
        ...(prevStates[id] || {}),
        selectedType,
        status: prevStates[id]?.status || "idle",
      },
    }));
  };

  const startConvert = (id) => {
    const state = conversionStates[id] || {};
    const selected = state.selectedType || null;
    // hide selector by setting status to converting
    setConversionStates((prevStates) => ({
      ...(prevStates || {}),
      [id]: { ...(prevStates[id] || {}), status: "converting" },
    }));

    // mock conversion with timeout
    setTimeout(() => {
      const entry = files.find((fileItem) => fileItem.id === id);
      if (!entry) return;
      const original = entry.file;

      // derive mime from selected type when possible
      const mimeMap = {
        png: "image/png",
        jpeg: "image/jpeg",
        jpg: "image/jpeg",
        webp: "image/webp",
        mp3: "audio/mpeg",
        wav: "audio/wav",
        ogg: "audio/ogg",
        mp4: "video/mp4",
        webm: "video/webm",
      };
      const mime =
        mimeMap[selected] || original.type || "application/octet-stream";

      // create a mock converted blob (for now reuse content)
      const converted = new Blob([original], { type: mime });
      const url = URL.createObjectURL(converted);

      setConversionStates((prevStates) => ({
        ...(prevStates || {}),
        [id]: { ...(prevStates[id] || {}), status: "done", downloadUrl: url },
      }));
    }, 2000);
  };

  const returnToSelection = (id) => {
    setConversionStates((prevStates) => {
      const copy = { ...(prevStates || {}) };
      const entry = copy[id] || {};
      // revoke previous download url if present
      if (entry.downloadUrl) {
        try {
          URL.revokeObjectURL(entry.downloadUrl);
        } catch (err) {}
      }
      copy[id] = { ...(entry || {}), status: "idle", selectedType: "" };
      // remove downloadUrl after revoking
      if (copy[id].downloadUrl) delete copy[id].downloadUrl;
      return copy;
    });
  };

  const triggerDownload = (id) => {
    const state = conversionStates[id];
    const entry = files.find((fileItem) => fileItem.id === id);
    if (!state || !entry) return;
    const url = state.downloadUrl;
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = entry.file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

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
            {files.map(({ id, file }, index) => {
              const state = conversionStates[id] || {};
              return (
                <FileListItem
                  key={id}
                  id={id}
                  file={file}
                  index={index}
                  state={state}
                  setSelectedType={setSelectedType}
                  startConvert={startConvert}
                      returnToSelection={returnToSelection}
                  triggerDownload={triggerDownload}
                  removeFile={removeFile}
                />
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
