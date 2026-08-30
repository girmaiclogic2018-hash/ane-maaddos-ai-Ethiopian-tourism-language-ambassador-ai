import React, { useState } from 'react';
import { VocabularyItem } from '../types';
import {
  Bookmark,
  Volume2,
  Trash2,
  Search,
  BookOpen,
  RotateCw,
  CheckCircle,
  XCircle,
  Sparkles,
  Layers,
} from 'lucide-react';

interface VocabularyDeckProps {
  savedWords: VocabularyItem[];
  onDeleteWord: (id: string) => void;
  onUpdateMastery: (id: string, newLevel: number) => void;
  targetLanguageName: string;
  onWordClick: (word: string, context: string) => void;
}

export const VocabularyDeck: React.FC<VocabularyDeckProps> = ({
  savedWords,
  onDeleteWord,
  onUpdateMastery,
  targetLanguageName,
  onWordClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<'list' | 'flashcards'>('list');

  // Flashcard state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const filteredWords = savedWords.filter(
    (w) =>
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.translation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const currentCard = filteredWords[cardIndex] || null;

  const handleNextCard = (mastered: boolean) => {
    if (currentCard) {
      const currentLevel = currentCard.masteryLevel || 1;
      const nextLevel = mastered ? Math.min(5, currentLevel + 1) : Math.max(1, currentLevel - 1);
      onUpdateMastery(currentCard.id, nextLevel);
    }
    setIsFlipped(false);
    if (cardIndex < filteredWords.length - 1) {
      setCardIndex((prev) => prev + 1);
    } else {
      setCardIndex(0);
    }
  };

  return (
    <div className="space-y-6" id="vocabulary-deck-view">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-stone-900 font-display">
              Saved Vocabulary & Flashcards
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Review words saved during live conversations with your AI partner in {targetLanguageName}. ({savedWords.length} total)
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center p-1 bg-stone-100 rounded-2xl shrink-0">
          <button
            onClick={() => setMode('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'list'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Word List
          </button>
          <button
            onClick={() => {
              setMode('flashcards');
              setCardIndex(0);
              setIsFlipped(false);
            }}
            disabled={filteredWords.length === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 ${
              mode === 'flashcards'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Practice Deck</span>
          </button>
        </div>
      </div>

      {/* FLASHCARD MODE */}
      {mode === 'flashcards' && currentCard && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-xs text-stone-500 px-2 font-medium">
            <span>
              Card {cardIndex + 1} of {filteredWords.length}
            </span>
            <span>Mastery Level: {currentCard.masteryLevel || 1} / 5 ⭐</span>
          </div>

          {/* Flip Card */}
          <div
            onClick={() => setIsFlipped((prev) => !prev)}
            className="cursor-pointer min-h-[300px] bg-white rounded-3xl border-2 border-amber-200/80 hover:border-amber-300 shadow-xl p-8 flex flex-col justify-between text-center transition-all duration-300 transform"
          >
            <div className="flex justify-end">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md">
                {isFlipped ? 'Translation' : currentCard.partOfSpeech}
              </span>
            </div>

            <div className="py-8">
              {!isFlipped ? (
                <div className="space-y-2">
                  <h3 className="text-3xl sm:text-4xl font-bold text-stone-900 font-display">
                    {currentCard.word}
                  </h3>
                  {currentCard.phonetic && (
                    <p className="text-sm font-mono text-stone-400">/{currentCard.phonetic}/</p>
                  )}
                  <p className="text-xs text-stone-400 mt-4 flex items-center justify-center gap-1">
                    <RotateCw className="w-3 h-3" /> Tap card to reveal translation
                  </p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-2xl sm:text-3xl font-bold text-stone-900">
                    {currentCard.translation}
                  </h3>
                  {currentCard.exampleSentence && (
                    <div className="p-4 bg-amber-50 rounded-2xl text-xs text-stone-800 italic">
                      "{currentCard.exampleSentence}"
                      {currentCard.exampleTranslation && (
                        <p className="text-stone-500 not-italic mt-1">"{currentCard.exampleTranslation}"</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak(currentCard.word);
                }}
                className="p-3 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-full transition-colors"
                title="Speak word"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Flashcard Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleNextCard(false)}
              className="flex-1 max-w-xs py-3.5 px-6 bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 border border-stone-200"
            >
              <XCircle className="w-4 h-4 text-red-500" />
              <span>Still Learning</span>
            </button>

            <button
              onClick={() => handleNextCard(true)}
              className="flex-1 max-w-xs py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>I Know This</span>
            </button>
          </div>
        </div>
      )}

      {/* WORD LIST MODE */}
      {mode === 'list' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved vocabulary..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {filteredWords.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-400 space-y-2">
              <BookOpen className="w-10 h-10 stroke-1 mx-auto text-stone-300" />
              <p className="text-sm font-semibold text-stone-700">No vocabulary words saved yet</p>
              <p className="text-xs max-w-sm mx-auto">
                During your voice or text conversations, click any word in the transcript or tutor feedback to inspect its definition and save it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWords.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-amber-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4
                          onClick={() => onWordClick(item.word, item.exampleSentence)}
                          className="text-base font-bold text-stone-900 font-display hover:text-amber-600 cursor-pointer transition-colors"
                        >
                          {item.word}
                        </h4>
                        <button
                          onClick={() => handleSpeak(item.word)}
                          className="p-1 text-stone-400 hover:text-stone-700"
                          title="Listen"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-semibold rounded">
                        {item.partOfSpeech}
                      </span>
                    </div>

                    {item.phonetic && (
                      <p className="text-xs font-mono text-stone-400 mt-0.5">/{item.phonetic}/</p>
                    )}

                    <p className="text-sm font-semibold text-stone-800 mt-2">{item.translation}</p>

                    {item.exampleSentence && (
                      <p className="text-xs text-stone-500 italic mt-2 line-clamp-2 bg-stone-50 p-2 rounded-lg">
                        "{item.exampleSentence}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs">
                    <span className="text-[11px] text-amber-600 font-semibold">
                      Mastery: {item.masteryLevel || 1} / 5 ⭐
                    </span>

                    <button
                      onClick={() => onDeleteWord(item.id)}
                      className="p-1.5 text-stone-300 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete from deck"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
