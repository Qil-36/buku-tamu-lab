# Buku Tamu Lab: Contoh Aplikasi Modul Docker

Aplikasi web sederhana (Node.js) dengan basis data PostgreSQL untuk modul
pembelajaran cloud computing dengan Docker. Seluruh aplikasi dijalankan
dengan satu perintah memakai Docker Compose.

## Prasyarat

- Docker Desktop (Docker Engine dan Docker Compose v2). Periksa dengan
  `docker --version` dan `docker compose version`
- Git
- Port 8080 belum dipakai aplikasi lain (atau ubah `WEB_PORT` di `.env`)

## Versi yang dipakai

| Komponen   | Versi/tag            |
|------------|----------------------|
| Node.js    | `node:24-alpine`     |
| PostgreSQL | `postgres:17-alpine` |
| Image web  | `modul-web:2.0`      |

## Cara menjalankan

    git clone https://github.com/USERNAME/buku-tamu-lab.git
    cd buku-tamu-lab
    Copy-Item .env.example .env
    docker compose up -d --build

Pengguna Linux/macOS: ganti `Copy-Item` dengan `cp .env.example .env`.

Buka http://localhost:8080, isi nama, lalu klik Simpan. Halaman menampilkan
`Penyimpanan: PostgreSQL (db)`.

## Perintah berguna

    docker compose ps         # status layanan
    docker compose logs web   # log aplikasi
    docker compose down       # hentikan, data tetap di volume
    docker compose down -v    # hentikan dan HAPUS data

## Mode memori (tanpa basis data)

Tanpa `DB_HOST`, data disimpan di memori dan hilang saat container berhenti:

    docker build -t modul-web:2.0 .
    docker run -d --name web -p 8080:3000 modul-web:2.0

## Pemecahan masalah

| Gejala | Solusi |
|--------|--------|
| `port is already allocated` | Ubah `WEB_PORT` di `.env`, misalnya `8081`, lalu `docker compose up -d`. |
| Sandi kosong / variable is not set | Buat `.env` dari `.env.example`. |
| Halaman menampilkan Galat basis data | Lihat `docker compose logs db`. Bila `DB_USER`/`DB_PASSWORD`/`DB_NAME` diubah setelah volume dibuat, jalankan `docker compose down -v` lalu naik ulang. |
| Cannot connect to the Docker daemon | Buka Docker Desktop dan tunggu sampai siap. |