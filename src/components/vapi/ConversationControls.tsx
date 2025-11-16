import { Mic, MicOff, Phone, PhoneOff, AlertCircle } from 'lucide-react';
import type { CallStatus } from '../../types/vapi';

interface ConversationControlsProps {
  callStatus: CallStatus;
  isMicrophonePermissionGranted: boolean | null;
  onStart: () => void;
  onStop: () => void;
  error?: string | null;
  className?: string;
}

export function ConversationControls({
  callStatus,
  isMicrophonePermissionGranted,
  onStart,
  onStop,
  error,
  className = '',
}: ConversationControlsProps) {
  const isActive = callStatus === 'active';
  const isConnecting = callStatus === 'connecting';
  const isDisabled = isConnecting;

  const getStatusText = () => {
    switch (callStatus) {
      case 'connecting':
        return 'Connecting...';
      case 'active':
        return 'Connected - Speak naturally';
      case 'ended':
        return 'Conversation ended';
      case 'error':
        return 'Connection error';
      default:
        return 'Ready to start';
    }
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case 'active':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'connecting':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 sm:gap-6 ${className}`}>
      {/* Status text */}
      <div className="text-center">
        <p className={`text-base sm:text-lg font-medium ${getStatusColor()} transition-colors duration-300`}>
          {getStatusText()}
        </p>
        {isActive && (
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            The AI advisor is listening...
          </p>
        )}
      </div>

      {/* Microphone permission warning */}
      {isMicrophonePermissionGranted === false && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 max-w-md">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
          <p className="text-xs sm:text-sm text-amber-800">
            Microphone access required for voice conversations
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 max-w-md">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0" />
          <p className="text-xs sm:text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Control buttons */}
      <div className="flex items-center gap-3 sm:gap-4">
        {!isActive ? (
          <button
            onClick={onStart}
            disabled={isDisabled}
            className={`
              flex items-center gap-2 sm:gap-3
              px-6 sm:px-8 py-3 sm:py-4
              rounded-full
              font-medium text-sm sm:text-base
              transition-all duration-300
              ${
                isDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#FF385C] text-white hover:bg-[#fe4d39] hover:shadow-lg hover:scale-105 active:scale-95'
              }
              shadow-md
            `}
            aria-label="Start conversation"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Start Conversation</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onStop}
            className="
              flex items-center gap-2 sm:gap-3
              px-6 sm:px-8 py-3 sm:py-4
              rounded-full
              bg-red-500 text-white
              hover:bg-red-600
              hover:shadow-lg hover:scale-105
              active:scale-95
              font-medium text-sm sm:text-base
              transition-all duration-300
              shadow-md
            "
            aria-label="End conversation"
          >
            <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>End Conversation</span>
          </button>
        )}
      </div>

      {/* Microphone indicator when active */}
      {isActive && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Microphone active</span>
        </div>
      )}
    </div>
  );
}
