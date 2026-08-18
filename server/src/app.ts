import express, { Express } from 'express';
import cors from 'cors';
import { uploadRouter } from './routes/uploadRoute';
import { sampleRouter } from './routes/sampleRoute';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'doc2dashboard-server' });
  });

  app.use('/api/upload', uploadRouter);
  app.use('/api/samples', sampleRouter);

  return app;
}
