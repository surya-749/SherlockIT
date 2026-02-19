import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "SherlockIT 2.0 – Mystery Solving Event",
  description:
    "A mystery-solving event application where teams explore worlds, solve clues, and submit the final mystery solution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="mystery-bg">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
