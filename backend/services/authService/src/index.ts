import express from "express";
import errorHandler from "./middleware/errorHandler";
import dotenv from "dotenv";
import cors from "cors";
import { rabbitmqConnect } from "./config/rabbitmq";
import authRoute from "./routes/auth.route";
import connectMongodb from "./config/db.config";

const app = express();

dotenv.config();

rabbitmqConnect().then(() => {
  console.log("rabbitmq connected");
});

connectMongodb().then(() => {
  console.log("mongodb connected");
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", authRoute);

// Global error handling middleware
app.use(errorHandler);

app.listen(3001, () => console.log(`server running on http://localhost:3001`));
