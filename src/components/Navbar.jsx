import { Activity, Clock, Shield } from 'lucide-react';

export default function Navbar({ historyOpen, onToggleHistory, historyCount }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <div className="navbar-logo">
            <Activity size={18} />
          </div>
          <span className="navbar-title">AI Skin Specialist</span>
          <span className="navbar-badge">AI Powered</span>
        </div>

        <div className="navbar-actions">
          <div className="navbar-status">
            <span className="status-dot" />
            <span>System Online</span>
          </div>

          <button
            className={`history-toggle ${historyOpen ? 'active' : ''}`}
            onClick={onToggleHistory}
            title="Consultation History"
            aria-label="Toggle consultation history"
          >
            <Clock size={16} />
            {historyCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'var(--accent-blue)',
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}>
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
