import db from '../config/db.js';

const Item = {
    findByQrCode: async (qr_code, conn = db) => {
        const [rows] = await conn.query('SELECT * FROM items WHERE qr_code = ? FOR UPDATE', [qr_code]);
        return rows[0];
    },
    updateStatus: async (id, status, conn = db) => {
        const [result] = await conn.query('UPDATE items SET status = ? WHERE id = ?', [status, id]);
        return result.affectedRows;
    },
    findAll: async (conn = db) => {
        const query = `
            SELECT 
                i.*, 
                t.waktu_pinjam,
                u.nama_lengkap AS peminjam
            FROM items i
            LEFT JOIN transactions t ON i.id = t.item_id AND t.status_transaksi = 'dipinjam'
            LEFT JOIN users u ON t.user_id = u.id
            ORDER BY i.id DESC
        `;
        const [rows] = await conn.query(query);
        return rows;
    },
    create: async ({ nama_barang, qr_code, kategori, gambar_url }) => {
        const [result] = await db.query(
            'INSERT INTO items (nama_barang, qr_code, kategori, gambar_url, status) VALUES (?, ?, ?, ?, ?)',
            [nama_barang, qr_code, kategori, gambar_url || null, 'tersedia']
        );
        return result.insertId;
    },
    getInventorySummary: async (conn = db) => {
        const [totalRows] = await conn.query('SELECT COUNT(*) as totalBarang FROM items');
        const [dipinjamRows] = await conn.query('SELECT COUNT(*) as sedangDipinjam FROM items WHERE status = "dipinjam"');
        return {
            totalBarang: totalRows[0].totalBarang,
            sedangDipinjam: dipinjamRows[0].sedangDipinjam
        };
    },
    deleteBulk: async (ids, conn = db) => {
        if (!ids || !Array.isArray(ids) || ids.length === 0) return 0;
        const placeholders = ids.map(() => '?').join(',');
        // Ekstra aman: Jangan hapus jika statusnya dipinjam
        const [result] = await conn.query(`DELETE FROM items WHERE id IN (${placeholders}) AND status != 'dipinjam'`, ids);
        return result.affectedRows;
    },
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
    }
};

export default Item;
