import Navbar from "@/components/server/Navbar";
import FileManager from "@/components/client/FileManager";

export default function Home() {
  return (
    <main className="p-4 sm:p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 sm:mb-20 lg:mb-25">
          <Navbar />
        </header>

        <div className="text-center space-y-6 sm:space-y-7 mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Free & Local File Converter
          </h1>
          <div className="text-base sm:text-lg lg:text-xl space-y-3 sm:space-y-2 px-2 sm:px-0">
            <p className="text-justify [text-align-last:center] max-w-4xl mx-auto">
              FileWell lets you convert images, audio, and video entirely in
              your browser using local processing.
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
