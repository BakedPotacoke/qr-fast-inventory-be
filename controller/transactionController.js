import Transaction from '../models/Transaction.js';

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

