import { Mic, MicOff, Phone, PhoneOff, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('advisor');
  const isActive = callStatus === 'active';
  const isConnecting = callStatus === 'connecting';
  const isDisabled = isConnecting;

  const getStatusText = () => {
    switch (callStatus) {
      case 'connecting':
        return t('controls.status_connecting');
      case 'active':
        return t('controls.status_active');
      case 'ended':
        return t('controls.status_ended');
      case 'error':
        return t('controls.status_error');
      default:
        return t('controls.status_ready');
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
            {t('controls.hint_active')}
          </p>
        )}
      </div>

      {/* Microphone permission warning */}
      {isMicrophonePermissionGranted === false && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 max-w-md">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
          <p className="text-xs sm:text-sm text-amber-800">
            {t('controls.warning_microphone_permission')}
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
                  : 'bg-[#FF385C] text-white hover:bg-[#E31C5F] hover:shadow-lg hover:scale-105 active:scale-95'
              }
              shadow-md
            `}
            aria-label="Start conversation"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t('controls.button_connecting')}</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{t('controls.button_start')}</span>
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
            <span>{t('controls.button_stop')}</span>
          </button>
        )}
      </div>

      {/* Microphone indicator when active */}
      {isActive && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>{t('controls.hint_microphone_active')}</span>
        </div>
      )}
    </div>
  );
}
