import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduTrack",
  description: "Assignment & Submission Management System",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <script
          // Sets the color-theme attribute before first paint, mirroring what next-themes does
          // internally for dark mode — without this, a saved non-default theme would flash the
          // default look for a frame before React hydrates and ThemeColorProvider's effect runs.
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('edutrack:color-theme');if(t)document.documentElement.dataset.colorTheme=t;}catch(e){}",
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
