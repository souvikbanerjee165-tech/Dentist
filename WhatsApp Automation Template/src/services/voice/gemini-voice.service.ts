import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { config } from '../../config/env.js';

export interface DailyVoiceQuota {
  date: string; // YYYY-MM-DD UTC
  requestsToday: number;
  dailyLimit: number;
  lastRequestTimestamp: string;
}

export interface VoiceSynthesisResult {
  audioBase64: string | null;
  latencyMs: number;
  engine: string;
  voice: string;
  quotaRemaining: number;
  isFallback: boolean;
  error?: string;
}

const KOKORO_SERVER_URL = process.env.KOKORO_SERVER_URL || 'http://127.0.0.1:8880';
const QUOTA_FILE_PATH = path.join(process.cwd(), 'data', 'gemini_voice_quota.json');
const DEFAULT_DAILY_LIMIT = 1500; // Free tier 1,500 RPD

export class GeminiVoiceService {
  private static instance: GeminiVoiceService;
  private quota: DailyVoiceQuota;

  private constructor() {
    this.quota = this.loadQuota();
  }

  static getInstance(): GeminiVoiceService {
    if (!GeminiVoiceService.instance) {
      GeminiVoiceService.instance = new GeminiVoiceService();
    }
    return GeminiVoiceService.instance;
  }

