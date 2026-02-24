import { fetchFile } from "@ffmpeg/util";
import loadFfmpeg from "@/utils/load-ffmpeg";

class FileConverter {
  getFileExtension(fileName: string): string {
    const match = /(?:\.([^.]+))?$/.exec(fileName);
    return match?.[1] || "";
  }

  async convert(file: File, format: string): Promise<Blob> {
    const ffmpeg = await loadFfmpeg();

    try {
      const input = `input.${this.getFileExtension(file.name)}`;
      const output = `output.${format}`;

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
        ffmpegCmd.push(
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
        );
      }

      ffmpegCmd.push(output);
      await ffmpeg.exec(ffmpegCmd);

      const data = await ffmpeg.readFile(output);
      const blob = new Blob([data as BlobPart]);

      try {
        await ffmpeg.deleteFile(input);
        await ffmpeg.deleteFile(output);
      } catch (err) {
        console.warn("Cleanup warning:", err);
      }

      return blob;
    } finally {
      ffmpeg.terminate();
    }
  }

  async convertFile(file: File, format: string): Promise<Blob> {
    try {
      return await this.convert(file, format);
    } catch (error) {
      // Retry once on error
      return await this.convert(file, format);
    }
  }
}

const converter = new FileConverter();
export default converter;
