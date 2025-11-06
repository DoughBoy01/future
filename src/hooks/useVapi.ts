import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Vapi from '@vapi-ai/web';
import type {
  OrbState,
  CallStatus,
  TranscriptMessage,
  VapiMessage,
  VapiError,
  AssistantConfig
} from '../types/vapi';
import { getVapiLanguageConfig } from '../config/vapi-languages';

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;

export function useVapi() {
  const { t, i18n } = useTranslation('advisor');
  const vapiRef = useRef<Vapi | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>('inactive');
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isMicrophonePermissionGranted, setIsMicrophonePermissionGranted] = useState<boolean | null>(null);

  // Initialize Vapi client
  useEffect(() => {
    if (!VAPI_PUBLIC_KEY) {
      console.error('VITE_VAPI_PUBLIC_KEY is not set in environment variables');
      setError('Vapi configuration error. Please contact support.');
      return;
    }

    vapiRef.current = new Vapi(VAPI_PUBLIC_KEY);

    // Set up event listeners
    const vapi = vapiRef.current;

    vapi.on('call-start', () => {
      console.log('Call started');
      setCallStatus('active');
      setOrbState('listening');
      setError(null);
    });

    vapi.on('call-end', () => {
      console.log('Call ended');
      setCallStatus('ended');
      setOrbState('idle');
    });

    vapi.on('speech-start', () => {
      console.log('User started speaking');
      setOrbState('listening');
    });

    vapi.on('speech-end', () => {
      console.log('User stopped speaking');
      setOrbState('thinking');
    });

    vapi.on('message', (message: VapiMessage) => {
      console.log('Message received:', message);

      // Handle assistant speaking
      if (message.type === 'speech-start') {
        setOrbState('speaking');
      }

      if (message.type === 'speech-end') {
        setOrbState('listening');
      }

      // Handle transcripts
      if (message.type === 'transcript' && message.transcript) {
        const newMessage: TranscriptMessage = {
          role: message.role || 'assistant',
          text: message.transcript,
          timestamp: Date.now(),
        };
        setTranscript((prev) => [...prev, newMessage]);
      }
    });

    vapi.on('error', (error: VapiError) => {
      console.error('Vapi error:', error);
      setCallStatus('error');
      setOrbState('error');
      setError(error.error?.message || 'An error occurred during the conversation');
    });

    // Cleanup on unmount
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  // Check microphone permission
  const checkMicrophonePermission = useCallback(async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setIsMicrophonePermissionGranted(result.state === 'granted');

      result.addEventListener('change', () => {
        setIsMicrophonePermissionGranted(result.state === 'granted');
      });
    } catch (err) {
      console.warn('Could not check microphone permission:', err);
      // Assume permission will be requested on call start
      setIsMicrophonePermissionGranted(null);
    }
  }, []);

  useEffect(() => {
    checkMicrophonePermission();
  }, [checkMicrophonePermission]);

  // Start conversation
  const startCall = useCallback(async () => {
    if (!vapiRef.current) {
      setError('Vapi client not initialized');
      return;
    }

    setCallStatus('connecting');
    setOrbState('thinking');
    setTranscript([]);
    setError(null);

    // Get language-specific configuration
    const currentLanguage = i18n.language || 'en';
    const languageConfig = getVapiLanguageConfig(currentLanguage);

    const assistantConfig: AssistantConfig = {
      model: {
        provider: 'openai',
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: t('system_prompt'),
          },
        ],
        temperature: 0.7,
      },
      voice: {
        provider: '11labs',
        voiceId: languageConfig.elevenLabsVoiceId,
      },
      firstMessage: t('first_message'),
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        language: languageConfig.deepgramCode,
      },
      name: t('advisor_name'),
      // Placeholder for future database function calling
      // functions: [
      //   {
      //     name: 'searchCamps',
      //     description: 'Search for camps based on criteria like age, interests, location, and dates',
      //     parameters: {
      //       type: 'object',
      //       properties: {
      //         age: { type: 'number' },
      //         interests: { type: 'array', items: { type: 'string' } },
      //         location: { type: 'string' },
      //       },
      //     },
      //   },
      // ],
    };

    try {
      await vapiRef.current.start(assistantConfig);
    } catch (err) {
      console.error('Failed to start call:', err);
      setCallStatus('error');
      setOrbState('error');
      setError('Failed to start conversation. Please check your microphone permissions and try again.');
    }
  }, [t, i18n.language]);

  // Stop conversation
  const stopCall = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      setCallStatus('ended');
      setOrbState('idle');
    }
  }, []);

  return {
    callStatus,
    orbState,
    transcript,
    error,
    isMicrophonePermissionGranted,
    startCall,
    stopCall,
  };
}
