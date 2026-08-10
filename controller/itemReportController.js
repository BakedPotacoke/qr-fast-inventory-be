import ItemReport from '../models/ItemReport.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

// GET /api/reports?page=&limit=
// Mengambil data laporan (item_reports) beserta info peminjam, barang, kategori,
// dan waktu pinjam/kembali dari tabel transactions — dengan pagination.
//
// Mode ekspor CSV: kirim ?limit=all untuk mendapatkan seluruh data tanpa LIMIT.
// Endpoint ini hanya bisa diakses admin (pastikan middleware isAdmin dipasang di route).
export const getAllReports = async (req, res) => {
    try {
        // Cek mode limit=all terlebih dulu sebelum parsePagination (yang akan ignore string 'all')
        const isExportAll = req.query.limit === 'all';

        let page, limit, rows, total;

        if (isExportAll) {
            // Mode ekspor: ambil semua data tanpa LIMIT
            ({ rows, total } = await ItemReport.findAll({ all: true }));
            page  = 1;
            limit = total || 1; // nilai dummy agar buildPaginationMeta tidak error
        } else {
            ({ page, limit } = parsePagination(req.query));
            ({ rows, total } = await ItemReport.findAll({ page, limit }));
        }

        return res.status(200).json({
            success: true,
            data: rows,
            pagination: buildPaginationMeta(page, limit, total),
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