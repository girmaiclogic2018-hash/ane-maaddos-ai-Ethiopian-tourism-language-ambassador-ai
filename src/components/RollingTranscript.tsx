import React, { useState } from 'react';
import { MessageTurn } from '../types';
import { Volume2, Sparkles, Languages, Check, Copy } from 'lucide-react';

interface RollingTranscriptProps {
  messages: MessageTurn[];
  onWordClick: (word: string, sentence: string) => void;
  onAnalyzeTurn?: (message: MessageTurn) => void;
  targetLanguage: string;
  autoTranslate?: boolean;
}

export const RollingTranscript: React.FC<RollingTranscriptProps> = ({
  messages,
  onWordClick,
  onAnalyzeTurn,
  targetLanguage,
  autoTranslate = false,
}) => {
  const [revealedTranslations, setRevealedTranslations] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleTranslation = (id: string) => {
    setRevealedTranslations((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Helper to make words clickable
  const renderInteractiveText = (text: string, isModel: boolean) => {
    // Split by words while keeping punctuation
    const words = text.split(/(\s+|[.,!?;:()"])/);
    return words.map((token, index) => {
      const cleanWord = token.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜàèìòùÀÈÌÒÙäöüÄÖÜßぁ-んァ-ヶ一-龯가-힣]/g, '');
      if (cleanWord.length > 1) {
        return (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              onWordClick(cleanWord, text);
            }}
            className="cursor-pointer hover:bg-amber-200 hover:text-stone-900 rounded px-0.5 transition-colors underline decoration-stone-300/60 hover:decoration-amber-500 underline-offset-2"
            title="Click word to view translation & definition"
          >
            {token}
          </span>
        );
      }
      return <span key={index}>{token}</span>;
    });
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[260px] text-center p-6 text-stone-400" id="empty-transcript">
        <Languages className="w-10 h-10 mb-2 stroke-1 text-stone-300" />
        <p className="text-sm font-medium text-stone-600">No conversation yet</p>
        <p className="text-xs text-stone-400 max-w-xs mt-1">
          Start the call or send a message to begin practice in {targetLanguage}. Tap any word anytime to open the dictionary.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2 sm:p-4 overflow-y-auto max-h-[500px]" id="rolling-transcript-container">
      {messages.map((msg) => {
        const isModel = msg.role === 'model';
        const isSystem = msg.role === 'system';
        const isTranslationVisible = autoTranslate || revealedTranslations[msg.id];

        if (isSystem) {
          return (
            <div key={msg.id} className="text-center my-2">
              <span className="px-3 py-1 bg-stone-100 text-stone-600 text-[11px] font-medium rounded-full border border-stone-200">
                {msg.text}
              </span>
            </div>
          );
        }

        return (
          <div
            key={msg.id}
            className={`flex flex-col ${isModel ? 'items-start' : 'items-end'} group`}
            id={`transcript-turn-${msg.id}`}
          >
            {/* Speaker Name / Tag */}
            <div className="flex items-center gap-2 mb-1 px-1 text-[11px] font-semibold text-stone-500">
              <span>{isModel ? 'AI Partner' : 'You'}</span>
              <span className="text-stone-300">•</span>
              <span className="font-normal text-stone-400">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm transition-all ${
                isModel
                  ? 'bg-white border border-stone-200/90 text-stone-800 rounded-tl-sm'
                  : 'bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-tr-sm'
              }`}
            >
              <div className={`text-base font-normal ${isModel ? 'text-stone-900' : 'text-white'}`}>
                {renderInteractiveText(msg.text, isModel)}
              </div>

              {/* Optional Translation */}
              {msg.translation && isTranslationVisible && (
                <div
                  className={`mt-2.5 pt-2 border-t text-xs italic ${
                    isModel
                      ? 'border-stone-100 text-stone-500'
                      : 'border-white/20 text-amber-50'
                  }`}
                >
                  "{msg.translation}"
                </div>
              )}

              {/* Action Toolbar */}
              <div
                className={`flex items-center justify-between gap-3 mt-3 pt-2 border-t text-xs ${
                  isModel ? 'border-stone-100 text-stone-400' : 'border-white/20 text-white/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSpeak(msg.text)}
                    className="p-1 rounded hover:bg-black/5 transition-colors"
                    title="Speak text aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="p-1 rounded hover:bg-black/5 transition-colors"
                    title="Copy text"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {msg.translation && (
                    <button
                      onClick={() => toggleTranslation(msg.id)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] hover:bg-black/5 transition-colors"
                    >
                      <Languages className="w-3 h-3" />
                      <span>{isTranslationVisible ? 'Hide translation' : 'Translate'}</span>
                    </button>
                  )}
                </div>

                {!isModel && onAnalyzeTurn && (
                  <button
                    onClick={() => onAnalyzeTurn(msg)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                      isModel
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                    title="Get grammar and vocabulary feedback on this turn"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Review Grammar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
