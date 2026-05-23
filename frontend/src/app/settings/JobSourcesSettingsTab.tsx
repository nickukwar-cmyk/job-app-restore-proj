import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Plug, Search, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useJobSourceSettingsStore, type ProviderStatus } from '@/stores/jobSourceSettingsStore';

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={onChange} className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 ${checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function statusMeta(status: ProviderStatus['status']) {
  if (status === 'connected') return { dot: 'bg-emerald-500', text: 'Connected', pill: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' };
  if (status === 'disabled_by_user') return { dot: 'bg-amber-500', text: 'Disabled by you', pill: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300' };
  if (status === 'missing_session') return { dot: 'bg-amber-500', text: 'Session required', pill: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300' };
  if (status === 'missing_api_key') return { dot: 'bg-amber-500', text: 'API key required', pill: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300' };
  if (status === 'degraded') return { dot: 'bg-amber-500', text: 'Degraded', pill: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300' };
  if (status === 'rate_limited') return { dot: 'bg-amber-500', text: 'Rate limited', pill: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300' };
  if (status === 'not_implemented') return { dot: 'bg-red-500', text: 'Not connected', pill: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300' };
  return { dot: 'bg-red-500', text: 'Provider is currently unavailable', pill: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300' };
}

function filterStatus(provider: ProviderStatus, filter: string): boolean {
  if (filter === 'all') return true;
  if (filter === 'connected') return provider.status === 'connected';
  if (filter === 'disabled') return provider.status === 'disabled_by_user';
  if (filter === 'setup') return provider.status === 'missing_session' || provider.status === 'missing_api_key';
  if (filter === 'degraded') return provider.status === 'degraded' || provider.status === 'rate_limited';
  if (filter === 'failed') return provider.status === 'failed';
  if (filter === 'not_connected') return provider.status === 'not_implemented';
  return true;
}

export function JobSourcesSettingsTab({ userId }: { userId: string }) {
  const [searchParams] = useSearchParams();
  const highlightedProvider = searchParams.get('provider');
  const { providers, groups, counts, isLoading, load, toggle, bulkToggle, runHealthCheck } = useJobSourceSettingsStore();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { void load(userId); }, [userId, load]);

  const filtered = useMemo(() => providers
    .filter((p) => p.label.toLowerCase().includes(query.toLowerCase()) || p.name.toLowerCase().includes(query.toLowerCase()))
    .filter((p) => filterStatus(p, statusFilter)), [providers, query, statusFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, ProviderStatus[]>();
    for (const provider of filtered) {
      const list = map.get(provider.group) ?? [];
      list.push(provider);
      map.set(provider.group, list);
    }
    for (const [group, list] of map) map.set(group, list.sort((a, b) => a.label.localeCompare(b.label)));
    const orderedGroups = (groups.length ? groups : Array.from(map.keys())).filter((group) => map.has(group)).sort((a, b) => a.localeCompare(b));
    return orderedGroups.map((group) => [group, map.get(group) ?? []] as const);
  }, [filtered, groups]);

  const connectedCount = counts.connected ?? providers.filter((p) => p.status === 'connected').length;
  const attentionCount = providers.length - connectedCount;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Provider Catalog / Job Sources</CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">Manage which job sources MultivoHub may use. Bulk consent only enables connected providers. Individual disable always wins, because apparently consent should mean something.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {attentionCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-100">
              <span>Some job sources need attention. Review Provider Catalog.</span>
              <button type="button" onClick={() => void runHealthCheck(userId)} className="rounded-lg border border-amber-500/30 px-3 py-1 text-xs font-medium hover:bg-amber-500/10">Run health check</button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-8">
            {[
              ['total', providers.length], ['connected', connectedCount], ['user disabled', counts.user_disabled ?? 0], ['needs setup', counts.needs_setup ?? 0], ['degraded', (counts.degraded ?? 0) + (counts.rate_limited ?? 0)], ['failed', counts.failed ?? 0], ['not connected', counts.not_implemented ?? 0], ['visible', filtered.length],
            ].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800"><p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p><p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{value}</p></div>)}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search provider" className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm dark:border-slate-800 dark:bg-slate-950" />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950">
              <option value="all">All</option><option value="connected">Connected</option><option value="disabled">Disabled by you</option><option value="setup">Needs setup</option><option value="degraded">Degraded</option><option value="failed">Failed</option><option value="not_connected">Not connected</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={isLoading} onClick={() => void bulkToggle(userId, true)} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60">Enable all connected providers</button>
            <button type="button" disabled={isLoading} onClick={() => void bulkToggle(userId, false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">Disable all providers</button>
            {isLoading && <span className="inline-flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading provider status…</span>}
          </div>
        </CardContent>
      </Card>

      {grouped.map(([group, items]) => (
        <Card key={group}>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle className="flex items-center gap-2 text-base"><Plug className="h-4 w-4" /> {group}</CardTitle><p className="text-xs text-slate-500">{items.length} providers</p></div>
            <button type="button" disabled={isLoading} onClick={() => void bulkToggle(userId, true, { group })} className="rounded-xl border border-indigo-500/30 px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-500/10 disabled:opacity-60 dark:text-indigo-300">Enable connected providers in this group</button>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((provider) => {
              const meta = statusMeta(provider.status);
              const canToggle = provider.status === 'connected' || provider.status === 'disabled_by_user';
              const highlighted = highlightedProvider === provider.name || highlightedProvider === provider.id;
              return (
                <div key={provider.name} id={`provider-${provider.name}`} className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between ${highlighted ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-100 dark:border-slate-800'}`}>
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span aria-hidden>{provider.icon}</span>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{provider.label}</p>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.pill}`}><span className={`h-2 w-2 rounded-full ${meta.dot}`} />{meta.text}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-400">{provider.category}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{provider.description}</p>
                    <p className="text-xs text-slate-500">{provider.statusReason ?? meta.text}</p>
                    {provider.requiresSession && <p className="text-xs text-amber-700 dark:text-amber-300">Session required. <Link className="underline" to="/jobs">Set up session</Link>.</p>}
                    {provider.requiresApiKey && <p className="text-xs text-amber-700 dark:text-amber-300">API key required: <code>{provider.requiresApiKey}</code></p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{provider.userEnabled ? 'Enabled' : 'Off'}</span>
                    <Toggle checked={provider.userEnabled} disabled={isLoading || !canToggle} onChange={() => void toggle(userId, provider.name, !provider.userEnabled)} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {providers.length === 0 && !isLoading && <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-800"><AlertCircle className="mr-2 inline h-4 w-4" />No providers returned from catalog.</div>}
    </div>
  );
}
