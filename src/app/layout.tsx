import { ThemeProvider } from "next-themes";
import "@/app/globals.css";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "FileWell",
  description:
    "Convert images, audio, and video directly in your browser with FileWell.",
  keywords:
    "filewell, file converter, browser file conversion, local file processing, image converter, audio converter, video converter",
  authors: [{ name: "Vinícius Gonçalves Mohr", url: "https://vinegm.dev" }],
  creator: "Vinícius Gonçalves Mohr",
  icons: "/favicon.ico",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="text-color bg-white dark:bg-gray-900 antialiased">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
