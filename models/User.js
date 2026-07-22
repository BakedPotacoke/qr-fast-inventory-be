import db from '../config/db.js';

const User = {
    findAll: async () => {
        const [rows] = await db.query('SELECT id, nama_lengkap, email, role FROM users');
        return rows;
    },
    findById: async (id, conn = db) => {
        const [rows] = await conn.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    },
    findByEmail: async (email, conn = db) => {
        const [rows] = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },
    create: async (data, conn = db) => {
        const [result] = await conn.query(
            'INSERT INTO users (nama_lengkap, email, password, role) VALUES (?, ?, ?, ?)',
            [data.nama_lengkap, data.email, data.password, data.role]
        );
        return result.insertId;
    },
    update: async (id, data, conn = db) => {
        // Jika password ikut dikirim (admin mengganti password pengguna lain), sertakan di query
        if (data.password) {
            const [result] = await conn.query(
                'UPDATE users SET nama_lengkap = ?, email = ?, role = ?, password = ? WHERE id = ?',
                [data.nama_lengkap, data.email, data.role, data.password, id]
            );
            return result.affectedRows;
        }
        const [result] = await conn.query(
            'UPDATE users SET nama_lengkap = ?, email = ?, role = ? WHERE id = ?',
            [data.nama_lengkap, data.email, data.role, id]
        );
        return result.affectedRows;
    },
    updateProfile: async (id, data, conn = db) => {
        // dipakai user untuk update profil sendiri (tanpa ubah role)
        if (data.password) {
            const [result] = await conn.query(
                'UPDATE users SET nama_lengkap = ?, email = ?, password = ? WHERE id = ?',
                [data.nama_lengkap, data.email, data.password, id]
            );
            return result.affectedRows;
        }
        const [result] = await conn.query(
            'UPDATE users SET nama_lengkap = ?, email = ? WHERE id = ?',
            [data.nama_lengkap, data.email, id]
        );
        return result.affectedRows;
    },
    delete: async (id, conn = db) => {
        const [result] = await conn.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

export default User;