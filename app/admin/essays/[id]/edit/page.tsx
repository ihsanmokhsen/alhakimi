import Link from "next/link";
import { notFound } from "next/navigation";

import { EssayForm } from "@/components/admin/essay-form";
import { WorksFooter, WorksHeader } from "@/components/portfolio/makna-shell";
import { updateEssayAction } from "@/lib/actions/essays";
import { requireAdmin } from "@/lib/auth";
import { getEssayById } from "@/lib/data/essays";

type EditEssayPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditEssayPage({ params }: EditEssayPageProps) {
  await requireAdmin();
  const { id } = await params;
  const essay = await getEssayById(id);

  if (!essay) notFound();

  const action = updateEssayAction.bind(null, essay.id);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[color:var(--surface-muted)] text-[color:var(--text)]">
      <WorksHeader />

      <section className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-[color:var(--border-solid)] pb-6 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-black uppercase tracking-normal text-[#ff4f0a]">Admin · Essays</p>
            <h1 className="mt-3 text-[clamp(2.65rem,7vw,5.2rem)] font-black leading-[0.88] tracking-normal text-[color:var(--text)]">
              Edit essay
            </h1>
            <p className="mt-4 max-w-2xl text-[14px] font-medium leading-6 text-[color:var(--text)]/52">
              Perbarui tulisan dan foto tanpa menerbitkan ulang sebagai essay baru.
            </p>
          </div>
          <Link
            className="inline-flex w-fit rounded-full border border-[color:var(--border-solid)] bg-[color:var(--surface)]/75 px-4 py-2.5 text-[12px] font-black text-[color:var(--text)] shadow-[0_12px_30px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:border-black/18 hover:bg-[color:var(--surface)]"
            href="/admin#essays"
          >
            Kembali
          </Link>
        </div>

        <EssayForm action={action} essay={essay} submitLabel="Simpan perubahan" />
      </section>

      <WorksFooter />
    </main>
  );
}
