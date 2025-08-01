import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import userRoutes from "./routes/user.routes";
import auctionRoutes from "./routes/auction.routes";
import socketHandler from "./utils/socket.utils";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);     // <-- fixed missing slash
app.use("/auction", auctionRoutes); // <-- fixed missing slash

// 👇 Socket logic in separate file
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
