import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const povVideoSelect = Prisma.validator<Prisma.PovVideoSelect>()({
  id: true,
  title: true,
  youtubeUrl: true,
  position: true,
  createdAt: true,
  updatedAt: true
});

export type PovVideoView = Prisma.PovVideoGetPayload<{
  select: typeof povVideoSelect;
}>;

export async function getPovVideos() {
  return prisma.povVideo.findMany({
    select: povVideoSelect,
    orderBy: [{ position: "asc" }, { createdAt: "desc" }]
  });
}
