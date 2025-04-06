import express, { Request, Response } from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { perplexity } from "./constants";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.use(express.json());

app.post("/api/research", async (req: Request, res: Response) => {
  try {
    const response = await axios.post(perplexity, req.body, {
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    res.json(response.data);
  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data,
    });
  }
});

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
