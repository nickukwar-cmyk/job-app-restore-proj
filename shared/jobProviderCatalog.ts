import { JOB_SOURCE_CATALOG, type JobSourceCatalogEntry, type ProviderName } from './jobSources.js';

export type ProviderStatus =
  | 'connected'
  | 'disabled_by_user'
  | 'missing_session'
  | 'missing_api_key'
  | 'degraded'
  | 'rate_limited'
  | 'failed'
  | 'not_implemented';

export type JobProviderGroup =
  | 'Education & Academic'
  | 'Engineering, Construction & Property'
  | 'Finance & Accounting'
  | 'General Job Boards'
  | 'Graduate, Student & Early Career'
  | 'Healthcare & Medical'
  | 'Hospitality, Retail, Tourism & Fashion'
  | 'IT & Tech'
  | 'Internal & AI Sources'
  | 'Legal'
  | 'Logistics, Transport & Supply Chain'
  | 'Public, NGO, Green & Agriculture'
  | 'Runtime Aggregators';

export type JobProviderCategory = 'api' | 'browser' | 'ai' | 'local' | 'aggregator';

export type JobProviderCatalogEntry = {
  id: string;
  label: string;
  description: string;
  icon: string;
  group: JobProviderGroup;
  category: JobProviderCategory;
  requiresApiKey: string | null;
  requiresSession: boolean;
  defaultEnabled: boolean;
  isExternalProvider: boolean;
  status: ProviderStatus;
  statusReason: string | null;
  lastCheckedAt: string | null;
  userEnabled: boolean;
  effectiveEnabled: boolean;
};

export const JOB_PROVIDER_GROUPS: JobProviderGroup[] = [
  'Education & Academic',
  'Engineering, Construction & Property',
  'Finance & Accounting',
  'General Job Boards',
  'Graduate, Student & Early Career',
  'Healthcare & Medical',
  'Hospitality, Retail, Tourism & Fashion',
  'IT & Tech',
  'Internal & AI Sources',
  'Legal',
  'Logistics, Transport & Supply Chain',
  'Public, NGO, Green & Agriculture',
  'Runtime Aggregators',
];

const GROUP_BY_PROVIDER: Record<ProviderName, JobProviderGroup> = {
  reed: 'General Job Boards',
  adzuna: 'General Job Boards',
  jooble: 'General Job Boards',
  'indeed-browser': 'General Job Boards',
  gumtree: 'General Job Boards',
  totaljobs: 'General Job Boards',
  'cv-library': 'General Job Boards',
  findajob: 'General Job Boards',
  linkedin: 'General Job Boards',
  monster: 'General Job Boards',
  glassdoor: 'General Job Boards',
  cwjobs: 'IT & Tech',
  technojobs: 'IT & Tech',
  theitjobboard: 'IT & Tech',
  harnham: 'IT & Tech',
  datacareer: 'IT & Tech',
  workinstartups: 'IT & Tech',
  siliconmilkroundabout: 'IT & Tech',
  'dice-uk': 'IT & Tech',
  gaapweb: 'Finance & Accounting',
  cityjobs: 'Finance & Accounting',
  barclaysimpson: 'Finance & Accounting',
  'nhs-jobs': 'Healthcare & Medical',
  healthjobs: 'Healthcare & Medical',
  nurses: 'Healthcare & Medical',
  'bmj-careers': 'Healthcare & Medical',
  'trac-jobs': 'Healthcare & Medical',
  'nhs-professionals': 'Healthcare & Medical',
  'tes-jobs': 'Education & Academic',
  'jobs-ac-uk': 'Education & Academic',
  'teaching-vacancies': 'Education & Academic',
  eteach: 'Education & Academic',
  fejobs: 'Education & Academic',
  timeshighereducation: 'Education & Academic',
  engineeringjobs: 'Engineering, Construction & Property',
  'ice-recruit': 'Engineering, Construction & Property',
  justengineers: 'Engineering, Construction & Property',
  themanufacturerjobs: 'Engineering, Construction & Property',
  fawkesreece: 'Engineering, Construction & Property',
  propertyweekjobs: 'Engineering, Construction & Property',
  iwfmjobs: 'Engineering, Construction & Property',
  'cips-jobs': 'Logistics, Transport & Supply Chain',
  supplychainonline: 'Logistics, Transport & Supply Chain',
  driverhire: 'Logistics, Transport & Supply Chain',
  caterer: 'Hospitality, Retail, Tourism & Fashion',
  retailchoice: 'Hospitality, Retail, Tourism & Fashion',
  hosco: 'Hospitality, Retail, Tourism & Fashion',
  cmtravel: 'Hospitality, Retail, Tourism & Fashion',
  'fashionjobs-uk': 'Hospitality, Retail, Tourism & Fashion',
  civilservicejobs: 'Public, NGO, Green & Agriculture',
  charityjob: 'Public, NGO, Green & Agriculture',
  environmentjob: 'Public, NGO, Green & Agriculture',
  greenjobs: 'Public, NGO, Green & Agriculture',
  farmingukjobs: 'Public, NGO, Green & Agriculture',
  totallylegal: 'Legal',
  lawgazettejobs: 'Legal',
  thelawyerjobs: 'Legal',
  targetjobs: 'Graduate, Student & Early Career',
  prospects: 'Graduate, Student & Early Career',
  milkround: 'Graduate, Student & Early Career',
  gradcracker: 'Graduate, Student & Early Career',
  studentcircus: 'Graduate, Student & Early Career',
  indeedflex: 'Graduate, Student & Early Career',
  database: 'Internal & AI Sources',
  manual: 'Internal & AI Sources',
  'openai-discovery': 'Internal & AI Sources',
  'company-targets': 'Internal & AI Sources',
};

