# Sitemap dan Google Analytics

Dokumen ini menjelaskan implementasi sitemap, `robots.txt`, Google Search Console, dan Google Analytics 4 (GA4) pada `https://works.ihsanmokhsen.com`.

## 1. Ringkasan Implementasi

| Bagian | Lokasi | Fungsi |
| --- | --- | --- |
| Konstanta domain | `lib/seo.ts` | Menyediakan `SITE_URL` untuk URL absolut |
| Sitemap | `app/sitemap.ts` | Menghasilkan `/sitemap.xml` dari halaman statis dan data Prisma |
| Robots | `app/robots.ts` | Menghasilkan `/robots.txt` dan menunjuk ke sitemap |
| Verifikasi Google | `app/layout.tsx` | Memasang token verifikasi Google Search Console |
| Google Analytics | `app/layout.tsx` | Memasang Google tag pada seluruh halaman |
| Contoh environment | `.env.example` | Mendokumentasikan `NEXT_PUBLIC_GA_MEASUREMENT_ID` |

URL produksi yang perlu diketahui:

- Situs: `https://works.ihsanmokhsen.com`
- Sitemap: `https://works.ihsanmokhsen.com/sitemap.xml`
- Robots: `https://works.ihsanmokhsen.com/robots.txt`

## 2. Sitemap

Next.js membaca `app/sitemap.ts` dan menyajikan hasilnya sebagai XML pada `/sitemap.xml`.

### Halaman statis

Sitemap selalu memuat halaman berikut:

| URL | Frekuensi perubahan | Prioritas |
| --- | --- | --- |
| `/` | Mingguan | `1.0` |
| `/works` | Mingguan | `0.9` |
| `/journal` | Mingguan | `0.9` |
| `/essays` | Mingguan | `0.9` |
| `/about` | Bulanan | `0.8` |
| `/pov` | Mingguan | `0.8` |

Semua URL dibentuk sebagai URL absolut menggunakan `SITE_URL` dari `lib/seo.ts`.

### Halaman dinamis

Sitemap mengambil data berikut melalui Prisma:

- Semua jurnal menjadi `/journal/{id}`.
- Semua esai menjadi `/essays/{slug}`.
- `updatedAt` digunakan sebagai `lastModified`.
- ID dan slug diamankan dengan `encodeURIComponent()`.

Jika database tidak dapat diakses saat sitemap dibuat, error ditangani dan halaman statis tetap dikembalikan. Hal ini menjaga halaman inti tetap dapat ditemukan crawler, tetapi halaman jurnal dan esai dinamis mungkin belum muncul sampai database kembali tersedia dan aplikasi dibangun atau dimuat ulang.

### Menambahkan halaman baru

Untuk halaman publik statis baru, tambahkan route ke `staticRoutes` dalam `app/sitemap.ts`:

```ts
{ path: "/halaman-baru", changeFrequency: "monthly", priority: 0.7 }
```

Untuk tipe konten dinamis baru:

1. Ambil identifier dan `updatedAt` melalui Prisma.
2. Ubah setiap record menjadi URL absolut.
3. Gunakan `encodeURIComponent()` pada bagian URL yang berasal dari database.
4. Tambahkan `lastModified`, `changeFrequency`, dan `priority` yang sesuai.

Setelah menambah route atau konten baru, buka `/sitemap.xml` untuk memastikan URL muncul. Lakukan redeploy jika sitemap produksi masih menampilkan hasil build sebelumnya.

## 3. Robots.txt

File `app/robots.ts` menghasilkan aturan berikut:

```text
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Sitemap: https://works.ihsanmokhsen.com/sitemap.xml
```

Tujuannya:

- Mengizinkan crawler mengakses halaman publik.
- Menghindari crawling halaman admin dan endpoint API.
- Memberi tahu crawler lokasi sitemap.

`robots.txt` mengatur crawling, bukan mekanisme keamanan dan bukan jaminan sebuah URL tidak masuk indeks. Halaman sensitif tetap harus dilindungi autentikasi. Gunakan `noindex` apabila sebuah halaman publik boleh diakses tetapi tidak boleh muncul di hasil pencarian.

## 4. Google Search Console

Token verifikasi Google sudah dipasang melalui `metadata.verification.google` pada `app/layout.tsx`.

Langkah pengelolaan Search Console:

1. Buka Google Search Console.
2. Pilih property `https://works.ihsanmokhsen.com`.
3. Pastikan ownership berstatus terverifikasi.
4. Buka **Sitemaps**.
5. Masukkan `sitemap.xml`, lalu kirim.
6. Periksa status sitemap dan jumlah URL yang ditemukan.
7. Gunakan **URL Inspection** untuk memeriksa halaman penting seperti `/works`, `/journal`, dan `/essays`.

