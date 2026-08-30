import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  AlertCircle,
  Radio,
  RefreshCw,
} from 'lucide-react';
import { LanguageInfo, ProficiencyLevel, Scenario, MessageTurn, TurnFeedback, PartnerSettings, VocabularyItem } from '../types';
import { AudioVisualizer } from './AudioVisualizer';
import { RollingTranscript } from './RollingTranscript';
import { FeedbackPanel } from './FeedbackPanel';
import { float32ToPcmBase64, LiveAudioPlayer, calculateRms } from '../utils/audio';

interface LiveVoiceRoomProps {
  language: LanguageInfo;
  level: ProficiencyLevel;
  scenario: Scenario;
  settings: PartnerSettings;
  onWordClick: (word: string, sentence: string) => void;
  onSaveWord: (item: VocabularyItem) => void;
  onSessionComplete?: (speakingSeconds: number, turnsCount: number) => void;
}

export const LiveVoiceRoom: React.FC<LiveVoiceRoomProps> = ({
  language,
  level,
  scenario,
  settings,
  onWordClick,
  onSaveWord,
  onSessionComplete,
}) => {
  // Connection states
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Audio & Mic states
  const [isMuted, setIsMuted] = useState(false);
  const [isPartnerSpeaking, setIsPartnerSpeaking] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [isPushToTalking, setIsPushToTalking] = useState(false);

  // Conversation & Transcription
  const [messages, setMessages] = useState<MessageTurn[]>([]);
  const [activeFeedback, setActiveFeedback] = useState<TurnFeedback | null>(null);
  const [analyzingFeedback, setAnalyzingFeedback] = useState(false);
  const [completedObjectives, setCompletedObjectives] = useState<Record<number, boolean>>({});
  const [showCheatSheet, setShowCheatSheet] = useState(true);
  const [showTextFallbackInput, setShowTextFallbackInput] = useState(false);
  const [textInput, setTextInput] = useState('');

  // Speaking metrics
  const sessionStartTimeRef = useRef<number | null>(null);
  const userTurnsCountRef = useRef(0);

  // WebSocket & Audio refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const isMutedRef = useRef(isMuted);
  const isLiveRef = useRef(isLive);
  const pushToTalkRef = useRef(settings.pushToTalk);
  const isPushToTalkingRef = useRef(isPushToTalking);

  // Keep refs in sync to prevent stale closures
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isLiveRef.current = isLive;
  }, [isLive]);

  useEffect(() => {
    pushToTalkRef.current = settings.pushToTalk;
  }, [settings.pushToTalk]);

  useEffect(() => {
    isPushToTalkingRef.current = isPushToTalking;
  }, [isPushToTalking]);

  // Initialize LiveAudioPlayer
  useEffect(() => {
    const player = new LiveAudioPlayer((speaking) => {
      setIsPartnerSpeaking(speaking);
    });
    audioPlayerRef.current = player;

    return () => {
      player.destroy();
    };
  }, []);

  // Request pedagogical analysis on user turn
  const analyzeUserUtterance = useCallback(
    async (userText: string, partnerLastText = '') => {
      setAnalyzingFeedback(true);
      try {
        const res = await fetch('/api/analyze-turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userUtterance: userText,
            partnerUtterance: partnerLastText,
            targetLanguage: language.name,
            nativeLanguage: settings.nativeLanguage,
            level,
            scenarioTitle: scenario.title,
          }),
        });
        if (res.ok) {
          const feedbackJson = await res.json();
          setActiveFeedback(feedbackJson);
        }
      } catch (err) {
        console.error('Error analyzing turn:', err);
      } finally {
        setAnalyzingFeedback(false);
      }
    },
    [language.name, settings.nativeLanguage, level, scenario.title]
  );

  // Stop Call / Teardown
  const stopLiveCall = useCallback(() => {
    if (sessionStartTimeRef.current) {
      const elapsedSeconds = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
      onSessionComplete?.(elapsedSeconds, userTurnsCountRef.current);
      sessionStartTimeRef.current = null;
    }

    // Stop mic stream
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }

    // Stop audio playback
    if (audioPlayerRef.current) {
      audioPlayerRef.current.interrupt();
    }

    // Close WebSocket
    if (wsRef.current) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'stop' }));
        wsRef.current.close();
      } catch {
        // ignore
      }
      wsRef.current = null;
    }

    setIsLive(false);
    setIsConnecting(false);
    setIsPartnerSpeaking(false);
    setMicVolume(0);
  }, [onSessionComplete]);

  // Start Call / Connect to Gemini Live
  const startLiveCall = async () => {
    setErrorMsg(null);
    setIsConnecting(true);

    try {
      // 1. Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      // 2. Initialize 16kHz input AudioContext
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const inputCtx = new AudioCtxClass({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      source.connect(processor);
      processor.connect(inputCtx.destination);

      // 3. Connect WebSocket to /live
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // Send initial handshake configuration
        ws.send(
          JSON.stringify({
            type: 'start',
            targetLanguage: language.name,
            nativeLanguage: settings.nativeLanguage,
            level,
            scenario,
            voiceName: settings.voiceName || language.defaultVoice,
            partnerPersona: settings.partnerPersona,
            strictness: settings.correctionStrictness,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'ready') {
            setIsConnecting(false);
            setIsLive(true);
            sessionStartTimeRef.current = Date.now();
            userTurnsCountRef.current = 0;
          } else if (msg.type === 'audio' && msg.audio) {
            audioPlayerRef.current?.playChunk(msg.audio);
          } else if (msg.type === 'transcription') {
            const role = msg.role === 'model' ? 'model' : 'user';
            const text = msg.text?.trim();
            if (text) {
              setMessages((prev) => {
                // If the last message is by the same role and recent, append; otherwise create new turn
                const last = prev[prev.length - 1];
                if (last && last.role === role && Date.now() - last.timestamp < 3000) {
                  return [
                    ...prev.slice(0, -1),
                    { ...last, text: `${last.text} ${text}`, timestamp: Date.now() },
                  ];
                }
                const newTurn: MessageTurn = {
                  id: `turn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                  role,
                  text,
                  timestamp: Date.now(),
                };
                return [...prev, newTurn];
              });

              if (role === 'user') {
                userTurnsCountRef.current += 1;
                // Trigger background feedback analysis on user turns
                const lastModelTurn = messages.filter((m) => m.role === 'model').slice(-1)[0]?.text;
                analyzeUserUtterance(text, lastModelTurn);
              }
            }
          } else if (msg.type === 'interrupted') {
            audioPlayerRef.current?.interrupt();
            setIsPartnerSpeaking(false);
          } else if (msg.type === 'error') {
            setErrorMsg(msg.error || 'Live connection encountered an issue.');
            stopLiveCall();
          } else if (msg.type === 'closed') {
            stopLiveCall();
          }
        } catch (err) {
          console.error('Error handling WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket connection error:', err);
        setErrorMsg('Could not connect to Gemini Live voice server.');
        stopLiveCall();
      };

      ws.onclose = () => {
        setIsLive(false);
        setIsConnecting(false);
      };

      // 4. Hook microphone audio processor to stream PCM chunks
      processor.onaudioprocess = (e) => {
        if (!isLiveRef.current) return;

        // Check mute or push-to-talk conditions
        if (isMutedRef.current) {
          setMicVolume(0);
          return;
        }

        if (pushToTalkRef.current && !isPushToTalkingRef.current) {
          setMicVolume(0);
          return;
        }

        const inputChannel = e.inputBuffer.getChannelData(0);
        const volume = calculateRms(inputChannel);
        setMicVolume(volume);

        // Convert to 16kHz PCM Base64 and send over WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const base64Pcm = float32ToPcmBase64(inputChannel);
          wsRef.current.send(
            JSON.stringify({
              type: 'audio',
              audio: base64Pcm,
            })
          );
        }
      };
    } catch (err: any) {
      console.error('Failed to initialize live voice call:', err);
      setErrorMsg(err.message || 'Microphone access is required for real-time voice practice.');
      stopLiveCall();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLiveCall();
    };
  }, [stopLiveCall]);

  const handleInterruptPartner = () => {
    audioPlayerRef.current?.interrupt();
    setIsPartnerSpeaking(false);
  };

  const handleSendTextPrompt = () => {
    if (!textInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const text = textInput.trim();
    wsRef.current.send(JSON.stringify({ type: 'text', text }));
    setMessages((prev) => [
      ...prev,
      {
        id: `turn_${Date.now()}`,
        role: 'user',
        text,
        timestamp: Date.now(),
      },
    ]);
    setTextInput('');
    userTurnsCountRef.current += 1;
    analyzeUserUtterance(text);
  };

  const toggleObjective = (index: number) => {
    setCompletedObjectives((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="live-voice-room">
      {/* LEFT / CENTER COLUMN: Active Live Call & Interactive Transcript (8 cols) */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-6">
        {/* Main Stage: AI Partner Voice Canvas */}
        <div className="relative overflow-hidden bg-gradient-to-b from-stone-900 to-stone-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800">
          {/* Subtle Ambient Background Ring */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          {/* Top Bar: Scenario Info & Live Status */}
          <div className="relative flex items-center justify-between gap-4 pb-6 border-b border-stone-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{language.flag}</span>
                <h2 className="text-lg sm:text-xl font-bold font-display text-stone-100">{scenario.title}</h2>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Role: <span className="text-amber-300 font-semibold">{scenario.partnerRole}</span>
              </p>
            </div>

            {/* Connection Badge */}
            <div className="flex items-center gap-2">
              {isLive ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <Radio className="w-3.5 h-3.5" />
                  <span>Live Call</span>
                </div>
              ) : isConnecting ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="px-3 py-1 bg-stone-800 text-stone-400 rounded-full text-xs font-medium border border-stone-700">
                  Ready to Practice
                </div>
              )}
            </div>
          </div>

          {/* Central AI Partner Avatar & Visualizer */}
          <div className="relative flex flex-col items-center justify-center py-8 sm:py-12 space-y-6">
            {/* Pulsing Avatar */}
            <div className="relative flex items-center justify-center">
              {/* Outer Speaking Glow Waves */}
              {isPartnerSpeaking && (
                <>
                  <div className="absolute w-44 h-44 rounded-full bg-emerald-500/20 animate-ping duration-1000" />
                  <div className="absolute w-36 h-36 rounded-full bg-teal-400/30 animate-pulse duration-700" />
                </>
              )}

              {/* User Speaking Glow */}
              {!isPartnerSpeaking && micVolume > 0.05 && (
                <div
                  className="absolute rounded-full bg-amber-500/30 transition-all duration-75"
                  style={{
                    width: `${120 + micVolume * 60}px`,
                    height: `${120 + micVolume * 60}px`,
                  }}
                />
              )}

              {/* Core Avatar Orb */}
              <div
                className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
                  isPartnerSpeaking
                    ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 ring-4 ring-emerald-400/50 scale-105'
                    : isLive
                    ? 'bg-gradient-to-tr from-amber-600 via-orange-500 to-rose-500 ring-2 ring-amber-400/30'
                    : 'bg-stone-800 border-2 border-stone-700'
                }`}
              >
                <div className="text-center">
                  <span className="text-3xl font-display font-bold">
                    {language.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="text-[10px] tracking-wider uppercase opacity-80 mt-0.5">
                    {settings.voiceName}
                  </div>
                </div>
              </div>
            </div>

            {/* Speaking Status Caption */}
            <div className="text-center space-y-1">
              <div className="text-sm font-semibold text-stone-200">
                {isPartnerSpeaking ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 justify-center">
                    <Volume2 className="w-4 h-4 animate-bounce" />
                    <span>Partner is speaking in {language.name}...</span>
                  </span>
                ) : isLive ? (
                  micVolume > 0.05 ? (
                    <span className="text-amber-400">Listening to you...</span>
                  ) : (
                    <span className="text-stone-400">Your turn to speak</span>
                  )
                ) : (
                  <span className="text-stone-400">Press "Start Live Practice" to begin</span>
                )}
              </div>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                {isLive
                  ? 'Speak naturally into your microphone. Say anything to reply or ask questions.'
                  : `Immerse yourself in real-time conversational practice with low-latency voice responses.`}
              </p>
            </div>

            {/* Live Audio Visualizer Bars */}
            <AudioVisualizer
              isActive={isLive}
              isPartnerSpeaking={isPartnerSpeaking}
              micVolume={micVolume}
            />

            {/* Error Banner */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-red-950/80 border border-red-800 text-red-200 rounded-xl text-xs max-w-md">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Control Dock */}
          <div className="relative pt-6 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-4">
            {/* Left: Push-to-Talk or Mute */}
            <div className="flex items-center gap-2">
              {isLive && (
                <>
                  <button
                    onClick={() => setIsMuted((prev) => !prev)}
                    className={`p-3 rounded-full transition-all ${
                      isMuted
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                        : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                    }`}
                    title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                    id="live-mute-toggle-btn"
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  {/* Interrupt partner button */}
                  {isPartnerSpeaking && (
                    <button
                      onClick={handleInterruptPartner}
                      className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-full text-xs font-semibold border border-stone-700 transition-colors"
                      title="Interrupt AI speaking"
                      id="live-interrupt-btn"
                    >
                      <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                      <span>Interrupt</span>
                    </button>
                  )}
                </>
              )}

              {/* Push-to-talk button if enabled */}
              {isLive && settings.pushToTalk && (
                <button
                  onMouseDown={() => setIsPushToTalking(true)}
                  onMouseUp={() => setIsPushToTalking(false)}
                  onTouchStart={() => setIsPushToTalking(true)}
                  onTouchEnd={() => setIsPushToTalking(false)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all select-none ${
                    isPushToTalking
                      ? 'bg-amber-500 text-stone-900 scale-95 ring-4 ring-amber-400/50'
                      : 'bg-stone-800 text-stone-200 border border-stone-700'
                  }`}
                  id="push-to-talk-btn"
                >
                  {isPushToTalking ? '🎙️ Recording Speech...' : 'Hold to Speak'}
                </button>
              )}
            </div>

            {/* Center / Right: Primary Start / End Call Button */}
            <div className="flex items-center gap-3">
              {!isLive ? (
                <button
                  onClick={startLiveCall}
                  disabled={isConnecting}
                  className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all text-sm"
                  id="start-live-call-btn"
                >
                  <PhoneCall className="w-5 h-5" />
                  <span>{isConnecting ? 'Connecting Partner...' : 'Start Live Practice'}</span>
                </button>
              ) : (
                <button
                  onClick={stopLiveCall}
                  className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all text-sm"
                  id="end-live-call-btn"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Session</span>
                </button>
              )}

              <button
                onClick={() => setShowTextFallbackInput((prev) => !prev)}
                className={`p-3 rounded-2xl transition-colors ${
                  showTextFallbackInput
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-700'
                }`}
                title="Toggle text input prompt in live session"
                id="toggle-live-text-input-btn"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Optional In-Call Text Input */}
          {showTextFallbackInput && isLive && (
            <div className="pt-4 mt-4 border-t border-stone-800 flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendTextPrompt()}
                placeholder={`Type a phrase in ${language.name} or English...`}
                className="flex-1 bg-stone-800/90 border border-stone-700 text-stone-100 placeholder-stone-500 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                id="live-text-prompt-input"
              />
              <button
                onClick={handleSendTextPrompt}
                disabled={!textInput.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-stone-900 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                id="send-live-text-prompt-btn"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          )}
        </div>

        {/* Live Rolling Transcripts Container */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-stone-700" />
              <h3 className="text-base font-bold text-stone-900 font-display">Live Transcript</h3>
              <span className="text-xs text-stone-400 font-normal">
                (Tap any word for definition & flashcards)
              </span>
            </div>
            <div className="text-xs text-stone-500">
              Turns: <span className="font-semibold text-stone-800">{messages.length}</span>
            </div>
          </div>

          <RollingTranscript
            messages={messages}
            onWordClick={onWordClick}
            onAnalyzeTurn={(msg) => analyzeUserUtterance(msg.text)}
            targetLanguage={language.name}
            autoTranslate={settings.autoTranslate}
          />
        </div>
      </div>

      {/* RIGHT COLUMN: Real-Time Feedback, Objectives & Suggested Phrases (5 cols) */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        {/* Scenario Objectives Tracker */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3" id="scenario-objectives-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-600 uppercase tracking-wider">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Practice Goals</span>
            </div>
            <span className="text-xs font-semibold text-stone-500">
              {Object.values(completedObjectives).filter(Boolean).length} / {scenario.objectives.length}
            </span>
          </div>

          <div className="space-y-2">
            {scenario.objectives.map((obj, i) => {
              const isDone = !!completedObjectives[i];
              return (
                <button
                  key={i}
                  onClick={() => toggleObjective(i)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                    isDone
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 line-through opacity-80'
                      : 'bg-stone-50/80 border-stone-200/80 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {isDone ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-snug">{obj}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Suggested Phrases Cheat-Sheet */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3" id="suggested-phrases-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-600 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Starter Phrases & Idioms</span>
            </div>
            <button
              onClick={() => setShowCheatSheet((prev) => !prev)}
              className="p-1 text-stone-400 hover:text-stone-700"
            >
              {showCheatSheet ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showCheatSheet && (
            <div className="space-y-2 pt-1">
              {scenario.suggestedPhrases.map((phrase, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-100 text-xs text-stone-800 flex items-center justify-between gap-2"
                >
                  <span className="italic font-medium">"{phrase}"</span>
                  {isLive && (
                    <button
                      onClick={() => {
                        setTextInput(phrase);
                        setShowTextFallbackInput(true);
                      }}
                      className="shrink-0 px-2 py-0.5 text-[10px] font-semibold bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-md transition-colors"
                    >
                      Use
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pedagogical Tutor Feedback Panel */}
        <FeedbackPanel
          feedback={activeFeedback}
          isLoading={analyzingFeedback}
          onSelectWord={(word) => onWordClick(word, '')}
          onSaveWord={onSaveWord}
          onUseSuggestion={(sugg) => {
            setTextInput(sugg);
            setShowTextFallbackInput(true);
          }}
        />
      </div>
    </div>
  );
};
