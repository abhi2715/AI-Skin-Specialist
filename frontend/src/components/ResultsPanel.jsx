import { Stethoscope, MessageSquareText, Brain, Volume2 } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

export default function ResultsPanel({ result, loading }) {
  // Loading skeleton
  if (loading) {
    return (
      <div className="results-panel glass-card-static">
        <div className="section-header">
          <div className="section-icon teal"><Stethoscope size={16} /></div>
          <div>
            <div className="section-title">Analyzing...</div>
            <div className="section-subtitle">Processing your consultation</div>
          </div>
        </div>

        <div className="result-block">
          <div className="result-label">
            <span className="result-label-dot blue" /> Transcript
          </div>
          <div className="skeleton" style={{ height: 60 }} />
        </div>

        <div className="result-block">
          <div className="result-label">
            <span className="result-label-dot teal" /> Doctor's Guidance
          </div>
          <div className="skeleton" style={{ height: 100 }} />
        </div>

        <div className="result-block">
          <div className="result-label">
            <span className="result-label-dot purple" /> Voice Response
          </div>
          <div className="skeleton" style={{ height: 60 }} />
        </div>
      </div>
    );
  }

  // Empty state
  if (!result) {
    return (
      <div className="results-panel glass-card-static">
        <div className="section-header">
          <div className="section-icon teal"><Stethoscope size={16} /></div>
          <div>
            <div className="section-title">Doctor Response</div>
            <div className="section-subtitle">AI-powered consultation results</div>
          </div>
        </div>

        <div className="result-empty">
          <div className="result-empty-icon">
            <Stethoscope size={32} />
          </div>
          <div className="result-empty-title">Ready for Analysis</div>
          <div className="result-empty-desc">
            Record your voice, upload a skin image, and click Analyze to receive your consultation.
          </div>
        </div>
      </div>
    );
  }

  // Results
  return (
    <div className="results-panel glass-card-static">
      <div className="section-header">
        <div className="section-icon teal"><Stethoscope size={16} /></div>
        <div>
          <div className="section-title">Doctor Response</div>
          <div className="section-subtitle">AI-powered consultation results</div>
        </div>
      </div>

      <div className="result-block">
        <div className="result-label">
          <span className="result-label-dot blue" />
          <MessageSquareText size={12} />
          Your Speech Transcript
        </div>
        <div className="result-text transcript">{result.transcript}</div>
      </div>

      <div className="result-block">
        <div className="result-label">
          <span className="result-label-dot teal" />
          <Brain size={12} />
          Doctor's Guidance
        </div>
        <div className="result-text">{result.guidance}</div>
      </div>

      <div className="result-block">
        <div className="result-label">
          <span className="result-label-dot purple" />
          <Volume2 size={12} />
          Voice Response
        </div>
        <AudioPlayer src={result.audio_data} />
      </div>
    </div>
  );
}
