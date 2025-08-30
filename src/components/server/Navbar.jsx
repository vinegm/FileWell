import Image from "next/image";
import ThemeToggle from "@/components/client/ThemeToggle";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50" role="banner">
      <div className="flex items-center justify-between w-full backdrop-blur-md py-3 sm:py-4 lg:py-5 px-4 sm:px-8 lg:px-25">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          <Image
            src="/FileWellIconNoBg.png"
            alt="FileWell Logo"
            width={40}
            height={40}
            priority
            className="rounded-lg sm:w-[45px] sm:h-[45px] lg:w-[50px] lg:h-[50px]"
          />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
            FileWell
          </h1>
        </div>

        <ThemeToggle />
      </div>
    </nav>
  );
}
