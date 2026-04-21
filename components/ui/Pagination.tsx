'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
}

export default function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px', borderTop: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
        Showing <strong style={{ color: 'var(--text-secondary)' }}>{from}–{to}</strong> of{' '}
        <strong style={{ color: 'var(--text-secondary)' }}>{total}</strong> results
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'var(--bg-3)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            color: page === 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
            opacity: page === 1 ? 0.5 : 1,
          }}
        >
          <ChevronLeft size={15} />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: p === page ? 'var(--brand)' : 'var(--bg-3)',
              border: `1px solid ${p === page ? 'var(--brand)' : 'var(--border)'}`,
              cursor: 'pointer',
              fontSize: '13px', fontWeight: p === page ? '600' : '400',
              color: p === page ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'var(--bg-3)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: page === totalPages ? 'not-allowed' : 'pointer',
            color: page === totalPages ? 'var(--text-muted)' : 'var(--text-secondary)',
            opacity: page === totalPages ? 0.5 : 1,
          }}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
