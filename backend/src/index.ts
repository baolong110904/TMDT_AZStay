import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import userRoutes from "./routes/user.routes";
import auctionRoutes from "./routes/auction.routes";
import propertyRoutes from "./routes/property.routes";
import bidRoutes from "./routes/userbid.routes";
import reviewRoutes from "./routes/review.routes";
// import uploadImageRoutes from "./routes/uploadImages.routes";
import adminRoutes from "./routes/admin.routes";
import socketHandler from "./utils/socket.utils";
import { initSocket } from "./utils/socket.utils";
import { setupSwagger } from "./swagger"; // api testing

dotenv.config();

const app = express();
setupSwagger(app);
const server = createServer(app);
const io = initSocket(server);
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("✅ Server is running!");
});
app.use("/user", userRoutes);
app.use("/auction", auctionRoutes); 
app.use("/properties", propertyRoutes); 
app.use("/bids", bidRoutes); 
// app.use("/upload", uploadImageRoutes);
app.use("/reviews", reviewRoutes);
app.use("/admin", adminRoutes);

socketHandler(io);

/*
how to test socket in front end (for real time auction)
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.emit("join-auction", "auction-id-123");

socket.on("new-bid", (data) => {
  console.log("New bid received:", data);
});
*/

server.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  console.log(`🔥 API Testing here: http://localhost:${PORT}/docs`);
});

app.use((req, res, next) => {
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});