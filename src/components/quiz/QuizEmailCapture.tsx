import { useState } from 'react';
import { X, Mail, Loader2, CheckCircle } from 'lucide-react';
import { updateQuizResponseEmail } from '../../services/quizService';

interface QuizEmailCaptureProps {
  sessionId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuizEmailCapture({ sessionId, onClose, onSuccess }: QuizEmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateQuizResponseEmail(sessionId, email);

      if (!result.success) {
        throw new Error('Failed to save email');
      }

      setSuccess(true);

      // Show success state for 2 seconds before calling onSuccess
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error('Error saving email:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success State
  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center space-y-4 animate-scale-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-airbnb-grey-900">All set!</h3>
          <p className="text-airbnb-grey-600">
            We've sent your personalized camp recommendations to <strong>{email}</strong>
          </p>
        </div>
      </div>
    );
  }

  // Form State
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-airbnb-grey-900 mb-2">
              Save Your Results
            </h3>
            <p className="text-sm text-airbnb-grey-600">
              We'll email you these camp recommendations
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-airbnb-grey-100 transition-colors focus:outline-none focus:ring-2 focus:ring-airbnb-pink-600"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-airbnb-grey-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (Optional) */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-airbnb-grey-900 mb-2">
              Your Name <span className="text-airbnb-grey-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sarah Johnson"
              className="w-full px-4 py-3 rounded-lg border-2 border-airbnb-grey-300 focus:border-airbnb-pink-600 focus:ring-2 focus:ring-airbnb-pink-200 transition-all outline-none"
            />
          </div>

          {/* Email Field (Required) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-airbnb-grey-900 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-airbnb-grey-500" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-airbnb-grey-300 focus:border-airbnb-pink-600 focus:ring-2 focus:ring-airbnb-pink-200 transition-all outline-none"
                aria-invalid={!!error}
                aria-describedby={error ? 'email-error' : undefined}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div id="email-error" className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Privacy Promise:</strong> We'll only use your email to send these results.
              No spam, ever. You can unsubscribe anytime.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full py-3 px-6 rounded-lg font-bold text-white transition-all shadow-md
              ${
                isSubmitting
                  ? 'bg-airbnb-grey-400 cursor-not-allowed'
                  : 'bg-airbnb-pink-600 hover:bg-airbnb-pink-700 hover:shadow-lg hover:scale-102 focus:outline-none focus:ring-2 focus:ring-airbnb-pink-600 focus:ring-offset-2'
              }
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </span>
            ) : (
              'Email My Results'
            )}
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-6 rounded-lg font-medium text-airbnb-grey-700 hover:bg-airbnb-grey-100 transition-all focus:outline-none focus:ring-2 focus:ring-airbnb-grey-400 focus:ring-offset-2"
          >
            Maybe Later
          </button>
        </form>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
