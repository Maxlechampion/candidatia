import { useTranslations } from "next-intl";
import Link from "next/link";
import { LandingFooter } from "@/components/Layout/LandingFooter";

export default function HomePage() {
  const t = useTranslations("landing");

  return (
    <main className="min-h-screen bg-white">
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

      <section className="container-main py-20 md:py-28 text-center">
        <span className="inline-block px-3 py-1 text-xs font-bold text-primary-700 bg-primary-50 rounded-full mb-6">
          NOUVEAU - Generateur de packs IA
        </span>
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
            href="#how"
            className="px-6 py-3 text-base font-semibold text-primary-600 bg-white border-2 border-primary-100 rounded-lg hover:border-primary-300 transition"
          >
            {t("cta_secondary")}
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">OK</span> Sans carte bancaire
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">OK</span> 1 pack offert
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">OK</span> Resultats en 30 secondes
          </div>
        </div>
      </section>

      <section id="features" className="container-main py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-dark text-center mb-4">
          {t("features_title")}
        </h2>
        <p className="text-center text-slate-600 max-w-2xl mx-auto mb-12">
          Tout ce dont vous avez besoin pour reussir votre candidature,
          dans un seul pack genere automatiquement.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: t("feature_cv_title"), desc: t("feature_cv_desc"), icon: "[CV]" },
            { title: t("feature_lettre_title"), desc: t("feature_lettre_desc"), icon: "[Lettre]" },
            { title: t("feature_guide_title"), desc: t("feature_guide_desc"), icon: "[Guide]" },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-lg transition"
            >
              <div className="text-lg font-bold text-primary-600 mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-dark mb-3">{feature.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="bg-slate-50 py-16 md:py-24">
        <div className="container-main">
          <h2 className="text-3xl md:text-4xl font-bold text-dark text-center mb-12">
            Comment ca marche ?
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Uploadez votre profil", desc: "CV, LinkedIn ou texte brut. Nous acceptons tous les formats." },
              { step: "2", title: "Ajoutez l offre cible", desc: "Collez l offre d emploi ou uploadez le PDF." },
              { step: "3", title: "Recevez votre pack", desc: "CV optimise, lettre personnalisee et guide d entretien en 30 secondes." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-dark mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="container-main py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-dark text-center mb-4">
          Tarifs simples et transparents
        </h2>
        <p className="text-center text-slate-600 max-w-2xl mx-auto mb-12">
          Commencez gratuitement, payez seulement quand vous en avez besoin.
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              name: "Decouverte",
              price: "0",
              features: ["1 pack offert", "CV + Lettre + Guide", "Sans engagement"],
              cta: "Commencer gratuitement",
              highlighted: false,
            },
            {
              name: "Essentiel",
              price: "4.99",
              features: ["5 packs", "Sans filigrane", "Support email"],
              cta: "Choisir Essentiel",
              highlighted: false,
            },
            {
              name: "Pro",
              price: "14.99",
              features: ["30 packs/mois", "Simulateur entretien", "Suivi candidatures", "Support prioritaire"],
              cta: "Choisir Pro",
              highlighted: true,
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`relative p-6 rounded-xl border-2 ${
                plan.highlighted ? "border-primary-500 shadow-lg" : "border-slate-200"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold text-white bg-primary-600 rounded-full">
                  POPULAIRE
                </span>
              )}
              <h3 className="text-lg font-bold text-dark mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-dark">{plan.price}</span>
                <span className="text-slate-500 ml-1">EUR</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-emerald-500">-</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`block text-center py-2.5 rounded-lg font-semibold text-sm transition ${
                  plan.highlighted
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-dark to-primary-900 py-16 md:py-24">
        <div className="container-main text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pret a decrocher votre prochain emploi ?
          </h2>
          <p className="text-primary-100 max-w-2xl mx-auto mb-8">
            Rejoignez des milliers de candidats qui ont optimise leur candidature avec CandidatIA.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 text-base font-semibold text-primary-700 bg-white rounded-lg hover:bg-primary-50 transition"
          >
            Generer mon premier pack gratuit
          </Link>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
