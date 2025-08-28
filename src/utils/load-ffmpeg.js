import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

/**
 * Loads and initializes FFmpeg WebAssembly instance
 *
 * @returns {Promise<FFmpeg>} Initialized FFmpeg instance
 */
export default async function loadFfmpeg() {
  const ffmpeg = new FFmpeg();
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd";

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  return ffmpeg;
}
