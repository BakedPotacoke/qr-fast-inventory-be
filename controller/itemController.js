import db from '../config/db.js';
import Item from '../models/Item.js';
import Transaction from '../models/Transaction.js';
import ItemReport from '../models/ItemReport.js';
import cloudinary from '../config/cloudinary.js';

// ─── Helper: hapus gambar dari Cloudinary ───────────────────────────────────
const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error(`Gagal menghapus gambar dari Cloudinary (public_id: ${publicId}):`, err.message);
    }
};

// GET /api/items?status=&kategori= — semua user terautentikasi bisa akses
export const getAllItems = async (req, res) => {
    try {
        const { status, kategori } = req.query;
        const items = await Item.findAll({ status, kategori });
        res.status(200).json({ data: items });
    } catch (error) {
        console.error('getAllItems error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// GET /api/items/kategori — daftar kategori unik, dipakai untuk populate filter di frontend
export const getKategoriList = async (req, res) => {
    try {
        const kategoriList = await Item.getKategoriList();
        res.status(200).json({ data: kategoriList });
    } catch (error) {
        console.error('getKategoriList error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// POST /api/items — hanya admin
export const createItem = async (req, res) => {
    try {
        const { nama_barang, qr_code, kategori } = req.body;

        if (!nama_barang || !qr_code || !kategori) {
            return res.status(400).json({ message: 'Nama barang, QR/SKU, dan kategori wajib diisi.' });
        }

        const existingItem = await Item.findByQrCode(qr_code);
        if (existingItem) {
            return res.status(400).json({ message: 'SKU sudah digunakan' });
        }

        const gambar_url           = req.cloudinaryResult?.secure_url || null;
        const cloudinary_public_id = req.cloudinaryResult?.public_id  || null;

        const insertId = await Item.create({ nama_barang, qr_code, kategori, gambar_url, cloudinary_public_id });

        res.status(201).json({
            message: 'Barang berhasil ditambahkan.',
            data: { id: insertId, nama_barang, qr_code, kategori, gambar_url, status: 'tersedia' },
        });
    } catch (error) {
        console.error('createItem error:', error);
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            return res.status(400).json({ message: 'SKU sudah digunakan' });
        }
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// DELETE /api/items — hanya admin (Hapus Massal & Satuan)
export const deleteItems = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'ID barang wajib disertakan dalam bentuk array.' });
        }

        // ─── VALIDASI: Tolak penghapusan jika ada barang berstatus 'dipinjam' ───
        const placeholders = ids.map(() => '?').join(',');
        const [borrowedItems] = await db.query(
            `SELECT nama_barang FROM items WHERE id IN (${placeholders}) AND status = 'dipinjam'`,
            ids
        );

        if (borrowedItems.length > 0) {
            const names = borrowedItems.map(item => item.nama_barang).join(', ');
            return res.status(400).json({ 
                message: `Gagal menghapus! Terdapat barang yang sedang dipinjam: ${names}.` 
            });
        }
        // ────────────────────────────────────────────────────────────────────────

        // 1. Ambil semua cloudinary_public_id sebelum dihapus dari DB
        const itemsWithImages = await Item.findPublicIdsByIds(ids);

        // 2. Hapus dari DB
        const affectedRows = await Item.deleteBulk(ids);

        // 3. Hapus gambar dari Cloudinary secara paralel
        if (itemsWithImages.length > 0) {
            const deletePromises = itemsWithImages.map(item => deleteFromCloudinary(item.cloudinary_public_id));
            await Promise.allSettled(deletePromises);
        }

        res.status(200).json({
            message: 'Penghapusan berhasil.',
            deletedCount: affectedRows
        });
    } catch (error) {
        console.error('deleteItems error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menghapus barang.' });
    }
};

// PUT /api/items/:id — admin bisa update semua field; pegawai hanya status
export const updateItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const userRole = req.user.role;
        const VALID_STATUSES = ['tersedia', 'dipinjam', 'rusak', 'hilang'];

        const { nama_barang, qr_code, kategori, remove_gambar, status } = req.body;
        let updateData = {};

        if (userRole === 'admin') {
            if (nama_barang) updateData.nama_barang = nama_barang;
            if (kategori) updateData.kategori = kategori;

            if (qr_code) {
                const existingItem = await Item.findByQrCode(qr_code);
                if (existingItem && Number(existingItem.id) !== Number(itemId)) {
                    return res.status(400).json({ message: 'SKU sudah digunakan' });
                }
                updateData.qr_code = qr_code;
            }

            if (req.cloudinaryResult) {
                const existingItem = await Item.findById(itemId);
                if (existingItem?.cloudinary_public_id) {
                    await deleteFromCloudinary(existingItem.cloudinary_public_id);
                }
                updateData.gambar_url           = req.cloudinaryResult.secure_url;
                updateData.cloudinary_public_id = req.cloudinaryResult.public_id;

            } else if (remove_gambar === 'true') {
                const existingItem = await Item.findById(itemId);
                if (existingItem?.cloudinary_public_id) {
                    await deleteFromCloudinary(existingItem.cloudinary_public_id);
                }
                updateData.gambar_url           = null;
                updateData.cloudinary_public_id = null;
            }

            if (status !== undefined) {
                if (!VALID_STATUSES.includes(status)) {
                    return res.status(400).json({
                        message: `Status tidak valid. Nilai yang diizinkan: ${VALID_STATUSES.join(', ')}.`
                    });
                }
                updateData.status = status;
            }

        } else {
            if (status === undefined) {
                return res.status(403).json({
                    message: 'Anda tidak memiliki izin untuk mengubah data barang selain status.'
                });
            }
            if (!VALID_STATUSES.includes(status)) {
                return res.status(400).json({
                    message: `Status tidak valid. Nilai yang diizinkan: ${VALID_STATUSES.join(', ')}.`
                });
            }
            updateData.status = status;
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
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            return res.status(400).json({ message: 'SKU sudah digunakan' });
        }
        res.status(500).json({ message: 'Terjadi kesalahan saat mengupdate barang.' });
    }
};

