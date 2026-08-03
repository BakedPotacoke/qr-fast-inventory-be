import ItemReport from '../models/ItemReport.js';

// GET /api/reports
// Mengambil seluruh data laporan (item_reports) beserta info peminjam, barang, kategori,
// dan waktu pinjam/kembali dari tabel transactions.
export const getAllReports = async (req, res) => {
    try {
        const reports = await ItemReport.findAll();

        return res.status(200).json({
            success: true,
            data: reports,
            message: 'Data laporan berhasil diambil.',
        });
    } catch (error) {
        console.error('Error getAllReports:', error);
        return res.status(500).json({
            success: false,
            data: [],
            message: 'Gagal mengambil data laporan. Silakan coba lagi.',
        });
    }
};