import Image from "next/image";
import ThemeToggle from "@/components/client/ThemeToggle";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50" role="banner">
      <div className="flex items-center justify-between w-full backdrop-blur-md py-5 px-25">
        <div className="flex items-center gap-4">
          <Image
            src="/FileWellIconNoBg.png"
            alt="FileWell Logo"
            width={50}
            height={50}
            priority
          />
          <h1 className="text-3xl font-bold text-center">FileWell</h1>
        </div>

        <ThemeToggle />
      </div>
    </nav>
  );
}
