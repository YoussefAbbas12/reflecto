import React from 'react';
import { Inbox } from 'lucide-react';

export function Card({ className = '', children, ...props }) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
}

const tones = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-100',
  ok: 'bg-ok-50 text-ok-700 ring-ok-100',
  warn: 'bg-warn-50 text-warn-700 ring-warn-100',
  bad: 'bg-bad-50 text-bad-700 ring-bad-100',
  info: 'bg-info-50 text-info-700 ring-info-100',
  neutral: 'bg-surface-sunken text-ink-soft ring-line',
  navy: 'bg-navy-50 text-navy-700 ring-navy-100',
};

export function Badge({ tone = 'neutral', className = '', children, dot = false }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold ring-1 ring-inset whitespace-nowrap ${tones[tone] || tones.neutral} ${className}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export const TASK_TONE = {
  scheduled: 'neutral',
  available: 'info',
  pending: 'warn',
  assigned: 'navy',
  in_progress: 'brand',
  completed: 'ok',
  cancelled: 'neutral',
};

export const ATT_TONE = {
  present: 'ok',
  late: 'warn',
  absent: 'bad',
  missing: 'warn',
  not_checked_in: 'neutral',
};

export const COMM_TONE = {
  pending: 'warn',
  confirmed: 'brand',
  paid: 'ok',
  cancelled: 'neutral',
};

export function SectionTitle({ children, className = '' }) {
  return (
    <h2 className={`mb-2 text-sm font-bold text-ink ${className}`}>
      {children}
    </h2>
  );
}

export function EmptyState({ title, hint, icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        {icon || <Inbox className="h-6 w-6" />}
      </div>
      <p className="font-semibold text-ink">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-ink-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Avatar({ name = '', size = 40, className = '' }) {
  const initials = (name || 'ف').slice(0, 2).trim();
  return (
    <div 
      className={`grid shrink-0 place-items-center rounded-full bg-brand-50 font-bold text-brand-700 select-none ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

