import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const port = 3000;

app.listen(port, () =>
  console.log(`server running on http://localhost:${port}`)
);
