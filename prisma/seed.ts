import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma";

async function main() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "change-me";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { username },
    update: {
      passwordHash
    },
    create: {
      username,
      passwordHash
    }
  });

  await prisma.project.upsert({
    where: { url: "https://absenpagi-perbidang.vercel.app/" },
    update: {
      position: 0
    },
    create: {
      title: "Absen Pagi Perbidang",
      url: "https://absenpagi-perbidang.vercel.app/",
      description: "An internal attendance app with a focused daily workflow and a clean, fast experience.",
      category: "Attendance App",
      featured: true,
      position: 0
    }
  });

  await prisma.project.upsert({
    where: { url: "https://optimalisasi-pad-ntt.netlify.app/" },
    update: {
      position: 1
    },
    create: {
      title: "Optimalisasi PAD NTT",
      url: "https://optimalisasi-pad-ntt.netlify.app/",
      description: "A web platform that presents PAD optimization initiatives through a clear and structured experience.",
      category: "Government Platform",
      featured: true,
      position: 1
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
