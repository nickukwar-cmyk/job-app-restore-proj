import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export type ProviderTickerStatus =
  | 'connected'
  | 'disabled_by_user'
  | 'missing_session'
  | 'missing_api_key'
  | 'degraded'
  | 'rate_limited'
  | 'failed'
  | 'not_implemented';

export type ProviderTickerItem = {
  id: string;
  label: string;
  status: ProviderTickerStatus;
  statusLabel: string;
  group: string;
};

export type ProviderStatusTickerProps = {
  providers: ProviderTickerItem[];
  onProviderClick?: (providerId: string) => void;
  className?: string;
};

function statusTone(status: ProviderTickerStatus): string {
  if (status === 'connected') return 'bg-emerald-400';
  if (status === 'failed' || status === 'not_implemented') return 'bg-red-400';
  return 'bg-amber-400';
}

function statusLabel(status: ProviderTickerStatus, fallback: string): string {
  if (status === 'connected') return 'Connected';
  if (status === 'disabled_by_user') return 'Disabled by you';
  if (status === 'missing_session') return 'Session required';
  if (status === 'missing_api_key') return 'API key required';
  if (status === 'degraded') return 'Degraded';
  if (status === 'rate_limited') return 'Rate limited';
  if (status === 'failed') return 'Provider is currently unavailable';
  if (status === 'not_implemented') return 'Not connected';
  return fallback;
}

function ProviderChip({ provider, onClick }: { provider: ProviderTickerItem; onClick: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(provider.id)}
      className="inline-flex h-7 shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-slate-200 transition hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-indigo-500"
      title={`${provider.label}: ${statusLabel(provider.status, provider.statusLabel)}`}
    >
      <span className={clsx('h-2 w-2 rounded-full', statusTone(provider.status))} aria-hidden />
      <span>{provider.label}</span>
    </button>
  );
}

export function ProviderStatusTicker({ providers, onProviderClick, className }: ProviderStatusTickerProps) {
  const navigate = useNavigate();
  const sorted = useMemo(
    () => [...providers].sort((a, b) => a.group.localeCompare(b.group) || a.label.localeCompare(b.label)),
    [providers],
  );
  const doubled = useMemo(() => [...sorted, ...sorted], [sorted]);
  const duration = Math.max(35, sorted.length * 1.4);

  const handleClick = (providerId: string) => {
    if (onProviderClick) onProviderClick(providerId);
    else navigate(`/settings?tab=sources&provider=${encodeURIComponent(providerId)}`);
  };

  if (sorted.length === 0) {
    return <div className={clsx('h-9 border-b border-white/8 bg-slate-950/40', className)} aria-hidden />;
  }

  const connected = sorted.filter((p) => p.status === 'connected').length;
  const attention = sorted.length - connected;

  return (
    <div className={clsx('provider-status-ticker h-9 overflow-hidden border-b border-white/8 bg-slate-950/55', className)}>
      <button
        type="button"
        onClick={() => navigate('/settings?tab=sources')}
        className="flex h-9 w-full items-center justify-center px-3 text-xs font-medium text-slate-300 sm:hidden"
      >
        Job sources: {connected} connected, {attention} need attention
      </button>
      <div
        className="hidden h-9 items-center overflow-hidden sm:flex"
        style={{ ['--provider-ticker-duration' as string]: `${duration}s` }}
        aria-label="Job source provider status ticker"
      >
        <div className="provider-status-ticker-track flex min-w-max items-center gap-2 whitespace-nowrap px-3">
          {doubled.map((provider, index) => (
            <ProviderChip key={`${provider.id}-${index}`} provider={provider} onClick={handleClick} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProviderStatusTicker;
