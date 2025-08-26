import Navbar from "@/components/server/Navbar";
import FileManager from "@/components/client/FileManager";

export default function Home() {
  return (
    <main className="p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-25">
          <Navbar />
        </header>

        <div className="text-center space-y-7 mb-10">
          <h1 className="text-5xl">Free & Local File Converter</h1>
          <div className="text-xl space-y-2">
            <p className="text-justify [text-align-last:center]">
              FileWell lets you convert images, audio, and video entirely in
              your browser using local processing. It also offers controlled
              obfuscation, irreversible perturbations that intentionally make
              files unsuitable for machine learning training.
            </p>
            <p className="text-blue-600 dark:text-blue-500">
              All operations run on your machine and no files are uploaded.
            </p>
          </div>
        </div>

        <FileManager />
      </div>
    </main>
  );
}
