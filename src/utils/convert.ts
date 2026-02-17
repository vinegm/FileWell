import { fetchFile } from "@ffmpeg/util";
import loadFfmpeg from "@/utils/load-ffmpeg";
import { FFmpeg } from "@ffmpeg/ffmpeg";

/**
 * FileConverter class for handling file conversions
 */
class FileConverter {
  private ffmpegInstance: FFmpeg | null = null;

  /**
   * Extracts file extension from filename
   */
  getFileExtension(fileName: string): string {
    const regex = /(?:\.([^.]+))?$/;
    const match = regex.exec(fileName);

    if (match && match[1]) return match[1];

    return "";
  }

  /**
   * Removes file extension from filename
   */
  removeFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf(".");

    if (lastDotIndex !== -1) return fileName.slice(0, lastDotIndex);

    return fileName;
  }

  /**
   * Gets or creates FFmpeg instance with error handling
   */
  async getFFmpegInstance(): Promise<FFmpeg> {
    if (!this.ffmpegInstance) {
      try {
        this.ffmpegInstance = await loadFfmpeg();
      } catch (error) {
        throw new Error(
          "FFmpeg failed to load. Please refresh the page and try again."
        );
      }
    }

    if (!this.ffmpegInstance) {
      throw new Error("FFmpeg instance is null after initialization");
    }

    return this.ffmpegInstance;
  }

  /**
   * Resets the FFmpeg instance (useful for memory issues)
   */
  resetFFmpegInstance(): void {
    this.ffmpegInstance = null;
  }

  /**
   * Converts files using FFmpeg WebAssembly (supports images, audio, and video)
   */
  async convert(file: File, format: string): Promise<Blob> {
    try {
      const ffmpeg = await this.getFFmpegInstance();

      // Using unique filenames to avoid conflicts
      const timestamp = Date.now();
      const input = `input_${timestamp}.${this.getFileExtension(file.name)}`;
      const output = `output_${timestamp}.${format}`;

      await ffmpeg.writeFile(input, await fetchFile(file));

      let ffmpegCmd: string[] = ["-i", input];

      // Format-specific optimizations
      if (format === "jpeg" || format === "jpg") {
        ffmpegCmd.push("-q:v", "2");
      } else if (format === "png") {
        ffmpegCmd.push("-compression_level", "6");
      } else if (format === "webp") {
        ffmpegCmd.push("-q:v", "80");
      } else if (format === "3gp") {
        ffmpegCmd = [
          "-i",
          input,
          "-r",
          "20",
          "-s",
          "352x288",
          "-vb",
          "400k",
          "-acodec",
          "aac",
          "-strict",
          "experimental",
          "-ac",
          "1",
          "-ar",
          "8000",
          "-ab",
          "24k",
          output,
        ];
      } else {
        ffmpegCmd.push(output);
      }

      if (!ffmpegCmd.includes(output)) {
        ffmpegCmd.push(output);
      }

      await ffmpeg.exec(ffmpegCmd);

      const data = await ffmpeg.readFile(output);
      const blob = new Blob([data as BlobPart]);

      try {
        await ffmpeg.deleteFile(input);
        await ffmpeg.deleteFile(output);
      } catch (cleanupError) {
        console.warn("Cleanup warning:", cleanupError);
      }

      return blob;
    } catch (error) {
      throw new Error(`Failed to convert ${file.name}: ${(error as Error).message}`);
    }
  }

  /**
   * Main conversion function - routes to appropriate converter based on file type
   */
  async convertFile(original: File, selected: string | null): Promise<Blob> {
    if (!selected) throw new Error("No target format selected");

    try {
      if (
        original.type &&
        (original.type.startsWith("image/") ||
          original.type.startsWith("video/") ||
          original.type.startsWith("audio/"))
      ) {
        return await this.convert(original, selected);
      }

      throw new Error(`Unsupported file type: ${original.type}`);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message &&
        error.message.includes("memory access out of bounds")
      ) {
        this.resetFFmpegInstance();

        if (
          original.type &&
          (original.type.startsWith("image/") ||
            original.type.startsWith("video/") ||
            original.type.startsWith("audio/"))
        ) {
          return await this.convert(original, selected);
        }
      }

      throw error;
    }
  }
}

const converter = new FileConverter();
export default converter;
