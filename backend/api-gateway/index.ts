import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { createStream } from "rotating-file-stream";
import path from "path";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// Define the path to the logs directory and Create the logs directory if it doesn't exist
// const logDirectory = path.join(__dirname,'logs')
// if(!fs.existsSync(logDirectory)){
//     fs.mkdirSync(logDirectory)
// }

// Create a stream for writing access logs
const accessLogStream = createStream("access.log", {
  interval: "1d",
  path: path.join(__dirname, "logs"),
});

// Use Morgan middleware to log HTTP requests to the access log stream
app.use(morgan("combined", { stream: accessLogStream }));

// Create a rate limiter to limit requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
});

app.use(limiter);

app.use(cookieParser());

app.use(cors());

const targets = {
  auth: process.env.AUTH_API_BASE_URL,
  user: process.env.USER_API_BASE_URL,
};

// Configure a proxy middleware for each route.
app.use(
  "/auth",
  createProxyMiddleware({
    target: targets.auth,
    changeOrigin: true,
  })
);
app.use(
  "/user",
  createProxyMiddleware({
    target: targets.user,
    changeOrigin: true,
  })
);

const port = process.env.GATEWAY_PORT;

app.listen(port, () =>
  console.log(`server running on http://localhost:${port}`)
);
