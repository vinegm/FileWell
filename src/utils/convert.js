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
  mov: "video/quicktime",
  mkv: "video/x-matroska",
  avi: "video/x-msvideo",
  flv: "video/x-flv",
  m4v: "video/x-m4v",
  avif: "image/avif",
  tiff: "image/tiff",
  tif: "image/tiff",
  bmp: "image/bmp",
  ico: "image/x-icon",
  svg: "image/svg+xml",
  heic: "image/heic",
  raw: "application/octet-stream",
};

function convertImage(file, format) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const mime = mimeMap[format] || `image/${format}`;
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) return reject(new Error("Failed to encode image"));
            resolve(blob);
          },
          mime,
          format === "jpeg" ? 0.92 : undefined
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for conversion"));
    };
    img.src = url;
  });
}

function convertVideoAudio(file, format) {
  throw new Error("Video/audio conversion not implemented");
}

export async function convertFile(original, selected) {
  if (!selected) throw new Error("No target format selected");

  if (original.type && original.type.startsWith("image/")) {
    const blob = await convertImage(original, selected);
    const mime = mimeMap[selected] || blob.type || "image/*";
    return { blob, mime };
  }

  return convertVideoAudio(original, selected);
}

export default convertFile;
