import React, { useState, useEffect } from 'react';
import { X, Volume2, Bookmark, Check, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { VocabularyItem } from '../types';

interface WordDetailModalProps {
  word: string | null;
  contextSentence?: string;
  targetLanguage: string;
  nativeLanguage: string;
  onClose: () => void;
  onSaveWord: (item: VocabularyItem) => void;
  isSaved?: boolean;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({
  word,
  contextSentence,
  targetLanguage,
  nativeLanguage,
  onClose,
  onSaveWord,
  isSaved = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [saved, setSaved] = useState(isSaved);

  useEffect(() => {
    if (!word) return;
    setSaved(isSaved);
    let isMounted = true;

    async function fetchWordDetails() {
      setLoading(true);
      try {
        const res = await fetch('/api/translate-word', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            word,
            contextSentence,
            targetLanguage,
            nativeLanguage,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setData(json);
        }
      } catch (err) {
        console.error('Failed to look up word:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchWordDetails();
    return () => {
      isMounted = false;
    };
  }, [word, contextSentence, targetLanguage, nativeLanguage, isSaved]);

  if (!word) return null;

  const handleSpeak = async () => {
    if (!word || audioPlaying) return;
    setAudioPlaying(true);
    try {
      // Use Web Speech API or server TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        window.speechSynthesis.speak(utterance);
        utterance.onend = () => setAudioPlaying(false);
      } else {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: word }),
        });
        const json = await res.json();
        if (json.audio) {
          const audio = new Audio(`data:audio/wav;base64,${json.audio}`);
          audio.play();
          audio.onended = () => setAudioPlaying(false);
        }
      }
    } catch {
      setAudioPlaying(false);
    }
  };

  const handleSave = () => {
    if (!data) return;
    const vocabItem: VocabularyItem = {
      id: `vocab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      word: data.word || word,
      phonetic: data.phonetic || '',
      partOfSpeech: data.partOfSpeech || 'word',
      translation: data.translation || '',
      exampleSentence: data.exampleSentence || contextSentence || '',
      exampleTranslation: data.exampleTranslation || '',
      language: targetLanguage,
      masteryLevel: 1,
      savedAt: Date.now(),
      notes: data.culturalNote || '',
    };
    onSaveWord(vocabItem);
    setSaved(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      id="word-detail-modal-overlay"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
        id="word-detail-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Interactive Dictionary</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            id="close-word-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-stone-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm font-medium">Analyzing "{word}" in context...</p>
            </div>
          ) : data ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-stone-900 font-display">{data.word}</h2>
                    <button
                      onClick={handleSpeak}
                      className="p-2 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      title="Listen to pronunciation"
                      id="listen-word-audio-btn"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  {data.phonetic && (
                    <p className="text-sm font-mono text-stone-500 mt-0.5">/{data.phonetic}/</p>
                  )}
                  {data.partOfSpeech && (
                    <span className="inline-block mt-1.5 px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-700 rounded-md">
                      {data.partOfSpeech}
                    </span>
                  )}
                </div>

                <button
                  onClick={handleSave}
                  disabled={saved}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    saved
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-900 text-white hover:bg-stone-800 active:scale-95'
                  }`}
                  id="save-vocab-btn"
                >
                  {saved ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save Word</span>
                    </>
                  )}
                </button>
              </div>

              {/* Translation & Definition */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100">
                <div className="text-xs text-stone-500 font-medium mb-1">Translation & Meaning</div>
                <div className="text-lg font-bold text-stone-900">{data.translation}</div>
                {data.definition && (
                  <div className="text-sm text-stone-600 mt-1">{data.definition}</div>
                )}
              </div>

              {/* Example in context */}
              {data.exampleSentence && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Example Usage</div>
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/80">
                    <p className="text-sm font-medium text-stone-900 italic">"{data.exampleSentence}"</p>
                    {data.exampleTranslation && (
                      <p className="text-xs text-stone-600 mt-1">"{data.exampleTranslation}"</p>
                    )}
                  </div>
                </div>
              )}

              {/* Cultural Note or Synonyms */}
              {data.culturalNote && (
                <div className="flex items-start gap-2 p-3 bg-teal-50 rounded-xl text-xs text-teal-900 border border-teal-100">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Cultural / Nuance Note: </span>
                    {data.culturalNote}
                  </div>
                </div>
              )}

              {data.synonyms && data.synonyms.length > 0 && (
                <div>
                  <span className="text-xs text-stone-500 font-medium">Synonyms: </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {data.synonyms.map((syn: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-stone-100 text-stone-700 text-xs rounded-md">
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-stone-500 text-sm">
              Unable to load definition for this word.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