  /**
   * Loads or initializes the daily voice quota tracking
   */
  private loadQuota(): DailyVoiceQuota {
    const todayUtc = new Date().toISOString().split('T')[0];
    try {
      if (fs.existsSync(QUOTA_FILE_PATH)) {
        const raw = fs.readFileSync(QUOTA_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw) as DailyVoiceQuota;
        if (parsed.date === todayUtc) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[GeminiVoice] Quota file read notice:', err);
    }

    // New day or first run
    const newQuota: DailyVoiceQuota = {
      date: todayUtc,
      requestsToday: 0,
      dailyLimit: DEFAULT_DAILY_LIMIT,
      lastRequestTimestamp: new Date().toISOString(),
    };
    this.saveQuota(newQuota);
    return newQuota;
  }

  private saveQuota(quota: DailyVoiceQuota) {
    try {
      const dir = path.dirname(QUOTA_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(QUOTA_FILE_PATH, JSON.stringify(quota, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[GeminiVoice] Quota file save notice:', err);
    }
  }

  /**
   * Returns current daily quota stats
   */
  getQuotaStats(): {
    date: string;
    requestsToday: number;
    dailyLimit: number;
    remainingToday: number;
    quotaExceeded: boolean;
    primaryEngine: string;
    fallbackEngine: string;
  } {
    const todayUtc = new Date().toISOString().split('T')[0];
    if (this.quota.date !== todayUtc) {
      this.quota = this.loadQuota();
    }

    const remaining = Math.max(0, this.quota.dailyLimit - this.quota.requestsToday);
    return {
      date: this.quota.date,
      requestsToday: this.quota.requestsToday,
      dailyLimit: this.quota.dailyLimit,
      remainingToday: remaining,
      quotaExceeded: this.quota.requestsToday >= this.quota.dailyLimit,
      primaryEngine: 'Google Gemini Neural Voice (gemini-2.5-flash-preview-tts)',
      fallbackEngine: 'Kokoro-82M Local Server',
    };
  }

  /**
   * Wraps raw 16-bit 24kHz PCM into a standard browser-playable WAV base64 string
   */
  private pcmToWavBase64(pcmBase64: string, sampleRate = 24000): string {
    const pcmBuffer = Buffer.from(pcmBase64, 'base64');
    const wavHeader = Buffer.alloc(44);

    // RIFF identifier
    wavHeader.write('RIFF', 0);
    wavHeader.writeUInt32LE(36 + pcmBuffer.length, 4);
    wavHeader.write('WAVE', 8);

    // fmt subchunk
    wavHeader.write('fmt ', 12);
    wavHeader.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
    wavHeader.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
    wavHeader.writeUInt16LE(1, 22);  // NumChannels (1 = Mono)
    wavHeader.writeUInt32LE(sampleRate, 24); // SampleRate (24,000 Hz)
    wavHeader.writeUInt32LE(sampleRate * 2, 28); // ByteRate (24,000 * 2)
    wavHeader.writeUInt16LE(2, 32);  // BlockAlign (1 * 16/8)
    wavHeader.writeUInt16LE(16, 34); // BitsPerSample (16 bits)

    // data subchunk
    wavHeader.write('data', 36);
    wavHeader.writeUInt32LE(pcmBuffer.length, 40);

    const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);
    return `data:audio/wav;base64,${wavBuffer.toString('base64')}`;
  }

  /**
   * Synthesize audio via Kokoro local server (Fallback engine)
   */
  async synthesizeViaKokoro(
    text: string, 
    voice = 'bf_emma', 
    speed = 1.1
  ): Promise<{ audioBase64: string | null; latencyMs: number; error?: string }> {
    const startT = performance.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(`${KOKORO_SERVER_URL}/synthesize/base64`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: voice || 'bf_emma',
          speed: speed || 1.1,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const latency = Math.round(performance.now() - startT);
        return { audioBase64: data.audio_base64, latencyMs: latency };
      }
      return { audioBase64: null, latencyMs: Math.round(performance.now() - startT), error: 'Kokoro server returned non-200' };
    } catch (err: any) {
      return { audioBase64: null, latencyMs: Math.round(performance.now() - startT), error: err.message };
    }
  }

  /**
   * Primary Speech Synthesis:
   * 1. Attempts Google Gemini Neural Voice (Kore, Aoede, Puck, Charon) within 1,500 daily quota
   * 2. Automatically falls back to local Kokoro-82M without dropping the call turn
   */
  async synthesize(params: {
    text: string;
    engine?: 'auto' | 'gemini' | 'kokoro';
    voice?: string;
    speed?: number;
  }): Promise<VoiceSynthesisResult> {
    const { text, engine = 'auto', voice, speed = 1.1 } = params;
    const startT = performance.now();
    const quotaStats = this.getQuotaStats();

    // Mapping Gemini voice names
    const geminiVoices = ['Kore', 'Aoede', 'Puck', 'Charon', 'Fenrir', 'Leda'];
    const chosenGeminiVoice = geminiVoices.includes(voice || '') ? voice! : 'Kore';
    const chosenKokoroVoice = !geminiVoices.includes(voice || '') && voice ? voice : 'bf_emma';

    // If explicit Kokoro is requested or quota is exhausted, route directly to Kokoro
    if (engine === 'kokoro' || quotaStats.quotaExceeded) {
      const kokoroResult = await this.synthesizeViaKokoro(text, chosenKokoroVoice, speed);
      return {
        audioBase64: kokoroResult.audioBase64,
        latencyMs: kokoroResult.latencyMs,
        engine: `Kokoro-82M Local Server (${chosenKokoroVoice})`,
        voice: chosenKokoroVoice,
        quotaRemaining: quotaStats.remainingToday,
        isFallback: quotaStats.quotaExceeded,
        error: kokoroResult.error,
      };
    }

    // Attempt Gemini Neural Voice (Primary Engine)
    if (config.gemini.apiKey && !config.gemini.apiKey.startsWith('your_gemini')) {
      try {
        const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6500);

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-tts',
          contents: [{ role: 'user', parts: [{ text }] }],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: chosenGeminiVoice,
                },
              },
            },
          },
        });
        clearTimeout(timeout);

        const candidate = response.candidates?.[0];
        const audioPart = candidate?.content?.parts?.find((p) => p.inlineData && p.inlineData.data);

        if (audioPart?.inlineData?.data) {
          const wavBase64 = this.pcmToWavBase64(audioPart.inlineData.data, 24000);
          const latencyMs = Math.round(performance.now() - startT);

          // Increment daily quota count
          this.quota.requestsToday += 1;
          this.quota.lastRequestTimestamp = new Date().toISOString();
          this.saveQuota(this.quota);

          return {
            audioBase64: wavBase64,
            latencyMs,
            engine: `Google Gemini Neural Voice (${chosenGeminiVoice})`,
            voice: chosenGeminiVoice,
            quotaRemaining: Math.max(0, this.quota.dailyLimit - this.quota.requestsToday),
            isFallback: false,
          };
        }
      } catch (geminiErr: any) {
        console.warn('[GeminiVoice] Gemini TTS notice, activating Kokoro fallback:', geminiErr.message);
      }
    }

    // Fallback to Kokoro Local Server
    console.log('[GeminiVoice] Falling back to Kokoro-82M Local Server...');
    const kokoroFallback = await this.synthesizeViaKokoro(text, chosenKokoroVoice, speed);
    return {
      audioBase64: kokoroFallback.audioBase64,
      latencyMs: Math.round(performance.now() - startT),
      engine: `Kokoro-82M Local Server (Fallback: ${chosenKokoroVoice})`,
      voice: chosenKokoroVoice,
      quotaRemaining: quotaStats.remainingToday,
      isFallback: true,
      error: kokoroFallback.error,
    };
  }
}

export const geminiVoiceService = GeminiVoiceService.getInstance();
