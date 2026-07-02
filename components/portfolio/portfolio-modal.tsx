"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ShareButton } from "@/components/portfolio/share-button";
import type { ProjectCard } from "@/lib/data/projects";

type PortfolioModalProps = {
  project: ProjectCard;
  onClose: () => void;
};

export function PortfolioModal({ project, onClose }: PortfolioModalProps) {
  const [isReady, setIsReady] = useState(false);
  const logoVersion = new Date(project.updatedAt).getTime();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => {
      setIsReady(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain p-0 sm:items-center sm:p-6">
      <div
        className={`fixed inset-0 bg-[color:var(--surface-overlay)] backdrop-blur-sm transition-opacity duration-500 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
      />
      <button
        aria-label="Close project detail"
        className="fixed inset-0"
        onClick={onClose}
        type="button"
      />

      <section
        className={`relative z-10 min-h-svh w-full overflow-y-auto rounded-none border border-[color:var(--border-solid)] bg-[color:var(--surface)] shadow-[0_40px_140px_rgba(10,12,20,0.28)] transition-all duration-500 sm:my-auto sm:min-h-0 sm:max-h-[calc(100svh-3rem)] sm:max-w-6xl sm:rounded-[24px] ${
          isReady ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-[0.985] opacity-0"
        }`}
      >
        <button
          className="absolute right-4 top-4 z-10 rounded-full border border-[color:var(--border-stronger)] bg-[color:var(--surface)] px-4 py-2 text-[12px] font-black uppercase text-[color:var(--text)]/[0.62] transition hover:text-[color:var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563ff]/50"
          onClick={onClose}
          type="button"
        >
          Close
        </button>

        <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative min-h-[320px] overflow-hidden bg-[#e8e8e8] sm:min-h-[440px] lg:min-h-[620px]">
            <Image
              alt={`${project.title} visual`}
              className="object-cover"
              fill
              priority
              quality={85}
              sizes="(max-width: 1024px) 100vw, 56vw"
              src={`/api/project-logo/${project.id}?v=${logoVersion}`}
            />
          </div>

          <div className="flex min-h-[460px] flex-col justify-between p-6 sm:p-8 lg:min-h-[620px] lg:p-12">
            <div>
              <p className="text-[11px] font-black uppercase text-[color:var(--text)]/[0.44]">
                {project.category} / {project.featured ? "Featured" : "Selected"}
              </p>
              <h2 className="mt-6 text-[clamp(2.8rem,8vw,6.5rem)] font-black leading-[0.86] tracking-tight text-[color:var(--text)]">
                {project.title}
              </h2>
              <p className="mt-7 max-w-xl text-[16px] font-medium leading-8 text-[color:var(--text)]/[0.58] sm:text-[19px] sm:leading-9">
                {project.description}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:mt-10">
              <p className="text-[12px] font-black uppercase text-[color:var(--text)]/[0.36]">
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "medium"
                }).format(project.createdAt)}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  className="inline-flex w-full justify-center rounded-full bg-black px-6 py-3 text-[13px] font-black uppercase text-white transition hover:bg-black/[0.76] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563ff]/50 sm:w-auto"
                  href={project.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  Klik Aplikasi
                </Link>
                <ShareButton title={project.title} url={project.url} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
