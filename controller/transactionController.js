import Transaction from '../models/Transaction.js';

const VALID_STATUSES = ['dipinjam', 'selesai'];

// GET /api/transactions — fetch transaction history (admin: all, pegawai: own only)
export const getAllTransactions = async (req, res) => {
    try {
        let transactions;
        if (req.user.role === 'admin') {
            transactions = await Transaction.findAll();
        } else {
            transactions = await Transaction.findByUserId(req.user.id);
        }
        res.status(200).json({ data: transactions });
    } catch (error) {
        console.error('getAllTransactions error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil riwayat transaksi.' });
    }
};

// PATCH /api/transactions/:id/status — admin only, ubah status transaksi (dipinjam <-> selesai)
// body: { status: 'dipinjam' | 'selesai' }
export const updateTransactionStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Hanya admin yang dapat mengubah status transaksi.' });
        }

        const { id } = req.params;
        const { status } = req.body;

        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                message: `Status tidak valid. Gunakan salah satu dari: ${VALID_STATUSES.join(', ')}.`,
            });
        }

        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
        }

        if (transaction.status_transaksi === status) {
            return res.status(400).json({ message: `Transaksi ini sudah berstatus "${status}".` });
        }

        const affectedRows = await Transaction.updateStatus(id, status);
        if (!affectedRows) {
            return res.status(500).json({ message: 'Gagal memperbarui status transaksi.' });
        }

        const updated = await Transaction.findById(id);
        res.status(200).json({ message: `Status transaksi berhasil diubah menjadi "${status}".`, data: updated });
    } catch (error) {
        console.error('updateTransactionStatus error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat memperbarui status transaksi.' });
    }
};