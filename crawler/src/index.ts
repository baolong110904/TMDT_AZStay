import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users.routes';
import listingsRoutes from './routes/listings.routes';
import bidsRoutes from './routes/bids.routes';
import seedRoutes from './routes/seed.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);
app.use('/listings', listingsRoutes);
app.use('/bids', bidsRoutes);
app.use('/api', seedRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
