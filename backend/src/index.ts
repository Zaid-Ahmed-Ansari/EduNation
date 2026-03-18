import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('EduNation API Backend Running. Use /api/* for data endpoints.');
});

import apiRoutes from './routes/index.js';

app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
