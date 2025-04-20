import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import googleDocsRouter from "./routes/googleDocs";
import axios from "axios";
import { chatGptResponse } from "../constants";

dotenv.config();

const app = express();

// Configure CORS
app.use(cors({
  origin: ['https://physics-gpt-good.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/api/google-docs", googleDocsRouter);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err);
  res.setHeader('Content-Type', 'application/json');
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
