import { fetchFile } from "@ffmpeg/util";
import ffmpegHandler from "@/utils/load-ffmpeg";

let nextCallId = 0;

class FileConverter {
  getFileExtension(fileName: string): string {
    const match = /(?:\.([^.]+))?$/.exec(fileName);
    return match?.[1] || "";
  }

  async convert(file: File, format: string): Promise<Blob> {
    const callId = nextCallId++;
    const input = `input-${callId}.${this.getFileExtension(file.name)}`;
    const output = `output-${callId}.${format}`;

    return ffmpegHandler.run(async (ffmpeg) => {
      try {
        await ffmpeg.writeFile(input, await fetchFile(file));

        const ffmpegCmd: string[] = ["-i", input];

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
        return new Blob([data as BlobPart]);
      } finally {
        try {
          await ffmpeg.deleteFile(input);
        } catch {
          // input may not have been written yet
        }
        try {
          await ffmpeg.deleteFile(output);
        } catch {
          // output may not have been produced
        }
      }
    });
  }

  async convertFile(file: File, format: string): Promise<Blob> {
    try {
      return await this.convert(file, format);
    } catch (firstError) {
      // The ffmpeg instance may be left in a bad state after an error,
      // so discard it before retrying with a fresh one.
      ffmpegHandler.reset();

      try {
        return await this.convert(file, format);
      } catch (secondError) {
        throw new Error(
          `Conversion failed: ${firstError}. Retry also failed: ${secondError}`,
        );
      }
    }
  }
}

const converter = new FileConverter();
export default converter;
