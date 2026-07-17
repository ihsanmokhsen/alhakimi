"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Types ──────────────────────────────────────────────
// The runtime API of useChat returns more properties than the type definitions
// reflect. We extend the type here to include the familiar helpers.
type UseChatReturn = {
  messages: UIMessage[];
  input: string;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e?: { preventDefault?: () => void }) => void;
  isLoading: boolean;
  append: (message: { role: "user" | "assistant"; content: string }) => void;
  setMessages: (
    messages: UIMessage[] | ((prev: UIMessage[]) => UIMessage[])
  ) => void;
  error: Error | undefined;
  stop: () => void;
  reload: () => void;
};

// ── Constants ─────────────────────────────────────────
const SUGGESTED_QUESTIONS = [
  "Apa saja project yang pernah dibuat?",
  "Cerita tentang background Ihsan",
  "Bagaimana cara kerja website ini?",
  "Butuh konsultasi website"
];

// ── Icons ──────────────────────────────────────────────
function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        d="M6 18L18 6M6 6l12 12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current/40 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current/40 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current/40 [animation-delay:300ms]" />
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────
/** Extract display text from a UIMessage, supporting both `content` and `parts` formats. */
function renderMessageContent(m: Record<string, unknown>): string | undefined {
  if (typeof m.content === "string" && m.content.length > 0) {
    return m.content;
  }
  // UIMessage in ai v7 may use `parts` array
  const parts = m.parts as Array<Record<string, unknown>> | undefined;
  if (parts) {
    const texts = parts
      .filter((p): p is Record<string, unknown> & { text: string } =>
        typeof p.text === "string"
      )
      .map((p) => p.text);
    if (texts.length > 0) {
      return texts.join("");
    }
  }
  return undefined;
}

