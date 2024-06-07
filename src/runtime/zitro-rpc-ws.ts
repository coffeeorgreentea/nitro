// import { NitroApp } from "#internal/nitro/app";
// import { AnyRouter } from "@trpc/server";
// import { applyWSSHandler } from "@trpc/server/adapters/ws";
// import WebSocket, { WebSocketServer as WSWebSocketServer } from "ws";

// export const initTrpcWSAdapter = (nitro: NitroApp, router: AnyRouter) => {
//   const WebSocketServer = WebSocket.Server || WSWebSocketServer;
//   const wss = new WebSocketServer({
//     port: 3001,
//     path: "/rpc",
//   });

//   const handler = applyWSSHandler({ wss, router });

//   wss.on("connection", (ws) => {
//     console.log(`++ Connection (${wss.clients.size})`);
//     ws.once("close", () => {
//       console.log(`-- Connection (${wss.clients.size})`);
//     });
//   });

//   console.log("✅ WebSocket Server listening on ws://localhost:3001");

//   nitro.hooks.hookOnce("close", async () => {
//     handler.broadcastReconnectNotification();
//     wss.close();
//   });
// };
