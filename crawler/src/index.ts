import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import listingsRoutes from './routes/listings.routes';
import seedRoutes from './routes/seed.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/listings', listingsRoutes);
app.use('/api', seedRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
