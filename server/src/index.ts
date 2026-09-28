import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import passport from "passport";
import authRouter from "./auth";
import apiRouter from "./api";

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Rutas
app.use("/auth", authRouter);
app.use("/api", apiRouter);

// Manejo de errores
app.use((err: Error, _q: Request, res: Response, _n: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Error del servidor" });
});

// Conexión a la base de datos y arranque del servidor
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() =>
    app.listen(process.env.PORT || 4000, () =>
      console.log("API lista en :" + (process.env.PORT || 4000)),
    ),
  );
