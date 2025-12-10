import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

const Controls = ({
    isAudioEnabled,
    isVideoEnabled,
    onToggleAudio,
    onToggleVideo,
    onEndCall
}) => {
    return (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
            <div className="flex items-center justify-center gap-4">
                {/* Audio Toggle */}
                <button
                    onClick={onToggleAudio}
                    className={`p-4 rounded-full transition-all duration-300 transform hover:scale-110 ${isAudioEnabled
                            ? 'bg-white/10 hover:bg-white/20 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                    title={isAudioEnabled ? 'Mute' : 'Unmute'}
                >
                    {isAudioEnabled ? (
                        <Mic className="w-6 h-6" />
                    ) : (
                        <MicOff className="w-6 h-6" />
                    )}
                </button>

                {/* Video Toggle */}
                <button
                    onClick={onToggleVideo}
                    className={`p-4 rounded-full transition-all duration-300 transform hover:scale-110 ${isVideoEnabled
                            ? 'bg-white/10 hover:bg-white/20 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                    title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                    {isVideoEnabled ? (
                        <Video className="w-6 h-6" />
                    ) : (
                        <VideoOff className="w-6 h-6" />
                    )}
                </button>

                {/* End Call */}
                <button
                    onClick={onEndCall}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-red-500/50"
                    title="End call"
                >
                    <PhoneOff className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default Controls;
