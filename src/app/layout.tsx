import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import SmoothPageTransition from "@/components/SmoothPageTransition";

const onest = Onest({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "CineGemini",
  description: "Tu web de películas creada con Gemini",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={onest.className}>
        <ErrorBoundary>
          <ThemeProvider>
            <FavoritesProvider>
              <Navbar />
              <SmoothPageTransition>{children}</SmoothPageTransition>
            </FavoritesProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
