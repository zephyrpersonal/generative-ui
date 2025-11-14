import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Generative UI - AI-Powered Dynamic Interface",
  description: "Generate dynamic UIs with AI using streaming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" data-theme="light">
      <body>
        {children}
      </body>
    </html>
  );
}
