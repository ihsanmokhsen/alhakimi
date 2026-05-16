"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className={`absolute inset-0 bg-black/24 backdrop-blur-sm transition-opacity duration-500 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
      />
      <button
        aria-label="Close project detail"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />

      <section
        className={`relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_40px_140px_rgba(10,12,20,0.28)] transition-all duration-500 ${
          isReady ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-[0.985] opacity-0"
        }`}
      >
        <button
          className="absolute right-4 top-4 z-10 rounded-full border border-black/10 bg-white/78 px-4 py-2 text-[12px] font-bold text-black/58 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl transition hover:text-black"
          onClick={onClose}
          type="button"
        >
          Close
        </button>

        <div className="grid md:grid-cols-[1.08fr_0.92fr]">
          <div className="relative min-h-[360px] overflow-hidden bg-[#edeef2] sm:min-h-[520px]">
            <Image
              alt={`${project.title} visual`}
              className="object-cover"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 55vw"
              src={`/api/project-logo/${project.id}?v=${logoVersion}`}
            />
          </div>

          <div className="flex min-h-[360px] flex-col justify-between p-6 sm:p-8 lg:p-10">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#2563ff]/10 px-3 py-1.5 text-[12px] font-black uppercase text-[#2563ff]">
                  {project.category}
                </span>
                <span className="rounded-full border border-black/10 px-3 py-1.5 text-[12px] font-bold text-black/42">
                  {project.featured ? "Featured" : "Selected"}
                </span>
              </div>

              <h2 className="mt-6 text-[42px] font-black leading-none tracking-normal text-black sm:text-[58px]">
                {project.title}
              </h2>
              <p className="mt-6 text-[16px] font-medium leading-8 text-black/58 sm:text-[18px]">
                {project.description}
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12px] font-bold uppercase text-black/34">
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "medium"
                }).format(project.createdAt)}
              </p>
              <Link
                className="inline-flex justify-center rounded-full bg-black px-6 py-3 text-[14px] font-black text-white shadow-[0_20px_45px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-[#2563ff]"
                href={project.url}
                rel="noreferrer"
                target="_blank"
              >
                Klik Aplikasi
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
