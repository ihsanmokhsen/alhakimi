import { redirect } from "next/navigation";

type JournalDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function JournalDetailPage({ params }: JournalDetailPageProps) {
  const { id } = await params;
  redirect(`/journal/${id}`);
}
