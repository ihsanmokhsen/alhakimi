import Image from "next/image";
import Link from "next/link";

import { deleteEssayAction } from "@/lib/actions/essays";
import type { EssayView } from "@/lib/data/essays";
import { formatJournalDate } from "@/lib/utils";

export function EssayList({ essays }: { essays: EssayView[] }) {
  if (essays.length === 0) {
    return <div className="border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-center text-[14px] font-bold text-[color:var(--text)]/52">Belum ada essay.</div>;
  }

  return (
    <div className="space-y-3">
      {essays.map((essay) => {
        const deleteAction = deleteEssayAction.bind(null, essay.id);
        return (
          <article className="flex gap-4 border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[0_18px_55px_rgba(18,22,34,0.07)] sm:p-5" key={essay.id}>
            {essay.hasCover ? (
              <div className="relative hidden h-24 w-32 shrink-0 overflow-hidden bg-[color:var(--surface-muted)] sm:block">
                <Image alt="" className="object-cover" fill sizes="128px" src={`/api/essay-cover/${essay.id}?v=${new Date(essay.updatedAt).getTime()}`} />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black uppercase text-[#2563ff]">{formatJournalDate(essay.publishedAt)}</p>
              <h3 className="mt-1 text-[22px] font-black leading-tight">{essay.title}</h3>
              <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-6 text-[color:var(--text)]/52">{essay.excerpt}</p>
              <Link className="mt-3 inline-flex text-[12px] font-black text-[#2563ff]" href={`/essays/${essay.slug}`} target="_blank">Lihat essay</Link>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <Link
                className="bg-black px-3 py-2 text-center text-[12px] font-black text-white transition hover:bg-[#2563ff]"
                href={`/admin/essays/${essay.id}/edit`}
              >
                Edit
              </Link>
              <form action={deleteAction}>
                <button className="w-full border border-[color:var(--border-solid)] px-3 py-2 text-[12px] font-black text-[color:var(--text)]/52 hover:text-red-500" type="submit">Hapus</button>
              </form>
            </div>
          </article>
        );
      })}
    </div>
  );
}
