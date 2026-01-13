import { Sparkles } from 'lucide-react';

interface TypingIndicatorProps {
  showAvatar?: boolean;
}

export function TypingIndicator({ showAvatar = true }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 mb-4 animate-slide-in-left">
      {/* AI Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#fe4d39] to-[#ff6b5c] flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      {/* Typing bubble */}
      <div className="bg-[#F7F7F7] rounded-2xl rounded-tl-sm shadow-sm px-4 py-3 flex gap-1">
        <div
          className="w-2 h-2 rounded-full bg-[#717171] animate-typing-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="w-2 h-2 rounded-full bg-[#717171] animate-typing-bounce"
          style={{ animationDelay: '200ms' }}
        />
        <div
          className="w-2 h-2 rounded-full bg-[#717171] animate-typing-bounce"
          style={{ animationDelay: '400ms' }}
        />
      </div>
    </div>
  );
}
