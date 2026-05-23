export type ProviderName =
  | 'reed'
  | 'adzuna'
  | 'jooble'
  | 'indeed-browser'
  | 'gumtree'
  | 'totaljobs'
  | 'cv-library'
  | 'findajob'
  | 'linkedin'
  | 'monster'
  | 'glassdoor'
  | 'database'
  | 'manual'
  | 'openai-discovery'
  | 'company-targets'
  | 'nhs-jobs'
  | 'jobs-ac-uk'
  | 'cwjobs'
  | 'rapidapi'
  | 'serpapi'
  | 'themuse'
  | 'rapidapi-jobs'
  | 'gov-jobs'
  | 'rss-feed'
  | 'aggregator'
  | 'technojobs'
  | 'theitjobboard'
  | 'harnham'
  | 'datacareer'
  | 'workinstartups'
  | 'siliconmilkroundabout'
  | 'dice-uk'
  | 'gaapweb'
  | 'cityjobs'
  | 'barclaysimpson'
  | 'healthjobs'
  | 'nurses'
  | 'bmj-careers'
  | 'trac-jobs'
  | 'nhs-professionals'
  | 'tes-jobs'
  | 'teaching-vacancies'
  | 'eteach'
  | 'fejobs'
  | 'timeshighereducation'
  | 'engineeringjobs'
  | 'ice-recruit'
  | 'justengineers'
  | 'themanufacturerjobs'
  | 'fawkesreece'
  | 'propertyweekjobs'
  | 'iwfmjobs'
  | 'cips-jobs'
  | 'supplychainonline'
  | 'driverhire'
  | 'caterer'
  | 'retailchoice'
  | 'hosco'
  | 'cmtravel'
  | 'fashionjobs-uk'
  | 'indeedflex'
  | 'civilservicejobs'
  | 'charityjob'
  | 'environmentjob'
  | 'greenjobs'
  | 'farmingukjobs'
  | 'totallylegal'
  | 'lawgazettejobs'
  | 'thelawyerjobs'
  | 'targetjobs'
  | 'prospects'
  | 'milkround'
  | 'gradcracker'
  | 'studentcircus';

export interface JobSourceCatalogEntry {
  name: ProviderName;
  label: string;
  description: string;
  icon: string;
  requiresApiKey: string | null;
  requiresSession: boolean;
  isAiPowered: boolean;
  defaultEnabled: boolean;
  category: 'api' | 'browser' | 'ai' | 'local';
  isExternalProvider?: boolean;
}

export const EXTERNAL_JOB_PROVIDER_NAMES: ProviderName[] = [
  'reed',
  'adzuna',
  'jooble',
  'indeed-browser',
  'gumtree',
  'totaljobs',
  'cv-library',
  'findajob',
  'linkedin',
  'monster',
  'glassdoor',
];

