import { FFmpeg } from "@ffmpeg/ffmpeg";

/**
 * Wraps a single shared FFmpeg WebAssembly instance, lazily loaded and
 * reused across conversions to avoid re-initializing the wasm module
 * on every call. Work is serialized via `run()` so concurrent
 * conversions never interleave writeFile/exec/readFile calls against
 * the shared virtual filesystem.
 */
class FfmpegHandler {
  private instance: FFmpeg | null = null;
  private loadingPromise: Promise<FFmpeg> | null = null;
  private queue: Promise<unknown> = Promise.resolve();

  async getInstance(): Promise<FFmpeg> {
    if (this.instance) return this.instance;

    if (!this.loadingPromise) {
      this.loadingPromise = (async () => {
        const ffmpeg = new FFmpeg();

        await ffmpeg.load({});
        this.instance = ffmpeg;

        return ffmpeg;
      })().catch((err) => {
        this.loadingPromise = null;
        throw err;
      });
    }

    return this.loadingPromise;
  }

  /**
   * Terminates and discards the shared instance, forcing the next
   * `getInstance()` call to create a fresh one. Use this when an
   * instance may have ended up in a bad state after an error.
   */
  reset(): void {
    this.instance?.terminate();
    this.instance = null;
    this.loadingPromise = null;
  }

  /**
   * Queues `task` to run exclusively against the shared FFmpeg
   * instance, after any previously queued tasks have settled.
   */
  run<T>(task: (ffmpeg: FFmpeg) => Promise<T>): Promise<T> {
    const result = this.queue.then(() =>
      this.getInstance().then((ffmpeg) => task(ffmpeg)),
    );

    // Keep the queue chain alive regardless of success/failure so a
    // rejected task doesn't break scheduling of subsequent tasks.
    this.queue = result.catch(() => undefined);

    return result;
  }
}

const ffmpegHandler = new FfmpegHandler();
export default ffmpegHandler;
