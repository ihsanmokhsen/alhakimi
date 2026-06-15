"use client";

import { startTransition, useActionState, useRef, useState } from "react";

import type { HeroFormState } from "@/lib/actions/hero";

type HeroFormProps = {
  updateAction: (state: HeroFormState, formData: FormData) => Promise<HeroFormState>;
  removeAction: () => Promise<HeroFormState>;
  hasHero: boolean;
  currentTitle: string;
  currentSubtitle: string;
};

const initialState: HeroFormState = {};

export function HeroForm({ updateAction, removeAction, hasHero, currentTitle, currentSubtitle }: HeroFormProps) {
  const [updateState, updateFormAction, updatePending] = useActionState(updateAction, initialState);
  const [removeState, setRemoveState] = useState<HeroFormState>({});
  const [removePending, setRemovePending] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) { setPreview(null); return; }
    setPreview(URL.createObjectURL(file));
  }

  function submitUpdate(formData: FormData) {
    startTransition(() => updateFormAction(formData));
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleRemove() {
    setRemovePending(true);
    const result = await removeAction();
    setRemoveState(result);
    setRemovePending(false);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const state = removeState.success || removeState.error ? removeState : updateState;

  return (
    <section className="rounded-[24px] border border-black/[0.06] bg-white p-4 shadow-[0_20px_70px_rgba(18,22,34,0.09)] sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[12px] font-black uppercase text-[#2563ff]">Appearance</p>
          <h3 className="mt-1 text-[20px] font-black text-black">Hero settings</h3>
        </div>
        <span className="rounded-full bg-black/5 px-3 py-1 text-[11px] font-bold text-black/50">
          {hasHero ? "Custom" : "Default"}
        </span>
      </div>

      <form action={submitUpdate} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-[12px] font-black uppercase text-black/42">Hero title</span>
            <input
              className="w-full rounded-[16px] border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-[14px] font-semibold text-black outline-none transition placeholder:text-black/30 focus:border-[#2563ff]/45 focus:bg-white"
              defaultValue={currentTitle}
              name="heroTitle"
              placeholder="works"
              type="text"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-[12px] font-black uppercase text-black/42">Hero subtitle</span>
            <input
              className="w-full rounded-[16px] border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-[14px] font-semibold text-black outline-none transition placeholder:text-black/30 focus:border-[#2563ff]/45 focus:bg-white"
              defaultValue={currentSubtitle}
              name="heroSubtitle"
              placeholder="Beberapa Apps yang dibuat untuk kebutuhan kantor dan pribadi."
              type="text"
            />
          </label>
        </div>

        <label className="space-y-1.5">
          <span className="text-[12px] font-black uppercase text-black/42">Upload image or GIF</span>
          <input
            ref={inputRef}
            accept="image/*"
            className="w-full rounded-[16px] border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-[13px] font-semibold text-black outline-none file:mr-3 file:rounded-full file:border-0 file:bg-black file:px-3.5 file:py-1.5 file:text-[12px] file:font-black file:text-white"
            name="heroFile"
            onChange={handleFileChange}
            type="file"
          />
          <p className="text-[12px] font-medium text-black/42">
            Supports PNG, JPG, GIF, WebP. Max 8 MB.
          </p>
        </label>

        {preview ? (
          <div className="overflow-hidden rounded-[16px] border border-black/[0.08]">
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
            className="rounded-full bg-black px-5 py-3 text-[12px] font-black text-white shadow-[0_14px_34px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 hover:bg-[#2563ff] disabled:translate-y-0 disabled:opacity-60"
            disabled={updatePending}
            type="submit"
          >
            {updatePending ? "Saving" : "Save hero"}
          </button>

          {hasHero ? (
            <button
              className="rounded-full border border-black/10 bg-white px-5 py-3 text-[12px] font-black text-black transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 disabled:translate-y-0 disabled:opacity-60"
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
  );
}
