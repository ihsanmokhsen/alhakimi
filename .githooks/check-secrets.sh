#!/usr/bin/env bash
#
# Penjaga rahasia untuk repo ini.
#
# Mode default  : memeriksa file yang sudah di-stage (dipakai hook pre-commit)
# Mode --all    : memeriksa seluruh file yang dilacak git (dipakai `npm run check:secrets`)
#
# Keluar dengan status 1 kalau ada file/nilai yang dicurigai rahasia.

set -uo pipefail

fail=0

# Nama file yang tidak boleh ada di repo (kecuali .env.example)
FORBIDDEN_NAME='(^|/)\.env($|\.)|\.pem$|\.key$|\.p12$|\.keystore$|(^|/)credentials\.json$|service-account.*\.json$'

# Pola nilai rahasia yang umum dipakai layanan di proyek ini
SECRET_VALUE='AIza[0-9A-Za-z_-]{30,}|re_[A-Za-z0-9]{16,}|sk-[A-Za-z0-9_-]{16,}|postgres(ql)?://[^[:space:]"'"'"']*:[^[:space:]"'"'"'@]+@|BEGIN [A-Z ]*PRIVATE KEY|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.'

# File yang wajar memuat string mirip rahasia (hash dependency, contoh env)
is_allowed() {
  case "$1" in
    */.env.example|.env.example) return 0 ;;
    package-lock.json|*/package-lock.json|*.lock|*.snap) return 0 ;;
  esac
  return 1
}

if [ "${1:-}" = "--all" ]; then
  files=$(git ls-files)
  scope="semua file terlacak"
else
  files=$(git diff --cached --name-only --diff-filter=ACM)
  scope="file yang di-stage"
fi

if [ -z "$files" ]; then
  echo "✓ check-secrets: tidak ada file untuk diperiksa ($scope)."
  exit 0
fi

while IFS= read -r file; do
  [ -n "$file" ] || continue
  is_allowed "$file" && continue

  if printf '%s' "$file" | grep -qE "$FORBIDDEN_NAME"; then
    echo "✖ file rahasia ikut masuk: $file" >&2
    fail=1
    continue
  fi

  # Ambil isi file dari index (staged) atau dari HEAD untuk mode --all
  if [ "${1:-}" = "--all" ]; then
    content=$(git show "HEAD:$file" 2>/dev/null) || continue
  else
    content=$(git show ":$file" 2>/dev/null) || continue
  fi
  [ -n "$content" ] || continue

  if hits=$(printf '%s' "$content" | grep -nEIo "$SECRET_VALUE"); then
    echo "✖ kemungkinan rahasia di file: $file" >&2
    printf '%s\n' "$hits" | head -3 | sed 's/^/      baris /' >&2
    fail=1
  fi
done <<< "$files"

if [ "$fail" -ne 0 ]; then
  cat >&2 <<'MSG'

Commit dihentikan agar rahasia tidak sampai ke GitHub.
Sudah dibatalkan? Hapus nilainya dari file, lalu commit ulang.
Benar-benar false positive? Jalankan: git commit --no-verify
Untuk memeriksa ulang seluruh repo: npm run check:secrets
MSG
  exit 1
fi

echo "✓ check-secrets: bersih ($scope)."
exit 0
