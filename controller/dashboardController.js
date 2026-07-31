import Item from '../models/Item.js';
import Transaction from '../models/Transaction.js';
import ItemReport from '../models/ItemReport.js';
import User from '../models/User.js';

// GET /api/dashboard/me — ringkasan personal untuk halaman Beranda (semua role login)
// Bentuk response SENGAJA beda dari getDashboardSummary (admin): { pinjaman, riwayat, inventaris }
export const getMyDashboardSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        const [pinjaman, riwayat, inventaris] = await Promise.all([
            Transaction.getActiveLoansByUser(userId),
            Transaction.getRecentLoansByUser(userId, 5),
            Item.getInventorySummary(),
        ]);

        res.status(200).json({ pinjaman, riwayat, inventaris });
    } catch (error) {
        console.error('getMyDashboardSummary error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil ringkasan dashboard.' });
    }
};

// GET /api/dashboard/summary — ringkasan statistik untuk dashboard admin
export const getDashboardSummary = async (req, res) => {
    try {
        const [
            inventory,
            totalPengguna,
            kategoriBreakdown,
            trenPeminjaman,
            laporanBreakdown,
            topBarang,
            transaksiAktif,
            laporanTerbaru,
        ] = await Promise.all([
            Item.getInventorySummary(),
            User.count(),
            Item.getKategoriBreakdown(),
            Transaction.getTrenPeminjaman(7),
            ItemReport.getBreakdownByJenis(),
            Transaction.getTopBarang(5),
            Transaction.countActive(),
            ItemReport.countRecent(30),
        ]);

        res.status(200).json({
            data: {
                inventory,
                totalPengguna,
                transaksiAktif,
                laporanTerbaru,
                kategoriBreakdown,
                trenPeminjaman,
                laporanBreakdown,
                topBarang,
            },
        });
    } catch (error) {
        console.error('getDashboardSummary error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil ringkasan dashboard.' });
    }
};