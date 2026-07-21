import { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX } from 'lucide-react';

const PLAYER_BARS = 50;

export default function AudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  // Generate random static bar heights for visualization
  const barHeights = useMemo(
    () => Array.from({ length: PLAYER_BARS }, () => 6 + Math.random() * 26),
    [src]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setTotalDuration(audio.duration);
    const onEnd = () => setPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);
    
    audio.volume = muted ? 0 : volume;

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
    };
  }, [src, volume, muted]);

  // Autoplay when src changes
  useEffect(() => {
    if (src && audioRef.current) {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const skip = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const toggleMute = () => setMuted(!muted);

  const progress = totalDuration > 0 ? currentTime / totalDuration : 0;
  const activeIndex = Math.floor(progress * PLAYER_BARS);

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="audio-controls-group">
        <button className="audio-control-btn skip-btn" onClick={() => skip(-10)} title="Rewind 10s">
          <RotateCcw size={14} />
        </button>
        
        <button className="audio-play-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
        </button>

        <button className="audio-control-btn skip-btn" onClick={() => skip(10)} title="Forward 10s">
          <RotateCw size={14} />
        </button>
      </div>

      <div className="audio-player-bars">
        {barHeights.map((h, i) => (
          <div
            key={i}
            className={`audio-player-bar ${i <= activeIndex ? 'active' : ''}`}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>

      <div className="audio-right-controls">
        <span className="audio-player-time">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </span>
        
        <div className="volume-control">
          <button className="audio-control-btn mute-btn" onClick={toggleMute}>
            {muted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            value={muted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (muted) setMuted(false);
            }}
            className="volume-slider"
          />
        </div>
      </div>
    </div>
  );
}
