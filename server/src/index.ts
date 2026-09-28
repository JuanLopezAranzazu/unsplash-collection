import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use((err: Error, _q: Request, res: Response, _n: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Error del servidor' });
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${process.env.PORT}`);
});