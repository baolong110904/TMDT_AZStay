import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup to allow frontend (http://localhost:3000) to access backend
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

// Parse incoming JSON and form-urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/user", userRoutes); // Example: /user/signup, /user/login

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
