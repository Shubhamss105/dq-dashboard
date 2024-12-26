// src/socket.js
import { io } from "socket.io-client";

const socket = io("https://rest.dicui.org/api", {
  transports: ["websocket"],
});

export default socket;
