import { useEffect, useRef, useState, useCallback } from 'react';

export type SpeechStatus = 'idle' | 'speaking' | 'paused';

export interface UseSpeechReturn {
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  toggle: (text: string) => void;
  status: SpeechStatus;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
}

// ─── Global Singleton Audio Manager ───────────────────────────────────────────
// Ensures only one audio stream plays at a time across all SpeakButton instances.
const globalAudio = {
  audio: null as HTMLAudioElement | null,
  ownerId: null as symbol | null,   // which hook instance "owns" playback
  queue: [] as string[],
  queueIdx: 0,
  statusListeners: new Map<symbol, (s: SpeechStatus) => void>(),

  /** Stop the currently playing audio and reset queue. Notifies all listeners. */
  stopAll() {
    if (this.audio) {
      this.audio.onplay = null;
      this.audio.onended = null;
      this.audio.onerror = null;
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.queue = [];
    this.queueIdx = 0;
    if (this.ownerId !== null) {
      const cb = this.statusListeners.get(this.ownerId);
      if (cb) cb('idle');
      this.ownerId = null;
    }
    // Also mark all other listeners as idle
    this.statusListeners.forEach((cb) => cb('idle'));
  },
};

// ─── Helper ───────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const stripMarkdown = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/#+\s+/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSpeech(options?: {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}): UseSpeechReturn {
  const { volume = 1 } = options ?? {};
  const [status, setStatus] = useState<SpeechStatus>('idle');
  // Stable identity for this hook instance
  const idRef = useRef<symbol>(Symbol());
  const isSupported = typeof window !== 'undefined';

  // Register/unregister this instance's status listener
  useEffect(() => {
    const id = idRef.current;
    globalAudio.statusListeners.set(id, setStatus);
    return () => {
      globalAudio.statusListeners.delete(id);
      // If this instance owns playback, stop it on unmount
      if (globalAudio.ownerId === id) {
        globalAudio.stopAll();
      }
    };
  }, []);

  const playNextChunk = useCallback(() => {
    const id = idRef.current;
    if (globalAudio.ownerId !== id) return; // we lost ownership

    if (globalAudio.queueIdx >= globalAudio.queue.length) {
      setStatus('idle');
      globalAudio.ownerId = null;
      globalAudio.audio = null;
      return;
    }

    const chunk = globalAudio.queue[globalAudio.queueIdx];
    const url = `${API_BASE}/api/tts/proxy?text=${encodeURIComponent(chunk)}`;
    const audio = new Audio(url);
    audio.volume = volume;
    globalAudio.audio = audio;

    audio.onplay = () => {
      if (globalAudio.ownerId === id) setStatus('speaking');
    };
    audio.onended = () => {
      if (globalAudio.ownerId !== id) return;
      globalAudio.queueIdx++;
      playNextChunk();
    };
    audio.onerror = () => {
      if (globalAudio.ownerId !== id) return;
      globalAudio.queueIdx++;
      playNextChunk(); // skip bad chunk, continue
    };

    // Guard against AbortError: only call play() once audio is ready
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Suppress AbortError (caused by rapid pause→play); anything else log it
        if (err.name !== 'AbortError') {
          console.error('Audio play error:', err);
        }
      });
    }
  }, [volume]);

  const stop = useCallback(() => {
    if (globalAudio.ownerId === idRef.current) {
      globalAudio.stopAll();
    }
    setStatus('idle');
  }, []);

  const speak = useCallback(
    (text: string) => {
      // Stop any current playback globally
      globalAudio.stopAll();

      if (!text.trim()) return;
      const cleanText = stripMarkdown(text);

      const chunks = cleanText.match(/[^.!?،؟\n]+[.!?،؟\n]*/g) || [cleanText];
      const filtered = chunks.map((s) => s.trim()).filter(Boolean);
      if (filtered.length === 0) return;

      // Take ownership
      globalAudio.ownerId = idRef.current;
      globalAudio.queue = filtered;
      globalAudio.queueIdx = 0;

      setStatus('speaking');
      playNextChunk();
    },
    [playNextChunk]
  );

  const pause = useCallback(() => {
    if (globalAudio.ownerId !== idRef.current) return;
    if (globalAudio.audio) {
      globalAudio.audio.pause();
      setStatus('paused');
    }
  }, []);

  const resume = useCallback(() => {
    if (globalAudio.ownerId !== idRef.current) return;
    if (globalAudio.audio) {
      const playPromise = globalAudio.audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setStatus('speaking'))
          .catch((err) => {
            if (err.name !== 'AbortError') {
              console.error('Resume error:', err);
            }
          });
      }
    }
  }, []);

  const toggle = useCallback(
    (text: string) => {
      if (status === 'idle') {
        speak(text);
      } else if (status === 'speaking') {
        pause();
      } else if (status === 'paused') {
        resume();
      }
    },
    [status, speak, pause, resume]
  );

  return {
    speak,
    pause,
    resume,
    stop,
    toggle,
    status,
    isSpeaking: status === 'speaking',
    isPaused: status === 'paused',
    isSupported,
  };
}
