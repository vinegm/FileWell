"use client";

import { useCallback, useState, useRef } from "react";
import FileListItem from "@/components/client/FileListItem";
import convertFile from "@/utils/convert";

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [conversionStates, setConversionStates] = useState({});
  const fileId = useRef(1);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const list = Array.from(event.dataTransfer?.files || []);
    if (list.length)
      setFiles((prevFiles) =>
        prevFiles.concat(list.map((file) => ({ id: fileId.current++, file })))
      );
  }, []);

  const onPick = useCallback((event) => {
    const list = Array.from(event.target.files || []);
    if (list.length)
      setFiles((prevFiles) =>
        prevFiles.concat(list.map((file) => ({ id: fileId.current++, file })))
      );
  }, []);

  const removeFile = (idToRemove) => {
    setFiles((prevFiles) => {
      const target = prevFiles.find((f) => f.id === idToRemove);
      if (
        target &&
        conversionStates[target.id] &&
        conversionStates[target.id].downloadUrl
      ) {
        try {
          URL.revokeObjectURL(conversionStates[target.id].downloadUrl);
        } catch (err) {}
      }
      const next = prevFiles.filter((f) => f.id !== idToRemove);

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

  const startConvert = (id, selectedFromUI = null) => {
    (async () => {
      const state = conversionStates[id] || {};
      const selected = selectedFromUI || state.selectedType || null;

      setConversionStates((prevStates) => ({
        ...(prevStates || {}),
        [id]: { ...(prevStates[id] || {}), status: "converting" },
      }));

      const entry = files.find((fileItem) => fileItem.id === id);
      if (!entry) return;
      const original = entry.file;

      try {
        const { blob } = await convertFile(original, selected);

        if (!blob) throw new Error("Conversion produced no blob");

        const url = URL.createObjectURL(blob);

        setConversionStates((prevStates) => ({
          ...(prevStates || {}),
          [id]: { ...(prevStates[id] || {}), status: "done", downloadUrl: url },
        }));
      } catch (err) {
        setConversionStates((prevStates) => ({
          ...(prevStates || {}),
          [id]: {
            ...(prevStates[id] || {}),
            status: "error",
            error: String(err),
          },
        }));
      }
    })();
  };

  const returnToSelection = (id) => {
    setConversionStates((prevStates) => {
      const copy = { ...(prevStates || {}) };
      const entry = copy[id] || {};

      if (entry.downloadUrl) {
        try {
          URL.revokeObjectURL(entry.downloadUrl);
        } catch (err) {}
      }
      copy[id] = { ...(entry || {}), status: "idle", selectedType: "" };

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

    const extMap = {
      jpeg: "jpg",
      jpg: "jpg",
      png: "png",
      webp: "webp",
      mp3: "mp3",
      wav: "wav",
      ogg: "ogg",
      mp4: "mp4",
      webm: "webm",
      mov: "mov",
      mkv: "mkv",
      avi: "avi",
      flv: "flv",
      m4v: "m4v",
      avif: "avif",
      tiff: "tiff",
      tif: "tif",
      bmp: "bmp",
      ico: "ico",
      svg: "svg",
      heic: "heic",
      raw: "raw",
    };

    const sel = state.selectedType;
    const newExt = sel ? extMap[sel] || sel : null;
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
