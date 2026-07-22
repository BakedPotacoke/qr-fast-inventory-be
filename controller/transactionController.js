import Transaction from '../models/Transaction.js';

// GET /api/transactions — fetch all transaction history
export const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll();
        res.status(200).json({ data: transactions });
    } catch (error) {
        console.error('getAllTransactions error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil riwayat transaksi.' });
    }
};
