import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  Calendar, 
  Check, 
  Radio, 
  Activity, 
  RotateCcw, 
  Send, 
  Zap, 
  ShieldCheck,
  CheckCircle2,
  Server,
  User,
  Bot,
  Play,
  Pause,
  Clock,
  HeartPulse,
  Settings2,
  Database,
  BrainCircuit,
  FileAudio,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';

interface TranscriptItem {
  role: 'patient' | 'doctor_ai';
  text: string;
  time: string;
  wordCount?: number;
  audioUrl?: string | null;
  isMeetingBooked?: boolean;
  bookedSlot?: string | null;
  treatment?: string | null;
  latencyMs?: number;
}

interface CallRecordingItem {
  id: string;
  callDate: string;
  durationSeconds: number;
  patientName: string;
  patientPhone: string;
  clinicName: string;
  audioFileName?: string;
  audioUrl?: string;
  fullTranscript: { role: 'patient' | 'doctor_ai'; text: string; time: string }[];
  sentiment: 'positive' | 'neutral' | 'urgent' | 'anxious';
  treatmentRequested: string;
  outcome: 'booked' | 'inquiry_answered' | 'rescheduled' | 'followup_needed';
  bookedSlot?: string | null;
  aiKeyTakeaways: string[];
  learnedClinicRule?: string;
}

interface LearnedInsightsSummary {
  lastTrainedAt: string;
  recordingsAnalyzed: number;
  conversionRate: string;
  topInquiredTreatments: string[];
  learnedRules: string[];
  recommendedImprovements: string[];
}

const BARS_COUNT = 15;
const GAUSSIAN_WEIGHTS = [0.18, 0.35, 0.58, 0.78, 0.92, 1.0, 0.96, 0.88, 0.95, 1.0, 0.89, 0.72, 0.52, 0.32, 0.15];

function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true); // 16-bit
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function mergeBuffers(buffers: Float32Array[]): Float32Array {
  let totalLength = 0;
  for (const b of buffers) totalLength += b.length;
  const result = new Float32Array(totalLength);
  let offset = 0;
  for (const b of buffers) {
    result.set(b, offset);
    offset += b.length;
  }
  return result;
}

