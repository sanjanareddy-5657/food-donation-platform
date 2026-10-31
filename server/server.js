require('dotenv').config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev_only_secret_change_in_production';

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seed = require('./config/seed');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors()); // allow the deployed frontend; tighten with CLIENT_URL if needed
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Food Donation Platform API is running' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB()
  .then(seed)
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)));
