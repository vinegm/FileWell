import { FFmpeg } from "@ffmpeg/ffmpeg";

/**
 * Loads and initializes FFmpeg WebAssembly instance
 *
 * @returns {Promise<FFmpeg>} Initialized FFmpeg instance
 */
export default async function loadFfmpeg(): Promise<FFmpeg> {
  const ffmpeg = new FFmpeg();

  await ffmpeg.load({});

  return ffmpeg;
}
