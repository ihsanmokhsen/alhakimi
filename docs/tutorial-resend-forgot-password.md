# Tutorial Resend untuk Forgot Password (Next.js + Prisma)

Dokumen ini menjelaskan setup email reset password menggunakan Resend pada project ini, termasuk DNS Namecheap, environment variable, migrasi database, dan pengujian end-to-end.

## 1) Prasyarat

- Domain aktif (contoh: `ihsanmokhsen.com`)
- Akun Resend
- Akses DNS domain (Namecheap)
- `RESEND_API_KEY` dari Resend
- Database PostgreSQL aktif (Supabase)

## 2) Setup Domain di Resend

1. Buka Resend -> Domains -> Add Domain.
2. Gunakan subdomain untuk pengiriman, contoh: `mg.ihsanmokhsen.com`.
3. Salin DNS records yang diminta Resend.

### DNS yang dipakai di Namecheap (sesuai implementasi ini)

- DKIM (TXT)
  - Host: `resend._domainkey.mg`
  - Value: `p=...` (public key dari Resend)
- SPF (TXT)
  - Host: `send.mg`
  - Value: `v=spf1 include:amazonses.com ~all`
- SPF (MX)
  - Host: `send.mg`
  - Mail Server: `feedback-smtp.ap-northeast-1.amazonses.com`
  - Priority: `10`

Catatan Namecheap:
- Untuk record MX `send.mg`, set melalui `MAIL SETTINGS` -> `Custom MX`.
- Simpan perubahan, lalu tunggu propagasi DNS.

## 3) Verifikasi Domain sampai `Sending: enabled`

Di halaman domain Resend, pastikan:
- Status domain: `verified`
- Capabilities:
  - `sending: enabled`
  - `receiving: disabled` (ini normal bila hanya untuk kirim email)

## 4) Environment Variable di Aplikasi

Isi `.env` (local) dan environment production (hosting):

```env
APP_URL="http://localhost:3000"
RESEND_API_KEY="re_xxxxxxxxx"
EMAIL_FROM="Makna Admin <noreply@mg.ihsanmokhsen.com>"
```

Catatan penting:
- Domain pada `EMAIL_FROM` harus domain yang sudah verified di Resend.
- Di production, `APP_URL` wajib pakai domain production (HTTPS), bukan localhost.

## 5) Pastikan Skema Database Sudah Siap

Aplikasi ini memakai:
- Kolom `AdminUser.email`
- Tabel `PasswordResetToken`

Jalankan migrasi:

```bash
npx prisma migrate deploy
```

Pastikan akun admin punya email:

```text
username: admin
email:    alamat-email-admin-yang-valid
```

Tanpa email di akun admin, forgot password tidak akan menemukan target pengiriman.

## 6) Alur Forgot Password di Project Ini

1. User buka `/forgot-password`.
2. Input email admin.
3. Server membuat token reset (hash + expiry 15 menit).
4. Server kirim email "Reset your password" via Resend.
5. User klik link `/reset-password?token=...`.
6. User set password baru.
7. Server:
   - update password hash,
   - tandai token terpakai,
   - hapus token lama lain milik user,
   - kirim notifikasi email "Your password was changed".

## 7) Verifikasi Cepat

1. Kirim reset dari `/forgot-password`.
2. Cek dashboard Resend -> email event:
   - `delivered` berarti email terkirim.
3. Buka inbox penerima (cek juga Spam/Promotions/Updates).
4. Uji link reset dan login ulang.

## 8) Troubleshooting

### A. Muncul log: `Password reset email is not configured`

Penyebab: `APP_URL`, `EMAIL_FROM`, atau `RESEND_API_KEY` belum terisi.

Solusi:
- Lengkapi env.
- Restart server (`npm run dev`) agar env terbaca ulang.

### B. Domain Resend masih `pending`

Penyebab umum:
- Record DNS belum tepat (host/value/priority).
- Propagasi DNS belum selesai.

Solusi:
- Cek ulang DNS records.
- Tunggu propagasi (menit-jam, kadang sampai 24 jam).
- Klik verify/refresh di dashboard Resend.

### C. Kadang langsung ter-login saat buka `/login`

Penyebab:
- Cookie session masih valid.

Solusi:
- Logout normal dari admin.
- Atau pakai URL paksa refresh session: `/login?fresh=1`.

## 9) Rekomendasi Keamanan Tambahan

- Pertahankan pesan netral di form forgot password:
  - "If your email exists in our system, we've sent a password reset link."
- Gunakan HTTPS di production.
- Rotasi `RESEND_API_KEY` bila sempat terekspos.
- Pertimbangkan memperpendek masa aktif session jika perlu.
