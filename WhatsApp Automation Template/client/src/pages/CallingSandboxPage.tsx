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
  Settings2
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

const BARS_COUNT = 15;
const GAUSSIAN_WEIGHTS = [0.18, 0.35, 0.58, 0.78, 0.92, 1.0, 0.96, 0.88, 0.95, 1.0, 0.89, 0.72, 0.52, 0.32, 0.15];

export const CallingSandboxPage: React.FC = () => {
  // Call Lifecycle States
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatusText, setCallStatusText] = useState<'Idle' | 'Listening to Patient...' | 'Patient Speaking' | 'AI Thinking' | 'Kokoro Synthesizing' | 'AI Speaking' | 'Anti-Echo Breather'>('Idle');
  const [handsFreeAutoMic, setHandsFreeAutoMic] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('bf_emma');
  const [speechSpeed, setSpeechSpeed] = useState(1.0);

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
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState<string | null>(null);

  // Audio Context & Speech Recognition Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const smoothedBarsRef = useRef<number[]>(new Array(BARS_COUNT).fill(12));
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAISpeakingRef = useRef(false);
  const isAntiEchoBreatherRef = useRef(false);
  const transcriptBufferRef = useRef<string>('');
  const activeAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null);

  // Poll Local Kokoro Server Status
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

  useEffect(() => {
    checkKokoroServer();
    const interval = setInterval(checkKokoroServer, 8000);
    return () => clearInterval(interval);
  }, [checkKokoroServer]);

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
   * Plays audio from base64 WAV (Kokoro) with 250ms Anti-Echo Breather
   */
  const playKokoroAudio = useCallback((audioBase64: string, fallbackText?: string, onComplete?: () => void) => {
    if (activeAudioPlayerRef.current) {
      activeAudioPlayerRef.current.pause();
      activeAudioPlayerRef.current = null;
    }

    isAISpeakingRef.current = true;
    setCallStatusText('AI Speaking');
    setCurrentlyPlayingAudio(audioBase64);

    const audio = new Audio(audioBase64);
    activeAudioPlayerRef.current = audio;

    audio.onended = () => {
      isAISpeakingRef.current = false;
      isAntiEchoBreatherRef.current = true;
      setCallStatusText('Anti-Echo Breather');
      setCurrentlyPlayingAudio(null);

      // 250ms acoustic breather prevents speaker reverberation from triggering the mic
      setTimeout(() => {
        isAntiEchoBreatherRef.current = false;
        if (isCallActive) {
          setCallStatusText('Listening to Patient...');
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {
              // Ignore restart error
            }
          }
        }
        if (onComplete) onComplete();
      }, 250);
    };

    audio.onerror = () => {
      // Fallback to browser TTS if audio decoding fails
      if (fallbackText && 'speechSynthesis' in window) {
        const utt = new SpeechSynthesisUtterance(fallbackText);
        utt.rate = speechSpeed;
        utt.onend = () => {
          isAISpeakingRef.current = false;
          setCallStatusText('Listening to Patient...');
        };
        window.speechSynthesis.speak(utt);
      } else {
        isAISpeakingRef.current = false;
        setCallStatusText('Listening to Patient...');
      }
    };

    audio.play().catch((err) => {
      console.warn('Audio play notice (user interaction requirement):', err);
      isAISpeakingRef.current = false;
      setCallStatusText('Listening to Patient...');
    });
  }, [isCallActive, speechSpeed]);

  /**
   * Submit Patient Speech Turn -> Doctor AI processes -> Kokoro synthesizes
   */
  const handleSendTurn = useCallback(async (userSpeech: string) => {
    const trimmed = userSpeech.trim();
    if (!trimmed) return;

    transcriptBufferRef.current = '';
    setPatientSpeechInput('');

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTranscripts((prev) => [
      ...prev,
      {
        role: 'patient',
        text: trimmed,
        time: timeStr,
        wordCount: trimmed.split(/\s+/).length,
      },
    ]);

    setCallStatusText('AI Thinking');

    try {
      const historyPayload = transcripts.slice(-6).map((t) => ({
        role: t.role === 'doctor_ai' ? 'assistant' : 'user',
        content: t.text,
      }));

      // Call Kokoro sandbox turn endpoint
      const res = await fetch('/api/v1/voice/kokoro/sandbox-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speech: trimmed,
          conversationHistory: historyPayload,
          clinicName: 'St. James Dental Practice',
          voice: selectedVoice,
          speed: speechSpeed,
        }),
      });

      const data = await res.json();
      const aiReply = data.reply || "I'd be glad to help you reserve your appointment at St. James Dental.";
      const wordCount = data.word_count || aiReply.split(/\s+/).length;

      // Detect autonomous meeting booking
      if (data.is_meeting_booked) {
        setBookedMeeting({
          slot: data.booked_slot || 'Thursday at 11:00 AM',
          treatment: data.treatment || 'Dental Care',
        });
      }

      setTranscripts((prev) => [
        ...prev,
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
      ]);

      // If local Kokoro server returned audio, play it immediately!
      if (data.audio_base64) {
        playKokoroAudio(data.audio_base64, aiReply);
      } else {
        // Fallback to Web Speech API
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          isAISpeakingRef.current = true;
          setCallStatusText('AI Speaking');
          const utt = new SpeechSynthesisUtterance(aiReply);
          utt.rate = speechSpeed;
          utt.onend = () => {
            isAISpeakingRef.current = false;
            setCallStatusText('Listening to Patient...');
          };
          window.speechSynthesis.speak(utt);
        }
      }
    } catch (err) {
      console.error('Turn error:', err);
      setCallStatusText('Listening to Patient...');
    }
  }, [transcripts, selectedVoice, speechSpeed, playKokoroAudio]);

  /**
   * Setup Web Audio Soundwave Analyser
   */
  const setupWebAudioLoop = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
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

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const renderSoundwave = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const average = sum / bufferLength;

        const isSpeaking = average > 14 && !isAISpeakingRef.current && !isAntiEchoBreatherRef.current;

        if (isSpeaking && callStatusText !== 'Patient Speaking') {
          setCallStatusText('Patient Speaking');
        }

        const newBars = smoothedBarsRef.current.map((prev, idx) => {
          const weight = GAUSSIAN_WEIGHTS[idx];
          const rawAmp = isAISpeakingRef.current
            ? (30 + Math.random() * 55) * weight // Kokoro AI speaking wave
            : isSpeaking
            ? Math.max(12, average * 1.5 * weight) // Patient speaking wave
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
   * Setup Continuous Speech Recognition with 850ms VAD Silence Auto-Submit
   */
  const setupSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-GB';

    recognition.onresult = (event: any) => {
      if (isAISpeakingRef.current || isAntiEchoBreatherRef.current || isMuted) {
        return;
      }

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

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        if (handsFreeAutoMic) {
          silenceTimerRef.current = setTimeout(() => {
            if (transcriptBufferRef.current && !isAISpeakingRef.current && !isAntiEchoBreatherRef.current) {
              handleSendTurn(transcriptBufferRef.current);
            }
          }, 850);
        }
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech') console.warn('[STT] SpeechRecognition event:', e.error);
    };

    recognition.onend = () => {
      if (isCallActive && !isAISpeakingRef.current && !isAntiEchoBreatherRef.current) {
        try {
          recognition.start();
        } catch {}
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('SpeechRecognition start notice:', e);
    }
  }, [isCallActive, isMuted, handsFreeAutoMic, handleSendTurn]);

  /**
   * Start Live Sandbox Call
   */
  const handleStartCall = async () => {
    setIsCallActive(true);
    setBookedMeeting(null);
    setTranscripts([]);
    setCallStatusText('Kokoro Synthesizing');

    await setupWebAudioLoop();
    setupSpeechRecognition();

    // Initial greeting synthesized via Kokoro
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
   * End Call Session
   */
  const handleEndCall = () => {
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

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setSoundBars(new Array(BARS_COUNT).fill(12));
  };

  useEffect(() => {
    return () => handleEndCall();
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

          {/* Local Kokoro Server HUD */}
          <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${serverStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Server className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Kokoro Local Server</span>
                  {serverStatus.online ? (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      (127.0.0.1:8880 • {serverStatus.latency}ms)
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-500">(Connecting...)</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">
                  {serverStatus.online 
                    ? `Active on PC • ${serverStatus.voicesCount} voices • Sub-second CD audio`
                    : 'Run `py kokoro_server/server.py` to start local daemon'}
                </div>
              </div>
            </div>
            <button
              onClick={checkKokoroServer}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Refresh connection"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Role Configuration Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Doctor's Side Persona */}
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
              Knows treatment pricing (£95 exam, £395 whitening, £2,800 implants), triage, and calendar slots.
            </p>
          </div>
        </div>

        {/* Patient Side Persona */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">You (The Patient / Caller)</span>
              <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold">
                Mic Enabled
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Speak into your microphone naturally or click preset patient queries to test clinical replies.
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

      {/* Main Interactive Call Sandbox Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Soundwave Visualizer, Controls, and Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Soundwave Console */}
          <div className="p-6 rounded-3xl bg-slate-950 text-white shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[220px] border border-slate-800">
            {/* HUD Status Header */}
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

            {/* Anti-Echo Breather indicator */}
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

            {/* Controls Bar inside Visualizer */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800/80 mt-2 px-1">
              <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={handsFreeAutoMic}
                  onChange={(e) => setHandsFreeAutoMic(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="font-semibold text-slate-200">[✓] Hands-Free Auto-Mic</span>
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

          {/* Call Trigger Buttons */}
          <div className="flex gap-3">
            {!isCallActive ? (
              <button
                onClick={handleStartCall}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Call Doctor's Front Desk (Start Sandbox)</span>
              </button>
            ) : (
              <button
                onClick={handleEndCall}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all animate-pulse"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Hang Up Call (End Session)</span>
              </button>
            )}
          </div>

          {/* Kokoro Voice Settings Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Kokoro Neural Voice Settings</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Kokoro-82M</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Doctor Receptionist Voice:
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  disabled={isCallActive}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                >
                  <option value="bf_emma">Emma (British Female - Dr. Sarah Assistant)</option>
                  <option value="bf_isabella">Isabella (British Female - Warm Clinical)</option>
                  <option value="af_sarah">Sarah (American Female - Professional)</option>
                  <option value="af_bella">Bella (American Female - Friendly & Reassuring)</option>
                  <option value="am_adam">Adam (American Male - Clear & Authoritative)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  <span>Speech Cadence Speed:</span>
                  <span className="font-mono">{speechSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.05"
                  value={speechSpeed}
                  onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
                  disabled={isCallActive}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Quick Patient Testing Scenarios */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Quick Patient Prompts (Click to test without mic):
            </span>
            <div className="space-y-1.5">
              {[
                { label: '🚨 Emergency Toothache', query: 'I woke up with severe toothache, can I get an emergency appointment today?' },
                { label: '✨ Laser Whitening', query: 'How much does laser teeth whitening cost and how many shades does it lighten?' },
                { label: '🦷 Dental Implants', query: 'Do you offer monthly financing for single tooth dental implants?' },
                { label: '📅 Confirm Slot', query: 'Yes, Thursday at 11:00 AM works perfectly, please book it for me.' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (isCallActive) {
                      handleSendTurn(item.query);
                    } else {
                      setPatientSpeechInput(item.query);
                    }
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

        {/* Right Column: Live Conversational Log & Audio Playback (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-emerald-500" />
              <span>Live Conversational Audio Log</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Calibrated: 12-15 Words/Turn • CD Quality WAV
            </span>
          </div>

          {/* Transcript Feed */}
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
                  Sandbox Waiting for Call Initiation
                </div>
                <p className="text-xs text-center max-w-sm text-slate-500">
                  Click <strong>"Call Doctor's Front Desk"</strong> on the left. The AI receptionist will greet you, listen to what you say, and speak back using your local Kokoro neural server.
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

          {/* Manual Patient Text Input & Send */}
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
              placeholder={isCallActive ? "Type patient speech or speak via microphone..." : "Start call to speak or type..."}
              disabled={!isCallActive}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
  );
};
