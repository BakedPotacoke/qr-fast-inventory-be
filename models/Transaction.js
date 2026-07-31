import db from '../config/db.js';

const Transaction = {
    create: async (userId, itemId, status, conn = db) => {
        const [result] = await conn.query(
            'INSERT INTO transactions (user_id, item_id, status_transaksi) VALUES (?, ?, ?)',
            [userId, itemId, status]
        );
        return result.insertId;
    },
    findActiveByItemId: async (itemId, conn = db) => {
        const [rows] = await conn.query(
            'SELECT id, user_id, waktu_pinjam FROM transactions WHERE item_id = ? AND status_transaksi = "dipinjam" ORDER BY waktu_pinjam DESC LIMIT 1 FOR UPDATE',
            [itemId]
        );
        return rows[0];
    },
    findById: async (id, conn = db) => {
        const [rows] = await conn.query('SELECT * FROM transactions WHERE id = ?', [id]);
        return rows[0];
    },
    complete: async (id, conn = db) => {
        const [result] = await conn.query(
            'UPDATE transactions SET waktu_kembali = CURRENT_TIMESTAMP, status_transaksi = "selesai" WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    },
    getActiveLoansByUser: async (userId, conn = db) => {
        const [rows] = await conn.query(`
            SELECT 
                i.id, 
                i.nama_barang, 
                i.qr_code as kode, 
                i.kategori, 
                i.status, 
                i.gambar_url as gambar,
                t.id as transaction_id,
                t.waktu_pinjam
            FROM items i
            JOIN transactions t ON i.id = t.item_id
            WHERE t.user_id = ? AND t.status_transaksi = 'dipinjam'
            ORDER BY t.waktu_pinjam DESC
        `, [userId]);
        return rows;
    },
    getRecentLoansByUser: async (userId, limit = 5, conn = db) => {
        const [rows] = await conn.query(`
            SELECT 
                t.id as transaction_id,
                t.user_id,
                t.status_transaksi as status,
                t.waktu_kembali,
                i.id, 
                i.nama_barang, 
                i.kategori, 
                i.gambar_url as gambar
            FROM transactions t
            JOIN items i ON t.item_id = i.id
            WHERE t.user_id = ? AND t.status_transaksi = 'selesai'
            ORDER BY t.waktu_pinjam DESC
            LIMIT ?
        `, [userId, Number(limit)]);
        return rows;
    },
    findByUserId: async (userId, conn = db) => {
        const query = `
            SELECT 
                t.id,
                t.status_transaksi as status,
                t.waktu_pinjam,
                t.waktu_kembali,
                t.user_id,
                i.nama_barang,
                i.qr_code as sku,
                i.kategori,
                u.nama_lengkap as peminjam
            FROM transactions t
            JOIN items i ON t.item_id = i.id
            JOIN users u ON t.user_id = u.id
            WHERE t.user_id = ?
            ORDER BY t.waktu_pinjam DESC
        `;
        const [rows] = await conn.query(query, [userId]);
        return rows;
    },
    findAll: async (conn = db) => {
        const query = `
            SELECT 
                t.id,
                t.status_transaksi as status,
                t.waktu_pinjam,
                t.waktu_kembali,
                t.user_id,
                i.nama_barang,
                i.qr_code as sku,
                i.kategori,
                u.nama_lengkap as peminjam
            FROM transactions t
            JOIN items i ON t.item_id = i.id
            JOIN users u ON t.user_id = u.id
            ORDER BY t.waktu_pinjam DESC
        `;
        const [rows] = await conn.query(query);
        return rows;
    },
    // Jumlah transaksi baru per hari, N hari terakhir — dipakai untuk area chart tren
    getTrenPeminjaman: async (days = 7, conn = db) => {
        const [rows] = await conn.query(
            `SELECT DATE(waktu_pinjam) AS tanggal, COUNT(*) AS jumlah
             FROM transactions
             WHERE waktu_pinjam >= CURDATE() - INTERVAL ? DAY
             GROUP BY DATE(waktu_pinjam)
             ORDER BY tanggal ASC`,
            [Number(days)]
        );
        return rows;
    },
    // Barang paling sering dipinjam (all-time) — dipakai untuk ranking chart
    getTopBarang: async (limit = 5, conn = db) => {
        const [rows] = await conn.query(
            `SELECT i.id, i.nama_barang, COUNT(*) AS dipinjam
             FROM transactions t
             JOIN items i ON i.id = t.item_id
             GROUP BY i.id, i.nama_barang
             ORDER BY dipinjam DESC
             LIMIT ?`,
            [Number(limit)]
        );
        return rows;
    },
    // Jumlah transaksi yang masih berstatus 'dipinjam'
    countActive: async (conn = db) => {
        const [rows] = await conn.query(
            `SELECT COUNT(*) AS jumlah FROM transactions WHERE status_transaksi = 'dipinjam'`
        );
        return rows[0].jumlah;
    },
};

export default Transaction;