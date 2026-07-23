import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Sajikan folder uploads sebagai static files
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDir));

// Import Routes (Perhatikan perubahan nama file di sini)
import scanRouter from './routes/scanRoutes.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import itemRouter from './routes/itemRoutes.js';
import dashboardRouter from './routes/dashboardRoutes.js';
import transactionRouter from './routes/transactionRoutes.js';

// Daftarkan URL Endpoint
app.use('/api', scanRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/items', itemRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/transactions', transactionRouter);

// Rute Uji Coba Dasar
app.get('/', (req, res) => {
  res.json({ message: "Server Backend FastQR Aktif!" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: err.message || 'Terjadi kesalahan pada server.' });
});

app.listen(PORT, () => {
  console.log(`Server berjalan http://localhost:${PORT}`);
});