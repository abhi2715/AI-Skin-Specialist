import { useState, useCallback } from 'react';
import { FileText, Info, Shield } from 'lucide-react';
import GlowCursor from './components/GlowCursor';
import ParticlesBg from './components/ParticlesBg';
import Navbar from './components/Navbar';
import AudioRecorder from './components/AudioRecorder';
import MediaUpload from './components/MediaUpload';
import AnalyzeButton from './components/AnalyzeButton';
import ResultsPanel from './components/ResultsPanel';
import HistorySidebar from './components/HistorySidebar';
import { analyzeConsultation } from './utils/api';
import './index.css';

const HISTORY_KEY = 'ais-history';

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
}

export default function App() {
  // State
  const [audioBlob, setAudioBlob] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState(loadHistory);

  const canAnalyze = audioBlob && (imageFile || videoFile) && !loading;

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeConsultation(audioBlob, imageFile, videoFile);
      setResult(data);

      // Save to history
      const entry = {
        date: new Date().toLocaleString(),
        transcript: data.transcript,
        guidance: data.guidance,
        audio_data: data.audio_data,
      };
      const updated = [entry, ...history].slice(0, 20);
      setHistory(updated);
      saveHistory(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [canAnalyze, audioBlob, imageFile, videoFile, history]);

  const handleHistorySelect = (item) => {
    setResult(item);
  };

  const handleDeleteHistoryItem = (indexToDelete) => {
    const updated = history.filter((_, index) => index !== indexToDelete);
    setHistory(updated);
    saveHistory(updated);
    
    // If the currently viewed result was just deleted, we could clear it,
    // but typically it's fine to leave it on screen or clear it. Let's leave it.
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return (
    <>
      <GlowCursor />
      <ParticlesBg />

      <Navbar
        historyOpen={historyOpen}
        onToggleHistory={() => setHistoryOpen(!historyOpen)}
        historyCount={history.length}
      />

      <div className="app-layout">
        <div className="main-content">
          <div className="consultation-grid">
            {/* ── Left: Input Panel ── */}
            <div className="input-panel glass-card-static">
              <div className="section-header">
                <div className="section-icon blue"><FileText size={16} /></div>
                <div>
                  <div className="section-title">Patient Input</div>
                  <div className="section-subtitle">Describe your skin concern</div>
                </div>
              </div>

              <div className="field-group">
                <span className="field-label">Voice Recording</span>
                <AudioRecorder onAudioReady={setAudioBlob} />
              </div>

              <div className="field-group">
                <span className="field-label">Upload Media</span>
                <MediaUpload
                  imageFile={imageFile}
                  videoFile={videoFile}
                  onImageChange={setImageFile}
                  onVideoChange={setVideoFile}
                />
              </div>

              <AnalyzeButton
                loading={loading}
                disabled={!canAnalyze}
                onClick={handleAnalyze}
              />

              {error && (
                <div className="info-note" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)' }}>
                  <Info size={14} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--accent-red)' }}>{error}</span>
                </div>
              )}

              <div className="info-note">
                <Info size={14} className="info-note-icon" />
                <span>For better assessment, include a short video showing the affected area from multiple angles under good lighting.</span>
              </div>
            </div>

            {/* ── Right: Results Panel ── */}
            <ResultsPanel result={result} loading={loading} />
          </div>
        </div>

        {/* ── History Sidebar ── */}
        {historyOpen && (
          <HistorySidebar
            history={history}
            onSelect={handleHistorySelect}
            onClear={handleClearHistory}
            onDelete={handleDeleteHistoryItem}
          />
        )}
      </div>

      <footer className="app-footer">
        <div className="app-footer-inner">
          <span className="app-footer-text">
            <strong>© 2026 Abhishek KS</strong> · AI Skin Specialist. Consult a licensed dermatologist for urgent symptoms.
          </span>
          <span className="footer-disclaimer">
            <Shield size={13} />
            AI guidance is informational, not a medical diagnosis
          </span>
        </div>
      </footer>
    </>
  );
}