export const STATUS_LABELS: Record<ProviderStatus, string> = {
  connected: 'Connected',
  disabled_by_user: 'Disabled by you',
  missing_session: 'Session required',
  missing_api_key: 'API key required',
  degraded: 'Degraded',
  rate_limited: 'Rate limited',
  failed: 'Failed',
  not_implemented: 'Not connected',
};

export function getProviderGroup(providerName: ProviderName | string): JobProviderGroup {
  return GROUP_BY_PROVIDER[providerName as ProviderName] ?? 'Runtime Aggregators';
}

export function statusBlocksSearch(status: ProviderStatus): boolean {
  return status !== 'connected';
}

export function isConnectedStatus(status: ProviderStatus): boolean {
  return status === 'connected';
}

export function isSetupStatus(status: ProviderStatus): boolean {
  return status === 'missing_api_key' || status === 'missing_session';
}

export function toBaseProviderCatalogEntry(entry: JobSourceCatalogEntry): JobProviderCatalogEntry {
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
    status: entry.defaultEnabled ? 'connected' : 'disabled_by_user',
    statusReason: null,
    lastCheckedAt: null,
    userEnabled: entry.defaultEnabled,
    effectiveEnabled: entry.defaultEnabled,
  };
}

export function getBaseJobProviderCatalog(): JobProviderCatalogEntry[] {
  return JOB_SOURCE_CATALOG
    .map(toBaseProviderCatalogEntry)
    .sort((a, b) => a.group.localeCompare(b.group) || a.label.localeCompare(b.label));
}

export function countProviderStatuses(providers: Array<Pick<JobProviderCatalogEntry, 'status'>>): Record<ProviderStatus | 'total' | 'needs_setup' | 'user_disabled', number> {
  const counts: Record<ProviderStatus | 'total' | 'needs_setup' | 'user_disabled', number> = {
    total: providers.length,
    connected: 0,
    disabled_by_user: 0,
    user_disabled: 0,
    missing_session: 0,
    missing_api_key: 0,
    needs_setup: 0,
    degraded: 0,
    rate_limited: 0,
    failed: 0,
    not_implemented: 0,
  };

  for (const provider of providers) {
    counts[provider.status] += 1;
    if (provider.status === 'disabled_by_user') counts.user_disabled += 1;
    if (isSetupStatus(provider.status)) counts.needs_setup += 1;
  }

  return counts;
}
