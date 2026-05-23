import { randomUUID } from 'crypto';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { publicProcedure, router } from '../trpc.js';
import { db } from '../../db/index.js';
import { users, userJobSessions, jobSourceSettings, jobScrapeLogs } from '../../db/schema.js';
import { JOB_PROVIDER_GROUPS, countProviderStatuses } from '../../../../shared/jobProviderCatalog.js';
import { JobDiscoveryService } from '../../services/jobSources/jobDiscoveryService.js';
import { decryptSessionCookies } from '../../services/jobSources/sessionCookieCrypto.js';
import {
  clearProviderHealthCache,
  getConnectedProviderNames,
  getProviderCatalogWithHealth,
  getProviderHealthStatuses,
  type ProviderConsentState,
  type ProviderDiagnosticsState,
  type ProviderSessionState,
} from '../../services/jobSources/jobSourceHealth.js';

const providerStatusSchema = z.enum([
  'connected',
  'disabled_by_user',
  'missing_session',
  'missing_api_key',
  'degraded',
  'rate_limited',
  'failed',
  'not_implemented',
]);

async function getInternalUserId(clerkUserId: string): Promise<string> {
  const userRows = await db.select({ id: users.id }).from(users).where(eq(users.clerkId, clerkUserId)).limit(1);
  if (!userRows[0]) throw new Error('User not found');
  return userRows[0].id;
}

async function getOptionalInternalUserId(clerkUserId: string): Promise<string | null> {
  const userRows = await db.select({ id: users.id }).from(users).where(eq(users.clerkId, clerkUserId)).limit(1);
  return userRows[0]?.id ?? null;
}

async function readConsentRows(internalUserId: string | null): Promise<ProviderConsentState[]> {
  if (!internalUserId) return [];
  const settingsRows = await db
    .select({ providerName: jobSourceSettings.providerName, enabled: jobSourceSettings.isEnabled })
    .from(jobSourceSettings)
    .where(eq(jobSourceSettings.userId, internalUserId));
  return settingsRows.map((row) => ({ providerName: row.providerName, enabled: Boolean(row.enabled) }));
}

async function readSessionRows(internalUserId: string | null): Promise<ProviderSessionState[]> {
  if (!internalUserId) return [];
  const sessionRows = await db
    .select({
      provider: userJobSessions.provider,
      isActive: userJobSessions.isActive,
      sessionStatus: userJobSessions.sessionStatus,
      lastTestedAt: userJobSessions.lastTestedAt,
      lastHealthReason: userJobSessions.lastHealthReason,
    })
    .from(userJobSessions)
    .where(eq(userJobSessions.userId, internalUserId));
  return sessionRows.map((row) => ({
    provider: row.provider,
    isActive: Boolean(row.isActive),
    sessionStatus: row.sessionStatus,
    lastTestedAt: row.lastTestedAt,
    lastHealthReason: row.lastHealthReason,
  }));
}

async function readDiagnosticRows(): Promise<ProviderDiagnosticsState[]> {
  const rows = await db
    .select({
      providerName: jobScrapeLogs.providerName,
      createdAt: jobScrapeLogs.createdAt,
      jobCount: jobScrapeLogs.jobCount,
      errorMessage: jobScrapeLogs.errorMessage,
    })
    .from(jobScrapeLogs);
  return rows.map((row) => ({ providerName: row.providerName, createdAt: row.createdAt, jobCount: row.jobCount, errorMessage: row.errorMessage }));
}

async function loadHealthContext(clerkUserId: string, force = false) {
  const internalUserId = await getOptionalInternalUserId(clerkUserId);
  const [consents, sessions, diagnostics] = await Promise.all([readConsentRows(internalUserId), readSessionRows(internalUserId), readDiagnosticRows()]);
  return { internalUserId, consents, sessions, diagnostics, force };
}

async function upsertConsent(internalUserId: string, providerName: string, enabled: boolean) {
  const existing = await db
    .select({ id: jobSourceSettings.id })
    .from(jobSourceSettings)
    .where(and(eq(jobSourceSettings.userId, internalUserId), eq(jobSourceSettings.providerName, providerName)))
    .limit(1);

  if (existing[0]) {
    await db.update(jobSourceSettings).set({ isEnabled: enabled }).where(eq(jobSourceSettings.id, existing[0].id));
  } else {
    await db.insert(jobSourceSettings).values({ id: randomUUID(), userId: internalUserId, providerName, isEnabled: enabled });
  }
}

async function getCatalogPayload(clerkUserId: string, force = false) {
  const context = await loadHealthContext(clerkUserId, force);
  const catalog = await getProviderCatalogWithHealth(context);
  return { providers: catalog, groups: JOB_PROVIDER_GROUPS, counts: countProviderStatuses(catalog) };
}

