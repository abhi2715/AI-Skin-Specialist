import { Sparkles, Loader2 } from 'lucide-react';

export default function AnalyzeButton({ loading, disabled, onClick }) {
  return (
    <button
      className={`analyze-btn ${loading ? 'loading' : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          Analyzing...
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </>
      ) : (
        <>
          <Sparkles size={18} />
          Analyze Concern
          <div className="analyze-btn-shimmer" />
        </>
      )}
    </button>
  );
}
