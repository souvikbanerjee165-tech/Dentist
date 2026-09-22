/**
 * NotificationSoundService
 * Provides zero-latency, offline-capable synthesized audio alerts using the
 * native browser Web Audio API, paired with HTML5 desktop notifications.
 */

class NotificationSoundService {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch (e) {
      console.warn('[NotificationSoundService] Web Audio not available:', e);
      return null;
    }
  }

  /**
   * Plays a mellow, high-definition two-tone harmonic chime for Curbside Arrivals
   * Chords: C5 (523.25 Hz) -> E5 (659.25 Hz) -> G5 (783.99 Hz)
   */
  public playCurbsideArrivalChime(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, time: now, dur: 0.3 },        // C5
        { freq: 659.25, time: now + 0.12, dur: 0.35 }, // E5
        { freq: 783.99, time: now + 0.24, dur: 0.5 },  // G5
      ];

      for (const note of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, note.time);

        gain.gain.setValueAtTime(0.001, note.time);
        gain.gain.exponentialRampToValueAtTime(0.2, note.time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, note.time + note.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(note.time);
        osc.stop(note.time + note.dur);
      }
    } catch (e) {
      console.warn('[NotificationSoundService] Error playing arrival chime:', e);
    }
  }

  /**
   * Plays an assertive, urgent multi-burst chime for Critical Post-Op Triage Alerts (Pain >= 7)
   */
  public playEmergencyTriageAlarm(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bursts = [
        { freq: 880, time: now, dur: 0.18 },       // A5
        { freq: 440, time: now + 0.18, dur: 0.18 }, // A4
        { freq: 880, time: now + 0.4, dur: 0.18 },  // A5
        { freq: 440, time: now + 0.58, dur: 0.3 },  // A4
      ];

      for (const b of bursts) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(b.freq, b.time);

        gain.gain.setValueAtTime(0.001, b.time);
        gain.gain.linearRampToValueAtTime(0.35, b.time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, b.time + b.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(b.time);
        osc.stop(b.time + b.dur);
      }
    } catch (e) {
      console.warn('[NotificationSoundService] Error playing emergency alarm:', e);
    }
  }

  /**
   * Requests HTML5 desktop notification permission
   */
  public async requestDesktopPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      if (Notification.permission === 'granted') return true;
      if (Notification.permission !== 'denied') {
        const result = await Notification.requestPermission();
        return result === 'granted';
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * Triggers an active desktop notification for front-desk staff
   */
  public showDesktopNotification(title: string, options?: NotificationOptions): void {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/images/dentist_doctor.jpg',
          badge: '/favicon.ico',
          ...options,
        });
      } catch (e) {
        console.warn('[NotificationSoundService] Notification trigger error:', e);
      }
    }
  }

  public sendCurbsideArrivalNotification(patientName: string, spotName?: string): void {
    this.showDesktopNotification(`🚗 Curbside Arrival: ${patientName}`, {
      body: `Patient checked in at ${spotName || 'Main Entrance'}. Ready for operatory transfer.`,
    });
  }
}

export const notificationSoundService = new NotificationSoundService();
