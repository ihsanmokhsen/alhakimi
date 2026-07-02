import { deletePovVideoAction } from "@/lib/actions/pov-videos";
import type { PovVideoView } from "@/lib/data/pov-videos";

type PovVideoListProps = {
  videos: PovVideoView[];
};

export function PovVideoList({ videos }: PovVideoListProps) {
  return (
    <div className="space-y-3">
      {videos.length === 0 ? (
        <div className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-center shadow-[0_18px_55px_rgba(18,22,34,0.07)]">
          <p className="text-[14px] font-bold text-[color:var(--text)]/52">No POV videos yet.</p>
        </div>
      ) : null}

      {videos.map((video) => {
        const deleteAction = deletePovVideoAction.bind(null, video.id);

        return (
          <article
            className="flex flex-col gap-3 rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[0_18px_55px_rgba(18,22,34,0.07)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_72px_rgba(18,22,34,0.10)] sm:flex-row sm:items-center sm:justify-between sm:p-5"
            key={video.id}
          >
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-[68px] shrink-0 overflow-hidden rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface-muted)] shadow-[0_10px_24px_rgba(18,22,34,0.09)]">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                  src={video.youtubeUrl}
                  title={video.title}
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-[18px] font-black leading-none text-[color:var(--text)] sm:text-[22px]">{video.title}</h3>
                <p className="text-[12px] font-medium text-[color:var(--text)]/36">Position {video.position}</p>
              </div>
            </div>

            <form action={deleteAction} className="shrink-0">
              <button
                className="rounded-full border border-[color:var(--border-solid)] bg-[color:var(--surface-muted)] px-3.5 py-2 text-[12px] font-black text-[color:var(--text)]/52 transition hover:border-[#2563ff]/30 hover:text-[#2563ff]"
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
