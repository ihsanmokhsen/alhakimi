const BUILD_PHASE = "phase-production-build";

/**
 * Saat `next build` (fase prerender), query DB boleh gagal — mis. .env lokal
 * belum mengarah ke Supabase — dan fallback kosong dipakai agar build tetap
 * lulus. Halaman akan diregenerasi otomatis oleh ISR / revalidatePath.
 *
 * Di runtime error dibiarkan naik agar masalah DB tetap terlihat.
 */
export async function fetchForPrerender<T>(
  fetcher: () => Promise<T>,
  fallback: T
): Promise<T> {
  if (process.env.NEXT_PHASE !== BUILD_PHASE) {
    return fetcher();
  }

  try {
    return await fetcher();
  } catch (error) {
    console.warn(
      "[prerender] DB tidak tersedia, memakai data fallback:",
      error instanceof Error ? error.message : error
    );
    return fallback;
  }
}