export const CallingSandboxPage: React.FC = () => {
  // Navigation View: 'sandbox' | 'recordings'
  const [activeView, setActiveView] = useState<'sandbox' | 'recordings'>('sandbox');

  // Call Lifecycle States
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatusText, setCallStatusText] = useState<'Idle' | 'Listening to Patient...' | 'Patient Speaking' | 'AI Thinking' | 'Kokoro Synthesizing' | 'AI Speaking' | 'Anti-Echo Breather'>('Idle');
  const [handsFreeAutoMic, setHandsFreeAutoMic] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('bf_emma');
  const [speechSpeed, setSpeechSpeed] = useState(1.1);

  // Local Kokoro Server States
  const [serverStatus, setServerStatus] = useState<{
    online: boolean;
    model?: string;
    voicesCount?: number;
    latency?: number;
  }>({ online: false });

  // Visualizer & VAD States
  const [soundBars, setSoundBars] = useState<number[]>(new Array(BARS_COUNT).fill(12));
  const [patientSpeechInput, setPatientSpeechInput] = useState('');
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [bookedMeeting, setBookedMeeting] = useState<{ slot: string; treatment: string } | null>(null);

  // Recordings & AI Learning Database
  const [recordings, setRecordings] = useState<CallRecordingItem[]>([]);
  const [learnedInsights, setLearnedInsights] = useState<LearnedInsightsSummary | null>(null);
  const [isTrainingAI, setIsTrainingAI] = useState(false);
  const [playingRecordingId, setPlayingRecordingId] = useState<string | null>(null);

  // Audio Context, Speech Recognition & PCM Audio Buffer Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const turnPcmSamplesRef = useRef<Float32Array[]>([]);
  const fullCallPcmSamplesRef = useRef<Float32Array[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const smoothedBarsRef = useRef<number[]>(new Array(BARS_COUNT).fill(12));
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isCallActiveRef = useRef(false);
  const isAISpeakingRef = useRef(false);
  const isAntiEchoBreatherRef = useRef(false);
  const isPatientSpeakingVADRef = useRef(false);
  const hasSpokenInThisTurnRef = useRef(false);
  const transcriptBufferRef = useRef<string>('');
  const activeAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null);

  // Check Kokoro server status
  const checkKokoroServer = useCallback(async () => {
    try {
      const startT = performance.now();
      const res = await fetch('/api/v1/voice/kokoro/status');
      const data = await res.json();
      const pingMs = Math.round(performance.now() - startT);

      if (data.online || data.status === 'online') {
        setServerStatus({
          online: true,
          model: data.model || 'kokoro-v1.0.onnx',
          voicesCount: data.voices_count || 54,
          latency: pingMs,
        });
      } else {
        setServerStatus({ online: false });
      }
    } catch {
      setServerStatus({ online: false });
    }
  }, []);

  // Fetch recordings and learned insights
  const fetchRecordingsAndInsights = useCallback(async () => {
    try {
      const [recRes, insRes] = await Promise.all([
        fetch('/api/v1/voice/recordings'),
        fetch('/api/v1/voice/recordings/insights')
      ]);
      const recData = await recRes.json();
      const insData = await insRes.json();
      if (recData.recordings) setRecordings(recData.recordings);
      if (insData.insights) setLearnedInsights(insData.insights);
    } catch (err) {
      console.warn('Recordings fetch notice:', err);
    }
  }, []);

  useEffect(() => {
    checkKokoroServer();
    fetchRecordingsAndInsights();
    const interval = setInterval(checkKokoroServer, 8000);
    return () => clearInterval(interval);
  }, [checkKokoroServer, fetchRecordingsAndInsights]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  // Call duration counter
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCallActive) {
      timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCallActive]);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  /**
   * Plays audio with 250ms Anti-Echo Breather
   */
  const playKokoroAudio = (audioBase64: string, fallbackText?: string, onComplete?: () => void) => {
    if (activeAudioPlayerRef.current) {
      activeAudioPlayerRef.current.pause();
      activeAudioPlayerRef.current = null;
    }

    isAISpeakingRef.current = true;
    setCallStatusText('AI Speaking');

    const audio = new Audio(audioBase64);
    activeAudioPlayerRef.current = audio;

    const resumePatientListening = () => {
      isAISpeakingRef.current = false;
      isAntiEchoBreatherRef.current = true;
      setCallStatusText('Anti-Echo Breather');

      setTimeout(() => {
        isAntiEchoBreatherRef.current = false;
        if (isCallActiveRef.current) {
          setCallStatusText('Listening to Patient...');
          turnPcmSamplesRef.current = [];
          transcriptBufferRef.current = '';
          hasSpokenInThisTurnRef.current = false;
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {}
          }
        }
        if (onComplete) onComplete();
      }, 250);
    };

    audio.onended = resumePatientListening;

    audio.onerror = () => {
      if (fallbackText && 'speechSynthesis' in window) {
        const utt = new SpeechSynthesisUtterance(fallbackText);
        utt.rate = speechSpeed;
        utt.onend = resumePatientListening;
        window.speechSynthesis.speak(utt);
      } else {
        resumePatientListening();
      }
    };

    audio.play().catch(() => {
      resumePatientListening();
    });
  };

  /**
   * Converts an audio blob to base64 string
   */
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  /**
   * Submit Patient Turn (Audio Blob + Speech Text)
   */
  const handleSendTurn = async (userSpeech?: string, audioBlob?: Blob) => {
    const textInput = (userSpeech || transcriptBufferRef.current || patientSpeechInput).trim();
    transcriptBufferRef.current = '';
    setPatientSpeechInput('');
    setCallStatusText('AI Thinking');

    let audioBase64: string | undefined;
    if (audioBlob && audioBlob.size > 1000) {
      try {
        audioBase64 = await blobToBase64(audioBlob);
      } catch {}
    }

    // Temporary turn placeholder until server responds
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tempPatientTurn = textInput || 'Voice audio (transcribing with AI...)';

    setTranscripts((prev) => [
      ...prev,
      {
        role: 'patient',
        text: tempPatientTurn,
        time: timeStr,
        wordCount: tempPatientTurn.split(/\s+/).length,
      },
    ]);

    try {
      const historyPayload = transcripts.slice(-6).map((t) => ({
        role: t.role === 'doctor_ai' ? 'assistant' : 'user',
        content: t.text,
      }));

      // Call multimodal audio endpoint with Gemini 3.6 Flash
      const res = await fetch('/api/v1/voice/kokoro/sandbox-turn-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speech: textInput,
          audioBase64,
          mimeType: audioBlob?.type || 'audio/wav',
          conversationHistory: historyPayload,
          clinicName: 'St. James Dental Practice',
          voice: selectedVoice,
          speed: speechSpeed,
        }),
      });

      const data = await res.json();
      const detectedSpeech = data.detected_speech || textInput || 'I need dental help';
      const aiReply = data.reply || "I'd be glad to help you reserve your appointment at St. James Dental.";
      const wordCount = data.word_count || aiReply.split(/\s+/).length;

      // Update patient transcript with exact detected speech from Gemini
      setTranscripts((prev) => {
        const copy = [...prev];
        if (copy.length > 0 && copy[copy.length - 1].role === 'patient') {
          copy[copy.length - 1].text = detectedSpeech;
          copy[copy.length - 1].wordCount = detectedSpeech.split(/\s+/).length;
        }
        return [
          ...copy,
          {
            role: 'doctor_ai',
            text: aiReply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            wordCount,
            audioUrl: data.audio_base64 || null,
            isMeetingBooked: Boolean(data.is_meeting_booked),
            bookedSlot: data.booked_slot,
            treatment: data.treatment,
            latencyMs: data.latency_ms,
          },
        ];
      });

      // Detect autonomous meeting booking
      if (data.is_meeting_booked) {
        setBookedMeeting({
          slot: data.booked_slot || 'Thursday at 11:00 AM',
          treatment: data.treatment || 'Dental Care',
        });
      }

      // Play audio response via Kokoro
      if (data.audio_base64) {
        playKokoroAudio(data.audio_base64, aiReply);
      } else {
        setCallStatusText('Listening to Patient...');
        turnPcmSamplesRef.current = [];
      }
    } catch (err) {
      console.error('Turn submission error:', err);
      setCallStatusText('Listening to Patient...');
      turnPcmSamplesRef.current = [];
    }
  };

  /**
   * Harvests collected PCM samples and text, then submits turn
   */
  const harvestAndSubmitTurn = (overrideText?: string) => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    isPatientSpeakingVADRef.current = false;
    hasSpokenInThisTurnRef.current = false;

    const capturedText = (overrideText || transcriptBufferRef.current || patientSpeechInput).trim();
    transcriptBufferRef.current = '';
    setPatientSpeechInput('');

    let wavBlob: Blob | undefined;
    if (turnPcmSamplesRef.current.length > 0 && audioContextRef.current) {
      const merged = mergeBuffers(turnPcmSamplesRef.current);
      turnPcmSamplesRef.current = [];
      if (merged.length > 4000) { // at least 0.15s of audio
        wavBlob = encodeWAV(merged, audioContextRef.current.sampleRate);
      }
    }

    if (capturedText || (wavBlob && wavBlob.size > 1000)) {
      handleSendTurn(capturedText, wavBlob);
    }
  };

  /**
   * Setup Web Audio Soundwave Analyser & PCM Audio Processor
   */
  const setupWebAudioLoop = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }, 
        video: false 
      });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.65;
      source.connect(analyser);
      analyserRef.current = analyser;

      // ScriptProcessor captures raw PCM samples continuously without restart glitches
      const scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      turnPcmSamplesRef.current = [];
      fullCallPcmSamplesRef.current = [];

      scriptProcessor.onaudioprocess = (e) => {
        if (!isCallActiveRef.current || isAISpeakingRef.current || isAntiEchoBreatherRef.current || isMuted) {
          return;
        }
        const input = e.inputBuffer.getChannelData(0);
        const copy = new Float32Array(input.length);
        copy.set(input);
        turnPcmSamplesRef.current.push(copy);
        fullCallPcmSamplesRef.current.push(copy);
      };

      source.connect(scriptProcessor);
      const silencer = audioCtx.createGain();
      silencer.gain.value = 0;
      scriptProcessor.connect(silencer);
      silencer.connect(audioCtx.destination);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const renderSoundwave = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const average = sum / bufferLength;

        // VAD threshold detection: energy > 11
        const isSpeakingNow = average > 11 && !isAISpeakingRef.current && !isAntiEchoBreatherRef.current && !isMuted;

        if (isSpeakingNow) {
          isPatientSpeakingVADRef.current = true;
          hasSpokenInThisTurnRef.current = true;
          setCallStatusText('Patient Speaking');

          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else if (hasSpokenInThisTurnRef.current && !isAISpeakingRef.current && !isAntiEchoBreatherRef.current) {
          // Patient finished speaking -> start 900ms silence timer
          if (!silenceTimerRef.current && handsFreeAutoMic) {
            silenceTimerRef.current = setTimeout(() => {
              isPatientSpeakingVADRef.current = false;
              hasSpokenInThisTurnRef.current = false;
              silenceTimerRef.current = null;

              if (isCallActiveRef.current && !isAISpeakingRef.current && !isAntiEchoBreatherRef.current) {
                harvestAndSubmitTurn();
              }
            }, 900);
          }
        }

        const newBars = smoothedBarsRef.current.map((prev, idx) => {
          const weight = GAUSSIAN_WEIGHTS[idx];
          const rawAmp = isAISpeakingRef.current
            ? (30 + Math.random() * 55) * weight
            : isSpeakingNow
            ? Math.max(12, average * 1.6 * weight)
            : 10 + Math.random() * 4;

          const smoothed = Math.round(prev * 0.55 + rawAmp * 0.45);
          return Math.min(85, Math.max(8, smoothed));
        });

        smoothedBarsRef.current = newBars;
        setSoundBars([...newBars]);

        animationFrameRef.current = requestAnimationFrame(renderSoundwave);
      };

      renderSoundwave();
    } catch (err) {
      console.warn('[WebAudio] Mic stream notice:', err);
    }
  };

  /**
   * Setup Web Speech STT in parallel
   */
  const setupSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';

      recognition.onresult = (event: any) => {
        if (isAISpeakingRef.current || isAntiEchoBreatherRef.current || isMuted) return;

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) final += transcript + ' ';
          else interim += transcript;
        }

        const activeText = (final + interim).trim();
        if (activeText) {
          transcriptBufferRef.current = activeText;
          setPatientSpeechInput(activeText);
          setCallStatusText('Patient Speaking');
          hasSpokenInThisTurnRef.current = true;
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('[SpeechRecognition Notice]:', err?.error);
      };

      recognition.onend = () => {
        if (isCallActiveRef.current && !isAISpeakingRef.current && !isAntiEchoBreatherRef.current) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('[SpeechRecognition Start Notice]:', err);
    }
  };

  /**
   * Start Live Sandbox Call
   */
  const handleStartCall = async () => {
    isCallActiveRef.current = true;
    setIsCallActive(true);
    setBookedMeeting(null);
    setTranscripts([]);
    setCallStatusText('Kokoro Synthesizing');
    turnPcmSamplesRef.current = [];
    fullCallPcmSamplesRef.current = [];

    await setupWebAudioLoop();
    setupSpeechRecognition();

    const initialText = "Thank you for calling St. James Dental. I am Dr. Sarah's AI receptionist. How can I help you today?";
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const res = await fetch('/api/v1/voice/kokoro/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: initialText,
          voice: selectedVoice,
          speed: speechSpeed,
        }),
      });

      const data = await res.json();
      setTranscripts([
        {
          role: 'doctor_ai',
          text: initialText,
          time: timeStr,
          wordCount: initialText.split(/\s+/).length,
          audioUrl: data.audio_base64 || null,
          latencyMs: data.latency_ms,
        },
      ]);

      if (data.audio_base64) {
        playKokoroAudio(data.audio_base64, initialText);
      } else {
        setCallStatusText('Listening to Patient...');
      }
    } catch {
      setTranscripts([
        {
          role: 'doctor_ai',
          text: initialText,
          time: timeStr,
          wordCount: initialText.split(/\s+/).length,
        },
      ]);
      setCallStatusText('Listening to Patient...');
    }
  };

  /**
   * End Call Session & Automatically Save to Database
   */
  const handleEndCall = async () => {
    const finalDuration = callDuration;
    const finalTranscripts = [...transcripts];
    isCallActiveRef.current = false;
    setIsCallActive(false);
    setCallStatusText('Idle');

    if (activeAudioPlayerRef.current) {
      activeAudioPlayerRef.current.pause();
      activeAudioPlayerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isAISpeakingRef.current = false;
    isAntiEchoBreatherRef.current = false;
    hasSpokenInThisTurnRef.current = false;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (scriptProcessorRef.current) {
      try { scriptProcessorRef.current.disconnect(); } catch {}
      scriptProcessorRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    // Harvest full call WAV recording
    let fullAudioBase64: string | undefined;
    if (fullCallPcmSamplesRef.current.length > 0 && audioContextRef.current) {
      try {
        const merged = mergeBuffers(fullCallPcmSamplesRef.current);
        const fullWavBlob = encodeWAV(merged, audioContextRef.current.sampleRate);
        fullAudioBase64 = await blobToBase64(fullWavBlob);
      } catch (encErr) {
        console.warn('WAV encoding notice on hangup:', encErr);
      }
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setSoundBars(new Array(BARS_COUNT).fill(12));

    // Save Call to Database if there were conversational turns
    if (finalTranscripts.length > 1) {
      try {
        const allText = finalTranscripts.map(t => t.text).join(' ').toLowerCase();
        let sentiment: 'positive' | 'neutral' | 'urgent' | 'anxious' = 'positive';
        let treatment = 'General Dental Care';

        if (allText.includes('pain') || allText.includes('emergency') || allText.includes('ache') || allText.includes('broken')) {
          sentiment = 'urgent';
          treatment = 'Emergency Pain Relief (£95)';
        } else if (allText.includes('whitening')) {
          treatment = 'Laser Teeth Whitening (£395)';
        } else if (allText.includes('implant')) {
          treatment = 'Dental Implants Assessment (£2,800)';
        }

        await fetch('/api/v1/voice/recordings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            durationSeconds: finalDuration,
            patientName: 'Sandbox Caller (You)',
            patientPhone: '+44 7700 900123',
            clinicName: 'St. James Dental Practice',
            fullTranscript: finalTranscripts,
            sentiment,
            treatmentRequested: treatment,
            outcome: bookedMeeting ? 'booked' : 'inquiry_answered',
            bookedSlot: bookedMeeting?.slot || null,
            audioBase64: fullAudioBase64,
          }),
        });

        // Refresh recordings
        fetchRecordingsAndInsights();
      } catch (saveErr) {
        console.warn('Auto-save call recording notice:', saveErr);
      }
    }
  };

  /**
   * Trigger AI Learning on Call Recordings
   */
  const handleTrainAIOnRecordings = async () => {
    setIsTrainingAI(true);
    try {
      const res = await fetch('/api/v1/voice/recordings/learn', { method: 'POST' });
      const data = await res.json();
      if (data.insights) {
        setLearnedInsights(data.insights);
      }
    } catch (err) {
      console.error('AI Training error:', err);
    } finally {
      setIsTrainingAI(false);
    }
  };

  useEffect(() => {
    return () => {
      if (isCallActive) handleEndCall();
    };
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      
      {/* Top Banner & Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600/15 via-teal-600/10 to-blue-500/10 border border-emerald-500/20 backdrop-blur-xl shadow-lg shadow-emerald-500/5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/25">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  Doctor's Portal • AI Voice Calling Sandbox
                  <Badge variant="success">Kokoro 82M Neural Engine</Badge>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Full-duplex conversational sandbox. The AI agent acts from the doctor's clinic side; you communicate as the patient.
                </p>
              </div>
            </div>
          </div>

          {/* Sub-menu Toggle: Sandbox vs Database */}
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-xl bg-slate-200/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveView('sandbox')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeView === 'sandbox'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Live Call Sandbox</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveView('recordings');
                  fetchRecordingsAndInsights();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeView === 'recordings'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Call Recordings &amp; AI Learning ({recordings.length})</span>
              </button>
            </div>

            {/* Kokoro Status Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${serverStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300">
                {serverStatus.online ? `Kokoro: ${serverStatus.latency}ms` : 'Kokoro Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: LIVE CALL SANDBOX */}
      {activeView === 'sandbox' && (
        <div className="space-y-6">
          
          {/* Role Configuration Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/5 border border-blue-500/20 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">AI Agent (Doctor's Side)</span>
                  <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">
                    Dr. Sarah's Front Desk
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Knows clinical pricing (£95 exam, £395 whitening, £2,800 implants), triage, and appointment calendar slots.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">You (The Patient / Caller)</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold">
                    Mic &amp; Audio Stream Active
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Speak naturally into your microphone. Voice audio is captured and transcribed directly by the multimodal brain.
                </p>
              </div>
            </div>
          </div>

          {/* Autonomous Meeting Celebration Card */}
          {bookedMeeting && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-100 animate-fadeIn space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 animate-bounce" />
                  <span>🎉 Appointment Booked by AI Agent on Doctor's Calendar!</span>
                </div>
                <Badge variant="success">Auto-Synced</Badge>
              </div>
              <div className="text-xs space-y-1 bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-emerald-500/20 flex flex-wrap items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-slate-900 dark:text-white">Reserved Slot:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">{bookedMeeting.slot}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-slate-900 dark:text-white">Procedure:</span>
                  <span className="text-slate-700 dark:text-slate-300">{bookedMeeting.treatment}</span>
                </div>
              </div>
            </div>
          )}

          {/* Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Console: Soundwave, Call Controls, Settings (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Soundwave Console */}
              <div className="p-6 rounded-3xl bg-slate-950 text-white shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[220px] border border-slate-800">
                <div className="w-full flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      isCallActive
                        ? callStatusText === 'Patient Speaking'
                          ? 'bg-amber-400 animate-ping'
                          : callStatusText === 'AI Speaking'
                          ? 'bg-emerald-400 animate-pulse'
                          : 'bg-teal-400'
                        : 'bg-slate-600'
                    }`} />
                    <span className="text-xs font-mono font-bold text-slate-300 tracking-wider uppercase">
                      {callStatusText}
                    </span>
                  </div>
                  <div className="font-mono text-xs font-bold text-emerald-400">
                    {isCallActive ? `CALL ACTIVE • ${formatDuration(callDuration)}` : 'CALL IDLE'}
                  </div>
                </div>

                {callStatusText === 'Anti-Echo Breather' && (
                  <div className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10.5px] font-mono mb-2 animate-fadeIn">
                    250ms Acoustic Anti-Echo Breather Active
                  </div>
                )}

                {/* 15-Bar Soundwave */}
                <div className="flex items-center justify-center gap-2.5 h-28 my-2">
                  {soundBars.map((height, idx) => (
                    <div
                      key={idx}
                      style={{ height: `${height}%` }}
                      className={`w-3 rounded-full transition-all duration-75 ${
                        isCallActive
                          ? callStatusText === 'Patient Speaking'
                            ? 'bg-gradient-to-t from-amber-500 to-yellow-300 shadow-md shadow-amber-400/50'
                            : callStatusText === 'AI Speaking'
                            ? 'bg-gradient-to-t from-emerald-600 to-teal-300 shadow-md shadow-emerald-400/50'
                            : 'bg-gradient-to-t from-teal-600 to-cyan-400'
                          : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>

                {/* HUD Footer */}
                <div className="w-full flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800/80 mt-2 px-1">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={handsFreeAutoMic}
                      onChange={(e) => setHandsFreeAutoMic(e.target.checked)}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-200">[✓] Hands-Free VAD Auto-Submit</span>
                  </label>

                  {isCallActive && (
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        isMuted ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      <span>{isMuted ? 'Muted' : 'Mute'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Call Start / Hang Up Buttons */}
              <div className="space-y-2">
                {!isCallActive ? (
                  <button
                    onClick={handleStartCall}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Doctor's Front Desk (Start Sandbox)</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => harvestAndSubmitTurn()}
                      className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Done Speaking (Submit Turn to Doctor AI ➔)</span>
                    </button>
                    <button
                      onClick={handleEndCall}
                      className="w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded-2xl bg-rose-600/90 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs shadow-md transition-all"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>Hang Up &amp; Save Call to Database</span>
                    </button>
                  </div>
                )}

                {/* Live Speech Recognition Transcript Preview */}
                {isCallActive && patientSpeechInput && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-2 animate-fadeIn">
                    <div className="text-xs text-amber-800 dark:text-amber-200 truncate">
                      <span className="font-bold mr-1.5">Microphone Heard:</span>
                      <span className="italic">"{patientSpeechInput}"</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => harvestAndSubmitTurn(patientSpeechInput)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold flex-shrink-0"
                    >
                      Send ➔
                    </button>
                  </div>
                )}
              </div>

              {/* Voice Tuning */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Settings2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Kokoro Neural Voice &amp; Speed</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">24,000 Hz</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                      Receptionist Persona:
                    </label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      disabled={isCallActive}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="bf_emma">Emma (British Female - Crisp Receptionist)</option>
                      <option value="bf_isabella">Isabella (British Female - Warm Clinical)</option>
                      <option value="af_sarah">Sarah (American Female - Professional)</option>
                      <option value="af_bella">Bella (American Female - Friendly)</option>
                      <option value="am_adam">Adam (American Male - Authoritative)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      <span>Conversational Speed:</span>
                      <span className="font-mono">{speechSpeed}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="1.3"
                      step="0.05"
                      value={speechSpeed}
                      onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
                      disabled={isCallActive}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Scenarios */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Quick Patient Test Queries:
                </span>
                <div className="space-y-1.5">
                  {[
                    { label: '🚨 Emergency Toothache', query: 'I have severe pain in my tooth, can I get an emergency appointment today?' },
                    { label: '✨ Teeth Whitening', query: 'How much is laser teeth whitening and does it cause tooth sensitivity?' },
                    { label: '🦷 Dental Implants', query: 'Do you offer monthly financing for single dental implants?' },
                    { label: '📅 Confirm Slot', query: 'Yes, Thursday at 11:00 AM works perfectly, please book it.' },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (isCallActive) handleSendTurn(item.query);
                        else setPatientSpeechInput(item.query);
                      }}
                      className="w-full text-left p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-slate-200 dark:border-slate-700/60 text-xs transition-colors group"
                    >
                      <div className="font-semibold text-slate-800 dark:text-slate-200 text-[11.5px] group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        "{item.query}"
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Feed: Transcript, Live Captions, Audio Replay (7 cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-emerald-500" />
                  <span>Conversational Audio Feed</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  Calibrated: 12-15 Words/Turn • CD Quality WAV
                </span>
              </div>

              {/* Transcript Scroll Area */}
              <div
                ref={transcriptScrollRef}
                className="flex-1 min-h-[460px] max-h-[580px] overflow-y-auto p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs"
              >
                {transcripts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-20">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                      <Mic className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="font-bold text-slate-600 dark:text-slate-300 text-sm">
                      Sandbox Ready
                    </div>
                    <p className="text-xs text-center max-w-sm text-slate-500">
                      Click <strong>"Call Doctor's Front Desk"</strong> to begin. When you speak, audio is processed directly through the multimodal voice engine and Kokoro speaks back.
                    </p>
                  </div>
                ) : (
                  transcripts.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${item.role === 'doctor_ai' ? 'items-start' : 'items-end'} space-y-1`}
                    >
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="font-bold">
                          {item.role === 'doctor_ai' ? "🏥 AI Agent (Dr. Sarah's Front Desk)" : '👤 You (Patient)'}
                        </span>
                        <span>•</span>
                        <span>{item.time}</span>
                        {item.wordCount && (
                          <span className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[9px] text-slate-600 dark:text-slate-300">
                            {item.wordCount} words
                          </span>
                        )}
                        {item.latencyMs && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[9px]">
                            Kokoro: {item.latencyMs}ms
                          </span>
                        )}
                      </div>

                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed text-xs shadow-sm ${
                          item.role === 'doctor_ai'
                            ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-tl-sm'
                            : 'bg-blue-600 text-white rounded-tr-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>{item.text}</div>
                          {item.audioUrl && (
                            <button
                              type="button"
                              onClick={() => playKokoroAudio(item.audioUrl!)}
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex-shrink-0 transition-colors"
                              title="Replay Kokoro Audio"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Manual Input Fallback */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={patientSpeechInput}
                  onChange={(e) => setPatientSpeechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && patientSpeechInput) {
                      handleSendTurn(patientSpeechInput);
                    }
                  }}
                  placeholder={isCallActive ? "Speak into microphone or type patient inquiry here..." : "Start call to speak..."}
                  disabled={!isCallActive}
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={() => handleSendTurn(patientSpeechInput)}
                  disabled={!isCallActive || !patientSpeechInput}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/25 disabled:opacity-40 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: DATABASE OF CALL RECORDINGS & AI LEARNING ENGINE */}
      {activeView === 'recordings' && (
        <div className="space-y-6">
          
          {/* AI Learning & Insights Header Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-600/15 via-indigo-600/10 to-blue-500/10 border border-purple-500/20 space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-purple-500 animate-pulse" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Autonomous AI Audio Learning &amp; Clinic Adaptation
                  </h3>
                  <Badge variant="purple">Memory Active</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  The AI listens to all recorded phone calls, extracts patient behavioral patterns, and updates its active front-desk rules.
                </p>
              </div>

              <button
                onClick={handleTrainAIOnRecordings}
                disabled={isTrainingAI}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 active:scale-95 rounded-xl shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isTrainingAI ? 'animate-spin' : ''}`} />
                <span>{isTrainingAI ? 'Analyzing Call Recordings...' : 'Train AI on All Recordings'}</span>
              </button>
            </div>

            {/* Learned Insights Metrics Strip */}
            {learnedInsights && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-purple-500/20 text-xs space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium">Recordings Analyzed</span>
                  <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
                    {learnedInsights.recordingsAnalyzed} calls
                  </div>
                  <span className="text-[10px] text-slate-400">Last trained: {new Date(learnedInsights.lastTrainedAt).toLocaleTimeString()}</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-purple-500/20 text-xs space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium">Call-to-Booking Conversion</span>
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {learnedInsights.conversionRate}
                  </div>
                  <span className="text-[10px] text-emerald-600/80 font-medium">High patient commitment</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-purple-500/20 text-xs space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium">Top Inquired Procedures</span>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {learnedInsights.topInquiredTreatments.slice(0, 2).join(', ')}
                  </div>
                  <span className="text-[10px] text-slate-400">Driven by patient volume</span>
                </div>
              </div>
            )}

            {/* Learned Rules Cards */}
            {learnedInsights?.learnedRules && learnedInsights.learnedRules.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-purple-500/20 space-y-2">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                  <span>Learned Clinic Rules (Injected into Live AI Front Desk):</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {learnedInsights.learnedRules.map((rule, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/15 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Call Recordings Database List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileAudio className="w-4 h-4 text-blue-500" />
                <span>Call Recordings Database ({recordings.length} Recorded Calls)</span>
              </h3>
              <span className="text-[11px] text-slate-400">All calls stored with audio and full transcripts</span>
            </div>

            <div className="space-y-3">
              {recordings.map((rec) => (
                <div
                  key={rec.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/30 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs ${
                        rec.outcome === 'booked' 
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                          : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      }`}>
                        {rec.outcome === 'booked' ? '✓' : '📞'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                          <span>{rec.patientName}</span>
                          <Badge variant={rec.outcome === 'booked' ? 'success' : 'neutral'}>
                            {rec.outcome === 'booked' ? 'Appointment Confirmed' : 'Inquiry Answered'}
                          </Badge>
                          {rec.sentiment === 'urgent' && (
                            <Badge variant="danger">Urgent Pain</Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {rec.patientPhone} • {new Date(rec.callDate).toLocaleString()} • Duration: {rec.durationSeconds}s
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {rec.treatmentRequested}
                      </span>
                    </div>
                  </div>

                  {/* Audio Player if audio URL exists */}
                  {rec.audioUrl && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (playingRecordingId === rec.id) {
                            if (activeAudioPlayerRef.current) activeAudioPlayerRef.current.pause();
                            setPlayingRecordingId(null);
                          } else {
                            if (activeAudioPlayerRef.current) activeAudioPlayerRef.current.pause();
                            const audio = new Audio(rec.audioUrl);
                            activeAudioPlayerRef.current = audio;
                            audio.onended = () => setPlayingRecordingId(null);
                            audio.play();
                            setPlayingRecordingId(rec.id);
                          }
                        }}
                        className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center flex-shrink-0"
                      >
                        {playingRecordingId === rec.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                      <div className="flex-1 text-xs text-slate-500">
                        <span className="font-mono text-slate-800 dark:text-slate-200 font-bold mr-2">Call Audio Recording:</span>
                        <span>{rec.audioFileName || 'call_audio.webm'}</span>
                      </div>
                    </div>
                  )}

                  {/* Transcript Preview */}
                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-slate-500 dark:text-slate-400 text-[11px] block">
                      Call Dialogue:
                    </span>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5 max-h-40 overflow-y-auto">
                      {rec.fullTranscript.map((turn, tIdx) => (
                        <div key={tIdx} className="leading-relaxed">
                          <span className={`font-bold ${turn.role === 'doctor_ai' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                            {turn.role === 'doctor_ai' ? "AI Sarah: " : "Patient: "}
                          </span>
                          <span className="text-slate-700 dark:text-slate-300">{turn.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Takeaways */}
                  {rec.aiKeyTakeaways && rec.aiKeyTakeaways.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400">AI Takeaways:</span>
                      {rec.aiKeyTakeaways.map((takeaway, tkIdx) => (
                        <span key={tkIdx} className="text-[10.5px] px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          ✓ {takeaway}
                        </span>
                      ))}
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
