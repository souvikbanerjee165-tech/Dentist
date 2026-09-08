import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  X, 
  Calendar, 
  Check, 
  Radio, 
  Activity, 
  RotateCcw, 
  Send, 
  Zap, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface TranscriptItem {
  role: 'user' | 'assistant';
  text: string;
  time: string;
  wordCount?: number;
  isMeetingBooked?: boolean;
  bookedSlot?: string | null;
}

interface InteractiveCallStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicName?: string;
}

const BARS_COUNT = 15;
// Gaussian curve weights to create a natural curved soundwave
const GAUSSIAN_WEIGHTS = [0.18, 0.35, 0.58, 0.78, 0.92, 1.0, 0.96, 0.88, 0.95, 1.0, 0.89, 0.72, 0.52, 0.32, 0.15];

export const InteractiveCallStudioModal: React.FC<InteractiveCallStudioModalProps> = ({
  isOpen,
  onClose,
  clinicName = 'St. James Dental Practice',
}) => {
  // Call Lifecycle States
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatusText, setCallStatusText] = useState<'Idle' | 'Listening...' | 'Caller Speaking' | 'AI Thinking' | 'AI Speaking' | 'Anti-Echo Breather'>('Idle');
  const [handsFreeAutoMic, setHandsFreeAutoMic] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  
  // Audio & VAD visualizer states
  const [soundBars, setSoundBars] = useState<number[]>(new Array(BARS_COUNT).fill(12));
  const [userInputText, setUserInputText] = useState('');
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [bookedMeeting, setBookedMeeting] = useState<{ slot: string; treatment: string } | null>(null);

  // Audio Context & Speech Refs
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
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll transcript container
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  // Call duration counter
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCallActive) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCallActive]);

  // Format call duration MM:SS
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  /**
   * Speak AI Response via Web Speech API (TTS)
   * With 250ms Acoustic Anti-Echo Breather on completion
   */
  const speakAIResponse = useCallback((text: string, onDone?: () => void) => {
    if (!('speechSynthesis' in window)) {
      if (onDone) onDone();
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();
    isAISpeakingRef.current = true;
    setCallStatusText('AI Speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05; // Natural crisp conversational pace
    utterance.pitch = 1.0;

    // Attempt to select British English voice (Amy / Google UK English / Samantha)
    const voices = window.speechSynthesis.getVoices();
    const ukVoice = voices.find(
      (v) => v.lang.startsWith('en-GB') || v.name.includes('UK') || v.name.includes('British') || v.name.includes('Sarah')
    ) || voices.find((v) => v.lang.startsWith('en'));
    if (ukVoice) {
      utterance.voice = ukVoice;
    }

    // Acoustic Anti-Echo Breather (250ms delay)
    utterance.onend = () => {
      isAISpeakingRef.current = false;
      isAntiEchoBreatherRef.current = true;
      setCallStatusText('Anti-Echo Breather');

      // 250ms acoustic delay prevents room speaker reverb from triggering the mic
      setTimeout(() => {
        isAntiEchoBreatherRef.current = false;
        if (isCallActive) {
          setCallStatusText('Listening...');
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {
              // Already running
            }
          }
        }
        if (onDone) onDone();
      }, 250);
    };

    utterance.onerror = () => {
      isAISpeakingRef.current = false;
      isAntiEchoBreatherRef.current = false;
      if (isCallActive) setCallStatusText('Listening...');
      if (onDone) onDone();
    };

    window.speechSynthesis.speak(utterance);
  }, [isCallActive]);

  /**
   * Execute Conversational Turn with Backend (12-15 word calibration + Meeting Detection)
   */
  const submitSpeechTurn = useCallback(async (speechText: string) => {
    const trimmed = speechText.trim();
    if (!trimmed) return;

    // Reset buffer
    transcriptBufferRef.current = '';
    setUserInputText('');

    // Append User turn to transcript
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTranscripts((prev) => [
      ...prev,
      { role: 'user', text: trimmed, time: timeStr, wordCount: trimmed.split(/\s+/).length },
    ]);

    setCallStatusText('AI Thinking');

    try {
      // Build conversation history payload
      const historyPayload = transcripts.slice(-6).map((t) => ({
        role: t.role === 'assistant' ? 'assistant' : 'user',
        content: t.text,
      }));

      const res = await fetch('/api/v1/voice/interactive/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speech: trimmed,
          conversationHistory: historyPayload,
          clinicName,
        }),
      });

      const data = await res.json();
      const aiReply = data.reply || "I'd be glad to help you reserve your appointment at St. James Dental.";
      const wordCount = data.word_count || aiReply.split(/\s+/).length;

      // Check if meeting was booked autonomously
      if (data.is_meeting_booked) {
        setBookedMeeting({
          slot: data.booked_slot || 'Thursday at 11:00 AM',
          treatment: data.treatment || 'Dental Care',
        });
      }

      // Append AI turn to transcript
      setTranscripts((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          wordCount,
          isMeetingBooked: Boolean(data.is_meeting_booked),
          bookedSlot: data.booked_slot,
        },
      ]);

      // Playback via TTS with 250ms anti-echo breather
      speakAIResponse(aiReply);
    } catch (err) {
      console.error('Turn submission error:', err);
      const fallbackReply = "Our clinic has immediate slots this week. How can I assist you further?";
      speakAIResponse(fallbackReply);
    }
  }, [transcripts, clinicName, speakAIResponse]);

  /**
   * Setup Web Audio Analyser & 15-Bar Soundwave Loop
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

        // Calculate average energy
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // VAD threshold detection: If loud enough and not AI speaking / not in breather
        const isSpeaking = average > 14 && !isAISpeakingRef.current && !isAntiEchoBreatherRef.current;

        if (isSpeaking && callStatusText !== 'Caller Speaking') {
          setCallStatusText('Caller Speaking');
        }

        // Update 15 Gaussian-weighted sound bars with smoothing formula:
        // level = level * 0.55 + raw * 0.45
        const newBars = smoothedBarsRef.current.map((prev, idx) => {
          const weight = GAUSSIAN_WEIGHTS[idx];
          const rawAmp = isAISpeakingRef.current
            ? (25 + Math.random() * 55) * weight
            : isSpeaking
            ? Math.max(12, (average * 1.5) * weight)
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
      console.warn('[WebAudio] Microphone stream access notice:', err);
    }
  };

  /**
   * Setup Web Speech STT with 850ms VAD Silence Auto-Submit
   */
  const setupSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-GB';

    recognition.onresult = (event: any) => {
      // Ignore mic when AI is talking or in 250ms anti-echo breather
      if (isAISpeakingRef.current || isAntiEchoBreatherRef.current || isMuted) {
        return;
      }

      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      const activeText = (final + interim).trim();
      if (activeText) {
        transcriptBufferRef.current = activeText;
        setUserInputText(activeText);
        setCallStatusText('Caller Speaking');

        // Clear existing silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // 850ms Silence Auto-Submit (Hands-Free VAD)
        if (handsFreeAutoMic) {
          silenceTimerRef.current = setTimeout(() => {
            if (transcriptBufferRef.current && !isAISpeakingRef.current && !isAntiEchoBreatherRef.current) {
              submitSpeechTurn(transcriptBufferRef.current);
            }
          }, 850);
        }
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech') {
        console.warn('[STT] SpeechRecognition event:', e.error);
      }
    };

    recognition.onend = () => {
      if (isCallActive && !isAISpeakingRef.current && !isAntiEchoBreatherRef.current) {
        try {
          recognition.start();
        } catch {
          // Ignore restart race condition
        }
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('SpeechRecognition start notice:', e);
    }
  }, [isCallActive, isMuted, handsFreeAutoMic, submitSpeechTurn]);

  /**
   * Start Live Hands-Free Call Session
   */
  const handleStartCallSession = async () => {
    setIsCallActive(true);
    setBookedMeeting(null);
    setTranscripts([]);
    setCallStatusText('Listening...');

    const initialGreeting = `Hello! Thank you for calling ${clinicName}. How can I assist you today?`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTranscripts([
      {
        role: 'assistant',
        text: initialGreeting,
        time: timeStr,
        wordCount: initialGreeting.split(/\s+/).length,
      },
    ]);

    await setupWebAudioLoop();
    setupSpeechRecognition();

    speakAIResponse(initialGreeting);
  };

  /**
   * Terminate Call Session
   */
  const handleEndCallSession = () => {
    setIsCallActive(false);
    setCallStatusText('Idle');

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isAISpeakingRef.current = false;
    isAntiEchoBreatherRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Safe ignore
      }
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
    return () => {
      handleEndCallSession();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Top Header Bar */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold transition-all ${
              isCallActive 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 animate-pulse' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}>
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Interactive AI Call Studio
                </h3>
                <Badge variant={isCallActive ? 'success' : 'neutral'}>
                  {isCallActive ? `LIVE • ${formatTime(callDuration)}` : 'Full-Duplex Sandbox'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                12-15 word sub-second pacing • 850ms VAD silence detection • 250ms anti-echo breather
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleEndCallSession();
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Autonomous Meeting Booked Celebration Banner */}
          {bookedMeeting && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-100 animate-fadeIn space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 animate-bounce" />
                  <span>🎉 Appointment Confirmed &amp; Reserved!</span>
                </div>
                <Badge variant="success">Auto-Synced to Calendar</Badge>
              </div>
              <div className="text-xs space-y-1 bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border border-emerald-500/20">
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
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  ✓ Instant WhatsApp confirmation dispatched to patient's mobile number.
                </div>
              </div>
            </div>
          )}

          {/* 15-Bar Soundwave Dynamic Visualizer Display */}
          <div className="p-5 rounded-3xl bg-slate-950 text-white shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[160px] border border-slate-800">
            {/* Status indicator badge */}
            <div className="absolute top-3 left-4 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                isCallActive 
                  ? callStatusText === 'Caller Speaking' 
                    ? 'bg-amber-400 animate-ping' 
                    : callStatusText === 'AI Speaking'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-blue-400'
                  : 'bg-slate-600'
              }`} />
              <span className="text-xs font-mono font-bold text-slate-300 tracking-wide uppercase">
                {callStatusText}
              </span>
            </div>

            {/* Anti-Echo Breather indicator badge */}
            {callStatusText === 'Anti-Echo Breather' && (
              <div className="absolute top-3 right-4 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono">
                250ms Acoustic Breather Active
              </div>
            )}

            {/* Dynamic Sound Bars */}
            <div className="flex items-center justify-center gap-2 h-24 my-2">
              {soundBars.map((height, idx) => (
                <div
                  key={idx}
                  style={{ height: `${height}%` }}
                  className={`w-2.5 rounded-full transition-all duration-75 ${
                    isCallActive
                      ? callStatusText === 'Caller Speaking'
                        ? 'bg-gradient-to-t from-amber-500 to-yellow-300 shadow-sm shadow-amber-400/50'
                        : callStatusText === 'AI Speaking'
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-300 shadow-sm shadow-emerald-400/50'
                        : 'bg-gradient-to-t from-blue-600 to-cyan-400'
                      : 'bg-slate-700/60'
                  }`}
                />
              ))}
            </div>

            {/* Hands-Free Settings HUD Footer */}
            <div className="w-full flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 px-2">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Audio Engine: Web Audio VAD (850ms silence)</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={handsFreeAutoMic}
                  onChange={(e) => setHandsFreeAutoMic(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="font-semibold text-slate-200">[✓] Hands-Free Auto-Mic</span>
              </label>
            </div>
          </div>

          {/* Real-time Conversational Transcript */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Conversational Transcript:</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                Sub-Second Pacing • Max 12-15 Words/Turn
              </span>
            </div>
            
            <div 
              ref={chatScrollRef}
              className="h-48 overflow-y-auto space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs"
            >
              {transcripts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-1">
                  <Mic className="w-6 h-6 opacity-40 mb-1" />
                  <p>Click "Start Hands-Free Call" to initiate duplex loop.</p>
                  <p className="text-[10px]">Mic will stream audio, detect silence automatically, and reply in 12-15 words.</p>
                </div>
              ) : (
                transcripts.map((t, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      t.role === 'assistant' ? 'items-start' : 'items-end'
                    } space-y-1`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="font-bold">{t.role === 'assistant' ? 'AI Sarah (Receptionist)' : 'Caller (You)'}</span>
                      <span>•</span>
                      <span>{t.time}</span>
                      {t.wordCount && (
                        <span className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 rounded font-mono text-[9px] text-slate-600 dark:text-slate-300">
                          {t.wordCount} words
                        </span>
                      )}
                    </div>
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl leading-relaxed text-xs ${
                        t.role === 'assistant'
                          ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-tl-sm'
                          : 'bg-blue-600 text-white rounded-tr-sm shadow-sm'
                      }`}
                    >
                      {t.text}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Dental Testing Prompts */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Quick Test Prompts (Simulate Patient Inputs):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'I have severe toothache and need an emergency visit.',
                'How much does laser teeth whitening cost?',
                'Do you offer monthly finance for dental implants?',
                'Yes, Thursday at 11:00 AM is perfect, book it please.',
              ].map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (isCallActive) {
                      submitSpeechTurn(p);
                    } else {
                      setUserInputText(p);
                    }
                  }}
                  className="px-2.5 py-1 text-[11px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-500/10 hover:border-blue-500/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Fallback */}
          <div className="flex gap-2">
            <input
              type="text"
              value={userInputText}
              onChange={(e) => setUserInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && userInputText) {
                  submitSpeechTurn(userInputText);
                }
              }}
              placeholder={isCallActive ? "Or type patient speech here..." : "Start call to talk or type..."}
              disabled={!isCallActive}
              className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={() => submitSpeechTurn(userInputText)}
              disabled={!isCallActive || !userInputText}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>

        </div>

        {/* Action Controls Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCallActive && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                  isMuted 
                    ? 'bg-rose-500 text-white border-rose-500' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isMuted ? 'Mic Muted' : 'Mic Active'}</span>
              </button>
            )}
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Full-Duplex Web Audio + Neural Voice Playback
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isCallActive ? (
              <button
                onClick={handleStartCallSession}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl shadow-lg shadow-emerald-600/25 transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Start Hands-Free Call</span>
              </button>
            ) : (
              <button
                onClick={handleEndCallSession}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 rounded-xl shadow-lg shadow-rose-600/25 transition-all animate-pulse"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End Call Session</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
