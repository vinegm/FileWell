import ThemeToggle from "@/components/client/ThemeToggle";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50" role="banner">
      <div className="flex items-center justify-between w-full backdrop-blur-md py-5 px-25">
        <h1 className="text-3xl font-bold text-center">FileWell</h1>

        <ThemeToggle />
      </div>
    </nav>
  );
}
