import React, { useState } from 'react';
import { X, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { Scenario, ProficiencyLevel } from '../types';

interface CustomScenarioModalProps {
  targetLanguage: string;
  level: ProficiencyLevel;
  onClose: () => void;
  onScenarioCreated: (scenario: Scenario) => void;
}

export const CustomScenarioModal: React.FC<CustomScenarioModalProps> = ({
  targetLanguage,
  level,
  onClose,
  onScenarioCreated,
}) => {
  const [topicPrompt, setTopicPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleIdeas = [
    'Negotiating an apartment lease with a local landlord',
    'Returning a damaged item at a department store',
    'Discussing favorite cooking recipes and food traditions',
    'Explaining a software bug to an engineering colleague',
    'Booking train tickets and asking about luggage rules',
  ];

  const handleGenerate = async (topicToUse?: string) => {
    const topic = topicToUse || topicPrompt.trim();
    if (!topic || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customTopic: topic,
          targetLanguage,
          level,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newScenario: Scenario = {
          id: `custom_${Date.now()}`,
          title: data.title || topic,
          iconName: 'Sparkles',
          category: 'custom',
          level,
          description: data.description || `Custom practice on: ${topic}`,
          partnerRole: data.partnerRole || 'Conversation partner',
          userRole: data.userRole || 'Language learner',
          starterPrompt: data.starterPrompt || `Hello! Let's talk about ${topic}.`,
          objectives: data.objectives || ['Practice discussing the topic', 'Use new vocabulary'],
          suggestedPhrases: data.suggestedPhrases || [],
        };
        onScenarioCreated(newScenario);
        onClose();
      } else {
        setError('Failed to generate scenario. Please try a different topic.');
      }
    } catch (err) {
      console.error('Error generating custom scenario:', err);
      setError('An error occurred while generating the scenario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in"
      id="custom-scenario-modal-overlay"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden"
        id="custom-scenario-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/80">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-600 uppercase tracking-wider">
            <Wand2 className="w-4 h-4 text-amber-500" />
            <span>AI Scenario Generator</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-xl font-bold text-stone-900 font-display">Create Custom Roleplay</h3>
            <p className="text-xs text-stone-500 mt-1">
              Describe any situation you want to practice in {targetLanguage}. The AI will build a tailored scenario with learning goals and starter lines.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              What do you want to practice?
            </label>
            <textarea
              rows={3}
              value={topicPrompt}
              onChange={(e) => setTopicPrompt(e.target.value)}
              placeholder="e.g. Asking a doctor about allergy symptoms, or debating the ending of a movie..."
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-stone-400"
              id="custom-scenario-topic-input"
            />
          </div>

          {/* Quick Idea Chips */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Or pick an idea:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sampleIdeas.map((idea, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTopicPrompt(idea);
                    handleGenerate(idea);
                  }}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-amber-50 hover:text-amber-900 text-stone-700 text-xs rounded-lg transition-colors text-left"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">{error}</div>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleGenerate()}
              disabled={!topicPrompt.trim() || loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              id="generate-scenario-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Building Scenario...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Generate Scenario</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
