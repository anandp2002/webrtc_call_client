import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { SOCKET_SERVER_URL } from '../utils/webrtcConfig';

export const useSocket = () => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Create socket connection
        const socketInstance = io(SOCKET_SERVER_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        socketInstance.on('connect', () => {
            console.log('✅ Connected to signaling server:', socketInstance.id);
            setSocket(socketInstance); // Update state when connected
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('❌ Disconnected from server:', reason);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        // Set socket immediately (even before connection completes)
        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, []);

    return socket;
};
