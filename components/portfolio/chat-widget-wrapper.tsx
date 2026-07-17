"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const ChatWidget = dynamic(
  () => import("@/components/portfolio/chat-widget").then((module) => module.ChatWidget),
  { ssr: false }
);

const LIGHTWEIGHT_ROUTES = ["/admin", "/login", "/forgot-password", "/reset-password"];

export function ChatWidgetWrapper() {
  const pathname = usePathname();

  if (LIGHTWEIGHT_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return null;
  }

  return <ChatWidget />;
}
