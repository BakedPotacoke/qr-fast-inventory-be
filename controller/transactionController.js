import Transaction from '../models/Transaction.js';
import Item from '../models/Item.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

// GET /api/transactions?page=&limit=&status=&kategori= — admin only
// Mengembalikan semua transaksi dengan server-side pagination + filter status/kategori.
export const getAllTransactions = async (req, res) => {
    try {
        const { page, limit } = parsePagination(req.query);
        const { status, kategori } = req.query;
        const { rows, total } = await Transaction.findAll({ page, limit, status, kategori });

        return res.status(200).json({
            success: true,
            data: rows,
            pagination: buildPaginationMeta(page, limit, total),
        });
    } catch (error) {
        console.error('getAllTransactions error:', error);
        return res.status(500).json({
            success: false,
            data: [],
            message: 'Gagal mengambil data transaksi. Silakan coba lagi.',
        });
    }
};

// GET /api/transactions/me?page=&limit= — user yang sedang login
// Riwayat transaksi milik user sendiri.
export const getMyTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page, limit } = parsePagination(req.query);
        const { rows, total } = await Transaction.findByUserId(userId, { page, limit });

        return res.status(200).json({
            success: true,
            data: rows,
            pagination: buildPaginationMeta(page, limit, total),
        });
    } catch (error) {
        console.error('getMyTransactions error:', error);
        return res.status(500).json({
            success: false,
            data: [],
            message: 'Gagal mengambil riwayat transaksi. Silakan coba lagi.',
        });
    }
};

// PATCH /api/transactions/:id/status — admin only
// Ubah status transaksi antara 'dipinjam' dan 'selesai'.
// Jika diubah ke 'selesai': barang dikembalikan ke status 'tersedia'.
// Jika diubah ke 'dipinjam': barang dikembalikan ke status 'dipinjam'.
export const updateTransactionStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const VALID_STATUSES = ['dipinjam', 'selesai'];
    if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            message: `Status tidak valid. Nilai yang diizinkan: ${VALID_STATUSES.join(', ')}.`,
        });
    }

    try {
        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
        }
        if (transaction.status_transaksi === status) {
            return res.status(400).json({ message: 'Status transaksi sudah sama, tidak ada perubahan.' });
        }

        // Update status transaksi (waktu_kembali diisi otomatis oleh model)
        await Transaction.updateStatus(id, status);

        // Sinkronisasi status barang
        const itemStatus = status === 'selesai' ? 'tersedia' : 'dipinjam';
        await Item.updateStatus(transaction.item_id, itemStatus);

        // Ambil waktu_kembali terbaru untuk dikirim ke frontend
        const updated = await Transaction.findById(id);

        return res.status(200).json({
            success: true,
            message: `Status transaksi berhasil diubah ke "${status}".`,
            data: {
                id: Number(id),
                status,
                waktu_kembali: updated?.waktu_kembali ?? null,
            },
        });
    } catch (error) {
        console.error('updateTransactionStatus error:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan saat memperbarui status transaksi.',
        });
    }
};