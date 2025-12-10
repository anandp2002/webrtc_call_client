import { useEffect, useRef } from 'react';
import { User } from 'lucide-react';

const VideoPlayer = ({ localStream, remoteStream, isVideoEnabled }) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    return (
        <div className="relative w-full h-full bg-slate-900">
            {/* Remote Video (Main View) */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                {remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse">
                            <User className="w-12 h-12 text-white" />
                        </div>
                        <div>
                            <p className="text-white text-xl font-semibold">Waiting for peer...</p>
                            <p className="text-gray-400 mt-2">Share the room ID to start the call</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-48 h-36 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-800 z-10">
                {localStream && isVideoEnabled ? (
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]" // Mirror effect
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-white text-xs mt-2">
                                {!localStream ? 'No camera' : 'Camera off'}
                            </p>
                        </div>
                    </div>
                )}

                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                    You
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
