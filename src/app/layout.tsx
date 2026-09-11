import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookVault — Không bao giờ mua trùng sách hai lần",
  description: "Tủ sách số cá nhân thông minh. Quản lý sách đã mua, đang đọc, ghi chú và hình ảnh sách vật lý.",
  keywords: ["book management", "digital bookshelf", "quản lý sách", "bookvault", "reading tracker"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FAF8F5",
};

const themeScript = `
  (function() {
    try {
      var saved = localStorage.getItem('bookvault-theme');
      var isDark = saved === 'dark' || (saved !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch(e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)] selection:bg-[#1e3a2f]/20">
        <QueryProvider>
          <ThemeProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                style: {
                  borderRadius: '10px',
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                },
              }}
            />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
