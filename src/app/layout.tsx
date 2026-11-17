import type { Metadata } from "next";
import type { ReactNode } from "react";

import { themeScript } from "@/lib/theme";
import { messages } from "@/messages";
import { StoreProvider } from "@/store/StoreProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: messages.app.name,
  description: messages.app.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The theme script adds the "dark" class to <html> before React starts,
    // so React is told not to warn that the class differs from the HTML file.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
