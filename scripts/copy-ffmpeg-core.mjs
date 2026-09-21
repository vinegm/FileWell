import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const files = [
  require.resolve("@ffmpeg/core"),
  require.resolve("@ffmpeg/core/wasm"),
];
const dest = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "ffmpeg",
);

mkdirSync(dest, { recursive: true });
for (const file of files) {
  copyFileSync(file, join(dest, basename(file)));
}
