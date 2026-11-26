import { LanguagePicker } from '@repo/ui/components/web';
import type { SupportedLocale } from '@repo/core/logic/i18n/web-locales';

interface LanguageSwitchProps {
  value: SupportedLocale;
  hrefs: Record<SupportedLocale, string>;
  label: string;
  className?: string;
}

/** The kit's picker on a static site: choosing a language opens that language's own page. */
export default function LanguageSwitch({ value, hrefs, label, className }: LanguageSwitchProps) {
  return (
    <LanguagePicker
      value={value}
      onChange={(next) => window.location.assign(hrefs[next])}
      variant="auto"
      threshold={420}
      label={label}
      className={className}
    />
  );
}
