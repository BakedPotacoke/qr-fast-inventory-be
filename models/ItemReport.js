import db from '../config/db.js';

const ItemReport = {
    // Buat entri laporan baru (rusak / hilang / baik)
    create: async ({ item_id, user_id, transaction_id = null, jenis_laporan, keterangan = null, foto_url = null, cloudinary_public_id = null }, conn = db) => {
        const [result] = await conn.query(
            'INSERT INTO item_reports (item_id, user_id, transaction_id, jenis_laporan, keterangan, foto_url, cloudinary_public_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [item_id, user_id, transaction_id, jenis_laporan, keterangan, foto_url, cloudinary_public_id]
        );
        return result.insertId;
    },

    // Riwayat laporan untuk satu barang, terbaru dulu
    findByItemId: async (item_id, conn = db) => {
        const [rows] = await conn.query(
            `SELECT r.*, u.nama_lengkap AS pelapor
             FROM item_reports r
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.item_id = ?
             ORDER BY r.created_at DESC`,
            [item_id]
        );
        return rows;
    },

    // Semua laporan (dipakai admin untuk memantau laporan masuk & halaman Laporan Pengembalian)
    // JOIN ke transactions untuk waktu_pinjam/waktu_kembali, dan ke items untuk kategori.
    findAll: async (conn = db) => {
        const [rows] = await conn.query(
            `SELECT
                r.*,
                u.nama_lengkap AS peminjam,
                i.nama_barang,
                i.qr_code,
                i.kategori,
                t.waktu_pinjam,
                t.waktu_kembali
             FROM item_reports r
             LEFT JOIN users u ON r.user_id = u.id
             LEFT JOIN items i ON r.item_id = i.id
             LEFT JOIN transactions t ON r.transaction_id = t.id
             ORDER BY r.created_at DESC`
        );
        return rows;
    },

    // Jumlah laporan per jenis (baik/rusak/hilang) — dipakai untuk donut chart dashboard
    getBreakdownByJenis: async (conn = db) => {
        const [rows] = await conn.query(
            `SELECT jenis_laporan, COUNT(*) AS jumlah
             FROM item_reports
             GROUP BY jenis_laporan`
        );
        return rows;
    },

    // Jumlah laporan dalam N hari terakhir — dipakai untuk KPI card dashboard
    countRecent: async (days = 30, conn = db) => {
        const [rows] = await conn.query(
            `SELECT COUNT(*) AS jumlah FROM item_reports WHERE created_at >= CURDATE() - INTERVAL ? DAY`,
            [Number(days)]
        );
        return rows[0].jumlah;
    },
};

export default ItemReport;