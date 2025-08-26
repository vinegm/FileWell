import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata = {
  title: "FileWell",
  description: "A lightweight client-side",
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
