"use client";

import { useEffect, useState } from "react";

type ConsultationModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ConsultationModal({ open, onClose }: ConsultationModalProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsReady(false);
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => setIsReady(true));

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/[0.45] backdrop-blur-sm transition-opacity duration-500 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
      />
      <button
        aria-label="Tutup dialog konsultasi"
        className="fixed inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />

      {/* Modal card */}
      <section
        className={`relative z-10 w-full max-w-lg overflow-hidden rounded-[24px] border border-white/[0.14] bg-white shadow-[0_40px_140px_rgba(10,12,20,0.32)] transition-all duration-500 ${
          isReady
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-6 scale-[0.975] opacity-0"
        }`}
      >
        {/* Accent gradient bar */}
        <div
          aria-hidden="true"
          className="h-1.5 w-full bg-gradient-to-r from-[#ff4f0a] via-orange-300 to-[#ff4f0a] bg-[length:200%_100%]"
          style={{ animation: "gradientShift 4s ease infinite" }}
        />

        {/* Close button */}
        <button
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.10] bg-white text-black/[0.52] transition hover:border-black/[0.20] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4f0a]/50"
          onClick={onClose}
          type="button"
          aria-label="Tutup"
        >
          <svg
            className="h-4 w-4"
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
        </button>

        <div className="px-6 pb-8 pt-5 sm:px-8 sm:pb-10 sm:pt-6">
          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ff4f0a]/15 bg-[#ff4f0a]/5 px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#ff4f0a]">
              Tersedia untuk Proyek
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-[clamp(2rem,7vw,2.8rem)] font-black leading-[1.05] tracking-tight text-black">
            Butuh Website atau
            <br />
            <span className="bg-gradient-to-r from-[#ff4f0a] via-orange-300 to-[#ff4f0a] bg-[length:200%_100%] bg-clip-text text-transparent" style={{ animation: "gradientShift 4s ease infinite" }}>
              Konsultasi?
            </span>
          </h2>

          <p className="mt-4 max-w-md text-[15px] font-medium leading-7 text-black/[0.58] sm:text-[16px]">
            Saya terbuka untuk diskusi ringan, tanya-tanya, atau serius membangun aplikasi
            web seperti yang ada di portofolio ini. Gratis — tidak ada biaya untuk ngobrol.
          </p>

          {/* Contact card */}
          <div className="mt-7 rounded-2xl border border-black/[0.08] bg-[#f2f4f3] p-5 sm:p-6">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-black/[0.40]">
              Hubungi via Email
            </p>
            <a
              className="mt-2 block text-[clamp(1.05rem,3vw,1.2rem)] font-bold leading-snug text-[#ff4f0a] transition hover:text-[#e54100] focus-visible:outline-none focus-visible:underline"
              href="mailto:ihsanmokhsen17@gmail.com?subject=Konsultasi%20Website%20%2F%20Project"
            >
              ihsanmokhsen17@gmail.com
            </a>
            <p className="mt-3 text-[13px] leading-6 text-black/[0.48]">
              Kirim deskripsi project atau ide kamu — saya biasanya merespon dalam
              1×24 jam.
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              className="group relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#ff4f0a] px-6 py-3.5 text-[14px] font-bold text-white shadow-[0_18px_40px_rgba(255,79,10,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e54100] hover:shadow-[0_24px_55px_rgba(255,79,10,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4f0a]/50"
              href="mailto:ihsanmokhsen17@gmail.com?subject=Konsultasi%20Website%20%2F%20Project"
            >
              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="relative z-10">Kirim Email</span>
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
            </a>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full border border-black/[0.12] bg-white px-6 py-3.5 text-[14px] font-bold text-black/[0.64] transition-all duration-300 hover:-translate-y-0.5 hover:border-black/[0.22] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4f0a]/50"
              onClick={onClose}
              type="button"
            >
              Nanti Saja
            </button>
          </div>

          {/* Footer micro-text */}
          <p className="mt-5 text-center text-[12px] text-black/[0.32]">
            Tidak ada biaya untuk konsultasi awal.
          </p>
        </div>
      </section>
    </div>
  );
}