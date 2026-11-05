# Image dasar: Node.js 24 LTS di atas Alpine Linux
FROM node:24-alpine

# Folder kerja di dalam image
WORKDIR /app

# Salin daftar dependensi dulu agar layer npm install di-cache
COPY package*.json ./
RUN npm install --omit=dev

# Salin seluruh kode aplikasi
COPY . .

# Variabel lingkungan bawaan dan port yang dipakai aplikasi
ENV PORT=3000
EXPOSE 3000

# Jalankan sebagai pengguna non-root yang disediakan image node
USER node
CMD ["node", "server.js"]
