import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Nam Thắng HRM - Hệ thống quản lý nhân sự",
  description: "Hệ thống quản lý nhân sự toàn diện cho công ty Nam Thắng",
  keywords: ["HRM", "quản lý nhân sự", "Nam Thắng", "tuyển dụng", "chấm công"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
