import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (token: string): Socket => {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5001", {
            auth: { token },
            transports: ["websocket"],
            autoConnect: true,
        });
    } else {
        // Sync token if it changed
        socket.auth = { token };
        if (socket.connected) {
            console.log("🔌 Socket token updated while connected");
        }
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export default getSocket;
