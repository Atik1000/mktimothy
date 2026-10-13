"use client";

/**
 * Programmatic sound generation via the Web Audio API. No audio asset files
 * needed — both the ringtone and the notification chime are synthesized at
 * runtime. This avoids CDN/tracking-prevention issues and keeps everything
 * self-contained.
 *
 * Browser autoplay policy: AudioContext can only start after a user gesture
 * (click, tap, keypress). We lazily create + resume the context on first use,
 * so by the time a ring or chime fires the user has already interacted with
 * the page (login button, navigation, etc.).
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // Resume if suspended (autoplay policy).
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
}

/** "Unlock" the audio context on a user gesture (call from a click handler). */
export function unlockAudio() {
  getCtx();
}

// ---------------------------------------------------------------------------
// Ringtone — classic telephone dual-tone (440Hz + 480Hz), 2s on / 4s off.
// Loops indefinitely until stopRingtone() is called.
// ---------------------------------------------------------------------------

let ringTimer: ReturnType<typeof setInterval> | null = null;
let ringNodes: { osc: OscillatorNode; gain: GainNode }[] = [];

/**
 * Start the ringtone loop. Call stopRingtone() to stop. Safe to call multiple
 * times — it won't start a second loop if one is already running.
 */
export function startRingtone() {
  if (ringTimer) return; // already ringing
  const audioCtx = getCtx();
  if (!audioCtx) return;

  const playRingBurst = () => {
    const now = audioCtx.currentTime;
    // Two oscillators at 440Hz and 480Hz (North American ring tone).
    const freqs = [440, 480];
    ringNodes = freqs.map((freq) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      // Fade in/out to avoid clicks. 2s burst.
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gain.gain.setValueAtTime(0.15, now + 1.9);
      gain.gain.linearRampToValueAtTime(0, now + 2.0);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 2.0);
      return { osc, gain };
    });
  };

  playRingBurst();
  // Repeat every 6 seconds (2s on + 4s gap = classic ring cadence).
  ringTimer = setInterval(playRingBurst, 6000);
}

/** Stop the ringtone loop immediately. */
export function stopRingtone() {
  if (ringTimer) {
    clearInterval(ringTimer);
    ringTimer = null;
  }
  for (const { osc, gain } of ringNodes) {
    try {
      gain.gain.cancelScheduledValues(0);
      gain.gain.setValueAtTime(0, getCtx()?.currentTime ?? 0);
      osc.stop();
    } catch {}
  }
  ringNodes = [];
}

// ---------------------------------------------------------------------------
// Notification chime — short two-note ascending beep for new messages.
// ---------------------------------------------------------------------------

/**
 * Play a short notification chime (two ascending notes). Non-blocking — fires
 * once and cleans up automatically.
 */
export function playNotificationChime() {
  const audioCtx = getCtx();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  // Two quick notes: C5 (523Hz) → E5 (659Hz), each 150ms.
  const notes = [
    { freq: 523.25, start: 0, dur: 0.15 },
    { freq: 659.25, start: 0.15, dur: 0.2 },
  ];

  for (const note of notes) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = note.freq;
    const t = now + note.start;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
    gain.gain.setValueAtTime(0.12, t + note.dur - 0.03);
    gain.gain.linearRampToValueAtTime(0, t + note.dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + note.dur);
  }
}
