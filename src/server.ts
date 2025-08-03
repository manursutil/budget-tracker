import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import config from '@/config';
import logger from '@/middleware/logger';

const app = express();

if (!config.MONGODB_URI || !config.PORT) {
  throw new Error('MONGODB_URI or PORT are not set as environment variables');
}

logger.info('connecting to:', config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => logger.info('connected to MongoDB'))
  .catch((error) => logger.error('error connecting to MongoDB', error.message));

app.use(cors());

app.get('/', (_req, res) => {
  res.json({
    message: 'hello world',
  });
});

app.listen(config.PORT, () => {
  console.log(`Server running on: http://localhost:${config.PORT}`);
});
