import { useState, useRef, useEffect, useCallback } from 'react';
import { iceServers, mediaConstraints } from '../utils/webrtcConfig';

export const useWebRTC = (socket, roomId) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [connectionState, setConnectionState] = useState('new'); // new, connecting, connected, disconnected, failed
    const [error, setError] = useState(null);

    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);

    // Initialize local media stream
    const initializeMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
            setLocalStream(stream);
            localStreamRef.current = stream;
            console.log('✅ Local media stream initialized');
            return stream;
        } catch (err) {
            console.error('❌ Error accessing media devices:', err);
            setError('Failed to access camera/microphone. Please grant permissions.');
            throw err;
        }
    }, []);

    // Create peer connection
    const createPeerConnection = useCallback(() => {
        try {
            const pc = new RTCPeerConnection(iceServers);

            // Add local tracks to peer connection
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => {
                    pc.addTrack(track, localStreamRef.current);
                });
            }

            // Handle incoming remote tracks
            pc.ontrack = (event) => {
                console.log('📹 Received remote track:', event.track.kind);
                setRemoteStream(event.streams[0]);
            };

            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate && socket && roomId) {
                    console.log('🧊 Sending ICE candidate');
                    socket.emit('ice-candidate', {
                        roomId,
                        candidate: event.candidate
                    });
                }
            };

            // Monitor connection state
            pc.onconnectionstatechange = () => {
                console.log('🔗 Connection state:', pc.connectionState);
                setConnectionState(pc.connectionState);

                if (pc.connectionState === 'failed') {
                    setError('Connection failed. Please try again.');
                }
            };

            // Monitor ICE connection state
            pc.oniceconnectionstatechange = () => {
                console.log('🧊 ICE connection state:', pc.iceConnectionState);
            };

            peerConnectionRef.current = pc;
            return pc;
        } catch (err) {
            console.error('❌ Error creating peer connection:', err);
            setError('Failed to create peer connection');
            throw err;
        }
    }, [socket, roomId]);

    // Create and send offer (caller)
    const createOffer = useCallback(async () => {
        try {
            const pc = peerConnectionRef.current;
            if (!pc) return;

            console.log('📤 Creating offer...');
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit('offer', {
                roomId,
                offer: pc.localDescription
            });
            console.log('✅ Offer sent');
        } catch (err) {
            console.error('❌ Error creating offer:', err);
            setError('Failed to create offer');
        }
    }, [socket, roomId]);

    // Handle incoming offer (callee)
    const handleOffer = useCallback(async (offer) => {
        try {
            const pc = peerConnectionRef.current;
            if (!pc) return;

            console.log('📥 Received offer, creating answer...');
            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit('answer', {
                roomId,
                answer: pc.localDescription
            });
            console.log('✅ Answer sent');
        } catch (err) {
            console.error('❌ Error handling offer:', err);
            setError('Failed to handle offer');
        }
    }, [socket, roomId]);

    // Handle incoming answer (caller)
    const handleAnswer = useCallback(async (answer) => {
        try {
            const pc = peerConnectionRef.current;
            if (!pc) return;

            console.log('📥 Received answer');
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            console.log('✅ Remote description set');
        } catch (err) {
            console.error('❌ Error handling answer:', err);
            setError('Failed to handle answer');
        }
    }, []);

    // Handle incoming ICE candidate
    const handleIceCandidate = useCallback(async (candidate) => {
        try {
            const pc = peerConnectionRef.current;
            if (!pc) return;

            console.log('🧊 Adding ICE candidate');
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
            console.error('❌ Error adding ICE candidate:', err);
        }
    }, []);

    // Toggle audio
    const toggleAudio = useCallback(() => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
                console.log('🎤 Audio:', audioTrack.enabled ? 'enabled' : 'disabled');
            }
        }
    }, []);

    // Toggle video
    const toggleVideo = useCallback(() => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
                console.log('📹 Video:', videoTrack.enabled ? 'enabled' : 'disabled');
            }
        }
    }, []);

    // Cleanup
    const cleanup = useCallback(() => {
        console.log('🧹 Cleaning up WebRTC resources...');

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }

        setLocalStream(null);
        setRemoteStream(null);
        setConnectionState('new');
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return {
        localStream,
        remoteStream,
        isAudioEnabled,
        isVideoEnabled,
        connectionState,
        error,
        initializeMedia,
        createPeerConnection,
        createOffer,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        toggleAudio,
        toggleVideo,
        cleanup
    };
};
