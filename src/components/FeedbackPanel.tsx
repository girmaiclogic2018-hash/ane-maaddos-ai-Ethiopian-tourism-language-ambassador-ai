import React from 'react';
import { TurnFeedback, TurnCorrection, VocabularyItem } from '../types';
import { CheckCircle2, AlertTriangle, Lightbulb, Sparkles, Plus, Award } from 'lucide-react';

interface FeedbackPanelProps {
  feedback: TurnFeedback | null;
  isLoading: boolean;
  onSelectWord: (word: string) => void;
  onSaveWord: (item: VocabularyItem) => void;
  onUseSuggestion?: (suggestion: string) => void;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  feedback,
  isLoading,
  onSelectWord,
  onSaveWord,
  onUseSuggestion,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col items-center justify-center min-h-[220px] text-stone-500 gap-3" id="feedback-loading-card">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-600">AI Tutor is reviewing your speech...</p>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/80 shadow-sm text-center" id="feedback-empty-card">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900 font-display">Live Pedagogical Coach</h3>
        <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
          Speak with your partner in the live room. Your AI tutor will automatically detect grammar points, suggest native phrasing, and rate fluency.
        </p>
      </div>
    );
  }

  const { fluencyScore = 88, praise, corrections, betterAlternatives, vocabularyUsed, suggestedReplies } = feedback;

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4" id="feedback-panel">
      {/* Top Header: Praise & Fluency Score */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-bold text-stone-900 font-display">Tutor Feedback</span>
        </div>
        {typeof fluencyScore === 'number' && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
            <span>Accuracy & Fluency:</span>
            <span className="text-emerald-700">{fluencyScore}%</span>
          </div>
        )}
      </div>

      {/* Praise / Encouragement */}
      {praise && (
        <div className="flex items-start gap-2.5 p-3 bg-emerald-50/70 rounded-xl border border-emerald-100/80 text-xs text-emerald-900 leading-relaxed">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">What you did well: </span>
            {praise}
          </div>
        </div>
      )}

      {/* Corrections List */}
      {corrections && corrections.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Grammar & Phrasing Refinements ({corrections.length})</span>
          </div>
          <div className="space-y-2">
            {corrections.map((c: TurnCorrection, idx: number) => (
              <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold rounded bg-amber-100 text-amber-800">
                    {c.category}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-red-700 line-through bg-red-50 px-1.5 py-0.5 rounded font-mono">
                    {c.original}
                  </span>
                  <span className="text-stone-400 font-bold text-xs">➔</span>
                  <span className="text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                    {c.corrected}
                  </span>
                </div>
                <p className="text-stone-600 text-xs pt-0.5 leading-relaxed">{c.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>No grammatical errors detected! Great phrasing.</span>
        </div>
      )}

      {/* Better Native Alternatives */}
      {betterAlternatives && betterAlternatives.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>More Natural / Native Phrasings</span>
          </div>
          <div className="space-y-1.5">
            {betterAlternatives.map((alt: string, i: number) => (
              <div
                key={i}
                className="p-2.5 bg-amber-50/40 rounded-xl border border-amber-100/70 text-xs text-stone-800 flex items-start justify-between gap-2"
              >
                <span className="italic font-medium">"{alt}"</span>
                {onUseSuggestion && (
                  <button
                    onClick={() => onUseSuggestion(alt)}
                    className="shrink-0 px-2 py-0.5 text-[11px] font-semibold bg-white hover:bg-stone-100 border border-stone-200 rounded-md text-stone-700 transition-colors"
                  >
                    Try Saying
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vocabulary Breakdown */}
      {vocabularyUsed && vocabularyUsed.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Key Vocabulary in Turn
          </div>
          <div className="flex flex-wrap gap-1.5">
            {vocabularyUsed.map((v, i) => (
              <button
                key={i}
                onClick={() => onSelectWord(v.word)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium transition-colors group"
                title="Click to view definition & save"
              >
                <span>{v.word}</span>
                <span className="text-[10px] text-stone-500 font-normal">({v.translation})</span>
                <span className="text-[9px] px-1 py-0.2 bg-stone-200 group-hover:bg-stone-300 rounded font-mono">
                  {v.level}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Follow-ups */}
      {suggestedReplies && suggestedReplies.length > 0 && onUseSuggestion && (
        <div className="space-y-1.5 pt-1 border-t border-stone-100">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Conversation Momentum Starters
          </div>
          <div className="space-y-1">
            {suggestedReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => onUseSuggestion(reply)}
                className="w-full text-left p-2 rounded-lg bg-stone-50 hover:bg-emerald-50 text-xs text-stone-700 hover:text-emerald-900 border border-stone-100 transition-colors flex items-center justify-between"
              >
                <span className="truncate">"{reply}"</span>
                <Plus className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
