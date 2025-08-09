import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import userRoutes from "./routes/user.routes";
import auctionRoutes from "./routes/auction.routes";
import uploadImageRoutes from "./routes/uploadImages.routes";
import socketHandler from "./utils/socket.utils";
import { initSocket } from "./utils/socket.utils";

dotenv.config();

const app = express();
const server = createServer(app);
const io = initSocket(server);
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);
app.use("/user", uploadImageRoutes);
app.use("/auction", auctionRoutes); 

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
});
