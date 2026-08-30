import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Volume2,
  Check,
  Sparkles,
  Globe,
  HeartHandshake,
  Bell,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { PartnerSettings } from '../types';
import { AVAILABLE_VOICES } from '../data/languages';
import {
  playReminderChime,
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendBrowserNotification,
} from '../utils/notifications';

interface PartnerSettingsModalProps {
  settings: PartnerSettings;
  onSave: (updated: PartnerSettings) => void;
  onClose: () => void;
  targetLanguageName: string;
}

const TIME_PRESETS = [
  { label: 'Morning', time: '08:30', emoji: '🌅' },
  { label: 'Midday', time: '12:30', emoji: '☀️' },
  { label: 'Evening', time: '18:30', emoji: '🌆' },
  { label: 'Night', time: '21:00', emoji: '🌙' },
];

const DAYS_OF_WEEK = [
  { id: 1, label: 'Mon', full: 'Monday' },
  { id: 2, label: 'Tue', full: 'Tuesday' },
  { id: 3, label: 'Wed', full: 'Wednesday' },
  { id: 4, label: 'Thu', full: 'Thursday' },
  { id: 5, label: 'Fri', full: 'Friday' },
  { id: 6, label: 'Sat', full: 'Saturday' },
  { id: 0, label: 'Sun', full: 'Sunday' },
];

