import Image from "next/image";

import { deleteJournalAction } from "@/lib/actions/journals";
import type { JournalView } from "@/lib/data/journals";
import { formatJournalDate } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";

type JournalListProps = {
  journals: JournalView[];
};

export function JournalList({ journals }: JournalListProps) {
  return (
    <div className="space-y-4">
      {journals.length === 0 ? (
        <GlassCard className="p-5 text-sm text-[color:var(--ui-soft)]">No journal entries yet.</GlassCard>
      ) : null}

      {journals.map((journal) => {
        const deleteAction = deleteJournalAction.bind(null, journal.id);

        return (
          <GlassCard className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between" key={journal.id}>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--ui-soft)]">
                    {formatJournalDate(journal.publishedAt)}
                  </p>
                  <h3 className="text-xl font-semibold text-[color:var(--ui-strong)]">{journal.title}</h3>
                  {journal.hasPhoto ? <p className="text-xs text-[color:var(--ui-soft)]">Has photo</p> : null}
                </div>
                {journal.hasPhoto ? (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)]">
                    <Image
                      alt={`Foto untuk ${journal.title}`}
                      className="object-cover"
                      fill
                      sizes="56px"
                      src={`/api/journal-photo/${journal.id}`}
                    />
                  </div>
                ) : null}
              </div>
              <p className="max-w-3xl whitespace-pre-wrap text-sm leading-7 text-[color:var(--ui-muted)]">
                {journal.content}
              </p>
            </div>

            <form action={deleteAction}>
              <button
                className="rounded-full border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-muted)] transition hover:text-[#ff8e75]"
                type="submit"
              >
                Delete
              </button>
            </form>
          </GlassCard>
        );
      })}
    </div>
  );
}
