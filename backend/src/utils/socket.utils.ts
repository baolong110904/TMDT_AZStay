// src/socketHandler.ts
import { Server, Socket } from "socket.io";
import { UserBidDAO } from "../dao/userbid.dao";
import { Server as HTTPServer } from "http";

let io: Server;

export const initSocket = (server: HTTPServer): Server => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true
    },
  });
  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("❌ Socket.io not initialized!");
  }
  return io;
};

export default function socketHandler(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);

    socket.on("join-auction", (auctionId: string) => {
      socket.join(auctionId);
      console.log(`Socket ${socket.id} joined auction ${auctionId}`);
    });

    socket.on("bid", async (data) => {
      const { auctionId, bid_amount, user_id } = data;

      try {
        const bid = new UserBidDAO({
          auction_id: auctionId,
          bidder_id: user_id,
          bid_amount: parseFloat(bid_amount),
        });

        const savedBid = await bid.save();

        io.to(auctionId).emit("new-bid", {
          user_id,
          bid_amount,
          auctionId,
          bid_id: savedBid.bid_id,
          timestamp: savedBid.bid_time,
        });

        console.log(`💰 Bid placed by ${user_id} on ${auctionId}: ${bid_amount}`);
      } catch (err) {
        console.error("❌ Bid error:", err);
        socket.emit("bid-error", { error: "Bid failed." });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 Socket disconnected: ${socket.id}`);
    });
  });
}
