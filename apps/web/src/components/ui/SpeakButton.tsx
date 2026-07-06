import React from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { useSpeech } from '../../hooks/useSpeech';

interface SpeakButtonProps {
  text: string;
  /** Extra CSS classes applied to the outer button */
  className?: string;
  /** Button size variant */
  size?: 'sm' | 'md';
  /** Optional label shown next to the icon */
  label?: string;
  /** Override default speech options */
  rate?: number;
  pitch?: number;
  lang?: string;
}

export function SpeakButton({
  text,
  className = '',
  size = 'sm',
  label,
  rate,
  pitch,
  lang,
}: SpeakButtonProps) {
  const { status, toggle, stop, isSupported } = useSpeech({ rate, pitch, lang });
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (!isSupported) {
    return null;
  }

  const isSpeaking = status === 'speaking';
  const isPaused = status === 'paused';
  const isActive = isSpeaking || isPaused;

  const sizeClasses =
    size === 'md'
      ? 'h-9 px-3 text-sm gap-2 rounded-xl'
      : 'h-7 px-2 text-xs gap-1.5 rounded-lg';

  const iconSize = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        title={isSpeaking ? 'Pause' : isPaused ? 'Resume' : 'Read aloud'}
        onClick={(e) => {
          e.stopPropagation();
          toggle(text);
        }}
        className={`
          inline-flex items-center font-medium transition-all select-none
          ${sizeClasses}
          ${
            isActive
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 hover:text-slate-700'
          }
          ${className}
        `}
      >
        {isSpeaking ? (
          <>
            {/* Animated wave bars */}
            <span className="flex items-end gap-[2px] h-3">
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  style={{ animationDelay: `${i * 0.12}s` }}
                  className="w-[3px] bg-emerald-500 rounded-full animate-[tts-bar_0.8s_ease-in-out_infinite_alternate]"
                />
              ))}
            </span>
            <Pause className={iconSize} />
          </>
        ) : isPaused ? (
          <Play className={iconSize} />
        ) : (
          <Volume2 className={iconSize} />
        )}
        {label && <span>{label}</span>}
      </button>

      {/* Stop button – only shown when active */}
      {isActive && (
        <button
          type="button"
          title="Stop reading"
          onClick={(e) => {
            e.stopPropagation();
            stop();
          }}
          className={`
            inline-flex items-center font-medium transition-all select-none
            ${sizeClasses}
            bg-rose-50 text-rose-400 border border-rose-200 hover:bg-rose-100 hover:text-rose-600
          `}
        >
          <VolumeX className={iconSize} />
        </button>
      )}
    </span>
  );
}
