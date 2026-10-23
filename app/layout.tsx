import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PaperLens AI — Evidence-based exam prep",
  description: "Turn syllabi, notes, teacher question banks and past papers into explainable mock exams.",
  applicationName: "PaperLens AI",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
