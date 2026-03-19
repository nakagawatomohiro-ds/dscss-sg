import type { Metadata } from "next";
import "./globals.css";
import AIChatPanel from "@/components/AIChatPanel";

export const metadata: Metadata = {
  title: "情報セキュリティマネジメント 学習アプリ",
  description: "情報セキュリティマネジメント試験対策 270問 学習アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen text-gray-900 antialiased">
        {children}
        <AIChatPanel />
      </body>
    </html>
  );
}
