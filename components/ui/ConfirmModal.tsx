'use client';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({ title, message, onConfirm, onCancel, loading }: ConfirmModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{
              width: '44px', height: '44px', flexShrink: 0, borderRadius: '12px',
              background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={20} color="var(--rose)" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                {title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {message}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '28px' }}>
            <button onClick={onCancel} className="btn-secondary" style={{ fontSize: '13px', padding: '9px 18px' }}>
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              style={{
                background: 'var(--rose)', color: 'white',
                border: 'none', borderRadius: '8px',
                padding: '9px 18px', fontSize: '13px', fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading && <div className="spinner" style={{ width: '14px', height: '14px' }} />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