// POST /api/items/:id/report — lapor barang hilang/rusak
export const reportItem = async (req, res) => {
    const itemId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { jenis_laporan, keterangan } = req.body;

    const VALID_REPORT_TYPES = ['hilang', 'rusak'];
    if (!VALID_REPORT_TYPES.includes(jenis_laporan)) {
        return res.status(400).json({
            message: `Jenis laporan tidak valid. Nilai yang diizinkan: ${VALID_REPORT_TYPES.join(', ')}.`
        });
    }
    if (!keterangan || !keterangan.trim()) {
        return res.status(400).json({ message: 'Keterangan wajib diisi.' });
    }

    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const barang = await Item.findById(itemId, conn);
        if (!barang) {
            await conn.rollback();
            return res.status(404).json({ message: 'Barang tidak ditemukan.' });
        }

        if (barang.status !== 'dipinjam') {
            await conn.rollback();
            return res.status(409).json({ message: 'Laporan hanya bisa dibuat untuk barang yang sedang dipinjam.' });
        }

        const tx = await Transaction.findActiveByItemId(itemId, conn);
        const isAdmin = userRole === 'admin';
        if (tx && tx.user_id !== userId && !isAdmin) {
            await conn.rollback();
            return res.status(403).json({ message: 'Anda hanya bisa melaporkan barang yang sedang Anda pinjam sendiri.' });
        }

        if (tx) {
            await Transaction.complete(tx.id, conn);
        }

        await Item.updateStatus(barang.id, jenis_laporan, conn);
        await ItemReport.create({
            item_id: barang.id,
            user_id: userId,
            transaction_id: tx ? tx.id : null,
            jenis_laporan,
            keterangan: keterangan.trim()
        }, conn);

        await conn.commit();

        return res.status(200).json({
            message: `Laporan "${jenis_laporan}" untuk "${barang.nama_barang}" berhasil dikirim.`,
            data: { id: barang.id, status: jenis_laporan }
        });
    } catch (error) {
        await conn.rollback();
        console.error('reportItem error:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengirim laporan.', error: error.message });
    } finally {
        conn.release();
    }
};