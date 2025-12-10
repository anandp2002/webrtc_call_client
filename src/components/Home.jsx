import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Copy, Check } from 'lucide-react';

const Home = ({ socket }) => {
    const [roomId, setRoomId] = useState('');
    const [joinRoomId, setJoinRoomId] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleCreateRoom = () => {
        if (!socket || !socket.connected) {
            setError('Not connected to server. Please refresh the page.');
            return;
        }

        socket.emit('create-room');

        socket.once('room-created', ({ roomId: newRoomId }) => {
            console.log('Room created:', newRoomId);
            setRoomId(newRoomId);
            setError('');
        });
    };

    const handleJoinRoom = () => {
        if (!joinRoomId.trim()) {
            setError('Please enter a room ID');
            return;
        }

        if (joinRoomId.length !== 6) {
            setError('Room ID must be 6 digits');
            return;
        }

        navigate(`/room/${joinRoomId}`);
    };

    const handleJoinCreatedRoom = () => {
        if (roomId) {
            navigate(`/room/${roomId}`);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center animate-float">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-4 animate-pulse-glow">
                        <Video className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        WebRTC Call
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Connect face-to-face with crystal clear quality
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="glass-effect rounded-xl p-4 border-red-500/50 bg-red-500/10">
                        <p className="text-red-400 text-center">{error}</p>
                    </div>
                )}

                {/* Create Room Section */}
                <div className="glass-effect rounded-2xl p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-white mb-4">Start a New Call</h2>

                    <button
                        onClick={handleCreateRoom}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
                    >
                        Create Room
                    </button>

                    {roomId && (
                        <div className="space-y-3 animate-in fade-in duration-300">
                            <div className="glass-effect rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Your Room ID</p>
                                    <p className="text-2xl font-mono font-bold text-white tracking-wider">
                                        {roomId}
                                    </p>
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    {copied ? (
                                        <Check className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <Copy className="w-5 h-5 text-gray-300" />
                                    )}
                                </button>
                            </div>

                            <button
                                onClick={handleJoinCreatedRoom}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                            >
                                Join Your Room
                            </button>
                        </div>
                    )}
                </div>

                {/* Join Room Section */}
                <div className="glass-effect rounded-2xl p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-white mb-4">Join an Existing Call</h2>

                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Enter 6-digit Room ID"
                            value={joinRoomId}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setJoinRoomId(value);
                                setError('');
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-center text-xl font-mono tracking-wider"
                            maxLength={6}
                        />

                        <button
                            onClick={handleJoinRoom}
                            disabled={joinRoomId.length !== 6}
                            className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
                        >
                            Join Room
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm">
                    Powered by WebRTC • End-to-end encrypted
                </p>
            </div>
        </div>
    );
};

export default Home;
