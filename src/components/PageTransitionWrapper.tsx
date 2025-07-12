"use client";
import SmoothPageTransition from "@/components/SmoothPageTransition";

export default function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  return <SmoothPageTransition>{children}</SmoothPageTransition>;
} 