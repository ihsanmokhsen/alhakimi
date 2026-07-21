"use client";

import { startTransition, useActionState, useRef, useState } from "react";

import type { HeroFormState } from "@/lib/actions/hero";
import type { WelcomeFormState } from "@/lib/actions/welcome";

type HeroFormProps = {
  updateAction: (state: HeroFormState, formData: FormData) => Promise<HeroFormState>;
  removeAction: () => Promise<HeroFormState>;
  hasHero: boolean;
  currentTitle: string;
  currentSubtitle: string;
  welcomeUpdateAction: (state: WelcomeFormState, formData: FormData) => Promise<WelcomeFormState>;
  welcomeRemoveAction: () => Promise<WelcomeFormState>;
  hasWelcome: boolean;
};

const initialHeroState: HeroFormState = {};
const initialWelcomeState: WelcomeFormState = {};

export function HeroForm({
  updateAction,
  removeAction,
  hasHero,
  currentTitle,
  currentSubtitle,
  welcomeUpdateAction,
  welcomeRemoveAction,
  hasWelcome
}: HeroFormProps) {
  /* ── Hero background image ── */
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateAction,
    initialHeroState
  );
  const [removeState, setRemoveState] = useState<HeroFormState>({});
  const [removePending, setRemovePending] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Welcome popup image ── */
  const [welcomeState, welcomeFormAction, welcomePending] = useActionState(
    welcomeUpdateAction,
    initialWelcomeState
  );
  const [welcomeRemoveState, setWelcomeRemoveState] = useState<WelcomeFormState>({});
  const [welcomeRemovePending, setWelcomeRemovePending] = useState(false);
  const [welcomePreview, setWelcomePreview] = useState<string | null>(null);
  const welcomeInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) { setPreview(null); return; }
    setPreview(URL.createObjectURL(file));
  }

  function handleWelcomeFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) { setWelcomePreview(null); return; }
    setWelcomePreview(URL.createObjectURL(file));
  }

  function submitUpdate(formData: FormData) {
    startTransition(() => updateFormAction(formData));
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function submitWelcomeUpdate(formData: FormData) {
    startTransition(() => welcomeFormAction(formData));
    setWelcomePreview(null);
    if (welcomeInputRef.current) welcomeInputRef.current.value = "";
  }

  async function handleRemove() {
    setRemovePending(true);
    const result = await removeAction();
    setRemoveState(result);
    setRemovePending(false);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleWelcomeRemove() {
    setWelcomeRemovePending(true);
    const result = await welcomeRemoveAction();
    setWelcomeRemoveState(result);
    setWelcomeRemovePending(false);
    setWelcomePreview(null);
    if (welcomeInputRef.current) welcomeInputRef.current.value = "";
  }

  const state = removeState.success || removeState.error ? removeState : updateState;
  const welcomeDisplayState =
    welcomeRemoveState.success || welcomeRemoveState.error
      ? welcomeRemoveState
      : welcomeState;

  return (
    <div className="space-y-6">
      {/* ── Hero Section ── */}
      <section className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[0_20px_70px_rgba(18,22,34,0.09)] sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-black uppercase text-[#ff4f0a]">Appearance</p>
            <h3 className="mt-1 text-[20px] font-black text-[color:var(--text)]">Hero settings</h3>
          </div>
          <span className="rounded-full bg-black/5 px-3 py-1 text-[11px] font-bold text-[color:var(--text)]/50">
            {hasHero ? "Custom" : "Default"}
          </span>
        </div>

        <form action={submitUpdate} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-[12px] font-black uppercase text-[color:var(--text)]/42">Hero title</span>
              <input
                className="w-full rounded-[16px] border border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] px-4 py-3 text-[14px] font-semibold text-[color:var(--text)] outline-none transition placeholder:text-[color:var(--text)]/30 focus:border-[#ff4f0a]/45 focus:bg-[color:var(--surface)]"
                defaultValue={currentTitle}
                name="heroTitle"
                placeholder="works"
                type="text"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-[12px] font-black uppercase text-[color:var(--text)]/42">Hero subtitle</span>
              <input
                className="w-full rounded-[16px] border border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] px-4 py-3 text-[14px] font-semibold text-[color:var(--text)] outline-none transition placeholder:text-[color:var(--text)]/30 focus:border-[#ff4f0a]/45 focus:bg-[color:var(--surface)]"
                defaultValue={currentSubtitle}
                name="heroSubtitle"
                placeholder="Beberapa Apps yang dibuat untuk kebutuhan kantor dan pribadi."
                type="text"
              />
            </label>
          </div>

          <label className="space-y-1.5">
            <span className="text-[12px] font-black uppercase text-[color:var(--text)]/42">Upload image or GIF</span>
            <input
              ref={inputRef}
              accept="image/*"
              className="w-full rounded-[16px] border border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] px-4 py-3 text-[13px] font-semibold text-[color:var(--text)] outline-none file:mr-3 file:rounded-full file:border-0 file:bg-[color:var(--inverse-surface)] file:px-3.5 file:py-1.5 file:text-[12px] file:font-black file:text-white"
              name="heroFile"
              onChange={handleFileChange}
              type="file"
            />
            <p className="text-[12px] font-medium text-[color:var(--text)]/42">
              Supports PNG, JPG, GIF, WebP. Max 8 MB.
            </p>
          </label>

          {preview ? (
            <div className="overflow-hidden rounded-[16px] border border-[color:var(--border-strong)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Hero preview"
                className="h-48 w-full object-cover"
                src={preview}
              />
            </div>
          ) : null}

          {state.error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{state.error}</p>
          ) : null}
          {state.success ? (
            <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-600">{state.success}</p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full bg-black px-5 py-3 text-[12px] font-black text-white shadow-[0_14px_34px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 hover:bg-[#ff4f0a] disabled:translate-y-0 disabled:opacity-60"
              disabled={updatePending}
              type="submit"
            >
              {updatePending ? "Saving" : "Save hero"}
            </button>

            {hasHero ? (
              <button
                className="rounded-full border border-[color:var(--border-solid)] bg-[color:var(--surface)] px-5 py-3 text-[12px] font-black text-[color:var(--text)] transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 disabled:translate-y-0 disabled:opacity-60"
                disabled={removePending}
                onClick={handleRemove}
                type="button"
              >
                {removePending ? "Removing" : "Remove hero"}
              </button>
            ) : null}
          </div>
        </form>
      </section>

      {/* ── Welcome Popup Section ── */}
      <section className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[0_20px_70px_rgba(18,22,34,0.09)] sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-black uppercase text-[#ff4f0a]">Popup</p>
            <h3 className="mt-1 text-[20px] font-black text-[color:var(--text)]">Welcome popup image</h3>
          </div>
          <span className="rounded-full bg-black/5 px-3 py-1 text-[11px] font-bold text-[color:var(--text)]/50">
            {hasWelcome ? "Active" : "Off"}
          </span>
        </div>

        <p className="mb-4 text-[13px] font-medium leading-relaxed text-[color:var(--text)]/[0.48]">
          Gambar atau GIF yang muncul sekali di awal kunjungan (popup welcome). Bisa
          dikosongkan — kalau kosong popup tidak akan muncul.
        </p>

        <form action={submitWelcomeUpdate} className="space-y-4">
          <label className="space-y-1.5">
            <span className="text-[12px] font-black uppercase text-[color:var(--text)]/42">Upload popup image / GIF</span>
            <input
              ref={welcomeInputRef}
              accept="image/*"
              className="w-full rounded-[16px] border border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] px-4 py-3 text-[13px] font-semibold text-[color:var(--text)] outline-none file:mr-3 file:rounded-full file:border-0 file:bg-[#ff4f0a] file:px-3.5 file:py-1.5 file:text-[12px] file:font-black file:text-white"
              name="welcomeFile"
              onChange={handleWelcomeFileChange}
              type="file"
            />
            <p className="text-[12px] font-medium text-[color:var(--text)]/42">
              Supports PNG, JPG, GIF, WebP. Max 8 MB. Ukuran direkomendasikan tidak
              terlalu besar — akan tampil responsif di desktop & HP.
            </p>
          </label>

          {welcomePreview ? (
            <div className="overflow-hidden rounded-[16px] border border-[color:var(--border-strong)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Welcome preview"
                className="max-h-56 w-full object-contain bg-[color:var(--surface-muted)]"
                src={welcomePreview}
              />
            </div>
          ) : null}

          {welcomeDisplayState.error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              {welcomeDisplayState.error}
            </p>
          ) : null}
          {welcomeDisplayState.success ? (
            <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-600">
              {welcomeDisplayState.success}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full bg-[#ff4f0a] px-5 py-3 text-[12px] font-black text-white shadow-[0_14px_34px_rgba(255,79,10,0.24)] transition hover:-translate-y-0.5 hover:bg-[#e54100] disabled:translate-y-0 disabled:opacity-60"
              disabled={welcomePending}
              type="submit"
            >
              {welcomePending ? "Saving" : "Save welcome image"}
            </button>

            {hasWelcome ? (
              <button
                className="rounded-full border border-[color:var(--border-solid)] bg-[color:var(--surface)] px-5 py-3 text-[12px] font-black text-[color:var(--text)] transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 disabled:translate-y-0 disabled:opacity-60"
                disabled={welcomeRemovePending}
                onClick={handleWelcomeRemove}
                type="button"
              >
                {welcomeRemovePending ? "Removing" : "Remove welcome"}
              </button>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}