import express from "express";
import errorHandler from "./middleware/errorHandler";

const app = express();

// Global error handling middleware
app.use(errorHandler);

app.listen(3001, () => console.log(`server running on http://localhost:3001`));