// ── Component ─────────────────────────────────────────
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const chat = useChat() as unknown as UseChatReturn;
  const {
    messages,
    input = "",
    handleInputChange,
    handleSubmit,
    isLoading,
    append
  } = chat;

  // ── Handlers ──────────────────────────────────────
  const open = useCallback(() => {
    setIsOpen(true);
    setHasOpened(true);
    setTimeout(() => inputRef.current?.focus(), 350);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const submitQuestion = useCallback(
    (question: string) => {
      if (!hasOpened) setHasOpened(true);
      if (!isOpen) setIsOpen(true);
      append({ role: "user", content: question });
    },
    [append, hasOpened, isOpen]
  );



  // ── Side effects ──────────────────────────────────
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keyboard: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  // Lock body scroll when chat is open on mobile
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // ── Derived state ─────────────────────────────────
  const showWelcome = messages.length === 0;
  const showSuggestions = messages.length === 0 && hasOpened;

  return (
    <>
      {/* ─── Floating button ─── */}
      <button
        aria-label={isOpen ? "Tutup chat" : "Buka chat AI"}
        className={`group fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#2563ff] text-white shadow-[0_8px_32px_rgba(37,99,255,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(37,99,255,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563ff]/50 focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 sm:h-15 sm:w-15 ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
        onClick={open}
        type="button"
      >
        <SparkleIcon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110 sm:h-7 sm:w-7" />
        {/* Pulse ring */}
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-ping rounded-full bg-[#2563ff]/30"
        />
      </button>

      {/* ─── Chat panel overlay (mobile) ─── */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 sm:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
      />

      {/* ─── Chat panel ─── */}
      <div
        aria-hidden={!isOpen}
        ref={panelRef}
        className={`fixed bottom-0 right-0 z-50 flex w-full flex-col overflow-hidden border-l border-[color:var(--border-strong)] bg-[color:var(--surface)] shadow-2xl transition-all duration-300 ease-out sm:bottom-24 sm:right-6 sm:h-[560px] sm:max-h-[80vh] sm:w-[400px] sm:rounded-2xl sm:border ${
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100 sm:translate-y-0 sm:scale-100"
            : "pointer-events-none translate-y-full opacity-0 sm:translate-y-4 sm:scale-95"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="AI Chat"
      >
        {/* ─── Header ─── */}
        <div className="flex shrink-0 items-center justify-between border-b border-[color:var(--border-strong)] px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563ff]/10">
              <SparkleIcon className="h-5 w-5 text-[#2563ff]" />
            </div>
            <div>
              <p className="text-[14px] font-black text-[color:var(--text)]">
                works AI
              </p>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                <span className="text-[11px] font-medium text-[color:var(--text-56)]">
                  {isLoading ? "Mengetik..." : "Online"}
                </span>
              </div>
            </div>
          </div>
          <button
            aria-label="Tutup chat"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--text-44)] transition-colors hover:bg-[color:var(--bg-chip)] hover:text-[color:var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563ff]/50"
            onClick={close}
            type="button"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* ─── Messages ─── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          {showWelcome ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563ff] to-violet-500 shadow-[0_8px_24px_rgba(37,99,255,0.25)]">
                <SparkleIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-[18px] font-black text-[color:var(--text)] sm:text-[20px]">
                Hai! 👋
              </h3>
              <p className="mt-2 max-w-xs text-[13px] font-medium leading-6 text-[color:var(--text-56)] sm:text-[14px]">
                Saya asisten AI untuk website ini. Tanya apapun tentang portfolio,
                project, atau Ihsan!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => (
                <div
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  key={m.id}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-6 sm:px-5 sm:py-3 ${
                      m.role === "user"
                        ? "bg-[#2563ff] text-white"
                        : "bg-[color:var(--bg-chip)] text-[color:var(--text)]"
                    }`}
                  >
                    {renderMessageContent(m as never) as string | undefined}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading &&
                messages.length > 0 &&
                messages[messages.length - 1]?.role === "user" && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-[color:var(--bg-chip)] px-5 py-3.5 text-[color:var(--text)]">
                      <TypingDots />
                    </div>
                  </div>
                )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Suggested questions */}
          {showSuggestions && showWelcome && (
            <div className="mt-6 grid grid-cols-2 gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  className="rounded-xl border border-[color:var(--border-strong)] px-3 py-2.5 text-left text-[12px] font-semibold leading-snug text-[color:var(--text-62)] transition-all hover:border-[#2563ff]/30 hover:bg-[#2563ff]/5 hover:text-[#2563ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563ff]/50 sm:text-[13px]"
                  key={q}
                  onClick={() => submitQuestion(q)}
                  type="button"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Input area ─── */}
        <div className="shrink-0 border-t border-[color:var(--border-strong)] px-4 pb-5 pt-3 sm:px-5 sm:pb-4 sm:pt-3">
          <form className="flex items-end gap-2" onSubmit={handleSubmit}>
            <div className="relative flex-1">
              <input
                ref={inputRef}
                className="w-full rounded-xl border border-[color:var(--border-solid)] bg-[color:var(--surface-muted)] px-4 py-2.5 pr-10 text-[14px] text-[color:var(--text)] placeholder:text-[color:var(--text-34)] transition-colors focus:border-[#2563ff]/40 focus:outline-none focus:ring-2 focus:ring-[#2563ff]/15"
                disabled={isLoading}
                id="chat-input"
                placeholder="Tanya sesuatu..."
                value={input}
                onChange={handleInputChange}
              />
            </div>
            <button
              aria-label="Kirim pesan"
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-[#2563ff] text-white transition-all hover:bg-[#0f4ff2] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563ff]/50"
              disabled={!input.trim() || isLoading}
              type="submit"
            >
              <SendIcon className="h-[18px] w-[18px]" />
            </button>
          </form>
          <p className="mt-2 text-center text-[10px] font-medium text-[color:var(--text-30)]">
            Powered by Gemini — gratis, tidak perlu login
          </p>
        </div>
      </div>
    </>
  );
}
