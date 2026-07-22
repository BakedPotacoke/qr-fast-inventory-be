import express from 'express';
import { getAllTransactions } from '../controller/transactionController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/transactions — fetch all transaction history (accessible by all authenticated users)
router.get('/', verifyToken, getAllTransactions);

export default router;
