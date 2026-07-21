import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Check, X } from 'lucide-react';

const BAR_COUNT = 40;

export default function AudioRecorder({ onAudioReady }) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [duration, setDuration] = useState(0);
  const [bars, setBars] = useState(() => Array(BAR_COUNT).fill(4));

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const cleanup = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Analyser for waveform
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      // MediaRecorder
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        onAudioReady(blob);
        cleanup();
      };

      recorder.start();
      setRecording(true);
      setDuration(0);

      // Timer
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);

      // Waveform animation
      const updateBars = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const step = Math.floor(data.length / BAR_COUNT);
        const newBars = [];
        for (let i = 0; i < BAR_COUNT; i++) {
          const val = data[i * step] || 0;
          newBars.push(Math.max(4, (val / 255) * 44));
        }
        setBars(newBars);
        animFrameRef.current = requestAnimationFrame(updateBars);
      };
      updateBars();
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const removeAudio = () => {
    setAudioBlob(null);
    onAudioReady(null);
    setBars(Array(BAR_COUNT).fill(4));
    setDuration(0);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className={`audio-recorder ${recording ? 'recording' : ''} ${audioBlob ? 'has-audio' : ''}`}>
      {/* Waveform */}
      <div className="waveform-container">
        {bars.map((h, i) => (
          <div
            key={i}
            className={`waveform-bar ${recording ? 'recording' : ''}`}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>

      {/* Controls */}
      {!audioBlob ? (
        <>
          <button
            className={`record-btn ${recording ? 'recording' : ''}`}
            onClick={recording ? stopRecording : startRecording}
            aria-label={recording ? 'Stop recording' : 'Start recording'}
          >
            {recording ? <Square size={20} /> : <Mic size={22} />}
          </button>
          <span className="record-label">
            {recording ? `Recording... ${formatTime(duration)}` : 'Tap to record'}
          </span>
        </>
      ) : (
        <div className="audio-preview">
          <Check size={16} />
          <span className="audio-preview-info">
            Audio recorded · {formatTime(duration)}
          </span>
          <button className="audio-preview-remove" onClick={removeAudio} aria-label="Remove recording">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
