import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tuyển dụng lái xe - Nam Thắng Group",
  description: "Cơ hội nghề nghiệp hấp dẫn tại Tập đoàn Nam Thắng",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0057FF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <div className="app-wrap">
          {children}
        </div>
      </body>
    </html>
  );
}