export const jobSourcesRouter = router({
  getCatalog: publicProcedure
    .input(z.object({ userId: z.string(), force: z.boolean().optional() }))
    .query(async ({ input }) => getCatalogPayload(input.userId, Boolean(input.force))),

  getProviderStatuses: publicProcedure
    .input(z.object({ userId: z.string(), force: z.boolean().optional() }))
    .query(async ({ input }) => {
      const context = await loadHealthContext(input.userId, Boolean(input.force));
      return getProviderHealthStatuses(context);
    }),

  updateProviderConsent: publicProcedure
    .input(z.object({ userId: z.string(), providerName: z.string(), enabled: z.boolean() }))
    .mutation(async ({ input }) => {
      const internalUserId = await getInternalUserId(input.userId);
      const context = await loadHealthContext(input.userId, true);
      const statuses = await getProviderHealthStatuses(context);
      const status = statuses.find((item) => item.providerId === input.providerName);
      if (!status) throw new Error('Provider not registered');
      if (input.enabled && !['connected', 'disabled_by_user'].includes(status.status)) {
        throw new Error(status.reason ?? 'Provider is not available for search');
      }
      await upsertConsent(internalUserId, input.providerName, input.enabled);
      clearProviderHealthCache();
      return { success: true };
    }),

  bulkUpdateProviderConsents: publicProcedure
    .input(z.object({ userId: z.string(), enabled: z.boolean(), providerNames: z.array(z.string()).optional(), group: z.string().optional() }))
    .mutation(async ({ input }) => {
      const internalUserId = await getInternalUserId(input.userId);
      const context = await loadHealthContext(input.userId, true);
      const statuses = await getProviderHealthStatuses(context);
      const wanted = new Set(input.providerNames ?? []);
      const targets = statuses.filter((status) => {
        if (input.group && status.group !== input.group) return false;
        if (wanted.size > 0 && !wanted.has(status.providerId)) return false;
        if (!input.enabled) return true;
        return status.status === 'connected' || status.status === 'disabled_by_user';
      });
      for (const target of targets) await upsertConsent(internalUserId, target.providerId, input.enabled);
      clearProviderHealthCache();
      return { success: true, updated: targets.length };
    }),

  runProviderHealthCheck: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      clearProviderHealthCache();
      const context = await loadHealthContext(input.userId, true);
      const statuses = await getProviderHealthStatuses(context);
      return { statuses, checkedAt: new Date().toISOString() };
    }),

  getProviderDiagnostics: publicProcedure
    .input(z.object({ userId: z.string(), providerName: z.string().optional() }))
    .query(async ({ input }) => {
      await getOptionalInternalUserId(input.userId);
      const diagnostics = await readDiagnosticRows();
      const filtered = input.providerName ? diagnostics.filter((diagnostic) => diagnostic.providerName === input.providerName) : diagnostics;
      return filtered.sort((a, b) => Number(new Date(b.createdAt ?? 0)) - Number(new Date(a.createdAt ?? 0))).slice(0, 100);
    }),

  list: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const payload = await getCatalogPayload(input.userId);
      return payload.providers.map((provider) => ({
        name: provider.id,
        label: provider.label,
        icon: provider.icon,
        description: provider.description,
        isEnabled: provider.userEnabled,
        category: provider.category,
        group: provider.group,
        status: provider.status,
        statusReason: provider.statusReason,
        lastCheckedAt: provider.lastCheckedAt,
        userEnabled: provider.userEnabled,
        effectiveEnabled: provider.effectiveEnabled,
        readiness: { ready: provider.status === 'connected', reason: provider.statusReason ?? undefined },
        requiresSession: provider.requiresSession,
        requiresApiKey: provider.requiresApiKey,
        isAiPowered: provider.category === 'ai',
        isExternalProvider: provider.isExternalProvider,
      }));
    }),

  update: publicProcedure
    .input(z.object({ userId: z.string(), providerName: z.string(), isEnabled: z.boolean() }))
    .mutation(async ({ input }) => {
      const internalUserId = await getInternalUserId(input.userId);
      await upsertConsent(internalUserId, input.providerName, input.isEnabled);
      clearProviderHealthCache();
      return { success: true };
    }),

  discover: publicProcedure
    .input(z.object({ userId: z.string(), query: z.string().default(''), location: z.string().default('United Kingdom'), limit: z.number().min(1).max(100).default(20), providers: z.array(z.string()).optional(), statuses: z.array(providerStatusSchema).optional() }))
    .query(async ({ input }) => {
      const internalUserId = await getOptionalInternalUserId(input.userId);
      const contextRows = await loadHealthContext(input.userId);
      const statuses = await getProviderHealthStatuses(contextRows);
      const connectedProviderNames = getConnectedProviderNames(statuses);
      const requested = input.providers && input.providers.length > 0 ? input.providers : connectedProviderNames;
      const providersToRun = Array.from(new Set(requested.filter((name) => connectedProviderNames.includes(name))));
      const context: { sessionCookies?: Record<string, string>; userId?: string } = { userId: input.userId };
      if (internalUserId) {
        const sessions = await db.select({ provider: userJobSessions.provider, cookies: userJobSessions.cookies }).from(userJobSessions).where(and(eq(userJobSessions.userId, internalUserId), eq(userJobSessions.isActive, true)));
        if (sessions.length > 0) {
          context.sessionCookies = {};
          for (const session of sessions) context.sessionCookies[session.provider] = decryptSessionCookies(session.cookies);
        }
      }
      return JobDiscoveryService.discover({ query: input.query, location: input.location, limit: input.limit, userId: input.userId, providers: providersToRun }, context, providersToRun);
    }),
});
