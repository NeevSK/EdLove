export const SITE_URL = 'https://gurudevi.edlove.org';
export const SITE_NAME = 'Gurudevi';
export const SITE_TITLE = 'Gurudevi | Education Ecology Support System';
export const SITE_DESCRIPTION =
  'Gurudevi is a sanctuary and education ecology support system for Sri Lanka, connecting teachers, students, schools, and communities through care, dignity, and practical support.';
export const SITE_KEYWORDS = [
  'Gurudevi',
  'education ecology',
  'teacher support',
  'Sri Lanka',
  'school support',
  'EdLove',
];

function validateUrl(name: string, value: string): string {
  const parsed = new URL(value);
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'mailto:') {
    throw new Error(`${name} must use https:// or mailto:`);
  }
  return value;
}

function publicUrl(name: string, fallback: string): string {
  const value = (import.meta.env[name] as string | undefined)?.trim() || fallback;
  const parsed = new URL(validateUrl(name, value));
  return parsed.toString().replace(/\/$/, '');
}

export const WEB_LINKS = {
  marketing: SITE_URL,
  app: publicUrl('PUBLIC_GURUDEVI_APP_URL', 'https://app.gurudevi.edlove.org'),
  edlove: publicUrl('PUBLIC_EDLOVE_URL', 'https://edlove.org'),
  intuitui: publicUrl('PUBLIC_INTUITUI_URL', 'https://intuituilabs.edlove.org'),
  founder: publicUrl('PUBLIC_FOUNDER_URL', 'https://neevsk.edlove.org'),
  beacons: 'https://beacons.ai/gurudevi',
} as const;

export const SOCIAL_LINKS = {
  email: 'https://beacons.ai/gurudevi#email',
  tiktok: 'https://www.tiktok.com/@gurudevi_app',
  x: 'https://x.com/gurudevi_app',
  youtube: 'https://youtube.com/@Gurudevi_App',
  facebook: 'https://www.facebook.com/GurudeviApp',
  linkedin: 'https://www.linkedin.com/company/gurudevi',
  beacons: WEB_LINKS.beacons,
} as const;

export const CONTACT_EMAILS = {
  support: publicEmail('PUBLIC_GURUDEVI_SUPPORT_EMAIL', 'support@gurudevi.lk'),
  gratitude: publicEmail('PUBLIC_GURUDEVI_GRATITUDE_EMAIL', 'gratitude@gurudevi.lk'),
  institutional: publicEmail('PUBLIC_GURUDEVI_INSTITUTIONAL_EMAIL', 'institutional@gurudevi.lk'),
} as const;

function publicEmail(name: string, fallback: string): string {
  const value = (import.meta.env[name] as string | undefined)?.trim() || fallback;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error(`${name} must be an email address`);
  return value;
}

for (const [name, value] of Object.entries(WEB_LINKS)) validateUrl(`WEB_LINKS.${name}`, value);
for (const [name, value] of Object.entries(SOCIAL_LINKS)) validateUrl(`SOCIAL_LINKS.${name}`, value);

export const MARKETING_STATS = {
  teachers: 0,
  students: 0,
  schools: 0,
  lessonsShared: 0,
  status: 'coming-soon' as const,
};

export const ORGANIZATION = {
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
};

export function absoluteUrl(pathname: string) {
  return new URL(pathname, SITE_URL).toString();
}

export function canonicalUrl(pathname: string) {
  const normalizedPath = pathname === '/' ? '/' : `/${pathname.replace(/^\/+|\/+$/g, '')}`;
  return absoluteUrl(normalizedPath);
}

export function defaultOgImage(pathname = '/') {
  return absoluteUrl('/og-image.png');
}
