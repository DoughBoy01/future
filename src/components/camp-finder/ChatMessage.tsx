import { Sparkles } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from './types';

interface ChatMessageProps {
  message: ChatMessageType;
  showAvatar?: boolean;
  animate?: boolean;
}

export function ChatMessage({
  message,
  showAvatar = true,
  animate = true,
}: ChatMessageProps) {
  const isAI = message.role === 'ai';

  return (
    <div
      className={`
        flex gap-3 mb-4
        ${isAI ? 'justify-start' : 'justify-end'}
        ${animate ? (isAI ? 'animate-slide-in-left' : 'animate-slide-in-right') : ''}
      `}
    >
      {/* AI Avatar (left side) */}
      {isAI && showAvatar && (
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#fe4d39] to-[#ff6b5c] flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`
          max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl
          ${
            isAI
              ? 'bg-[#F7F7F7] text-[#222222] rounded-tl-sm shadow-sm'
              : 'bg-[#fe4d39] text-white rounded-tr-sm shadow-md'
          }
        `}
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        {typeof message.content === 'string' ? (
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          message.content
        )}

        {/* Optional timestamp */}
        {message.timestamp && (
          <div
            className={`
              text-xs mt-1
              ${isAI ? 'text-[#717171]' : 'text-white/70'}
            `}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>

      {/* Spacer for alignment when no avatar */}
      {!isAI && <div className="w-9 flex-shrink-0" />}
    </div>
  );
}
