import Item from '../models/Item.js';
import Transaction from '../models/Transaction.js';

export const getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Dapatkan daftar barang yang sedang dipinjam oleh user (lewat Model)
        const pinjamanRows = await Transaction.getActiveLoansByUser(userId);

        // Karena di frontend statusnya "Sedang Dipinjam", kita mapping sedikit statusnya
        const pinjamanUser = pinjamanRows.map(item => ({
            ...item,
            status: item.status === 'dipinjam' ? 'Sedang Dipinjam' : item.status
        }));

        // 2. Dapatkan ringkasan inventaris (lewat Model)
        const inventarisSummary = await Item.getInventorySummary();

        // 3. (Opsional) Data stat cards jika dibutuhkan
        const statCards = {
            sedangDipinjam: inventarisSummary.sedangDipinjam,
            transaksiAktif: inventarisSummary.sedangDipinjam, // simplifikasi
            tersedia: inventarisSummary.totalBarang - inventarisSummary.sedangDipinjam
        };

        res.status(200).json({
            pinjaman: pinjamanUser,
            inventaris: inventarisSummary,
            stats: statCards
        });

    } catch (error) {
        console.error("Error getDashboardSummary:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server saat mengambil data dashboard." });
    }
};
