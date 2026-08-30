import React, { useState } from 'react';
import { Scenario, ProficiencyLevel } from '../types';
import { DEFAULT_SCENARIOS } from '../data/scenarios';
import {
  Coffee,
  Smile,
  Compass,
  Hotel,
  Briefcase,
  BookOpen,
  Sparkles,
  Plus,
  ArrowRight,
  CheckCircle,
  Filter,
  GraduationCap,
  HeartHandshake,
  ShoppingBag,
  Globe,
  Award,
} from 'lucide-react';

interface ScenarioSelectorProps {
  selectedScenario: Scenario;
  onSelectScenario: (scenario: Scenario) => void;
  onOpenCustomModal: () => void;
  customScenarios: Scenario[];
  targetLanguageName: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Coffee: <Coffee className="w-5 h-5" />,
  Smile: <Smile className="w-5 h-5" />,
  Compass: <Compass className="w-5 h-5" />,
  Hotel: <Hotel className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  HeartHandshake: <HeartHandshake className="w-5 h-5" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
  Globe: <Globe className="w-5 h-5" />,
};

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  selectedScenario,
  onSelectScenario,
  onOpenCustomModal,
  customScenarios,
  targetLanguageName,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const allScenarios = [...customScenarios, ...DEFAULT_SCENARIOS];

  const categories = [
    { id: 'all', label: 'All Scenarios' },
    { id: 'tourism', label: '🏛️ Tourism Ambassador' },
    { id: 'education', label: '🎓 Education & Teachers' },
    { id: 'community', label: '🤝 Rural & Community Health' },
    { id: 'daily', label: '☕ Daily Life & Markets' },
    { id: 'travel', label: '🧭 Travel & Directions' },
    { id: 'work', label: '💼 Career & Interviews' },
    { id: 'cultural', label: '🌍 Cultural Diplomacy' },
  ];

  const filteredScenarios =
    activeCategory === 'all'
      ? allScenarios
      : allScenarios.filter((s) => s.category === activeCategory);

  return (
    <div className="space-y-6" id="scenario-selector-view">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 p-6 rounded-3xl border border-stone-800 shadow-xl text-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Ambassador & Classroom Hub
            </span>
          </div>
          <h2 className="text-xl font-bold font-display text-white">
            Tourism Ambassador & Educational Scenarios
          </h2>
          <p className="text-xs text-stone-300 mt-1 max-w-xl">
            Choose an immersive real-life situation to practice in <strong className="text-amber-300">{targetLanguageName}</strong> —
            crafted for global ambassadors, students, teachers, and communities.
          </p>
        </div>

        <button
          onClick={onOpenCustomModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-2xl shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
          id="open-custom-scenario-btn"
        >
          <Sparkles className="w-4 h-4 text-stone-950" />
          <span>Generate Custom Scenario</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredScenarios.map((scenario) => {
          const isSelected = selectedScenario.id === scenario.id;
          const levelTag = scenario.level.split('_')[0];

          return (
            <div
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              className={`cursor-pointer group relative bg-stone-900/90 rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between shadow-lg text-white ${
                isSelected
                  ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-amber-900/20 bg-stone-900'
                  : 'border-stone-800 hover:border-stone-700 hover:shadow-xl'
              }`}
              id={`scenario-card-${scenario.id}`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950'
                        : 'bg-stone-800 text-amber-300 group-hover:bg-amber-500 group-hover:text-stone-950'
                    }`}
                  >
                    {ICON_MAP[scenario.iconName] || <Sparkles className="w-5 h-5" />}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 bg-stone-800 text-amber-200 font-mono font-bold text-[10px] rounded-md uppercase border border-stone-700">
                      {levelTag}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-md border border-emerald-500/30">
                        <CheckCircle className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-stone-100 text-base font-display mb-1.5 line-clamp-2">
                  {scenario.title}
                </h3>
                <p className="text-xs text-stone-400 line-clamp-3 leading-relaxed mb-4">
                  {scenario.description}
                </p>

                {/* Cultural Etiquette Tip Badge */}
                {scenario.culturalEtiquetteTip && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 mb-3">
                    <span className="font-semibold text-amber-300">Etiquette: </span>
                    {scenario.culturalEtiquetteTip}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-3 border-t border-stone-800">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span>
                    Partner: <strong className="text-stone-200 font-medium">{scenario.partnerRole}</strong>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-stone-400">
                    {scenario.objectives.length} Practice Objectives
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Practice Voice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
