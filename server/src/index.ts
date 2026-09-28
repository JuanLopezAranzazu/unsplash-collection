import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use((err: Error, _q: Request, res: Response, _n: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Error del servidor" });
});

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() =>
    app.listen(process.env.PORT || 4000, () =>
      console.log("API lista en :" + (process.env.PORT || 4000)),
    ),
  );
