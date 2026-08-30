import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, RefreshCw, Volume2, Languages } from 'lucide-react';
import { LanguageInfo, ProficiencyLevel, Scenario, MessageTurn, TurnFeedback, PartnerSettings, VocabularyItem } from '../types';
import { RollingTranscript } from './RollingTranscript';
import { FeedbackPanel } from './FeedbackPanel';

interface TextChatFallbackProps {
  language: LanguageInfo;
  level: ProficiencyLevel;
  scenario: Scenario;
  settings: PartnerSettings;
  onWordClick: (word: string, sentence: string) => void;
  onSaveWord: (item: VocabularyItem) => void;
  onSessionComplete?: (speakingSeconds: number, turnsCount: number) => void;
}

export const TextChatFallback: React.FC<TextChatFallbackProps> = ({
  language,
  level,
  scenario,
  settings,
  onWordClick,
  onSaveWord,
}) => {
  const [messages, setMessages] = useState<MessageTurn[]>(() => [
    {
      id: `turn_${Date.now()}`,
      role: 'model',
      text: scenario.starterPrompt || language.greeting,
      timestamp: Date.now(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState<TurnFeedback | null>(null);
  const [analyzingFeedback, setAnalyzingFeedback] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported in browser
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language.code;

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputMessage(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language.code]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. You can type your message!');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.lang = language.code;
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage.trim();
    if (!textToSend || loading) return;

    const userTurn: MessageTurn = {
      id: `turn_${Date.now()}_user`,
      role: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userTurn];
    setMessages(newHistory);
    setInputMessage('');
    setLoading(true);
    setAnalyzingFeedback(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, text: m.text })),
          targetLanguage: language.name,
          nativeLanguage: settings.nativeLanguage,
          level,
          scenario,
          partnerPersona: settings.partnerPersona,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const modelTurn: MessageTurn = {
          id: `turn_${Date.now()}_model`,
          role: 'model',
          text: data.replyText,
          translation: data.translation,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, modelTurn]);

        // Set feedback
        setActiveFeedback({
          praise: data.praise,
          fluencyScore: data.fluencyScore,
          corrections: data.corrections || [],
          betterAlternatives: data.betterAlternatives || [],
          vocabularyUsed: [],
          suggestedReplies: data.suggestedReplies || [],
        });

        // Automatically play TTS if audio is available
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(data.replyText);
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
      setAnalyzingFeedback(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="text-chat-view">
      {/* Left Chat Column (8 cols) */}
      <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col h-[700px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{language.flag}</span>
              <h2 className="text-lg font-bold text-stone-900 font-display">{scenario.title}</h2>
            </div>
            <p className="text-xs text-stone-500">
              Partner: <span className="font-semibold text-stone-700">{scenario.partnerRole}</span>
            </p>
          </div>
          <button
            onClick={() => {
              setMessages([
                {
                  id: `turn_${Date.now()}`,
                  role: 'model',
                  text: scenario.starterPrompt || language.greeting,
                  timestamp: Date.now(),
                },
              ]);
              setActiveFeedback(null);
            }}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            title="Reset conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Transcript */}
        <div className="flex-1 overflow-y-auto py-4">
          <RollingTranscript
            messages={messages}
            onWordClick={onWordClick}
            targetLanguage={language.name}
            autoTranslate={settings.autoTranslate}
          />
          {loading && (
            <div className="flex items-center gap-2 p-3 text-stone-400 text-xs italic">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Partner is crafting response in {language.name}...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-stone-100 shrink-0 space-y-2">
          {/* Quick starter replies */}
          {scenario.suggestedPhrases && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-[10px] text-stone-400 uppercase font-semibold shrink-0">Try:</span>
              {scenario.suggestedPhrases.slice(0, 3).map((phrase, i) => (
                <button
                  key={i}
                  onClick={() => setInputMessage(phrase)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 rounded-full text-xs shrink-0 transition-colors truncate max-w-xs"
                >
                  "{phrase}"
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-2xl transition-all ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
              title={isRecording ? 'Stop recording voice' : 'Click to speak via microphone'}
              id="chat-mic-btn"
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Write in ${language.name}...`}
              className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-stone-400"
              id="chat-text-input"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || loading}
              className="px-5 py-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-30 text-white font-semibold rounded-2xl text-sm transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              id="chat-send-btn"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Instant Feedback & Grammar Coach (4 cols) */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <FeedbackPanel
          feedback={activeFeedback}
          isLoading={analyzingFeedback}
          onSelectWord={(word) => onWordClick(word, '')}
          onSaveWord={onSaveWord}
          onUseSuggestion={(sugg) => handleSendMessage(sugg)}
        />
      </div>
    </div>
  );
};
