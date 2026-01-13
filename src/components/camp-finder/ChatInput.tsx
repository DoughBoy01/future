import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSubmit: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  validation?: (value: string) => string | null;
}

export function ChatInput({
  onSubmit,
  placeholder = 'Type your answer...',
  autoFocus = true,
  maxLength = 50,
  minLength = 2,
  validation,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      // Small delay to ensure smooth focus
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autoFocus]);

  const validateInput = (input: string): string | null => {
    const trimmed = input.trim();

    if (trimmed.length === 0) {
      return 'Please enter a value';
    }

    if (trimmed.length < minLength) {
      return `Please enter at least ${minLength} characters`;
    }

    if (trimmed.length > maxLength) {
      return `Maximum ${maxLength} characters allowed`;
    }

    // Custom validation if provided
    if (validation) {
      return validation(trimmed);
    }

    return null;
  };

  const handleSubmit = () => {
    const validationError = validateInput(value);

    if (validationError) {
      setError(validationError);
      return;
    }

    onSubmit(value.trim());
    setValue('');
    setError(null);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`
              w-full px-5 py-3 rounded-full
              border-2 bg-[#F7F7F7]
              text-base text-[#222222]
              transition-all duration-200
              focus:outline-none focus:bg-white focus:shadow-md
              ${
                error
                  ? 'border-[#C13515] focus:border-[#C13515]'
                  : 'border-[#DDDDDD] focus:border-[#fe4d39]'
              }
            `}
            aria-label={placeholder}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'input-error' : undefined}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={value.trim().length === 0}
          className={`
            w-11 h-11 rounded-full flex items-center justify-center
            transition-all duration-200
            ${
              value.trim().length === 0
                ? 'bg-[#DDDDDD] cursor-not-allowed'
                : 'bg-[#fe4d39] hover:bg-[#b13527] hover:scale-110 active:scale-95 shadow-md'
            }
          `}
          aria-label="Send message"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div
          id="input-error"
          role="alert"
          aria-live="assertive"
          className="text-sm text-[#C13515] px-5 animate-slide-in-left"
        >
          {error}
        </div>
      )}

      {/* Character count */}
      {value.length > 0 && (
        <div className="text-xs text-[#717171] px-5 text-right">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
}
