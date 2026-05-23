import { JOB_SOURCE_CATALOG } from '../../../../shared/jobSources.js';
import {
  STATUS_LABELS,
  getProviderGroup,
  type JobProviderCatalogEntry,
  type ProviderStatus,
} from '../../../../shared/jobProviderCatalog.js';
import { getProvider, getProviders } from './providerRegistry.js';
import type { JobSourceProvider } from './types.js';

export type ProviderHealthStatus = {
  providerId: string;
  label: string;
  group: string;
  status: ProviderStatus;
  reason: string | null;
  userEnabled: boolean;
  effectiveEnabled: boolean;
  requiresSession: boolean;
  hasValidSession: boolean;
  requiresApiKey: string | null;
  hasApiKeyConfigured: boolean;
  lastCheckedAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastFailureReason: string | null;
};

export type ProviderConsentState = {
  providerName: string;
  enabled: boolean;
};

export type ProviderSessionState = {
  provider: string;
  isActive: boolean;
  sessionStatus?: string | null;
  lastTestedAt?: Date | string | null;
  lastHealthReason?: string | null;
};

export type ProviderDiagnosticsState = {
  providerName: string;
  createdAt?: Date | string | null;
  jobCount?: number | null;
  errorMessage?: string | null;
};

const HEALTH_TTL_MS = 10 * 60 * 1000;

let cachedStatuses: { expiresAt: number; statuses: ProviderHealthStatus[] } | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function toIso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function isPlaceholderReason(reason?: string | null): boolean {
  return /placeholder|not implemented|not connected yet|integration not connected/i.test(reason ?? '');
}

function getApiKeyConfigured(envName: string | null): boolean {
  if (!envName) return true;
  return Boolean(process.env[envName]?.trim());
}

function hasProviderSession(providerId: string, sessions: ProviderSessionState[]): boolean {
  return sessions.some(
    (session) =>
      session.provider === providerId &&
      session.isActive &&
      (session.sessionStatus == null || ['active', 'valid', 'ok'].includes(session.sessionStatus)),
  );
}

function findLatestDiagnostic(providerId: string, diagnostics: ProviderDiagnosticsState[]): ProviderDiagnosticsState | undefined {
  return diagnostics
    .filter((diagnostic) => diagnostic.providerName === providerId)
    .sort((a, b) => Number(new Date(toIso(b.createdAt) ?? 0)) - Number(new Date(toIso(a.createdAt) ?? 0)))[0];
}

function classifyStatus(params: {
  provider?: JobSourceProvider;
  readiness: { ready: boolean; reason?: string };
  userEnabled: boolean;
  requiresSession: boolean;
  hasValidSession: boolean;
  requiresApiKey: string | null;
  hasApiKeyConfigured: boolean;
}): ProviderStatus {
  if (!params.provider) return 'not_implemented';
  if (isPlaceholderReason(params.readiness.reason)) return 'not_implemented';
  if (!params.readiness.ready) return 'failed';
  if (params.requiresApiKey && !params.hasApiKeyConfigured) return 'missing_api_key';
  if (params.requiresSession && !params.hasValidSession) return 'missing_session';
  if (!params.userEnabled) return 'disabled_by_user';
  return 'connected';
}

function statusReason(status: ProviderStatus, readinessReason?: string | null): string | null {
  if (status === 'connected') return 'Connected.';
  if (status === 'disabled_by_user') return 'Disabled by you.';
  if (status === 'missing_session') return 'Session required.';
  if (status === 'missing_api_key') return 'API key required.';
  if (status === 'degraded') return 'Degraded.';
  if (status === 'rate_limited') return 'Rate limited.';
  if (status === 'not_implemented') return 'Integration not connected yet.';
  return readinessReason ?? 'Provider is currently unavailable.';
}

export function clearProviderHealthCache(): void {
  cachedStatuses = null;
}

