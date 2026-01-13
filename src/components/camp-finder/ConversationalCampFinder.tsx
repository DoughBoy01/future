import { useState, useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import { QuickReplyChips } from './QuickReplyChips';
import { CategorySelectionGrid } from './CategorySelectionGrid';
import { BudgetTierSelector } from './BudgetTierSelector';
import { SpecialNeedsMultiSelect } from './SpecialNeedsMultiSelect';
import { ConversationalResults } from './ConversationalResults';
import { BUDGET_TIERS, DURATION_LABELS } from './types';
import { getRecommendations, saveQuizResponse, generateSessionId } from '../../services/quizService';
import type {
  QuestionState,
  ChatMessage,
  QuizResponses,
  BudgetTier,
  DurationPreference,
  SpecialNeeds,
  ChatSession,
} from './types';
import type { CampWithScore } from '../../services/quizService';

const SESSION_KEY = 'camp_chat_session_v1';
const SESSION_EXPIRY_DAYS = 7;

export function ConversationalCampFinder() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [responses, setResponses] = useState<QuizResponses>({});
  const [currentQuestion, setCurrentQuestion] = useState<QuestionState>('NAME');
  const [isAITyping, setIsAITyping] = useState(false);
  const [sessionId] = useState(generateSessionId());
  const [results, setResults] = useState<CampWithScore[] | null>(null);

  const messageThreadRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Initialize conversation
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;

      // Check for saved session
      const savedSession = loadSession();
      if (savedSession) {
        // Resume saved session
        setMessages(savedSession.messages);
        setResponses(savedSession.responses);
        setCurrentQuestion(savedSession.currentState);
      } else {
        // Start new conversation
        addAIMessage("Hi! I'm your camp advisor. What's your child's first name?");
      }
    }
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messageThreadRef.current) {
      messageThreadRef.current.scrollTo({
        top: messageThreadRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isAITyping]);

  // Save session to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      saveSession();
    }
  }, [messages, responses, currentQuestion]);

  const loadSession = (): ChatSession | null => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (!saved) return null;

      const session: ChatSession = JSON.parse(saved);
      const expiryTime = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      if (Date.now() - session.lastUpdated > expiryTime) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }

      // Convert timestamp strings back to Date objects
      session.messages = session.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));

      return session;
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  };

  const saveSession = () => {
    try {
      const session: ChatSession = {
        sessionId,
        childName: responses.childName,
        currentState: currentQuestion,
        messages,
        responses,
        lastUpdated: Date.now(),
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const addAIMessage = (content: string | React.ReactNode, delay: number = 800) => {
    setIsAITyping(true);

    setTimeout(() => {
      const message: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        role: 'ai',
        content,
        timestamp: new Date(),
        questionType: currentQuestion,
      };

      setMessages((prev) => [...prev, message]);
      setIsAITyping(false);
    }, delay);
  };

  const addUserMessage = (content: string | React.ReactNode, responseValue?: any) => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      questionType: currentQuestion,
      responseValue,
    };

    setMessages((prev) => [...prev, message]);
  };

  const moveToNextQuestion = (nextQuestion: QuestionState) => {
    setCurrentQuestion(nextQuestion);
  };

  // Question handlers
  const handleNameSubmit = (name: string) => {
    const trimmedName = name.trim();

    // Validate name
    if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
      return; // Invalid - ChatInput will show error
    }

    setResponses((prev) => ({ ...prev, childName: trimmedName }));
    addUserMessage(trimmedName, trimmedName);

    // Move to age question
    setTimeout(() => {
      addAIMessage(`Great to meet ${trimmedName}! How old are they?`);
      moveToNextQuestion('AGE');
    }, 600);
  };

  const handleAgeSelect = (age: number) => {
    setResponses((prev) => ({ ...prev, childAge: age }));
    addUserMessage(`${age} years old`, age);

    const childName = responses.childName || 'your child';

    setTimeout(() => {
      addAIMessage(
        `Perfect! What is ${childName} most excited about? Pick up to 3 interests.`
      );
      moveToNextQuestion('INTERESTS');
    }, 600);
  };

  const handleInterestsChange = (categoryIds: string[]) => {
    setResponses((prev) => ({ ...prev, interests: categoryIds }));
  };

  const handleInterestsSubmit = () => {
    if (!responses.interests || responses.interests.length === 0) {
      return; // Need at least one interest
    }

    const childName = responses.childName || 'your child';
    addUserMessage(`${responses.interests.length} interests selected`, responses.interests);

    setTimeout(() => {
      addAIMessage(`What's your budget comfort zone for a week of camp?`);
      moveToNextQuestion('BUDGET');
    }, 600);
  };

  const handleBudgetSelect = (tier: BudgetTier) => {
    setResponses((prev) => ({ ...prev, budgetTier: tier }));
    addUserMessage(BUDGET_TIERS[tier].label, tier);

    const childName = responses.childName || 'your child';

    setTimeout(() => {
      addAIMessage(
        `How long would work best for ${childName}'s schedule this summer?`
      );
      moveToNextQuestion('DURATION');
    }, 600);
  };

  const handleDurationSelect = (duration: DurationPreference) => {
    setResponses((prev) => ({ ...prev, duration }));
    addUserMessage(DURATION_LABELS[duration], duration);

    setTimeout(() => {
      addAIMessage(
        `Last thing - any dietary needs or accessibility requirements I should know about?`
      );
      moveToNextQuestion('SPECIAL_NEEDS');
    }, 600);
  };

  const handleSpecialNeedsChange = (needs: SpecialNeeds) => {
    setResponses((prev) => ({ ...prev, specialNeeds: needs }));
  };

  const handleSpecialNeedsSubmit = () => {
    const hasNeeds =
      (responses.specialNeeds?.dietary?.length || 0) +
        (responses.specialNeeds?.accessibility?.length || 0) >
      0;

    if (hasNeeds) {
      const totalNeeds =
        (responses.specialNeeds?.dietary?.length || 0) +
        (responses.specialNeeds?.accessibility?.length || 0);
      addUserMessage(`${totalNeeds} requirement(s)`, responses.specialNeeds);
    } else {
      addUserMessage('No special requirements', undefined);
    }

    // Move to processing
    moveToNextQuestion('PROCESSING');
    const childName = responses.childName || 'your child';

    setTimeout(() => {
      addAIMessage(
        `Analyzing 200+ camps... matching ${childName}'s interests... 🎯`
      );

      // Fetch recommendations
      fetchRecommendations();
    }, 600);
  };

  const fetchRecommendations = async () => {
    try {
      // Map budget tier to price range
      const budgetRange = responses.budgetTier
        ? {
            min: BUDGET_TIERS[responses.budgetTier].minPrice,
            max: BUDGET_TIERS[responses.budgetTier].maxPrice,
          }
        : undefined;

      // Call quizService
      const recommendations = await getRecommendations({
        childAge: responses.childAge!,
        interests: responses.interests!,
        budgetRange,
        duration: responses.duration,
        specialNeeds: responses.specialNeeds,
      });

      // Save to database
      await saveQuizResponse(
        {
          childAge: responses.childAge!,
          interests: responses.interests!,
          budgetRange,
          duration: responses.duration,
          specialNeeds: responses.specialNeeds,
        },
        recommendations,
        sessionId,
        getDeviceType()
      );

      // Show results
      setResults(recommendations);
      moveToNextQuestion('RESULTS');

      const childName = responses.childName || 'your child';

      setTimeout(() => {
        if (recommendations.length > 0) {
          addAIMessage(
            `I found ${recommendations.length} amazing camps perfect for ${childName}! Here's why each one matches...`
          );
        } else {
          addAIMessage(
            `I couldn't find perfect matches with these exact criteria. Let's adjust your preferences or browse all camps for ${childName}'s age group.`
          );
        }
      }, 2000);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      addAIMessage(
        `I'm having trouble finding matches right now. Please try again in a moment.`
      );
    }
  };

  const getDeviceType = (): string => {
    const width = window.innerWidth;
    if (width < 744) return 'mobile';
    if (width < 1128) return 'tablet';
    return 'desktop';
  };

  const handleStartOver = () => {
    setMessages([]);
    setResponses({});
    setResults(null);
    setCurrentQuestion('NAME');
    localStorage.removeItem(SESSION_KEY);

    setTimeout(() => {
      addAIMessage("Hi! I'm your camp advisor. What's your child's first name?");
    }, 300);
  };

  // Age options (5-18 years old)
  const ageOptions = Array.from({ length: 14 }, (_, i) => ({
    value: i + 5,
    label: `${i + 5} years old`,
  }));

  // Duration options
  const durationOptions: Array<{ value: DurationPreference; label: string }> = [
    { value: 'half-day', label: 'Half-day' },
    { value: 'full-day', label: 'Full-day' },
    { value: 'week', label: 'Week-long' },
    { value: 'multi-week', label: 'Multi-week' },
  ];

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto bg-white">
      {/* Message Thread */}
      <div
        ref={messageThreadRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4"
        role="log"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.map((message) => (
          <ChatMessageComponent key={message.id} message={message} />
        ))}

        {isAITyping && <TypingIndicator />}
      </div>

      {/* Question Input Area - Sticky on mobile */}
      <div className="sticky bottom-0 border-t border-[#DDDDDD] bg-white px-4 sm:px-6 py-4 sm:py-6 shadow-lg sm:shadow-none">
        {currentQuestion === 'NAME' && (
          <ChatInput
            onSubmit={handleNameSubmit}
            placeholder="Enter your child's first name"
            validation={(value) => {
              if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                return 'Please use only letters, spaces, hyphens, and apostrophes';
              }
              return null;
            }}
          />
        )}

        {currentQuestion === 'AGE' && (
          <QuickReplyChips
            options={ageOptions}
            onSelect={(value) => handleAgeSelect(value as number)}
          />
        )}

        {currentQuestion === 'INTERESTS' && (
          <div className="space-y-4">
            <CategorySelectionGrid
              selected={responses.interests || []}
              onSelectionChange={handleInterestsChange}
              maxSelections={3}
            />
            {(responses.interests?.length || 0) > 0 && (
              <button
                onClick={handleInterestsSubmit}
                className="w-full bg-[#fe4d39] text-white py-4 sm:py-3 rounded-full font-bold text-lg sm:text-base hover:bg-[#b13527] active:scale-95 transition-all duration-200 shadow-lg"
                style={{ minHeight: '56px' }}
              >
                Next →
              </button>
            )}
          </div>
        )}

        {currentQuestion === 'BUDGET' && (
          <BudgetTierSelector onSelect={handleBudgetSelect} />
        )}

        {currentQuestion === 'DURATION' && (
          <QuickReplyChips
            options={durationOptions}
            onSelect={(value) => handleDurationSelect(value as DurationPreference)}
          />
        )}

        {currentQuestion === 'SPECIAL_NEEDS' && (
          <div className="space-y-4">
            <SpecialNeedsMultiSelect
              value={responses.specialNeeds || { dietary: undefined, accessibility: undefined }}
              onChange={handleSpecialNeedsChange}
            />
            <button
              onClick={handleSpecialNeedsSubmit}
              className="w-full bg-[#fe4d39] text-white py-4 sm:py-3 rounded-full font-bold text-lg sm:text-base hover:bg-[#b13527] active:scale-95 transition-all duration-200 shadow-lg"
              style={{ minHeight: '56px' }}
            >
              Next →
            </button>
          </div>
        )}

        {currentQuestion === 'RESULTS' && results && (
          <ConversationalResults
            results={results}
            childName={responses.childName || 'your child'}
            onStartOver={handleStartOver}
          />
        )}
      </div>
    </div>
  );
}
