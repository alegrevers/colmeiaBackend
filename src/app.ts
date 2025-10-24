import express from 'express';
import customerRoutes from './routes/customers';
import chargeRoutes from './routes/charges';
import errorHandler from './middlewares/errorHandler';

const app = express();
app.use(express.json());

app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/charges', chargeRoutes);

app.get('/_health', (_, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

export default app;
