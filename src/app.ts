import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import logger from 'morgan';

import router from './routes';

function getCorsOrigin() {
  const origin = process.env.CORS_ORIGIN;
  if (!origin) throw new Error('CORS_ORIGIN is a required env var.');

  if (origin === '*') return origin;

  return new RegExp(origin);
}

const app = express();
const corsOptions = {
  origin: getCorsOrigin(),
  optionsSuccessStatus: 200
};

app.use(logger('dev'));
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

app.use(router);

export default app;