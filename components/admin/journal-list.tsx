import Image from "next/image";

import { deleteJournalAction } from "@/lib/actions/journals";
import type { JournalView } from "@/lib/data/journals";
import { formatJournalDate } from "@/lib/utils";

type JournalListProps = {
  journals: JournalView[];
};

export function JournalList({ journals }: JournalListProps) {
  return (
    <div className="space-y-3">
      {journals.length === 0 ? (
        <div className="rounded-[20px] border border-black/[0.06] bg-white p-6 text-center shadow-[0_18px_55px_rgba(18,22,34,0.07)]">
          <p className="text-[14px] font-bold text-black/52">No journal entries yet.</p>
        </div>
      ) : null}

      {journals.map((journal) => {
        const deleteAction = deleteJournalAction.bind(null, journal.id);
        const photoVersion = new Date(journal.updatedAt).getTime();

        return (
          <article
            className="flex flex-col gap-3 rounded-[20px] border border-black/[0.06] bg-white p-4 shadow-[0_18px_55px_rgba(18,22,34,0.07)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_72px_rgba(18,22,34,0.10)] sm:flex-row sm:items-start sm:justify-between sm:p-5"
            key={journal.id}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-normal text-[#2563ff]">
                    {formatJournalDate(journal.publishedAt)}
                  </p>
                  <h3 className="text-[23px] font-black leading-none text-black sm:text-[30px]">{journal.title}</h3>
                  {journal.hasPhoto ? <p className="text-[12px] font-bold text-black/36">Has photo</p> : null}
                </div>
                {journal.hasPhoto ? (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[16px] border border-black/[0.06] bg-[#f5f5f7] shadow-[0_10px_24px_rgba(18,22,34,0.09)]">
                    <Image
                      alt={`Foto untuk ${journal.title}`}
                      className="object-cover"
                      fill
                      sizes="56px"
                      src={`/api/journal-photo/${journal.id}?v=${photoVersion}`}
                    />
                  </div>
                ) : null}
              </div>
              <p className="max-w-3xl whitespace-pre-wrap text-[13px] font-medium leading-6 text-black/56">
                {journal.content}
              </p>
            </div>

            <form action={deleteAction} className="shrink-0">
              <button
                className="rounded-full border border-black/10 bg-[#f5f5f7] px-3.5 py-2 text-[12px] font-black text-black/52 transition hover:border-[#2563ff]/30 hover:text-[#2563ff]"
                type="submit"
              >
                Delete
              </button>
            </form>
          </article>
        );
      })}
    </div>
  );
}
