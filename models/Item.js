import db from '../config/db.js';

const Item = {
    findByQrCode: async (qr_code, conn = db) => {
        const [rows] = await conn.query('SELECT * FROM items WHERE qr_code = ? FOR UPDATE', [qr_code]);
        return rows[0];
    },
    findById: async (id, conn = db) => {
        const [rows] = await conn.query('SELECT * FROM items WHERE id = ?', [id]);
        return rows[0];
    },
    updateStatus: async (id, status, conn = db) => {
        const [result] = await conn.query('UPDATE items SET status = ? WHERE id = ?', [status, id]);
        return result.affectedRows;
    },
    findAll: async ({ status, kategori } = {}, conn = db) => {
        const validStatuses = ['tersedia', 'dipinjam', 'rusak', 'hilang'];
        const useStatusFilter = status && validStatuses.includes(status);
        const useKategoriFilter = kategori && kategori.trim() !== '';

        const conditions = [];
        const params = [];

        if (useStatusFilter) {
            conditions.push('i.status = ?');
            params.push(status);
        }
        if (useKategoriFilter) {
            conditions.push('i.kategori = ?');
            params.push(kategori.trim());
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const query = `
            SELECT 
                i.*, 
                t.waktu_pinjam,
                u.nama_lengkap AS peminjam
            FROM items i
            LEFT JOIN transactions t ON i.id = t.item_id AND t.status_transaksi = 'dipinjam'
            LEFT JOIN users u ON t.user_id = u.id
            ${whereClause}
            ORDER BY i.id DESC
        `;
        const [rows] = await conn.query(query, params);
        return rows;
    },
    // Daftar kategori unik untuk dropdown/chip filter di frontend
    getKategoriList: async (conn = db) => {
        const [rows] = await conn.query(
            `SELECT DISTINCT kategori 
             FROM items 
             WHERE kategori IS NOT NULL AND kategori != '' 
             ORDER BY kategori ASC`
        );
        return rows.map((r) => r.kategori);
    },
    // Jumlah barang per kategori — dipakai untuk chart dashboard
    getKategoriBreakdown: async (conn = db) => {
        const [rows] = await conn.query(
            `SELECT COALESCE(NULLIF(kategori, ''), 'Lainnya') AS kategori, COUNT(*) AS jumlah
             FROM items
             GROUP BY kategori
             ORDER BY jumlah DESC`
        );
        return rows;
    },
    // Tambah cloudinary_public_id ke INSERT
    create: async ({ nama_barang, qr_code, kategori, gambar_url, cloudinary_public_id }) => {
        const [result] = await db.query(
            'INSERT INTO items (nama_barang, qr_code, kategori, gambar_url, cloudinary_public_id, status) VALUES (?, ?, ?, ?, ?, ?)',
            [nama_barang, qr_code, kategori, gambar_url || null, cloudinary_public_id || null, 'tersedia']
        );
        return result.insertId;
    },
    getInventorySummary: async (conn = db) => {
        const [totalRows] = await conn.query('SELECT COUNT(*) as totalBarang FROM items');
        const [tersediaRows] = await conn.query('SELECT COUNT(*) as tersedia FROM items WHERE status = "tersedia"');
        const [dipinjamRows] = await conn.query('SELECT COUNT(*) as sedangDipinjam FROM items WHERE status = "dipinjam"');
        const [rusakRows] = await conn.query('SELECT COUNT(*) as jumlahRusak FROM items WHERE status = "rusak"');
        const [hilangRows] = await conn.query('SELECT COUNT(*) as jumlahHilang FROM items WHERE status = "hilang"');
        return {
            totalBarang: totalRows[0].totalBarang,
            tersedia: tersediaRows[0].tersedia,
            sedangDipinjam: dipinjamRows[0].sedangDipinjam,
            jumlahRusak: rusakRows[0].jumlahRusak,
            jumlahHilang: hilangRows[0].jumlahHilang
        };
    },
    deleteBulk: async (ids, conn = db) => {
        if (!ids || !Array.isArray(ids) || ids.length === 0) return 0;
        const placeholders = ids.map(() => '?').join(',');
        // Ekstra aman: Jangan hapus jika statusnya dipinjam
        const [result] = await conn.query(`DELETE FROM items WHERE id IN (${placeholders}) AND status != 'dipinjam'`, ids);
        return result.affectedRows;
    },
    // Dynamic update — cloudinary_public_id akan ter-update otomatis jika ada di updateData
    update: async (id, itemData, conn = db) => {
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(itemData)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (fields.length === 0) return 0;

        values.push(id);
        const query = `UPDATE items SET ${fields.join(', ')} WHERE id = ?`;
        const [result] = await conn.query(query, values);
        return result.affectedRows;
    },
    // Ambil cloudinary_public_id dari multiple items (dipakai saat bulk delete)
    findPublicIdsByIds: async (ids, conn = db) => {
        if (!ids || ids.length === 0) return [];
        const placeholders = ids.map(() => '?').join(',');
        const [rows] = await conn.query(
            `SELECT id, cloudinary_public_id FROM items WHERE id IN (${placeholders}) AND cloudinary_public_id IS NOT NULL`,
            ids
        );
        return rows;
    },
};

export default Item;