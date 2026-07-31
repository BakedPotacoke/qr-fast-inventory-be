import express from 'express';
import { getAllTransactions, updateTransactionStatus } from '../controller/transactionController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/transactions — fetch all transaction history (accessible by all authenticated users)
router.get('/', verifyToken, getAllTransactions);

// PATCH /api/transactions/:id/status — update transaction status (admin only, checked in controller)
// body: { status: 'dipinjam' | 'selesai' }
router.patch('/:id/status', verifyToken, updateTransactionStatus);

export default router;