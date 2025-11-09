// src/service.ts
import * as grpc from "@grpc/grpc-js";
import { BrokerClient, Message, Subscriber } from "./grpc/heyo_client.ts";

const BROKER_ADDR = process.env.BROKER_ADDR ?? "[::]:8022";

// 1️⃣ Create gRPC client
const broker = new BrokerClient(BROKER_ADDR, grpc.credentials.createInsecure());
const event = "new.user"
const sub: Subscriber = {
  event,
  clientId: "fastify-service",
  name: "fastify-service",
};

const stream = broker.subscription(sub);

stream.on("data", (m: Message) => {
  console.log(m);
  // ici ?
});

stream.on("end", () => {
    // ???
});

stream.on("error", (err) => {
  console.error("Stream error:", err);
});