export const PartnerSettingsModal: React.FC<PartnerSettingsModalProps> = ({
  settings,
  onSave,
  onClose,
  targetLanguageName,
}) => {
  const [form, setForm] = useState<PartnerSettings>({
    ...settings,
    reminderEnabled: settings.reminderEnabled ?? false,
    reminderTime: settings.reminderTime || '18:30',
    reminderFrequency: settings.reminderFrequency || 'daily',
    reminderDays: settings.reminderDays || [1, 2, 3, 4, 5, 6, 0],
    reminderSound: settings.reminderSound ?? true,
  });

  const [testPlaying, setTestPlaying] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [testReminderSent, setTestReminderSent] = useState(false);

  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

  const handleAuditionVoice = async (voiceId: string) => {
    setTestPlaying(voiceId);
    try {
      const sampleText = `Hello! I am your AI language partner, tourism ambassador and community learning tutor in ${targetLanguageName}.`;
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText, voiceName: voiceId }),
      });
      const data = await res.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        audio.play();
        audio.onended = () => setTestPlaying(null);
      } else {
        setTestPlaying(null);
      }
    } catch {
      setTestPlaying(null);
    }
  };

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
  };

  const handleTestReminder = () => {
    if (form.reminderSound !== false) {
      playReminderChime();
    }

    if (notificationPermission === 'granted') {
      sendBrowserNotification(`Language Partner AI: Time for ${targetLanguageName} Practice! 🌟`, {
        body: `Your scheduled practice time (${form.reminderTime}) is now! Spend 5 minutes practicing live voice conversation.`,
        tag: 'practice-reminder-test',
      });
    }

    setTestReminderSent(true);
    setTimeout(() => setTestReminderSent(false), 4000);
  };

  const handleToggleDay = (dayId: number) => {
    const currentDays = form.reminderDays || [];
    let updated: number[];
    if (currentDays.includes(dayId)) {
      updated = currentDays.filter((d) => d !== dayId);
    } else {
      updated = [...currentDays, dayId];
    }
    setForm({
      ...form,
      reminderDays: updated,
      reminderFrequency: 'custom',
    });
  };

  const handleSelectFrequency = (freq: 'daily' | 'weekdays' | 'weekends') => {
    let days = [0, 1, 2, 3, 4, 5, 6];
    if (freq === 'weekdays') days = [1, 2, 3, 4, 5];
    if (freq === 'weekends') days = [6, 0];

    setForm({
      ...form,
      reminderFrequency: freq,
      reminderDays: days,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in"
      id="partner-settings-modal-overlay"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-stone-900 rounded-3xl shadow-2xl border border-stone-800 overflow-hidden text-white"
        id="partner-settings-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-300 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-amber-500" />
            <span>Voice, Ambassador & Persona Settings</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* AI Voice Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                Gemini Live Voice Persona
              </label>
              <span className="text-[10px] text-amber-400 font-mono">Real-time Bi-directional</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AVAILABLE_VOICES.map((v) => {
                const isSelected = form.voiceName === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setForm({ ...form, voiceName: v.id as any })}
                    className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/30'
                        : 'border-stone-800 hover:border-stone-700 bg-stone-950/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-stone-100 font-display">{v.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">{v.gender}</p>
                      <p className="text-[10px] text-stone-500">{v.tone}</p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAuditionVoice(v.id);
                      }}
                      className="p-2 rounded-xl bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-amber-300 transition-colors cursor-pointer"
                      title="Audition voice"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${testPlaying === v.id ? 'animate-bounce text-stone-950' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Partner Persona & Roleplay Stance */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">
              Tutor Persona & Atmosphere
            </label>
            <select
              value={form.partnerPersona}
              onChange={(e) => setForm({ ...form, partnerPersona: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs font-medium text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="Warm, patient, and inspirational cultural ambassador & tutor">
                🌟 Cultural & Tourism Ambassador (Warm, Inspiring, Community-Focused)
              </option>
              <option value="Encouraging school teacher and patient phonics mentor">
                🎓 Supportive Classroom Teacher & Phonics Mentor
              </option>
              <option value="Lively native friend speaking natural conversational slang and idioms">
                ☕ Casual Local Friend & Cafe Conversation Partner
              </option>
              <option value="Rigorous professional interviewer and executive language coach">
                💼 Executive Interviewer & Workplace Language Coach
              </option>
            </select>
          </div>

          {/* Correction Strictness */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">
              Coaching & Pronunciation Strictness
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'gentle', label: 'Gentle', desc: 'Flow-first, subtle tips' },
                { id: 'balanced', label: 'Balanced', desc: 'Phonetics & rephrasing' },
                { id: 'rigorous', label: 'Rigorous', desc: 'Deep phonetics & grammar' },
              ].map((lvl) => (
                <button
                  type="button"
                  key={lvl.id}
                  onClick={() => setForm({ ...form, correctionStrictness: lvl.id as any })}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    form.correctionStrictness === lvl.id
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-bold ring-2 ring-amber-400/30'
                      : 'border-stone-800 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  <div className="text-xs font-bold">{lvl.label}</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Native Language for Explanations */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">
              Primary Language for Feedback & Translations
            </label>
            <select
              value={form.nativeLanguage}
              onChange={(e) => setForm({ ...form, nativeLanguage: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs font-medium text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Amharic">Amharic (አማርኛ)</option>
              <option value="Afaan Oromoo">Afaan Oromoo</option>
              <option value="Tigrinya">Tigrinya (ትግርኛ)</option>
              <option value="Somali">Somali (Af-Soomaali)</option>
              <option value="Swahili">Swahili (Kiswahili)</option>
              <option value="Hausa">Hausa</option>
              <option value="Yoruba">Yoruba</option>
              <option value="Spanish">Spanish (Español)</option>
              <option value="French">French (Français)</option>
              <option value="Arabic">Arabic (العربية)</option>
              <option value="German">German (Deutsch)</option>
              <option value="Mandarin Chinese">Chinese (中文)</option>
            </select>
          </div>

          {/* Practice Schedule & Daily Reminders */}
          <div className="space-y-3 pt-4 border-t border-stone-800" id="practice-reminder-settings-section">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                    Daily Practice Reminders
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    Schedule a reminder to build your language habit
                  </p>
                </div>
              </div>

              {/* Master Reminder Toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.reminderEnabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    setForm({ ...form, reminderEnabled: enabled });
                    if (enabled && notificationPermission === 'default') {
                      handleRequestPermission();
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {form.reminderEnabled && (
              <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                {/* Time Picker & Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-stone-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Preferred Time of Day</span>
                    </label>
                    <span className="text-[10px] text-stone-400 font-mono">
                      Current setting: <strong className="text-amber-300">{form.reminderTime}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TIME_PRESETS.map((preset) => (
                      <button
                        type="button"
                        key={preset.time}
                        onClick={() => setForm({ ...form, reminderTime: preset.time })}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all cursor-pointer ${
                          form.reminderTime === preset.time
                            ? 'border-amber-400 bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40'
                            : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-700'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <span>{preset.emoji}</span>
                          <span>{preset.label}</span>
                        </span>
                        <span className="text-[10px] font-mono text-stone-400">{preset.time}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Time Input */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[11px] text-stone-400 whitespace-nowrap">Or custom time:</span>
                    <input
                      type="time"
                      value={form.reminderTime || '18:30'}
                      onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
                      className="px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-xl text-xs font-mono text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Frequency & Days */}
                <div className="space-y-2 pt-2 border-t border-stone-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-stone-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Frequency & Schedule</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'daily', label: 'Everyday', desc: '7 days a week' },
                      { id: 'weekdays', label: 'Weekdays', desc: 'Mon - Fri' },
                      { id: 'weekends', label: 'Weekends', desc: 'Sat - Sun' },
                    ].map((freq) => (
                      <button
                        type="button"
                        key={freq.id}
                        onClick={() => handleSelectFrequency(freq.id as any)}
                        className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                          form.reminderFrequency === freq.id
                            ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-bold'
                            : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <div className="text-xs font-bold">{freq.label}</div>
                        <div className="text-[9px] text-stone-400">{freq.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Day Pills for Custom selection */}
                  <div className="flex items-center justify-between gap-1 pt-1.5">
                    {DAYS_OF_WEEK.map((d) => {
                      const isActive = form.reminderDays?.includes(d.id);
                      return (
                        <button
                          type="button"
                          key={d.id}
                          onClick={() => handleToggleDay(d.id)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-amber-500 text-stone-950 shadow-sm'
                              : 'bg-stone-900 text-stone-500 border border-stone-800 hover:text-stone-300'
                          }`}
                          title={d.full}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sound & Notification Status */}
                <div className="space-y-3 pt-2 border-t border-stone-800/80">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.reminderSound !== false}
                        onChange={(e) => setForm({ ...form, reminderSound: e.target.checked })}
                        className="w-3.5 h-3.5 text-amber-500 rounded border-stone-700 focus:ring-amber-400 cursor-pointer"
                      />
                      <span className="text-[11px] font-medium text-stone-300">Play chime sound when reminder fires</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleTestReminder}
                      className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      id="test-reminder-btn"
                    >
                      <Bell className="w-3 h-3" />
                      <span>Test Reminder</span>
                    </button>
                  </div>

                  {/* Notification Permission Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-[11px]">
                    <div className="flex items-center gap-2">
                      {notificationPermission === 'granted' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : notificationPermission === 'denied' ? (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <div>
                        <div className="text-stone-200 font-medium">
                          Browser Notifications:{' '}
                          <strong
                            className={
                              notificationPermission === 'granted'
                                ? 'text-emerald-400'
                                : notificationPermission === 'denied'
                                ? 'text-rose-400'
                                : 'text-amber-400'
                            }
                          >
                            {notificationPermission === 'granted'
                              ? 'Enabled'
                              : notificationPermission === 'denied'
                              ? 'Blocked by browser'
                              : 'Not yet granted'}
                          </strong>
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {notificationPermission === 'granted'
                            ? 'You will receive native desktop/device notifications when app is open'
                            : 'Enable browser permission for pop-up practice reminders'}
                        </div>
                      </div>
                    </div>

                    {notificationPermission !== 'granted' && (
                      <button
                        type="button"
                        onClick={handleRequestPermission}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-[10px] font-bold rounded-lg whitespace-nowrap cursor-pointer transition-all active:scale-95 shrink-0"
                      >
                        Enable Notifications
                      </button>
                    )}
                  </div>

                  {testReminderSent && (
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Test reminder sent! Melodic chime played & notification triggered.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-xs font-bold text-stone-200">Auto-display translations</div>
                <div className="text-[11px] text-stone-400">Show native meaning under every conversation turn</div>
              </div>
              <input
                type="checkbox"
                checked={form.autoTranslate}
                onChange={(e) => setForm({ ...form, autoTranslate: e.target.checked })}
                className="w-4 h-4 text-amber-500 rounded border-stone-700 focus:ring-amber-400 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-xs font-bold text-stone-200">Push-To-Talk Mode</div>
                <div className="text-[11px] text-stone-400">Hold button to talk instead of continuous microphone stream</div>
              </div>
              <input
                type="checkbox"
                checked={form.pushToTalk}
                onChange={(e) => setForm({ ...form, pushToTalk: e.target.checked })}
                className="w-4 h-4 text-amber-500 rounded border-stone-700 focus:ring-amber-400 cursor-pointer"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-stone-200 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