Pengiriman sitemap membantu Google menemukan URL, tetapi tidak menjamin semua URL akan di-crawl atau diindeks.

## 5. Google Analytics 4

### Konfigurasi aktif

Konfigurasi Production saat dokumentasi ini dibuat:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-TZRVDFPNTH"
```

Environment variable tersebut disimpan pada Vercel untuk environment **Production**. Measurement ID memang tampil di browser dan bukan secret.

Aplikasi memakai komponen resmi Next.js:

```tsx
import { GoogleAnalytics } from "@next/third-parties/google";
```

Komponen dipasang pada root layout sehingga berlaku untuk seluruh halaman. Kode hanya memuat Google Analytics jika environment variable tersedia dan cocok dengan format `G-...`:

```tsx
const configuredGoogleAnalyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
const googleAnalyticsId =
  configuredGoogleAnalyticsId && /^G-[A-Z0-9]+$/.test(configuredGoogleAnalyticsId)
    ? configuredGoogleAnalyticsId
    : null;
```

Jika nilai kosong atau tidak valid, Google tag tidak akan dirender.

### Enhanced Measurement

Pada data stream GA4, **Enhanced Measurement** aktif. Pengaturan **Page views** juga mengaktifkan:

- Page loads.
- Page changes based on browser history events.

Pengaturan perubahan browser history penting karena situs memakai Next.js App Router. Navigasi client-side, misalnya dari `/` ke `/works`, dapat dicatat sebagai page view tanpa memuat ulang seluruh dokumen.

Jangan mengirim event `page_view` manual selama pengukuran otomatis ini aktif karena dapat menyebabkan page view ganda.

## 6. Cara Membaca Analytics

### Aktivitas saat ini

Buka **Reports → Realtime**.

Periksa:

- **Active users**: pengguna aktif dalam 30 menit terakhir.
- **Views by page title**: halaman yang sedang dilihat.
- **Event count**: event yang dipicu pengguna.
- **Source/medium**: asal trafik yang sudah selesai diproses.

Realtime adalah tempat pertama untuk memastikan pemasangan tag bekerja.

### Halaman paling populer

Buka **Reports → Engagement → Pages and screens**.

Metrik penting:

- **Views**: total tampilan halaman; satu pengguna dapat menghasilkan beberapa views.
- **Active users**: pengguna unik yang aktif.
- **Views per active user**: rata-rata halaman yang dilihat setiap pengguna.
- **Average engagement time**: waktu halaman benar-benar aktif di layar.
- **Event count**: jumlah event pada halaman tersebut.

### Asal pengunjung

Buka **Reports → Acquisition → Traffic acquisition**.

Kanal umum:

- **Organic Search**: mesin pencari seperti Google.
- **Direct**: URL langsung, bookmark, atau sumber yang tidak terdeteksi.
- **Organic Social**: media sosial tanpa iklan.
- **Referral**: tautan dari situs lain.
- **Email**: tautan dari email yang ditandai sebagai kampanye.

Gunakan **Traffic acquisition** untuk menganalisis sesi. Gunakan **User acquisition** untuk melihat bagaimana pengguna baru pertama kali menemukan situs.

### Engagement

Sebuah sesi dianggap engaged apabila memenuhi minimal satu kondisi:

- Berlangsung lebih dari 10 detik.
- Memiliki minimal dua page view atau screen view.
- Memicu key event.

**Engagement rate** adalah persentase sesi yang engaged. Nilai ini sebaiknya dibaca bersama jumlah pengguna, sumber trafik, dan halaman tujuan—bukan sebagai angka tunggal.

### Event otomatis

Enhanced Measurement dapat menghasilkan event seperti:

- `page_view`
- `scroll`
- `click` untuk outbound link
- `file_download`
- `video_start`, `video_progress`, dan `video_complete`
- Event interaksi form dan pencarian situs bila kondisinya terpenuhi

Event yang benar-benar penting bagi tujuan situs dapat ditandai sebagai **Key event** di GA4.

### Membandingkan periode

Untuk evaluasi mingguan:

1. Pilih rentang **Last 7 days**.
2. Aktifkan perbandingan dengan periode sebelumnya.
3. Bandingkan pengguna, sessions, views, engagement rate, dan waktu engagement.
4. Cari halaman dan sumber trafik yang naik atau turun paling besar.

Data Realtime biasanya muncul dalam beberapa menit. Laporan standar dapat memerlukan waktu pemrosesan hingga 24–48 jam.

## 7. Parameter UTM

Gunakan UTM untuk membedakan tautan yang dibagikan melalui Instagram, LinkedIn, email, atau kampanye lain.

Contoh:

```text
https://works.ihsanmokhsen.com/works?utm_source=instagram&utm_medium=social&utm_campaign=portfolio
```

Arti parameter:

- `utm_source`: platform atau sumber, misalnya `instagram`.
- `utm_medium`: jenis kanal, misalnya `social` atau `email`.
- `utm_campaign`: nama kampanye, misalnya `portfolio`.

Gunakan penamaan huruf kecil secara konsisten. Jangan masukkan nama, email, nomor telepon, atau data pribadi ke parameter UTM.

## 8. Verifikasi Setelah Deployment

### Sitemap dan robots

1. Buka `https://works.ihsanmokhsen.com/sitemap.xml`.
2. Pastikan halaman inti, jurnal, dan esai yang diharapkan muncul.
3. Buka `https://works.ihsanmokhsen.com/robots.txt`.
4. Pastikan sitemap tercantum dan `/admin` serta `/api/` tidak diizinkan untuk crawler.

