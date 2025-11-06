import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useVapi } from '../hooks/useVapi';
import { VapiOrb } from '../components/vapi/VapiOrb';
import { ConversationControls } from '../components/vapi/ConversationControls';
import { Sparkles, Shield, Heart } from 'lucide-react';

export function TalkToAdvisorPage() {
  const { t } = useTranslation('advisor');
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
        <title>{t('page.title')} | Future Impact</title>
        <meta
          name="description"
          content={t('page.subtitle')}
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-8 sm:pb-12">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#222222] mb-3 sm:mb-4">
              {t('page.title')}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-[#717171] max-w-2xl mx-auto">
              {t('page.subtitle')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FFE8EA] rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF385C]" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-[#222222] mb-1 sm:mb-2">
                {t('page.feature_1_title')}
              </h3>
              <p className="text-xs sm:text-sm text-[#717171]">
                {t('page.feature_1_description')}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FFE8EA] rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF385C]" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-[#222222] mb-1 sm:mb-2">
                {t('page.feature_2_title')}
              </h3>
              <p className="text-xs sm:text-sm text-[#717171]">
                {t('page.feature_2_description')}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FFE8EA] rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF385C]" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-[#222222] mb-1 sm:mb-2">
                {t('page.feature_3_title')}
              </h3>
              <p className="text-xs sm:text-sm text-[#717171]">
                {t('page.feature_3_description')}
              </p>
            </div>
          </div>
        </div>

        {/* Main Conversation Area */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 lg:p-12">
            {/* Orb Container */}
            <div className="flex justify-center mb-8 sm:mb-12">
              <VapiOrb state={orbState} size="large" />
            </div>

            {/* Controls */}
            <ConversationControls
              callStatus={callStatus}
              isMicrophonePermissionGranted={isMicrophonePermissionGranted}
              onStart={startCall}
              onStop={stopCall}
              error={error}
            />

            {/* Transcript (optional - can be shown/hidden) */}
            {transcript.length > 0 && (
              <div className="mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-[#222222] mb-4 sm:mb-6">
                  {t('page.conversation_title')}
                </h2>
                <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-96 overflow-y-auto scrollbar-hide">
                  {transcript.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3
                          ${
                            message.role === 'user'
                              ? 'bg-[#FF385C] text-white'
                              : 'bg-gray-100 text-[#222222]'
                          }
                        `}
                      >
                        <p className="text-xs sm:text-sm font-medium mb-1 opacity-75">
                          {message.role === 'user' ? t('controls.you') : t('controls.ai_advisor')}
                        </p>
                        <p className="text-sm sm:text-base">{message.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-[#717171]">
              {t('page.privacy_notice')}
            </p>
          </div>
        </div>

        {/* How it Works Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
          <div className="bg-gradient-to-br from-[#FFE8EA] to-[#FFC4CC] rounded-2xl p-6 sm:p-8 lg:p-10">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#222222] mb-4 sm:mb-6 text-center">
              {t('page.how_it_works_title')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 font-bold text-[#FF385C] text-lg sm:text-xl shadow-sm">
                  1
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-[#222222] mb-2">
                  {t('page.step_1_title')}
                </h3>
                <p className="text-xs sm:text-sm text-[#717171]">
                  {t('page.step_1_description')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 font-bold text-[#FF385C] text-lg sm:text-xl shadow-sm">
                  2
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-[#222222] mb-2">
                  {t('page.step_2_title')}
                </h3>
                <p className="text-xs sm:text-sm text-[#717171]">
                  {t('page.step_2_description')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 font-bold text-[#FF385C] text-lg sm:text-xl shadow-sm">
                  3
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-[#222222] mb-2">
                  {t('page.step_3_title')}
                </h3>
                <p className="text-xs sm:text-sm text-[#717171]">
                  {t('page.step_3_description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
