import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider>
            <FavoritesProvider>
              <Navbar />
              {children}
            </FavoritesProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
