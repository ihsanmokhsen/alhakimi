const PG_PREFIX = /^(postgres|postgresql):\/\//i;

function isValidPostgresUrl(value: string | undefined): boolean {
  const v = value?.trim();
  return Boolean(v && PG_PREFIX.test(v));
}

/**
 * Prisma membutuhkan URL yang valid di runtime. Tanpa ini, error di Vercel
 * sering hanya "Application error" + digest.
 */
export function assertDatabaseEnv(): void {
  const keys = ["DATABASE_URL", "DIRECT_URL"] as const;
  const bad: string[] = [];

  for (const key of keys) {
    if (!isValidPostgresUrl(process.env[key])) {
      bad.push(key);
    }
  }

  if (bad.length === 0) {
    return;
  }

  const hint =
    "Pastikan nilai dimulai dengan postgresql:// atau postgres://. " +
    "Di Vercel: Settings → Environment Variables → tanpa tanda kutip di awal/akhir nilai. " +
    "Variabel bermasalah: " +
    bad.join(", ");

  throw new Error(`[database] ${hint}`);
}
