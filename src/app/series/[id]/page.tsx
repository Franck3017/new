'use client';

import { useTVShowPage } from "@/hooks/useTVShowPage";
import TVShowPageComponent from "@/components/pages/TVShowPage";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TVShowPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TVShowPage({ params }: TVShowPageProps) {
  // Use the business logic hook to get all data and actions
  const pageLogic = useTVShowPage(params);

  // Render the UI component with all the logic passed as props
  return <TVShowPageComponent {...pageLogic} />;
} 