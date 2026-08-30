import React from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  isPartnerSpeaking: boolean;
  micVolume: number; // 0 to 1
  partnerVolume?: number; // 0 to 1
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isActive,
  isPartnerSpeaking,
  micVolume,
}) => {
  // Generate 24 animated bars
  const bars = Array.from({ length: 24 }, (_, i) => {
    let heightPercent = 15;
    if (!isActive) {
      heightPercent = 10;
    } else if (isPartnerSpeaking) {
      // Dynamic simulated ripple for partner speech
      const wave = Math.sin(Date.now() / 150 + i * 0.4) * 0.5 + 0.5;
      heightPercent = Math.max(15, wave * 85);
    } else if (micVolume > 0.05) {
      // Scale with user mic input
      const variance = Math.sin(i * 1.2) * 0.3 + 0.7;
      heightPercent = Math.min(100, Math.max(15, micVolume * 120 * variance));
    }
    return { id: i, heightPercent };
  });

  return (
    <div className="flex items-center justify-center gap-1 h-12 w-full max-w-xs px-2" id="audio-visualizer-container">
      {bars.map((bar) => (
        <div
          key={bar.id}
          className={`w-1 rounded-full transition-all duration-100 ${
            !isActive
              ? 'bg-stone-300 h-2'
              : isPartnerSpeaking
              ? 'bg-gradient-to-t from-emerald-500 to-teal-400'
              : micVolume > 0.05
              ? 'bg-gradient-to-t from-amber-500 to-orange-400'
              : 'bg-stone-300 h-2'
          }`}
          style={{
            height: `${isActive ? bar.heightPercent : 8}%`,
          }}
        />
      ))}
    </div>
  );
};
