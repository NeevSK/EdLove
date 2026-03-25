import { AuthorityTier } from '../types/Authority';

/**
 * Get authority display name
 */
export function getAuthorityLabel(
  authority: AuthorityTier,
  language: 'en' | 'si' | 'ta' = 'en'
): string {
  const labels: Record<AuthorityTier, Record<'en' | 'si' | 'ta', string>> = {
    student: {
      si: 'ශිෂ්‍ය',
      ta: 'மாணவர்',
      en: 'Student'
    },
    teacher: {
      si: 'ගුරු',
      ta: 'ஆசிரியர்',
      en: 'Teacher'
    },
    principal: {
      si: 'විදුහල්පති',
      ta: 'அதிபர்',
      en: 'Principal'
    },
    founder: {
      si: 'නිර්මාතෘ',
      ta: 'நிறுவனர்',
      en: 'Founder'
    },
    admin: {
      si: 'පරිපාලක',
      ta: 'நிர்வாகි',
      en: 'Admin'
    },
    developer: {
      si: 'සංවර්ධක',
      ta: 'உருවාக்குබவர்',
      en: 'Developer'
    }
  };

  return labels[authority]?.[language] || authority;
}
