import type { Metadata } from "next";
import type { ReactNode } from "react";

import { messages } from "@/messages";

import "./globals.css";

export const metadata: Metadata = {
  title: messages.app.name,
  description: messages.app.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
