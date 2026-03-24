import type { Metadata } from "next";
import { Newsreader, Manrope, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", style: ["normal", "italic"] });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SignBridge — Communication Reimagined",
  description:
    "AI-powered sign language video calling. Real-time gesture recognition and speech-to-text captions bridging deaf and hearing communities.",
  keywords: ["sign language", "video calling", "deaf", "accessibility", "AI captions", "SignBridge"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${manrope.variable} ${inter.variable}`}>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" async></script>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" async></script>
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#fbf9f5",
                color: "#1b1c1a",
                border: "none",
                boxShadow: "0 8px 32px rgba(27,28,26,0.06)",
                fontFamily: "var(--font-manrope)",
              },
              success: { iconTheme: { primary: "#9a442d", secondary: "#fbf9f5" } },
              error: { iconTheme: { primary: "#ba1a1a", secondary: "#fbf9f5" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
