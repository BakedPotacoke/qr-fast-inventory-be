import db from '../config/db.js';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Transaction from '../models/Transaction.js';

// Helper: format durasi (ms) jadi teks yang mudah dibaca
function formatDurasi(ms) {
    const totalMenit = Math.floor(ms / 60000);
    const hari = Math.floor(totalMenit / 1440);
    const jam = Math.floor((totalMenit % 1440) / 60);
    const menit = totalMenit % 60;

    const bagian = [];
    if (hari > 0) bagian.push(`${hari} hari`);
    if (jam > 0) bagian.push(`${jam} jam`);
    if (menit > 0 || bagian.length === 0) bagian.push(`${menit} menit`);
    return bagian.join(' ');
}

export const handleScan = async (req, res) => {
    const { qr_code } = req.body;
    const user_id = req.user.id; // Diambil dari JWT via middleware

    // Validasi input dasar
    if (!qr_code || typeof qr_code !== 'string' || !qr_code.trim()) {
        return res.status(400).json({ message: "QR Code wajib diisi dan harus berupa teks yang valid." });
    }

    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        // 0. Cek apakah user terdaftar & statusnya aktif
        const user = await User.findById(user_id, conn);
        if (!user) {
            await conn.rollback();
            return res.status(404).json({ message: "Pengguna dengan ID tersebut tidak terdaftar di sistem." });
        }


        // 1. Cek apakah barang dengan qr_code tersebut terdaftar
        const barang = await Item.findByQrCode(qr_code, conn);

        if (!barang) {
            await conn.rollback();
            return res.status(404).json({ message: `QR Code tidak dikenali.` });
        }

        const namaUser = user.nama_lengkap || `User #${user.id}`;

        switch (barang.status) {
            // 2. ALUR PEMINJAMAN
            case 'tersedia': {
                await Item.updateStatus(barang.id, "dipinjam", conn);
                const transactionId = await Transaction.create(user_id, barang.id, "dipinjam", conn);

                await conn.commit();
                return res.status(200).json({
                    status: "pinjam",
                    message: `${namaUser} berhasil meminjam "${barang.nama_barang}". Jangan lupa dikembalikan ya!`,
                    barang,
                    transaction_id: transactionId
                });
            }

            // 3. ALUR PENGEMBALIAN
            case 'dipinjam': {
                const tx = await Transaction.findActiveByItemId(barang.id, conn);

                if (!tx) {
                    await Item.updateStatus(barang.id, "tersedia", conn);
                    await conn.commit();
                    return res.status(409).json({
                        message: `Data "${barang.nama_barang}"(berstatus dipinjam tanpa transaksi aktif). Status telah direset otomatis menjadi "tersedia". Silakan scan ulang untuk meminjam.`
                    });
                }

                // Validasi: hanya peminjam asli (atau admin) yang boleh mengembalikan
                const isAdmin = user.role === 'admin';
                if (tx.user_id !== user_id && !isAdmin) {
                    await conn.rollback();
                    const peminjam = await User.findById(tx.user_id, conn);
                    const namaPeminjam = peminjam?.nama_lengkap || 'pengguna lain';
                    return res.status(403).json({
                        message: `Gagal mengembalikan: "${barang.nama_barang}" sedang dipinjam oleh ${namaPeminjam}, bukan oleh ${namaUser}.`
                    });
                }

                await Transaction.complete(tx.id, conn);
                await Item.updateStatus(barang.id, "tersedia", conn);

                const durasiMs = Date.now() - new Date(tx.waktu_pinjam).getTime();
                const durasiText = formatDurasi(durasiMs);
                const catatanTerlambat = durasiMs > 24 * 60 * 60 * 1000
                    ? ' (durasi peminjaman cukup lama, mohon dicek kondisi barang)'
                    : '';

                await conn.commit();
                return res.status(200).json({
                    status: "kembali",
                    message: `${namaUser} berhasil mengembalikan "${barang.nama_barang}" setelah dipinjam selama ${durasiText}${catatanTerlambat}.`,
                    barang,
                    durasi_pinjam: durasiText
                });
            }

            case 'maintenance':
            case 'perbaikan':
                await conn.rollback();
                return res.status(423).json({
                    message: `"${barang.nama_barang}" sedang dalam perbaikan/maintenance dan belum bisa dipinjam saat ini.`
                });

            case 'rusak':
                await conn.rollback();
                return res.status(423).json({
                    message: `"${barang.nama_barang}" berstatus rusak dan tidak dapat dipinjam. Silakan laporkan ke admin jika ini keliru.`
                });

            case 'hilang':
                await conn.rollback();
                return res.status(423).json({
                    message: `"${barang.nama_barang}" tercatat hilang dalam sistem dan tidak dapat diproses. Hubungi admin untuk klarifikasi.`
                });

            default:
                await conn.rollback();
                return res.status(409).json({
                    message: `"${barang.nama_barang}" memiliki status "${barang.status}" yang tidak dikenali sistem. Silakan hubungi admin.`
                });
        }
    } catch (error) {
        await conn.rollback();
        console.error('Scan QR error:', error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server saat memproses scan.",
            error: error.message
        });
    } finally {
        conn.release();
    }
};
