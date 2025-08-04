import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import config from '@/config';
import logger from '@/middleware/logger';
import requestLogger from '@/middleware/requestLogger';
import errorHandler from '@/middleware/errorHandler';
import unknownEndpoint from '@/middleware/unknownEndpoint';
import getTokenFrom from '@/middleware/getTokenFrom';

import authRouter from '@/routes/authRouter';
import userRouter from '@/routes/userRouter';

import '@/models/user';
import '@/models/transaction';

const app = express();

if (!config.MONGODB_URI || !config.PORT) {
  throw new Error('MONGODB_URI or PORT are not set as environment variables');
}

if (process.env.NODE_ENV !== 'test') {
  logger.info('connecting to:', config.MONGODB_URI);

  mongoose
    .connect(config.MONGODB_URI)
    .then(() => logger.info('connected to MongoDB'))
    .catch((error) =>
      logger.error('error connecting to MongoDB', error.message),
    );
}

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(getTokenFrom);

app.get('/', (_req, res) => {
  res.json({
    message: 'hello world',
  });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.PORT, () => {
    console.log(`Server running on: http://localhost:${config.PORT}`);
  });
}

export default app;