export async function getProviderHealthStatuses(options: {
  consents?: ProviderConsentState[];
  sessions?: ProviderSessionState[];
  diagnostics?: ProviderDiagnosticsState[];
  force?: boolean;
} = {}): Promise<ProviderHealthStatus[]> {
  const cacheable = !options.consents?.length && !options.sessions?.length && !options.diagnostics?.length;
  if (cacheable && !options.force && cachedStatuses && cachedStatuses.expiresAt > Date.now()) {
    return cachedStatuses.statuses;
  }

  const providerMap = new Map(getProviders().map((provider) => [provider.name, provider]));
  const consentMap = new Map((options.consents ?? []).map((consent) => [consent.providerName, consent.enabled]));
  const sessions = options.sessions ?? [];
  const diagnostics = options.diagnostics ?? [];
  const checkedAt = nowIso();

  const statuses = await Promise.all(
    JOB_SOURCE_CATALOG.map(async (entry) => {
      const provider = providerMap.get(entry.name);
      const userEnabled = consentMap.has(entry.name) ? Boolean(consentMap.get(entry.name)) : entry.defaultEnabled;
      const hasValidSession = entry.requiresSession ? hasProviderSession(entry.name, sessions) : true;
      const hasApiKeyConfigured = getApiKeyConfigured(entry.requiresApiKey);
      const readiness = provider
        ? await provider.readiness().catch((err) => ({
            ready: false,
            reason: err instanceof Error ? err.message : String(err),
          }))
        : { ready: false, reason: 'Provider not registered' };
      const status = classifyStatus({
        provider,
        readiness,
        userEnabled,
        requiresSession: entry.requiresSession,
        hasValidSession,
        requiresApiKey: entry.requiresApiKey,
        hasApiKeyConfigured,
      });
      const latestDiagnostic = findLatestDiagnostic(entry.name, diagnostics);
      const latestError = latestDiagnostic?.errorMessage ?? null;
      const effectiveEnabled = status === 'connected' && userEnabled;

      return {
        providerId: entry.name,
        label: entry.label,
        group: getProviderGroup(entry.name),
        status,
        reason: statusReason(status, latestError ?? readiness.reason),
        userEnabled,
        effectiveEnabled,
        requiresSession: entry.requiresSession,
        hasValidSession,
        requiresApiKey: entry.requiresApiKey,
        hasApiKeyConfigured,
        lastCheckedAt: checkedAt,
        lastSuccessAt: latestDiagnostic && !latestError ? toIso(latestDiagnostic.createdAt) : null,
        lastFailureAt: latestError ? toIso(latestDiagnostic?.createdAt) : null,
        lastFailureReason: latestError,
      } satisfies ProviderHealthStatus;
    }),
  );

  const sorted = statuses.sort((a, b) => a.group.localeCompare(b.group) || a.label.localeCompare(b.label));
  if (cacheable) cachedStatuses = { expiresAt: Date.now() + HEALTH_TTL_MS, statuses: sorted };
  return sorted;
}

export async function getProviderCatalogWithHealth(options: {
  consents?: ProviderConsentState[];
  sessions?: ProviderSessionState[];
  diagnostics?: ProviderDiagnosticsState[];
  force?: boolean;
} = {}): Promise<JobProviderCatalogEntry[]> {
  const health = await getProviderHealthStatuses(options);
  const healthMap = new Map(health.map((item) => [item.providerId, item]));

  return JOB_SOURCE_CATALOG.map((entry) => {
    const status = healthMap.get(entry.name);
    const userEnabled = status?.userEnabled ?? entry.defaultEnabled;
    return {
      id: entry.name,
      label: entry.label,
      description: entry.description,
      icon: entry.icon,
      group: getProviderGroup(entry.name),
      category: entry.category,
      requiresApiKey: entry.requiresApiKey,
      requiresSession: entry.requiresSession,
      defaultEnabled: entry.defaultEnabled,
      isExternalProvider: entry.isExternalProvider !== false,
      status: status?.status ?? 'not_implemented',
      statusReason: status?.reason ?? STATUS_LABELS.not_implemented,
      lastCheckedAt: status?.lastCheckedAt ?? null,
      userEnabled,
      effectiveEnabled: Boolean(status?.effectiveEnabled),
    } satisfies JobProviderCatalogEntry;
  }).sort((a, b) => a.group.localeCompare(b.group) || a.label.localeCompare(b.label));
}

export function getConnectedProviderNames(statuses: ProviderHealthStatus[]): string[] {
  return statuses.filter((status) => status.effectiveEnabled && status.status === 'connected').map((status) => status.providerId);
}

export function getProviderReadinessStatus(providerName: string): Promise<{ ready: boolean; reason?: string }> {
  const provider = getProvider(providerName);
  if (!provider) return Promise.resolve({ ready: false, reason: 'Provider not registered' });
  return provider.readiness();
}
