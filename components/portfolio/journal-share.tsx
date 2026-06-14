"use client";

import { ShareButton } from "@/components/portfolio/share-button";

type JournalShareProps = {
  title: string;
};

export function JournalShare({ title }: JournalShareProps) {
  return <ShareButton title={title} url={typeof window !== "undefined" ? window.location.href : ""} variant="light" />;
}
