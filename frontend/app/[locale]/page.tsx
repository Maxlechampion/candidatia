import { useTranslations } from "next-intl";
import Link from "next/link";

export default function HomePage() {
  const t = useTranslations("landing");

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-main flex items-center justify-between py-4">
          <div className="text-xl font-bold text-dark">
            Candidat<span className="text-primary-500">IA</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 transition"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition"
            >
              Inscription
            </Link>
          </nav>
        </div>
      </header>

      <section className="container-main py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-dark mb-6 leading-tight">
          {t("hero_title")}
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          {t("hero_subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 text-base font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition shadow-lg shadow-primary-500/30"
          >
            {t("cta_primary")}
          </Link>
          <Link
            href="/demo"
            className="px-6 py-3 text-base font-semibold text-primary-600 bg-white border-2 border-primary-100 rounded-lg hover:border-primary-300 transition"
          >
            {t("cta_secondary")}
          </Link>
        </div>
      </section>

      <section className="container-main py-16">
        <h2 className="text-3xl font-bold text-dark text-center mb-12">
          {t("features_title")}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: t("feature_cv_title"), desc: t("feature_cv_desc") },
            { title: t("feature_lettre_title"), desc: t("feature_lettre_desc") },
            { title: t("feature_guide_title"), desc: t("feature_guide_desc") },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-bold text-dark mb-3">{feature.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        <p>&copy; 2026 CandidatIA. Tous droits reserves.</p>
      </footer>
    </main>
  );
}
