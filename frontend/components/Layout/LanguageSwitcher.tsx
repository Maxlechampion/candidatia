"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

const LANGUAGES = [
  { code: "fr", label: "FR", flag: "FR" },
  { code: "en", label: "EN", flag: "EN" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    // Retirer le prefixe de langue actuel du pathname
    let path = pathname;

    // Retirer /en ou /fr au debut si present
    if (path.startsWith(`/${locale}`)) {
      path = path.substring(`/${locale}`.length);
    }

    // Construire le nouveau path
    const newPath = newLocale === "fr" ? path || "/" : `/${newLocale}${path}`;

    router.push(newPath);
  }

  return (
    <div className="flex items-center gap-1">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => switchLocale(lang.code)}
          className={`px-2 py-1 text-xs font-medium rounded transition ${
            locale === lang.code
              ? "bg-primary-100 text-primary-700"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          }`}
          aria-label={`Changer en ${lang.label}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}