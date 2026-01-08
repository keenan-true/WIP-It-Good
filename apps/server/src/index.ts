import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import managerRoutes from './routes/managers.js';
import staffRoutes from './routes/staff.js';
import productRoutes from './routes/products.js';
import initiativeRoutes from './routes/initiatives.js';
import allocationRoutes from './routes/allocations.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/managers', managerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/products', productRoutes);
app.use('/api/initiatives', initiativeRoutes);
app.use('/api/allocations', allocationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