### Google Analytics

1. Buka situs Production.
2. Pada Chrome DevTools, buka tab **Network**.
3. Cari `gtag` atau `collect`.
4. Pastikan script berikut dimuat:

```text
https://www.googletagmanager.com/gtag/js?id=G-TZRVDFPNTH
```

5. Navigasikan situs dari `/` ke `/works` tanpa reload manual.
6. Buka **GA4 → Reports → Realtime** dan periksa page view yang masuk.

Ad blocker atau perlindungan tracking pada browser dapat memblokir request Analytics. Gunakan browser tanpa extension pemblokir saat melakukan verifikasi.

## 9. Troubleshooting

### Sitemap hanya berisi halaman statis

Kemungkinan penyebab:

- Database tidak dapat diakses saat sitemap dibuat.
- Data jurnal atau esai belum tersedia.
- Production masih memakai hasil build/cache sebelumnya.

Langkah pemeriksaan:

1. Pastikan `DATABASE_URL` dan `DIRECT_URL` Production valid.
2. Pastikan record jurnal atau esai tersedia di database.
3. Jalankan build dan redeploy.
4. Buka kembali `/sitemap.xml`.

### Google tag tidak muncul

Periksa:

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` tersedia di Vercel Production.
- Nilainya memakai format `G-...`.
- Deployment dibuat setelah environment variable ditambahkan atau diubah.
- Commit yang berisi integrasi Google Analytics sudah masuk ke branch Production.

### Realtime masih menunjukkan nol pengguna

Periksa:

- Situs dibuka setelah deployment terbaru berstatus **Ready**.
- Property dan Measurement ID yang dilihat sudah benar.
- Ad blocker dimatikan untuk pengujian.
- Request `gtag.js` dan `g/collect` tidak diblokir.
- Tunggu beberapa menit lalu periksa kembali Realtime.

### Page view tercatat dua kali

Periksa apakah aplikasi atau Google Tag Manager juga mengirim `page_view` manual. Pilih salah satu metode. Implementasi proyek ini mengandalkan Enhanced Measurement dan perubahan browser history otomatis.

### Data beberapa domain tercampur

Measurement ID yang sama dapat menggabungkan trafik dari beberapa domain atau subdomain. Gunakan filter atau comparison dengan dimensi hostname untuk membatasi analisis ke `works.ihsanmokhsen.com`.

## 10. Checklist Pemeliharaan

Ketika menambah halaman atau fitur baru:

- [ ] Tambahkan halaman publik statis ke `app/sitemap.ts` bila diperlukan.
- [ ] Tambahkan sumber konten dinamis baru ke sitemap.
- [ ] Jangan masukkan `/admin`, endpoint API, atau URL nonkanonis ke sitemap.
- [ ] Periksa `/sitemap.xml` dan `/robots.txt` setelah deployment.
- [ ] Pastikan environment variable GA tetap tersedia di Production.
- [ ] Verifikasi navigasi baru muncul sebagai page view di Realtime.
- [ ] Hindari event manual yang menggandakan Enhanced Measurement.
- [ ] Gunakan UTM pada tautan kampanye.
- [ ] Tinjau Search Console dan Analytics minimal setiap minggu.

## 11. Referensi Resmi

- [Next.js: Sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js: Robots.txt](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [Next.js: Google Analytics](https://nextjs.org/docs/app/guides/third-party-libraries#google-analytics)
- [Google Search Central: Membuat dan mengirim sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google Search Central: Robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [GA4: Realtime report](https://support.google.com/analytics/answer/9271392)
- [GA4: Traffic acquisition report](https://support.google.com/analytics/answer/12923437)
- [GA4: Data freshness](https://support.google.com/analytics/answer/11198161)