export const JOB_SOURCE_CATALOG: JobSourceCatalogEntry[] = [
  {
    name: 'reed',
    label: 'Reed',
    description: 'UK job board via official API. Enabling this source allows MultivoHub to search Reed listings for your job search.',
    icon: '🔴',
    requiresApiKey: 'REED_API_KEY',
    requiresSession: false,
    isAiPowered: false,
    defaultEnabled: true,
    category: 'api',
    isExternalProvider: true,
  },
  {
    name: 'adzuna',
    label: 'Adzuna',
    description: 'Global job search aggregator. Enabling this source allows MultivoHub to search Adzuna listings for your job search.',
    icon: '🟠',
    requiresApiKey: 'ADZUNA_APP_ID',
    requiresSession: false,
    isAiPowered: false,
    defaultEnabled: true,
    category: 'api',
    isExternalProvider: true,
  },
  {
    name: 'jooble',
    label: 'Jooble',
    description: 'International job search aggregator. Enabling this source allows MultivoHub to search Jooble listings for your job search.',
    icon: '🟡',
    requiresApiKey: 'JOOBLE_API_KEY',
    requiresSession: false,
    isAiPowered: false,
    defaultEnabled: true,
    category: 'api',
    isExternalProvider: true,
  },
  {
    name: 'indeed-browser',
    label: 'Indeed',
    description: 'Job board searched through a saved browser session or web scanning when direct API access is unavailable. Enabling this source is your consent to use it for search.',
    icon: '🔵',
    requiresApiKey: null,
    requiresSession: true,
    isAiPowered: false,
    defaultEnabled: false,
    category: 'browser',
    isExternalProvider: true,
  },
  {
    name: 'gumtree',
    label: 'Gumtree',
    description: 'UK classifieds job listings searched through a saved browser session or web scanning. Enabling this source is your consent to use it for search.',
    icon: '🟢',
    requiresApiKey: null,
    requiresSession: true,
    isAiPowered: false,
    defaultEnabled: false,
    category: 'browser',
    isExternalProvider: true,
  },
  {
    name: 'totaljobs',
    label: 'Totaljobs',
    description: 'UK job board source for web-scanned listings when no direct API is available. Enabling this source is your consent to use it for search.',
    icon: '🟣',
    requiresApiKey: null,
    requiresSession: false,
    isAiPowered: false,
    defaultEnabled: false,
    category: 'browser',
    isExternalProvider: true,
  },
  {
    name: 'cv-library',
    label: 'CV-Library',
    description: 'UK CV-Library job board source for web-scanned listings when no direct API is available. Enabling this source is your consent to use it for search.',
    icon: '📘',
    requiresApiKey: null,
    requiresSession: false,
    isAiPowered: false,
    defaultEnabled: false,
    category: 'browser',
    isExternalProvider: true,
  },
  {
    name: 'findajob',
    label: 'Find a Job',
    description: 'UK government Find a Job source. Enabling this source allows MultivoHub to search public listings for your job search.',
    icon: '🇬🇧',
    requiresApiKey: null,
    requiresSession: false,
    isAiPowered: false,
    defaultEnabled: false,
    category: 'browser',
    isExternalProvider: true,
  },
  {
    name: 'linkedin',
    label: 'LinkedIn',
    description: 'LinkedIn job listings searched through a saved browser session. Enabling this source is your consent to use it for search.',
    icon: '💼',
    requiresApiKey: null,
    requiresSession: true,
    isAiPowered: false,
    defaultEnabled: false,
    category: 'browser',
    isExternalProvider: true,
  },
  {
    name: 'monster',
    label: 'Monster UK',
    description: 'Monster UK job board source for web-scanned listings. Enabling this source is your consent to use it for search.',
    icon: '👹',
    requiresApiKey: null,
    requiresSession: false,
    isAiPowered: false,
    defaultEnabled: false,
    category: 'browser',
    isExternalProvider: true,
  },
  {
    name: 'glassdoor',
    label: 'Glassdoor',
    description: 'Glassdoor job listings searched through a saved browser session. Enabling this source is your consent to use it for search.',
    icon: '🏢',
    requiresApiKey: null,
    requiresSession: true,
    isAiPowered: false,
    defaultEnabled: false,
    category: 'browser',
    isExternalProvider: true,
  },
  {
    name: 'database',
    label: 'Saved Jobs',
    description: 'Jobs previously saved to your database. This is a local product source, not an external provider consent.',
    icon: '💾',
    requiresApiKey: null,
    requiresSession: false,
    isAiPowered: false,
    defaultEnabled: true,
    category: 'local',
    isExternalProvider: false,
  },
  {
    name: 'manual',
    label: 'Manual Entries',
    description: 'Jobs you have added manually. This is a local product source, not an external provider consent.',
    icon: '✍️',
    requiresApiKey: null,
    requiresSession: false,
    isAiPowered: false,
    defaultEnabled: true,
    category: 'local',
    isExternalProvider: false,
  },
  {
    name: 'openai-discovery',
    label: 'AI Discovery',
    description: 'AI-assisted discovery tailored to your profile. This is a product feature, not a job board provider consent.',
    icon: '🤖',
    requiresApiKey: 'OPENAI_API_KEY',
    requiresSession: false,
    isAiPowered: true,
    defaultEnabled: false,
    category: 'ai',
    isExternalProvider: false,
  },
  {
    name: 'company-targets',
    label: 'Company Targets',
    description: 'Watch jobs from your target companies. This is a product feature, not a job board provider consent.',
    icon: '🎯',
    requiresApiKey: null,
    requiresSession: false,
    isAiPowered: false,
    defaultEnabled: false,
    category: 'local',
    isExternalProvider: false,
  },
  { name: 'nhs-jobs', label: 'NHS Jobs', description: 'NHS Jobs public search provider.', icon: '🏥', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'jobs-ac-uk', label: 'jobs.ac.uk', description: 'Academic and university jobs via RSS feed.', icon: '🎓', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'cwjobs', label: 'CWJobs', description: 'IT and tech jobs via CWJobs.', icon: '💻', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'technojobs', label: 'Technojobs', description: 'IT and tech jobs via Technojobs.', icon: '💻', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'theitjobboard', label: 'The IT Job Board', description: 'IT specialist job board.', icon: '💻', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'harnham', label: 'Harnham', description: 'Data and analytics recruitment.', icon: '📊', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'datacareer', label: 'DataCareer', description: 'Data science and engineering jobs.', icon: '📊', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'workinstartups', label: 'Work In Startups', description: 'Startup job board.', icon: '🚀', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'siliconmilkroundabout', label: 'Silicon Milkroundabout', description: 'London tech startup jobs.', icon: '🚀', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'dice-uk', label: 'Dice UK', description: 'Tech jobs via Dice.', icon: '💻', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'gaapweb', label: 'GAAPweb', description: 'Finance and accounting jobs.', icon: '💰', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'cityjobs', label: 'CityJobs', description: 'City and finance sector jobs.', icon: '💰', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'barclaysimpson', label: 'Barclay Simpson', description: 'Governance, risk and compliance recruitment.', icon: '💰', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'healthjobs', label: 'Healthjobs.co.uk', description: 'Healthcare and medical jobs.', icon: '🏥', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'nurses', label: 'Nurses.co.uk', description: 'Nursing jobs.', icon: '🏥', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'bmj-careers', label: 'BMJ Careers', description: 'Medical and clinical jobs via BMJ.', icon: '🏥', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'trac-jobs', label: 'trac.jobs', description: 'NHS and healthcare jobs via TRAC.', icon: '🏥', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'nhs-professionals', label: 'NHS Professionals', description: 'NHS flexible working jobs.', icon: '🏥', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'tes-jobs', label: 'Tes Jobs', description: 'Teaching and education jobs via TES.', icon: '🎓', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'teaching-vacancies', label: 'Teaching Vacancies', description: 'UK government teaching vacancies.', icon: '🎓', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'eteach', label: 'Eteach', description: 'Education recruitment.', icon: '🎓', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'fejobs', label: 'FEjobs', description: 'Further education jobs.', icon: '🎓', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'timeshighereducation', label: 'Times Higher Education Jobs', description: 'Academic and university jobs.', icon: '🎓', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'engineeringjobs', label: 'Engineering Jobs', description: 'Engineering sector jobs.', icon: '⚙️', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'ice-recruit', label: 'ICE Recruit', description: 'Civil engineering jobs via ICE.', icon: '⚙️', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'justengineers', label: 'Just Engineers', description: 'Engineering specialist jobs.', icon: '⚙️', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'themanufacturerjobs', label: 'The Manufacturer Jobs', description: 'Manufacturing sector jobs.', icon: '⚙️', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'fawkesreece', label: 'Fawkes & Reece', description: 'Construction and property recruitment.', icon: '🏗️', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'propertyweekjobs', label: 'Property Week Jobs', description: 'Property and real estate jobs.', icon: '🏗️', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'iwfmjobs', label: 'IWFM Jobs', description: 'Facilities management jobs.', icon: '🏗️', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'cips-jobs', label: 'CIPS Procurement & Supply Jobs', description: 'Procurement and supply chain jobs via CIPS.', icon: '🚚', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'supplychainonline', label: 'SupplyChainOnline', description: 'Supply chain and logistics jobs.', icon: '🚚', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'driverhire', label: 'Driver Hire', description: 'Driving and transport jobs.', icon: '🚚', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'caterer', label: 'Caterer.com', description: 'Hospitality and catering jobs.', icon: '🍽️', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'retailchoice', label: 'RetailChoice.com', description: 'Retail sector jobs.', icon: '🛍️', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'hosco', label: 'Hosco', description: 'Hospitality industry jobs.', icon: '🍽️', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'cmtravel', label: 'C&M Travel Recruitment', description: 'Travel and tourism jobs.', icon: '✈️', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'fashionjobs-uk', label: 'FashionJobs UK', description: 'Fashion industry jobs.', icon: '👗', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'indeedflex', label: 'Indeed Flex', description: 'Flexible and temporary work via Indeed Flex.', icon: '🕐', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'civilservicejobs', label: 'Civil Service Jobs', description: 'UK government civil service vacancies.', icon: '🏛️', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'charityjob', label: 'CharityJob', description: 'Charity and non-profit jobs.', icon: '❤️', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'environmentjob', label: 'Environmentjob.co.uk', description: 'Environmental sector jobs.', icon: '🌿', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'greenjobs', label: 'GreenJobs', description: 'Green and sustainability jobs.', icon: '🌿', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'farmingukjobs', label: 'Farming UK Jobs', description: 'Agricultural and farming jobs.', icon: '🌾', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'totallylegal', label: 'TotallyLegal', description: 'Legal sector jobs.', icon: '⚖️', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'lawgazettejobs', label: 'Law Gazette Jobs', description: 'Legal jobs via Law Gazette.', icon: '⚖️', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'thelawyerjobs', label: 'The Lawyer Jobs', description: 'Lawyer and solicitor jobs.', icon: '⚖️', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'targetjobs', label: 'TARGETjobs', description: 'Graduate and early career jobs.', icon: '🎓', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'prospects', label: 'Prospects', description: 'Graduate careers and jobs.', icon: '🎓', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'milkround', label: 'Milkround', description: 'Graduate and student jobs.', icon: '🎓', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'gradcracker', label: 'Gradcracker', description: 'STEM graduate jobs.', icon: '🎓', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'studentcircus', label: 'Student Circus', description: 'International student jobs in the UK.', icon: '🎓', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'rapidapi', label: 'RapidAPI Jobs', description: 'Job aggregation via RapidAPI.', icon: '⚡', requiresApiKey: 'RAPIDAPI_KEY', requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'api', isExternalProvider: true },
  { name: 'serpapi', label: 'SerpAPI Jobs', description: 'Job search via SerpAPI.', icon: '🔍', requiresApiKey: 'SERPAPI_KEY', requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'api', isExternalProvider: true },
  { name: 'themuse', label: 'The Muse', description: 'Company culture and job listings via The Muse.', icon: '✨', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'api', isExternalProvider: true },
  { name: 'rapidapi-jobs', label: 'RapidAPI Jobs (alt)', description: 'Alternative RapidAPI jobs provider.', icon: '⚡', requiresApiKey: 'RAPIDAPI_KEY', requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'api', isExternalProvider: true },
  { name: 'gov-jobs', label: 'Gov Jobs', description: 'UK government jobs aggregator.', icon: '🏛️', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'rss-feed', label: 'RSS Feed', description: 'Generic RSS feed job source.', icon: '📡', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'browser', isExternalProvider: true },
  { name: 'aggregator', label: 'Aggregator', description: 'Generic job aggregator source.', icon: '🔗', requiresApiKey: null, requiresSession: false, isAiPowered: false, defaultEnabled: false, category: 'aggregator' as const, isExternalProvider: true },
];
