import { useEffect, useRef, useState, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import type {
  OrbState,
  CallStatus,
  TranscriptMessage,
  VapiMessage,
  VapiError,
  AssistantConfig
} from '../types/vapi';

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;

export function useVapi() {
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

    const assistantConfig: AssistantConfig = {
      model: {
        provider: 'openai',
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a warm, knowledgeable camp advisor helping parents find the perfect summer camp experience for their children.

Your role is to:
- Be conversational, friendly, and genuinely helpful
- Ask thoughtful questions about the child's age, interests, and preferences
- Understand what the parents are looking for (educational focus, adventure, arts, sports, etc.)
- Provide personalized recommendations based on their needs
- Share relevant details about camp features, safety, and benefits
- Answer questions with warmth and expertise

Keep responses concise and conversational - aim for 2-3 sentences per response. Ask one question at a time to avoid overwhelming parents. Use a warm, supportive tone as if you're a trusted friend helping them make this important decision.`,
          },
        ],
        temperature: 0.7,
      },
      voice: {
        provider: '11labs',
        voiceId: 'sarah', // Warm, friendly female voice
      },
      firstMessage: "Hi there! I'm so glad you're here. I'd love to help you find the perfect camp for your child. To get started, could you tell me a bit about your child - maybe their age and what they're most interested in?",
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        language: 'en',
      },
      name: 'Camp Advisor',
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
  }, []);

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
