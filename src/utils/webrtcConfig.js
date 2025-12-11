// WebRTC Configuration
const buildIceServers = () => {
    const servers = [
        {
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                'stun:stun4.l.google.com:19302',
            ]
        }
    ];

    // Add TURN server if credentials are provided
    const turnUrl = import.meta.env.VITE_TURN_URL;
    const turnUsername = import.meta.env.VITE_TURN_USERNAME;
    const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL;

    if (turnUrl && turnUsername && turnCredential) {
        servers.push({
            urls: turnUrl,
            username: turnUsername,
            credential: turnCredential
        });
        console.log('✅ TURN server configured:', turnUrl);
    } else {
        console.warn('⚠️ TURN server not configured. Connections may fail across different networks.');
    }

    return servers;
};

export const iceServers = {
    iceServers: buildIceServers(),
    iceCandidatePoolSize: 10,
};

// Optimized media constraints for low latency
export const mediaConstraints = {
    video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
        facingMode: 'user'
    },
    audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 1
    }
};

// Socket.io server URL
export const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 'https://webrtc-call-server-806d.onrender.com';
