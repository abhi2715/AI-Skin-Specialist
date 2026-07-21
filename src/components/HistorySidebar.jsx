import { Clock, Trash2, MessageSquare, X } from 'lucide-react';

export default function HistorySidebar({ history, onSelect, onClear, onDelete }) {
  return (
    <aside className="history-sidebar">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-icon blue"><Clock size={16} /></div>
          <div>
            <div className="section-title">History</div>
          </div>
        </div>
        {history.length > 0 && (
          <button className="history-clear-btn" onClick={onClear}>
            <Trash2 size={12} style={{ marginRight: 4 }} />
            Clear
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="history-empty">
          <MessageSquare size={24} style={{ marginBottom: 8, opacity: 0.3 }} />
          <div>No consultations yet</div>
        </div>
      ) : (
        history.map((item, i) => (
          <div key={i} className="glass-card history-card" onClick={() => onSelect(item)} style={{ position: 'relative' }}>
            <div className="history-card-date">{item.date}</div>
            <div className="history-card-text">{item.guidance}</div>
            <button 
              className="history-delete-btn" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(i);
              }}
              title="Delete this chat"
            >
              <X size={14} />
            </button>
          </div>
        ))
      )}
    </aside>
  );
}
