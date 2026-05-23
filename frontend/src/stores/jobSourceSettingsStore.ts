import { create } from 'zustand';
import { trpcClient } from '@/lib/api';

export type ProviderStatusValue =
  | 'connected'
  | 'disabled_by_user'
  | 'missing_session'
  | 'missing_api_key'
  | 'degraded'
  | 'rate_limited'
  | 'failed'
  | 'not_implemented';

export interface ProviderStatus {
  name: string;
  id: string;
  label: string;
  icon: string;
  description: string;
  group: string;
  isEnabled: boolean;
  userEnabled: boolean;
  effectiveEnabled: boolean;
  category: string;
  status: ProviderStatusValue;
  statusReason: string | null;
  lastCheckedAt: string | null;
  readiness: { ready: boolean; reason?: string };
  requiresSession: boolean;
  requiresApiKey: string | null;
  isAiPowered: boolean;
  isExternalProvider: boolean;
}

type ProviderCounts = Record<string, number>;

interface JobSourceSettingsStore {
  providers: ProviderStatus[];
  groups: string[];
  counts: ProviderCounts;
  isLoading: boolean;
  load(userId: string, force?: boolean): Promise<void>;
  toggle(userId: string, providerName: string, isEnabled: boolean): Promise<void>;
  bulkToggle(userId: string, isEnabled: boolean, options?: { group?: string; providerNames?: string[] }): Promise<void>;
  runHealthCheck(userId: string): Promise<void>;
}

function mapProvider(p: any): ProviderStatus {
  const name = p.name ?? p.id;
  const status = p.status ?? (p.readiness?.ready ? 'connected' : 'failed');
  return {
    name,
    id: p.id ?? name,
    label: p.label,
    icon: p.icon ?? '',
    description: p.description ?? '',
    group: p.group ?? 'Runtime Aggregators',
    isEnabled: Boolean(p.isEnabled ?? p.userEnabled),
    userEnabled: Boolean(p.userEnabled ?? p.isEnabled),
    effectiveEnabled: Boolean(p.effectiveEnabled ?? p.readiness?.ready),
    category: p.category,
    status,
    statusReason: p.statusReason ?? p.reason ?? p.readiness?.reason ?? null,
    lastCheckedAt: p.lastCheckedAt ?? null,
    readiness: p.readiness ?? { ready: status === 'connected', reason: p.statusReason ?? undefined },
    requiresSession: Boolean(p.requiresSession),
    requiresApiKey: p.requiresApiKey ?? null,
    isAiPowered: Boolean(p.isAiPowered ?? p.category === 'ai'),
    isExternalProvider: p.isExternalProvider !== false,
  };
}

export const useJobSourceSettingsStore = create<JobSourceSettingsStore>((set, get) => ({
  providers: [],
  groups: [],
  counts: {},
  isLoading: false,

  async load(userId: string, force = false) {
    if (!userId) return;
    set({ isLoading: true });
    try {
      const result = await trpcClient.jobSources.getCatalog.query({ userId, force });
      set({
        providers: result.providers.map(mapProvider),
        groups: result.groups,
        counts: result.counts,
      });
    } catch (err) {
      console.error('[jobSourceSettingsStore] Failed to load catalog:', err);
      try {
        const fallback = await trpcClient.jobSources.list.query({ userId });
        set({ providers: fallback.map(mapProvider) });
      } catch (fallbackErr) {
        console.error('[jobSourceSettingsStore] Failed to load fallback provider list:', fallbackErr);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  async toggle(userId: string, providerName: string, isEnabled: boolean) {
    set((state) => ({
      providers: state.providers.map((p) =>
        p.name === providerName
          ? { ...p, isEnabled, userEnabled: isEnabled, effectiveEnabled: isEnabled && p.status === 'connected' }
          : p,
      ),
    }));
    try {
      await trpcClient.jobSources.updateProviderConsent.mutate({ userId, providerName, enabled: isEnabled });
      await get().load(userId, true);
    } catch (err) {
      console.error('[jobSourceSettingsStore] Failed to update:', err);
      set((state) => ({
        providers: state.providers.map((p) =>
          p.name === providerName
            ? { ...p, isEnabled: !isEnabled, userEnabled: !isEnabled, effectiveEnabled: !isEnabled && p.status === 'connected' }
            : p,
        ),
      }));
    }
  },

  async bulkToggle(userId: string, isEnabled: boolean, options = {}) {
    set({ isLoading: true });
    try {
      await trpcClient.jobSources.bulkUpdateProviderConsents.mutate({
        userId,
        enabled: isEnabled,
        group: options.group,
        providerNames: options.providerNames,
      });
      await get().load(userId, true);
    } catch (err) {
      console.error('[jobSourceSettingsStore] Failed to bulk update:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  async runHealthCheck(userId: string) {
    set({ isLoading: true });
    try {
      await trpcClient.jobSources.runProviderHealthCheck.mutate({ userId });
      await get().load(userId, true);
    } catch (err) {
      console.error('[jobSourceSettingsStore] Failed to run health check:', err);
    } finally {
      set({ isLoading: false });
    }
  },
}));
