import { useEffect, useRef, useState, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import type {
  OrbState,
  CallStatus,
  TranscriptMessage,
  VapiMessage,
  VapiError
} from '../types/vapi';

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID;

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

    if (!VAPI_ASSISTANT_ID) {
      console.error('VITE_VAPI_ASSISTANT_ID is not set in environment variables');
      setError('Vapi assistant ID not configured. Please contact support.');
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
        vapiRef.current.removeAllListeners();
        vapiRef.current.stop();
      }
    };
  }, []);

  // Check microphone permission
  const checkMicrophonePermission = useCallback(async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setIsMicrophonePermissionGranted(result.state === 'granted');

      const permissionChangeHandler = () => {
        setIsMicrophonePermissionGranted(result.state === 'granted');
      };

      result.addEventListener('change', permissionChangeHandler);

      // Return cleanup function
      return () => {
        result.removeEventListener('change', permissionChangeHandler);
      };
    } catch (err) {
      console.warn('Could not check microphone permission:', err);
      // Assume permission will be requested on call start
      setIsMicrophonePermissionGranted(null);
      return undefined;
    }
  }, []);

  useEffect(() => {
    const cleanup = checkMicrophonePermission();
    return () => {
      cleanup?.then(fn => fn?.());
    };
  }, [checkMicrophonePermission]);

  // Start conversation
  const startCall = useCallback(async () => {
    if (!vapiRef.current) {
      setError('Vapi client not initialized');
      return;
    }

    if (!VAPI_ASSISTANT_ID) {
      setError('Vapi assistant ID not configured');
      console.error('VITE_VAPI_ASSISTANT_ID is not set in environment variables');
      return;
    }

    setCallStatus('connecting');
    setOrbState('thinking');
    setTranscript([]);
    setError(null);

    try {
      await vapiRef.current.start(VAPI_ASSISTANT_ID);
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
