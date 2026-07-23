import Item from '../models/Item.js';

// GET /api/items — semua user terautentikasi bisa akses
export const getAllItems = async (req, res) => {
    try {
        const items = await Item.findAll();
        res.status(200).json({ data: items });
    } catch (error) {
        console.error('getAllItems error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// POST /api/items — hanya admin (diproteksi verifyToken + isAdmin di route)
export const createItem = async (req, res) => {
    try {
        const { nama_barang, qr_code, kategori } = req.body;

        if (!nama_barang || !qr_code || !kategori) {
            return res.status(400).json({ message: 'Nama barang, QR/SKU, dan kategori wajib diisi.' });
        }

        // 1. Cek apakah SKU/QR Code sudah ada di database
        const existingItem = await Item.findByQrCode(qr_code);
        if (existingItem) {
            return res.status(400).json({ message: 'SKU sudah digunakan' });
        }

        // Jika ada file gambar yang diupload via multer
        const gambar_url = req.file
            ? `/uploads/${req.file.filename}`
            : null;

        const insertId = await Item.create({ nama_barang, qr_code, kategori, gambar_url });

        res.status(201).json({
            message: 'Barang berhasil ditambahkan.',
            data: { id: insertId, nama_barang, qr_code, kategori, gambar_url, status: 'tersedia' },
        });
    } catch (error) {
        console.error('createItem error:', error);

        // 2. Tangani error duplikasi dari database (MySQL error code 1062)
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            return res.status(400).json({ message: 'SKU sudah digunakan' });
        }

        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// DELETE /api/items — hanya admin
export const deleteItems = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'ID barang wajib disertakan dalam bentuk array.' });
        }

        const affectedRows = await Item.deleteBulk(ids);
        res.status(200).json({
            message: 'Penghapusan berhasil.',
            deletedCount: affectedRows
        });
    } catch (error) {
        console.error('deleteItems error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menghapus barang.' });
    }
};

// PUT /api/items/:id — hanya admin
export const updateItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const { nama_barang, qr_code, kategori, remove_gambar } = req.body;

        let updateData = {};
        if (nama_barang) updateData.nama_barang = nama_barang;
        if (kategori) updateData.kategori = kategori;

        // 1. Cek duplikasi jika qr_code (SKU) ikut diupdate
        if (qr_code) {
            const existingItem = await Item.findByQrCode(qr_code);
            // Pastikan SKU yang ditemukan bukan milik barang itu sendiri yang sedang diupdate
            if (existingItem && Number(existingItem.id) !== Number(itemId)) {
                return res.status(400).json({ message: 'SKU sudah digunakan' });
            }
            updateData.qr_code = qr_code;
        }

        // Handle file upload
        if (req.file) {
            updateData.gambar_url = `/uploads/${req.file.filename}`;
        } else if (remove_gambar === 'true') {
            updateData.gambar_url = null;
        }

        const affectedRows = await Item.update(itemId, updateData);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Barang tidak ditemukan atau tidak ada perubahan.' });
        }

        res.status(200).json({
            message: 'Barang berhasil diupdate.',
            data: updateData
        });
    } catch (error) {
        console.error('updateItem error:', error);

        // 2. Tangani error duplikasi dari database (MySQL error code 1062)
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            return res.status(400).json({ message: 'SKU sudah digunakan' });
        }

        res.status(500).json({ message: 'Terjadi kesalahan saat mengupdate barang.' });
    }
};