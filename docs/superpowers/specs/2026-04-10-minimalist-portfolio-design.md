# Minimalist Glass Portfolio Design

## Ringkasan

Membangun web app portfolio pribadi dengan Next.js App Router dan Tailwind CSS yang menampilkan gaya visual iPhone-style glassmorphism: gelap, bersih, lega, tipografi besar, dan animasi halus. Aplikasi memiliki area publik untuk menampilkan portfolio dan area admin kecil untuk login lalu menambah, mengubah, dan menghapus item aplikasi.

## Tujuan

- Menampilkan portfolio yang sangat minimal dan premium.
- Menjadikan nama pemilik sebagai fokus utama tanpa subtitle atau elemen visual tambahan.
- Menyediakan pengalaman eksplorasi project dengan glass cards dan modal fullscreen.
- Menyediakan login admin kecil agar pemilik bisa menambah aplikasi lain nanti.
- Menggunakan SQLite sekarang tetapi menjaga struktur agar mudah dipindah ke Supabase.

## Ruang Lingkup

### Halaman Publik

- Header kaca berisi nama `Muhammad Ihsanul Hakim Mokhsen`.
- Tombol `Login` kecil dan tidak dominan.
- Hero kosong tanpa copy tambahan.
- Section portfolio berbentuk grid kartu kaca.
- Klik kartu membuka modal fullscreen kaca dengan detail project.
- Footer minimal.

### Area Admin

- Halaman login sederhana untuk admin.
- Dashboard admin untuk melihat daftar project.
- Form tambah project baru.
- Form edit project yang sudah ada.
- Aksi hapus project.

### Seed Awal

Project awal diisi dengan dua aplikasi:

1. `Absen Pagi Perbidang` — `https://absenpagi-perbidang.vercel.app/`
2. `Optimalisasi PAD NTT` — `https://optimalisasi-pad-ntt.netlify.app/`

## Di Luar Ruang Lingkup Saat Ini

- Multi-user admin.
- Upload gambar langsung ke storage cloud.
- Integrasi Supabase sekarang juga.
- Rich text editor.
- Analytics.

## Pendekatan Teknis

### Framework dan Styling

- Next.js dengan App Router.
- Tailwind CSS untuk styling.
- Komponen dibuat sesederhana mungkin agar kode tetap minimal.

### Data Layer

- Prisma sebagai ORM.
- SQLite sebagai database lokal awal.
- Model data dirancang generik agar datasource Prisma nanti bisa dialihkan ke Postgres/Supabase.

### Auth

- Satu akun admin awal.
- Password disimpan dalam bentuk hash.
- Session berbasis cookie aman.
- Login hanya dibutuhkan untuk area `/admin`.

## Struktur Route

- `/` halaman portfolio publik.
- `/login` halaman login admin.
- `/admin` dashboard admin.
- `/admin/new` form tambah project.
- `/admin/[id]/edit` form edit project.

Jika implementasi dirasa lebih ringkas, form tambah dan edit boleh digabung dalam dashboard admin asalkan tetap bersih dan mudah dipakai.

## Model Data

### `Project`

- `id`
- `title`
- `url`
- `description`
- `category`
- `featured`
- `createdAt`
- `updatedAt`

### `AdminUser`

- `id`
- `username`
- `passwordHash`
- `createdAt`

Model ini harus tetap netral agar perpindahan ke Supabase nanti hanya butuh perubahan provider dan migrasi data.

## Pengalaman Visual

### Arah Desain

- Background utama `#0b0b0b`.
- Teks putih dengan kontras tinggi.
- Accent interaktif `#F44A22`.
- Semua permukaan sekunder menggunakan efek kaca:
  - blur
  - opacity rendah
  - border putih lembut
  - shadow lembut
- Radius besar setara `2xl` atau lebih lembut bila visual lebih cocok.
- Banyak whitespace dan ritme vertikal longgar.

### Komposisi

- Header dapat disejajarkan kiri atau center, tetapi tetap sangat bersih.
- Hero sengaja dibiarkan kosong agar nama dan portfolio jadi fokus.
- Grid portfolio responsif: 1 kolom mobile, bertambah di tablet/desktop.
- Modal fullscreen muncul di atas overlay blur gelap dengan transisi lembut ala iOS.

### Motion

- Hover kartu: glow halus, border sedikit menghangat ke accent.
- Modal: fade + slight scale/slide yang lembut.
- Tombol dan link: transisi cepat dan ringan, tidak agresif.
- Tidak memakai animasi berlebihan atau dekorasi visual ramai.

## Perilaku UI

### Portfolio Grid

- Setiap kartu menampilkan judul project dan metadata singkat.
- Klik kartu membuka modal detail.
- Modal menampilkan:
  - nama project
  - deskripsi
  - kategori
  - link keluar ke aplikasi

### Login

- Tombol `Login` tampil kecil di header.
- Halaman login sangat minimal, tetap konsisten dengan gaya kaca.
- Jika belum login lalu mengakses `/admin`, user diarahkan ke login.

### Admin Dashboard

- Daftar project tampil sederhana dan rapi.
- Terdapat CTA kecil untuk tambah project.
- Form memakai input kaca sederhana.
- Setelah simpan atau hapus, data portfolio publik langsung ikut berubah.

## Responsiveness

- Mobile-first.
- Typography besar tetap terjaga di desktop.
- Padding dan jarak menyesuaikan agar tidak sesak di layar kecil.
- Modal fullscreen tetap nyaman di mobile dengan scroll internal bila isi lebih panjang.

## Error Handling

- Validasi form dasar: field wajib tidak boleh kosong.
- URL harus valid.
- Pesan error ditampilkan singkat dan bersih.
- Login gagal menampilkan pesan yang jelas tanpa membocorkan detail sensitif.

## Testing Strategy

- Uji minimal untuk utilitas auth dan validasi form penting.
- Uji rendering dasar halaman publik bila setup test ringan mendukung.
- Prioritas utama implementasi pertama adalah aplikasi berjalan stabil dan siap deploy.

## Deployment

- Siap deploy ke Vercel.
- Variabel environment disiapkan untuk:
  - database URL
  - secret session/auth
  - kredensial admin awal bila diperlukan saat seed

## Implementasi Bertahap

1. Scaffold Next.js + Tailwind + Prisma.
2. Buat skema database dan seed awal.
3. Bangun halaman publik dengan glassmorphism.
4. Tambahkan modal fullscreen project.
5. Tambahkan auth admin.
6. Bangun dashboard CRUD project.
7. Rapikan responsivitas dan animasi.
8. Finalisasi untuk deploy Vercel.
