import { ThemeProvider } from "next-themes";
import "@/app/globals.css";

export const metadata = {
  title: "FileWell",
  description:
    "Convert images, audio, and video directly in your browser with FileWell. Enjoy fast local processing plus optional obfuscation to protect files from machine learning use.",
  keywords:
    "filewell, file converter, browser file conversion, local file processing, image converter, audio converter, video converter, file obfuscation, data protection, machine learning prevention, privacy tools, perturbation tool",
  authors: [{ name: "Vinícius Gonçalves Mohr", url: "https://vinegm.dev" }],
  creator: "Vinícius Gonçalves Mohr",
  icon: "/favicon.ico",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }) {
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
