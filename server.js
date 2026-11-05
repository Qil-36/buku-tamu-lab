// Buku Tamu Lab: aplikasi contoh modul Docker
const http = require('http');

const PORT = Number(process.env.PORT) || 3000;
const PAKAI_DB = Boolean(process.env.DB_HOST);
const MODE = PAKAI_DB ? 'PostgreSQL' : 'memori';
const HTML = { 'Content-Type': 'text/html; charset=utf-8' };
const aman = (teks) =>
  String(teks).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

let siapkan, simpan, ambil;
if (PAKAI_DB) {
  // Mode basis data: data disimpan di PostgreSQL (Bab 5-7)
  const { Pool } = require('pg');
  const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER || 'bukutamu',
    password: process.env.DB_PASSWORD || 'rahasia123',
    database: process.env.DB_NAME || 'bukutamu',
    port: Number(process.env.DB_PORT) || 5432
  });
  siapkan = () => pool.query(
    `CREATE TABLE IF NOT EXISTS tamu (
       id SERIAL PRIMARY KEY,
       nama TEXT NOT NULL,
       waktu TIMESTAMP DEFAULT NOW())`);
  simpan = (nama) =>
    pool.query('INSERT INTO tamu (nama) VALUES ($1)', [nama]);
  ambil = async () => {
    const hasil = await pool.query(
      'SELECT nama FROM tamu ORDER BY id');
    return hasil.rows;
  };
} else {
  // Mode memori: data hilang saat container berhenti (Bab 4)
  const data = [];
  siapkan = async () => {};
  simpan = async (nama) => { data.push({ nama }); };
  ambil = async () => data;
}

function halaman(daftar) {
  const mode = PAKAI_DB
    ? `PostgreSQL (${aman(process.env.DB_HOST)})` : 'memori';
  const isi = daftar.map((t) => `<li>${aman(t.nama)}</li>`);
  return `<!doctype html><title>Buku Tamu Lab</title>
<h1>Buku Tamu Lab v2</h1>
<p>Penyimpanan: ${mode} | Node.js ${process.version}</p>
<form method="post" action="/tambah">
  <input name="nama" placeholder="Nama Anda" required>
  <button>Simpan</button>
</form>
<ol>${isi.join('')}</ol>`;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/tambah') {
      let body = '';
      req.on('data', (bagian) => { body += bagian; });
      req.on('end', async () => {
        const nama = new URLSearchParams(body).get('nama');
        await simpan((nama || 'Tanpa nama').slice(0, 100));
        res.writeHead(303, { Location: '/' });
        res.end();
      });
      return;
    }
    const daftar = await ambil();
    res.writeHead(200, HTML);
    res.end(halaman(daftar));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Galat basis data: ' + (err.message || err.code));
  }
});

siapkan()
  .then(() => server.listen(PORT, () => {
    console.log(`Buku Tamu Lab berjalan di port ${PORT} (${MODE})`);
  }))
  .catch((err) => {
    const pesan = err.message || err.code;
    console.error('Gagal terhubung ke basis data:', pesan);
    process.exit(1);
  });
