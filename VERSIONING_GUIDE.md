# 📌 Versioning & Release Guide

Panduan ini bertujuan untuk menjaga konsistensi penomoran versi dan dokumentasi perubahan di repositori **Legoland Gacha**. Kita mengikuti standar **Semantic Versioning (SemVer) 2.0.0**.

---

## 🏗️ Aturan Semantic Versioning

Format versi: `MAJOR.MINOR.PATCH` (Contoh: `1.1.0`)

1.  **MAJOR (`+1.0.0`)**: 
    - Digunakan jika ada perubahan besar yang **tidak kompatibel** dengan versi sebelumnya (*breaking changes*).
    - Contoh: Perubahan total struktur database atau penggantian framework utama.
2.  **MINOR (`0.+1.0`)**: 
    - Digunakan jika ada **penambahan fitur baru** yang tetap kompatibel dengan versi sebelumnya (*backward compatible*).
    - Contoh: Menambah halaman baru, fitur gacha baru, atau integrasi API baru.
3.  **PATCH (`0.0.+1`)**: 
    - Digunakan untuk **perbaikan bug** atau perubahan kecil yang tidak menambah fitur.
    - Contoh: Perbaikan typo, perbaikan bug tampilan, atau update dependency kecil.

---

## 📝 Protokol CHANGELOG.md

Setiap kali melakukan rilis, file `CHANGELOG.md` **WAJIB** diperbarui dengan kategori berikut:

*   **`Added`**: Untuk fitur baru.
*   **`Changed`**: Untuk perubahan fungsionalitas fituryang sudah ada.
*   **`Deprecated`**: Untuk fitur yang akan dihapus di rilis mendatang.
*   **`Removed`**: Untuk fitur yang resmi dihapus.
*   **`Fixed`**: Untuk perbaikan bug.
*   **`Security`**: Jika ada perbaikan kerentanan keamanan.

---

## 🛠️ Alur Kerja Update Versi (Workflow)

Saat fitur/perbaikan sudah siap di-merge ke branch utama:

1.  **Tentukan Versi Baru**: Lihat riwayat PR sejak versi terakhir. Jika ada `feat/`, naikkan **Minor**. Jika hanya `fix/`, naikkan **Patch**.
2.  **Update `package.json`**:
    - Ubah field `"version"` ke nomor baru.
    - Ubah field `"updated"` ke tanggal hari ini.
3.  **Update `CHANGELOG.md`**:
    - Tambahkan section baru di paling atas dengan nomor versi dan tanggal.
    - Kelompokkan perubahan berdasarkan kategori (Added, Fixed, dll).
4.  **Commit & Tag**:
    ```bash
    git add package.json CHANGELOG.md
    git commit -m "chore: bump version to 1.x.x"
    git tag -a v1.x.x -m "Release version 1.x.x"
    git push origin --tags
    ```

---

## 💡 Standar Pesan Commit (Conventional Commits)

Gunakan prefix berikut untuk memudahkan penentuan versi otomatis:

*   `feat:` -> Memicu kenaikan **Minor**.
*   `fix:` -> Memicu kenaikan **Patch**.
*   `chore:`, `style:`, `docs:`, `refactor:` -> Biasanya tidak memicu kenaikan versi atau hanya **Patch**.
*   `BREAKING CHANGE:` di bagian body -> Memicu kenaikan **Major**.

---

*Panduan ini dibuat untuk mendukung profesionalitas dan kemudahan pelacakan rilis di masa depan.*
