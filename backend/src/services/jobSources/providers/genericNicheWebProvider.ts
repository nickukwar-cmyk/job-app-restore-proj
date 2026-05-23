import type { DiscoveryInput, JobSourceProvider, ProviderContext, SourceJob } from '../types.js';

export type GenericNicheProviderConfig = {
  name: string;
  label: string;
  baseUrl: string;
  searchPath: string;
  queryParam?: string;
  locationParam?: string;
  extraParams?: Record<string, string>;
  companyFallback?: string;
};

function clean(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function absolute(baseUrl: string, href: string): string {
  try { return new URL(href, baseUrl).toString(); } catch { return baseUrl; }
}

function extractBetween(value: string, left: string, right: string): string | null {
  const start = value.toLowerCase().indexOf(left.toLowerCase());
  if (start < 0) return null;
  const from = start + left.length;
  const end = value.toLowerCase().indexOf(right.toLowerCase(), from);
  if (end < 0) return null;
  return clean(value.slice(from, end));
}

function extractHref(card: string): string | null {
  const lower = card.toLowerCase();
  const hrefAt = lower.indexOf('href=');
  if (hrefAt < 0) return null;
  const quote = card[hrefAt + 5];
  const from = hrefAt + 6;
  const to = card.indexOf(quote, from);
  return to > from ? card.slice(from, to) : null;
}

function extractTitle(card: string): string | null {
  return extractBetween(card, '<h1', '</h1>')
    ?? extractBetween(card, '<h2', '</h2>')
    ?? extractBetween(card, '<h3', '</h3>')
    ?? extractBetween(card, '<a', '</a>');
}

function splitCards(html: string): string[] {
  return html
    .split('<a')
    .slice(1)
    .map((part) => `<a${part}`)
    .filter((part) => /job|vacanc|career|position/i.test(part))
    .slice(0, 50);
}

function parseWorkMode(text: string): string | null {
  const value = text.toLowerCase();
  if (value.includes('remote')) return 'remote';
  if (value.includes('hybrid')) return 'hybrid';
  if (value.includes('on-site') || value.includes('onsite')) return 'on-site';
  return null;
}

function parseRequirements(text: string): string[] {
  return text.split('. ').map((line) => line.trim()).filter((line) => line.length > 18 && /experience|required|qualification|skill/i.test(line)).slice(0, 8);
}

export class GenericNicheWebProvider implements JobSourceProvider {
  readonly name: string;
  readonly label: string;
  private readonly config: GenericNicheProviderConfig;

  constructor(config: GenericNicheProviderConfig) {
    this.config = config;
    this.name = config.name;
    this.label = config.label;
  }

  async readiness(): Promise<{ ready: boolean; reason?: string }> {
    try { new URL(this.config.searchPath, this.config.baseUrl); return { ready: true }; }
    catch { return { ready: false, reason: 'Provider search URL is not configured correctly.' }; }
  }

  async discover(input: DiscoveryInput, _context?: ProviderContext): Promise<SourceJob[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const url = new URL(this.config.searchPath, this.config.baseUrl);
      url.searchParams.set(this.config.queryParam ?? 'q', input.query || 'jobs');
      if (input.location) url.searchParams.set(this.config.locationParam ?? 'location', input.location);
      for (const [key, value] of Object.entries(this.config.extraParams ?? {})) url.searchParams.set(key, value);
      const response = await fetch(url.toString(), { signal: controller.signal, headers: { Accept: 'text/html' } });
      if (!response.ok) throw new Error(`${this.label} HTTP ${response.status}`);
      const html = await response.text();
      return splitCards(html).map((card): SourceJob | null => {
        const href = extractHref(card);
        const title = extractTitle(card);
        if (!href || !title || title.length < 3) return null;
        const applyUrl = absolute(this.config.baseUrl, href);
        const text = clean(card).slice(0, 2000);
        return {
          externalId: `${this.name}:${applyUrl.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 160)}`,
          source: this.name,
          title,
          company: this.config.companyFallback ?? this.label,
          location: input.location || 'United Kingdom',
          description: text,
          applyUrl,
          salaryMin: null,
          salaryMax: null,
          salaryText: null,
          workMode: parseWorkMode(text),
          requirements: parseRequirements(text),
          postedAt: new Date().toISOString(),
        };
      }).filter((job): job is SourceJob => Boolean(job)).slice(0, input.limit);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`${this.label} search failed: ${message}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
