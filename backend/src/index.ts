import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Security, Compression, and Logging
app.use(helmet());
app.use(compression());
app.use((pinoHttp as any)({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
}));

// Rate Limiting (200 requests per 15 mins)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
}));

// CORS — allow production frontend + localhost for development
app.use(cors({
  origin: [
    'https://edu-nation-j4o5.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true
}));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.get('/', (req, res) => {
  res.send('NationHub API Backend Running. Use /api/* for data endpoints.');
});

app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  
  // Cache Warming
  setTimeout(() => {
    console.log('🔥 Initiating cache warming for top 5 countries (USA, IND, CHN, GBR, DEU)...');
    try {
      import('./controllers/countryController.js').then(({ getCountryIndicators }) => {
        ['USA', 'IND', 'CHN', 'GBR', 'DEU'].forEach(code => {
          // Fire-and-forget dummy requests
          getCountryIndicators({ params: { code } } as any, { json: () => {} } as any).catch(() => {});
        });
      });
    } catch (e) {
      console.error('Failed to warm cache:', e);
    }
  }, 2000);
});
