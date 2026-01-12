import { Helmet } from 'react-helmet-async';
import { useVapi } from '../hooks/useVapi';
import { VapiOrb } from '../components/vapi/VapiOrb';
import { ConversationControls } from '../components/vapi/ConversationControls';
import { Sparkles } from 'lucide-react';

export function TalkToAdvisorPage() {
  const {
    callStatus,
    orbState,
    transcript,
    error,
    isMicrophonePermissionGranted,
    startCall,
    stopCall,
  } = useVapi();

  return (
    <>
      <Helmet>
        <title>Talk to Our AI Advisor | Future Impact</title>
        <meta
          name="description"
          content="Have a conversation with our AI advisor to find the perfect summer camp for your child. Get personalized recommendations based on your child's interests and needs."
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Main Content - Mobile First */}
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-8 sm:pt-12 sm:pb-16">

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-[#222222] mb-2 sm:mb-3">
              Talk to Our AI Advisor
            </h1>
            <p className="text-base sm:text-lg text-[#717171]">
              Have a conversation to find the perfect camp
            </p>
          </div>

          {/* Call Interface - Primary Focus */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100 p-6 sm:p-10 mb-6">
            {/* Orb - Main Visual Element */}
            <div className="flex justify-center mb-8 sm:mb-12">
              <VapiOrb state={orbState} size="large" />
            </div>

            {/* Controls - Primary Action */}
            <ConversationControls
              callStatus={callStatus}
              isMicrophonePermissionGranted={isMicrophonePermissionGranted}
              onStart={startCall}
              onStop={stopCall}
              error={error}
            />

            {/* Transcript */}
            {transcript.length > 0 && (
              <div className="mt-8 sm:mt-10 pt-8 sm:pt-10 border-t border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-[#222222] mb-4">
                  Conversation
                </h2>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {transcript.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-3
                          ${
                            message.role === 'user'
                              ? 'bg-[#FF385C] text-white'
                              : 'bg-[#F7F7F7] text-[#222222]'
                          }
                        `}
                      >
                        <p className="text-xs font-medium mb-1 opacity-75">
                          {message.role === 'user' ? 'You' : 'AI Advisor'}
                        </p>
                        <p className="text-sm sm:text-base leading-relaxed">{message.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Single Info Card */}
          <div className="bg-gradient-to-br from-[#FFE8EA] to-[#FFC4CC] rounded-xl sm:rounded-2xl p-5 sm:p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="w-6 h-6 text-[#FF385C]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base sm:text-lg text-[#222222] mb-1">
                  AI-Powered Recommendations
                </h3>
                <p className="text-sm sm:text-base text-[#717171] leading-relaxed">
                  Share your child's interests and get personalized camp suggestions through natural conversation
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <p className="text-xs sm:text-sm text-[#717171] text-center">
            Your conversation is private and secure
          </p>
        </div>
      </div>
    </>
  );
}
