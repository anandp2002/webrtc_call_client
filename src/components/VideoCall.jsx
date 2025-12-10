import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';
import VideoPlayer from './VideoPlayer';
import Controls from './Controls';
import { Copy, Check, Loader } from 'lucide-react';

const VideoCall = ({ socket }) => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [isJoining, setIsJoining] = useState(true);
    const [joinError, setJoinError] = useState('');
    const [isFirstParticipant, setIsFirstParticipant] = useState(false);

    const {
        localStream,
        remoteStream,
        isAudioEnabled,
        isVideoEnabled,
        isRemoteVideoEnabled,
        isRemoteAudioEnabled,
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
        cleanup,
        setIsRemoteVideoEnabled,
        setIsRemoteAudioEnabled
    } = useWebRTC(socket, roomId);

    useEffect(() => {
        if (!socket) {
            setJoinError('Not connected to server');
            return;
        }

        const setupCall = async () => {
            try {
                // Initialize media first
                await initializeMedia();

                // Join the room
                socket.emit('join-room', { roomId });
            } catch (err) {
                console.error('Setup error:', err);
                setJoinError(err.message || 'Failed to initialize media');
                setIsJoining(false);
            }
        };

        setupCall();

        // Socket event listeners
        socket.on('room-joined', ({ isFirstParticipant: isFirst }) => {
            console.log('✅ Joined room successfully');
            setIsJoining(false);
            setIsFirstParticipant(isFirst);
            createPeerConnection();
        });

        socket.on('join-error', ({ error }) => {
            console.error('❌ Join error:', error);
            setJoinError(error);
            setIsJoining(false);
        });

        socket.on('peer-joined', ({ peerId }) => {
            console.log('👤 Peer joined:', peerId);
            // Create and send offer to the new peer
            setTimeout(() => {
                createOffer();
            }, 1000);
        });

        socket.on('offer', ({ offer }) => {
            console.log('📥 Received offer');
            handleOffer(offer);
        });

        socket.on('answer', ({ answer }) => {
            console.log('📥 Received answer');
            handleAnswer(answer);
        });

        socket.on('ice-candidate', ({ candidate }) => {
            console.log('🧊 Received ICE candidate');
            handleIceCandidate(candidate);
        });

        socket.on('peer-left', () => {
            console.log('👋 Peer left the room');
        });

        // Listen for peer media state changes
        socket.on('peer-video-toggle', ({ isVideoEnabled }) => {
            console.log('📹 Peer video:', isVideoEnabled ? 'enabled' : 'disabled');
            setIsRemoteVideoEnabled(isVideoEnabled);
        });

        socket.on('peer-audio-toggle', ({ isAudioEnabled }) => {
            console.log('🎤 Peer audio:', isAudioEnabled ? 'enabled' : 'disabled');
            setIsRemoteAudioEnabled(isAudioEnabled);
        });

        return () => {
            socket.off('room-joined');
            socket.off('join-error');
            socket.off('peer-joined');
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            socket.off('peer-left');
            socket.off('peer-video-toggle');
            socket.off('peer-audio-toggle');
        };
    }, [socket, roomId, initializeMedia, createPeerConnection, createOffer, handleOffer, handleAnswer, handleIceCandidate, setIsRemoteVideoEnabled, setIsRemoteAudioEnabled]);

    const handleEndCall = () => {
        if (socket) {
            socket.emit('leave-room', { roomId });
        }
        cleanup();
        navigate('/');
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Show loading state
    if (isJoining) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-center space-y-4">
                    <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
                    <p className="text-white text-xl">Joining room...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (joinError || error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
                <div className="glass-effect rounded-2xl p-8 max-w-md w-full text-center space-y-4">
                    <div className="text-red-400 text-lg font-semibold">
                        {joinError || error}
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
            {/* Room ID Header */}
            <div className="absolute top-4 left-4 z-20 glass-effect rounded-xl px-4 py-2 flex items-center gap-3">
                <div>
                    <p className="text-gray-400 text-xs">Room ID</p>
                    <p className="text-white font-mono font-bold text-lg tracking-wider">
                        {roomId}
                    </p>
                </div>
                <button
                    onClick={copyRoomId}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                    ) : (
                        <Copy className="w-4 h-4 text-gray-300" />
                    )}
                </button>
            </div>

            {/* Connection Status */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                <div className={`glass-effect rounded-full px-4 py-2 flex items-center gap-2 ${connectionState === 'connected' ? 'border-green-500/50' : ''}`}>
                    <div className={`w-2 h-2 rounded-full ${connectionState === 'connected' ? 'bg-green-400 animate-pulse' :
                            connectionState === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                                connectionState === 'failed' ? 'bg-red-400' :
                                    'bg-gray-400'
                        }`} />
                    <span className="text-white text-sm capitalize">
                        {connectionState === 'new' ? 'Initializing' : connectionState}
                    </span>
                </div>
            </div>

            {/* Video Player */}
            <VideoPlayer
                localStream={localStream}
                remoteStream={remoteStream}
                isVideoEnabled={isVideoEnabled}
                isRemoteVideoEnabled={isRemoteVideoEnabled}
            />

            {/* Controls */}
            <Controls
                isAudioEnabled={isAudioEnabled}
                isVideoEnabled={isVideoEnabled}
                onToggleAudio={toggleAudio}
                onToggleVideo={toggleVideo}
                onEndCall={handleEndCall}
            />
        </div>
    );
};

export default VideoCall;
