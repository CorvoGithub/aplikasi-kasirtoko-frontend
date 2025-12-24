# Mantra - Frontend (Sistem Kasir Toko)

Repository ini berisi **Frontend / Client-side** untuk aplikasi **Mantra**, dibangun menggunakan **React + Vite**.

Aplikasi ini berfungsi sebagai antarmuka pengguna (UI) yang responsif untuk manajemen toko, kasir, dan pelaporan penjualan.

> **Catatan:** Backend (Laravel API) untuk aplikasi ini terdapat di repository terpisah:
> **https://github.com/CorvoGithub/aplikasi-kasirtoko-backend**

---

## Fitur Frontend

Antarmuka ini dirancang untuk memenuhi kriteria UX/UI modern sesuai spesifikasi **Soal Tes Tipe 2**:

1.  **Responsif:** Tampilan beradaptasi sempurna pada Desktop, Tablet, dan Mobile (Dapat diuji dengan Toggle Device Toolbar).
2.  **Point of Sale (POS):**
    * Keranjang belanja dinamis.
    * Kalkulasi total dan kembalian otomatis.
    * Cetak struk belanja dengan logo toko (Crop to Circle).
3.  **Manajemen Produk:**
    * Upload dan preview gambar produk.
    * Tampilan grid dengan indikator stok menipis.
4.  **Laporan:**
    * Visualisasi riwayat transaksi.
    * Export data ke PDF dan Excel.

---

## Teknologi

* **Core:** React.js, Vite
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **HTTP Client:** Axios
* **Libraries:** React Easy Crop (Profile), JSPDF (Export), XLSX (Excel)

---

## Cara Menjalankan (Localhost)

Pastikan Server Backend (Laravel) sudah berjalan terlebih dahulu di port 8000.

1.  **Clone Repository & Install Dependencies:**
    ```bash
    git clone [https://github.com/CorvoGithub/aplikasi-kasirtoko-frontend](https://github.com/CorvoGithub/aplikasi-kasirtoko-frontend)
    cd aplikasi-kasirtoko-frontend
    npm install
    ```

2.  **Konfigurasi API:**
    Pastikan backend berjalan di `http://127.0.0.1:8000`. Jika berbeda, sesuaikan URL pada konfigurasi Axios di source code.

3.  **Jalankan Frontend:**
    ```bash
    npm run dev
    ```

4.  **Akses Aplikasi:**
    Buka browser dan kunjungi URL yang muncul di terminal (biasanya `http://localhost:5173`).

---

## Video Demonstrasi

Berikut adalah link video penjelasan kode, struktur database, dan demonstrasi penggunaan aplikasi:

**https://drive.google.com/drive/folders/1rEJgcqvZjZ-vCUCDXXSrLgVeihcP7nqi?usp=drive_link**

---

**Dibuat oleh:** Andhika Farizky Mansyur
