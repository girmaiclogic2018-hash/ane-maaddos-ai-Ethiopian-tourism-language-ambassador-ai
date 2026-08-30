/**
 * Audio processing utilities for Gemini Live API real-time PCM streaming
 * 
 * Rules:
 * - Input: 16kHz raw 16-bit PCM Little Endian (mic to server)
 * - Output: 24kHz raw 16-bit PCM Little Endian (server/model to client)
 * - Gapless playback scheduling with AudioBufferSourceNode
 */

// Convert Float32Array (-1.0 to 1.0) to 16-bit PCM Base64 string
export function float32ToPcmBase64(inputData: Float32Array): string {
  const pcm16 = new Int16Array(inputData.length);
  for (let i = 0; i < inputData.length; i++) {
    // Clamp sample between -1.0 and 1.0
    const s = Math.max(-1, Math.min(1, inputData[i]));
    // Convert to signed 16-bit integer (-32768 to 32767)
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  
  const bytes = new Uint8Array(pcm16.buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 16-bit PCM to AudioBuffer at 24kHz
export function base64ToAudioBuffer(
  audioCtx: AudioContext,
  base64Data: string,
  sampleRate = 24000
): AudioBuffer | null {
  try {
    const binary = atob(base64Data);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7fff);
    }

    const audioBuffer = audioCtx.createBuffer(1, float32Array.length, sampleRate);
    audioBuffer.getChannelData(0).set(float32Array);
    return audioBuffer;
  } catch (err) {
    console.error('Error decoding PCM audio buffer:', err);
    return null;
  }
}

// Audio Stream Manager for gapless playback with interrupt support
export class LiveAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private nextStartTime = 0;
  private activeNodes: AudioBufferSourceNode[] = [];
  private isPlaying = false;
  private onSpeakingChange?: (isSpeaking: boolean) => void;
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  constructor(onSpeakingChange?: (isSpeaking: boolean) => void) {
    this.onSpeakingChange = onSpeakingChange;
  }

  public init() {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass({ sampleRate: 24000 });
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.startCheckLoop();
  }

  public playChunk(base64Pcm: string) {
    if (!this.audioCtx) {
      this.init();
    }
    if (!this.audioCtx) return;

    const buffer = base64ToAudioBuffer(this.audioCtx, base64Pcm, 24000);
    if (!buffer) return;

    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioCtx.destination);

    const now = this.audioCtx.currentTime;
    if (this.nextStartTime < now) {
      this.nextStartTime = now + 0.03; // small lead cushion for jitter
    }

    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
    this.activeNodes.push(source);

    if (!this.isPlaying) {
      this.isPlaying = true;
      this.onSpeakingChange?.(true);
    }

    source.onended = () => {
      const idx = this.activeNodes.indexOf(source);
      if (idx !== -1) {
        this.activeNodes.splice(idx, 1);
      }
      if (this.activeNodes.length === 0 && (!this.audioCtx || this.audioCtx.currentTime >= this.nextStartTime - 0.05)) {
        this.isPlaying = false;
        this.onSpeakingChange?.(false);
      }
    };
  }

  public interrupt() {
    for (const node of this.activeNodes) {
      try {
        node.stop();
        node.disconnect();
      } catch {
        // already stopped
      }
    }
    this.activeNodes = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    }
    if (this.isPlaying) {
      this.isPlaying = false;
      this.onSpeakingChange?.(false);
    }
  }

  private startCheckLoop() {
    if (this.checkInterval) return;
    this.checkInterval = setInterval(() => {
      if (this.audioCtx && this.isPlaying && this.activeNodes.length === 0 && this.audioCtx.currentTime >= this.nextStartTime) {
        this.isPlaying = false;
        this.onSpeakingChange?.(false);
      }
    }, 150);
  }

  public destroy() {
    this.interrupt();
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

// Calculate audio level (RMS) for visualizer
export function calculateRms(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(sum / buffer.length);
  return Math.min(1, rms * 4); // normalize with amplification
}
