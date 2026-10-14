Voici le fichier `context.md` mis à jour en **version 0.9.0**, intégrant :

- La nouvelle grille tarifaire validée (5 plans B2C + B2B reporté)
- L'historique des packs générés **maintenant fonctionnel**
- Le **guide d'entretien enrichi** (8 phases, validator, prompt v2)
- Les corrections de bugs (billing, historique, i18n)
- L'état du frontend et du backend à jour

---

```markdown
# context.md — Contexte global du projet CandidatIA

> **Version** : 0.9.0
> **Dernière mise à jour** : 2026-10-14
> **Statut** : Historique + Guide enrichi opérationnels — Nouvelle grille tarifaire en cours d'application
> **Tags Git** : `phase-7e-complete`, `fix-history`, `pricing-v2-pending`

---

## 1. VISION DU PRODUIT

### 1.1 Pitch
CandidatIA est un SaaS mondial, multilingue, qui génère en quelques secondes
un **pack de candidature complet** (CV optimisé méthode STAR, lettre de motivation
culturellement adaptée, guide d'entretien professionnel en 8 phases, suivi de relance
programmable) dans la langue choisie par l'utilisateur, avec un score de matching ATS.

### 1.2 Proposition de valeur
- **Pour le candidat** : gain de temps massif, qualité "chasseur de têtes",
  adaptation culturelle automatique au marché cible, guide d'entretien de niveau coaching premium.
- **Pour la plateforme** : modèle freemium scalable, encaissement au Bénin,
  coût opérationnel proche de zéro au lancement.

### 1.3 Cibles
- **B2C primaire** : chercheurs d'emploi francophones (France, Afrique de l'Ouest, diaspora)
- **B2C secondaire** : marché anglophone mondial, MENA, APAC
- **B2B** : écoles de commerce, cabinets de recrutement, ONG, institutions (Phase 10)

---

## 2. ÉTAT D'AVANCEMENT

### 2.1 Roadmap globale

| Phase | Contenu | Tests | Statut |
|---|---|---|---|
| **0** | Fondations (structure, config, docs, CI/CD) | — | ✅ Terminée |
| **1** | Moteur IA multi-provider + orchestrateur + cache | 13 | ✅ Terminée |
| **2** | Ingestion multi-format + détection langue/contenu | 45 | ✅ Terminée |
| **3** | Génération Word/PDF + pipeline complet | 21 | ✅ Terminée |
| **4** | Auth + DB + quotas + protection JWT | 41 | ✅ Terminée |
| **5** | Paiement multi-canal (FedaPay + Flutterwave + Raenest) | 32 | ✅ Terminée |
| **6** | Système de relance + scheduler + emails Brevo | 24 | ✅ Terminée |
| **7a-7f** | Frontend Next.js complet + i18n | — | ✅ Terminée |
| **7e-legal** | Pages légales conformes au Code du numérique du Bénin | — | ✅ Terminée |
| **FIX-historique** | Sauvegarde en DB + endpoint + affichage enrichi | — | ✅ Terminée (2026-10-14) |
| **FIX-billing** | Chemins API `/api/billing/*` corrigés | — | ✅ Terminée (2026-10-14) |
| **GUIDE-v2** | Guide d'entretien 8 phases + validator + prompt enrichi | — | ✅ Terminée (2026-10-14) |
| **PRICING-v2** | Nouvelle grille tarifaire 5 plans B2C | — | ⏳ À appliquer |
| **8** | Déploiement production (Vercel + Render) | — | ⏳ À venir |
| **9** | Conformité APDP (déclaration + registre) | — | ⏳ À venir |
| **10** | Marketing + B2B + itération | — | ⏳ À venir |
| **TOTAL** | | **176+** | |

### 2.2 Capacités opérationnelles

| Fonctionnalité | Statut |
|---|---|
| Ingestion PDF (texte + OCR), DOCX, ODT, RTF, HTML, MD, images | ✅ |
| Détection langue (15 langues) + mapping culturel | ✅ |
| Mapping conventions d'entretien par culture (nouveau) | ✅ |
| Moteur IA fallback (Groq → Gemini → Mistral → Cohere) | ✅ |
| Circuit breaker + cache Redis (recommandation : debug Redis) | ⚠️ |
| Génération CV méthode STAR (multilingue) | ✅ |
| Génération Lettre AIDA (multilingue) | ✅ |
| **Génération Guide d'entretien 8 phases (nouveau)** | ✅ |
| **Validator + enrichissement automatique du guide (nouveau)** | ✅ |
| Génération Brouillon relance (multilingue) | ✅ |
| Assemblage ZIP | ✅ |
| Auth JWT (register, login, /me) | ✅ |
| Gestion crédits + quotas par plan | ✅ |
| Protection de `/api/generate` | ✅ |
| **Historique des packs (sauvegarde + affichage) (nouveau)** | ✅ |
| Statistiques utilisateur (total, score moyen) | ✅ |
| Paiement Mobile Money (FedaPay sandbox) | ✅ |
| Paiement carte (Flutterwave) | ✅ |
| Paiement crypto (Raenest) | ✅ |
| Webhooks sécurisés HMAC | ✅ |
| Crédit automatique après paiement | ✅ |
| Relances programmables (avec brouillon IA) | ✅ |
| Scheduler quotidien | ✅ |
| Rappels email automatiques (Brevo) | ✅ |
| Landing page complète (hero, features, how, pricing, CTA) | ✅ |
| Pages légales (CGU, Privacy, Cookies) | ✅ |
| Bandeau de consentement cookies | ✅ |
| Page 404 personnalisée | ✅ |
| Configuration Vercel | ✅ |

---

## 3. ARCHITECTURE TECHNIQUE

### 3.1 Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript strict
- Tailwind CSS
- next-intl (i18n FR/EN)
- Zustand (state management)
- Axios (HTTP client)
- Déploiement : Vercel

**Backend**
- FastAPI
- Pydantic v2
- Python 3.11+
- Déploiement : Render.com

**IA (fallback en cascade)**
- Groq (Llama 3.3 70B ou gpt-oss-120b) — primary
- Google Gemini (1.5 Flash)
- Mistral (Small)
- Cohere (Command R) — actuellement clé invalide, à régénérer

**Ingestion**
- pypdf + pdfplumber (PDF textuels)
- Tesseract OCR + PyMuPDF (PDF scannés)
- python-docx (Word)
- odfpy (ODT), striprtf (RTF), BeautifulSoup (HTML)

**Données**
- Supabase Postgres (DB)
- Upstash Redis (cache — actuellement indisponible)
- Brevo (emails)

**Paiement (encaissement au Bénin)**
- FedaPay (Mobile Money — MTN MoMo, Moov, Celtiis)
- Flutterwave (cartes internationales)
- Raenest (USDT/USDC → USD → Bénin)

### 3.2 Structure du projet

```
candidatia/
├── backend/              # FastAPI (176+ tests)
│   ├── app/
│   │   ├── core/         # config, security, logging, telemetry, database, supabase_client
│   │   ├── models/       # schémas Pydantic (user, generation, payment, relance, ai_log)
│   │   ├── routers/      # endpoints FastAPI
│   │   │   ├── auth.py
│   │   │   ├── billing.py
│   │   │   ├── generation.py         # → inclut _save_generation() (fix-historique)
│   │   │   ├── generations.py        # → historique enrichi
│   │   │   ├── health.py
│   │   │   ├── ingestion.py
│   │   │   ├── quota.py
│   │   │   ├── relance.py
│   │   │   ├── scheduler.py
│   │   │   └── webhooks.py
│   │   └── services/
│   │       ├── ai/       # orchestrateur multi-provider + prompts
│   │       │   ├── prompts/
│   │       │   │   ├── cv_prompt.py
│   │       │   │   ├── guide_prompt.py      # → enrichi 8 phases (GUIDE-v2)
│   │       │   │   ├── lettre_prompt.py
│   │       │   │   └── relance_prompt.py
│   │       │   ├── schemas.py               # → inclut GuideData, GuidePhase, etc.
│   │       │   ├── guide_validator.py       # → nouveau (validation + fallbacks)
│   │       │   ├── orchestrator.py
│   │       │   ├── cache.py
│   │       │   ├── json_repair.py
│   │       │   ├── base.py
│   │       │   ├── groq.py
│   │       │   ├── gemini.py
│   │       │   ├── mistral.py
│   │       │   └── cohere.py
│   │       ├── auth/     # bcrypt, JWT, users, quotas
│   │       ├── email/    # Brevo + templates
│   │       ├── generation/  # Word CV/Lettre/Guide/Relance + PackBuilder
│   │       │   ├── word_cv.py
│   │       │   ├── word_lettre.py
│   │       │   ├── word_guide.py            # → générateur dense 8 phases (GUIDE-v2)
│   │       │   ├── word_relance.py
│   │       │   ├── pack_builder.py
│   │       │   ├── pdf_export.py
│   │       │   ├── style.py
│   │       │   └── base.py
│   │       ├── ingestion/ # extracteurs multi-format
│   │       ├── language/ # détection + locale_map (enrichi conventions entretien)
│   │       ├── payment/  # FedaPay + Flutterwave + Raenest + orchestrateur + plans
│   │       │   ├── plans.py                 # → à réécrire pour PRICING-v2
│   │       │   ├── orchestrator.py
│   │       │   ├── fedapay.py
│   │       │   ├── flutterwave.py
│   │       │   ├── raenest.py
│   │       │   ├── base.py
│   │       │   └── schemas.py
│   │       └── relance/  # service + scheduler
│   ├── scripts/          # schema.sql, init_db.py, test_*.py
│   └── tests/            # 176+ tests
├── frontend/             # Next.js 14
│   ├── app/[locale]/
│   │   ├── page.tsx               # Landing enrichie
│   │   ├── login/, register/      # Auth
│   │   ├── dashboard/             # Espace utilisateur
│   │   │   ├── page.tsx           # Accueil (stats)
│   │   │   ├── generate/          # Générateur
│   │   │   ├── history/           # Historique enrichi (fix-historique)
│   │   │   ├── relances/          # Relances
│   │   │   └── billing/           # Paiement (5 plans à venir : PRICING-v2)
│   │   ├── billing/return/        # Retour de paiement
│   │   └── legal/
│   │       ├── terms/             # CGU
│   │       ├── privacy/           # Confidentialité
│   │       └── cookies/           # Cookies
│   ├── components/
│   │   ├── ui/                    # Button, Input, Card, Alert, Toast, Spinner
│   │   ├── Layout/                # Header, Sidebar, Footer, LanguageSwitcher
│   │   ├── relance/               # RelanceCard, ScheduleModal
│   │   ├── billing/               # PlanCard, PaymentMethods
│   │   └── Legal/                 # CookieBanner
│   ├── lib/                       # api.ts, store.ts, supabase.ts, utils.ts
│   ├── messages/                  # fr.json, en.json
│   └── vercel.json
├── docs/                 # context.md, architecture.md
├── ops/                  # runbook, monitoring
└── scripts/setup/        # setup-phase*.js (historique du projet)
```

### 3.3 Endpoints backend

**Santé** : `/health`, `/`
**Ingestion** : `POST /api/ingest`
**Génération** : `POST /api/generate`, `GET /api/generate/info`
**Auth** : `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/me/quota`
**Historique** : `/api/generations`, `/api/generations/stats`
**Quota** : `/api/quota/plans`, `/api/quota/me`
**Paiement** : `/api/billing/plans`, `/api/billing/providers`, `/api/billing/checkout`, `/api/billing/payments`, `/api/billing/verify`
**Webhooks** : `/webhooks/fedapay`, `/webhooks/flutterwave`, `/webhooks/raenest`
**Relance** : `/api/relance/schedule`, `/api/relance/pending`, `/api/relance`, `/api/relance/{id}/cancel`, `/api/relance/{id}/mark-sent`
**Scheduler** : `/api/scheduler/run`, `/api/scheduler/health`

---

## 4. BASE DE DONNÉES (Supabase)

| Table | Rôle | Statut |
|---|---|---|
| `profiles` | Utilisateurs (id, email, password_hash, credits, plan, locale) | ✅ |
| `generations` | Historique des packs (user_id, score, paths, langues) | ✅ (fix appliqué) |
| `payments` | Paiements (provider, transaction_id, amount, status, credits) | ✅ |
| `relances` | Relances programmables (user_id, scheduled_date, email_draft, status) | ✅ |
| `ai_logs` | Monitoring des appels IA (provider, tokens, latency, success) | ✅ |

**RLS** : activé sur toutes les tables, bypassé par `service_role` (clé utilisée par le backend). Aucune policy n'est requise pour le bon fonctionnement tant qu'on passe par l'admin client.

Schéma SQL : `backend/scripts/schema.sql` (créé via Supabase SQL Editor).

---

## 5. MODÈLE ÉCONOMIQUE (v2 — à appliquer)

### 5.1 Grille tarifaire validée (2026-10-14)

| Plan | Code | Prix EUR | Prix XOF | Prix USD | Crédits | Cible |
|---|---|---|---|---|---|---|
| 🆓 Découverte | `free` | 0 € | 0 FCFA | 0 $ | 1 (unique) | Test |
| 🎯 Express | `express` | 3 € | 2 000 FCFA | 3,50 $ | 1 | Impulsion |
| ⭐ Candidature Active | `active` | 7,50 € | 5 000 FCFA | 8,50 $ | 5 | Best-seller |
| 🚀 Recherche Intensive | `intensive` | 18 € | 12 000 FCFA | 20 $ | 15 | Engagement |
| 💎 Pro Illimité | `pro_unlimited` | 22 €/mois | 15 000 FCFA/mois | 25 $/mois | Illimité | Récurrent |
| 🏢 B2B | `b2b` | Sur devis | Sur devis | Sur devis | Volume | Écoles / ONG (Phase 10) |

### 5.2 Différenciation fonctionnelle (Phase B — à venir)

| Plan | Relance auto | Guide enrichi | Coaching IA | Support |
|---|---|---|---|---|
| 🆓 Découverte | ❌ | ❌ | ❌ | standard |
| 🎯 Express | ❌ | ❌ | ❌ | standard |
| ⭐ Candidature Active | ✅ | ✅ | ❌ | standard |
| 🚀 Recherche Intensive | ✅ | ✅ | ✅ | prioritaire |
| 💎 Pro Illimité | ✅ | ✅ | ✅ | VIP |

**Note** : en Phase A (immédiate), la différenciation fonctionnelle n'est PAS appliquée. Tous les plans payants donnent accès aux mêmes fonctionnalités. La différenciation sera appliquée en Phase B après avoir observé les usages réels.

### 5.3 Canaux de paiement
- **FedaPay** : Mobile Money (MTN MoMo, Moov, Celtiis) + carte bancaire locale
- **Flutterwave** : cartes internationales (Visa, Mastercard)
- **Raenest** : USDT/USDC (crypto stablecoins)
- **Encaissement** : tout au Bénin

### 5.4 Filigrane sur plan gratuit
Les packs générés par un utilisateur en plan `free` (Découverte) auront un discret filigrane en bas de page :
> *"Généré gratuitement avec CandidatIA — candidatia.com"* (italique gris clair)

Ce filigrane disparaît dès qu'un pack est acheté (Express ou supérieur).

---

## 6. GUIDE D'ENTRETIEN ENRICHI (GUIDE-v2)

### 6.1 Structure en 8 phases

1. **Préparation** : checklist logistique + recherche entreprise + pitch 30 s
2. **Introduction** : brise-glace, structuration de la présentation
3. **Parcours et motivation** : "Parlez-moi de vous", "Pourquoi ce poste ?", etc.
4. **Compétences techniques** : questions métier + mises en situation
5. **Comportemental (STAR)** : conflits, échecs, leadership, initiative
6. **Questions pièges et pression** : "votre faiblesse", "pourquoi nous", etc.
7. **Vos questions** : par interlocuteur (RH, manager, dirigeant)
8. **Clôture et négociation** : salaire, date de démarrage, question finale

### 6.2 Contenu par question
- **Intention cachée du recruteur** (décryptage psychologique)
- **Stratégie de réponse** (script tactique)
- **Exemple de réponse cadre** (2-4 phrases déjà rédigées, personnalisées avec le CV)

### 6.3 Architecture technique
- **Prompt enrichi** : `backend/app/services/ai/prompts/guide_prompt.py`
- **Validator + fallback** : `backend/app/services/ai/guide_validator.py`
- **Schémas Pydantic** : `GuideData`, `GuidePhase`, `GuideQuestion`, `GuidePiege`, etc. dans `schemas.py`
- **Générateur Word dense** : `backend/app/services/generation/word_guide.py` (format 10-15 pages, mise en forme experte)

### 6.4 Adaptation culturelle
Chaque `locale_map` contient maintenant :
- `interview_style` : collaboratif, direct, hiérarchique, etc.
- `interview_duration_minutes` : 45 min (US) → 90 min (JP)
- `salary_negotiation_style` : direct, indirect, jamais abordé
- `interview_technical_depth` : standard, élevé

---

## 7. CONFORMITÉ LÉGALE (BÉNIN)

### 7.1 Applicabilité
CandidatIA est soumise au **Code du numérique du Bénin (Loi n° 2017-20 du 20 avril 2018)** car :
- Elle cible des utilisateurs au Bénin (support XOF, Mobile Money, français)
- Elle traite des données de personnes situées au Bénin
- Elle encaisse via des providers béninois

### 7.2 Obligations identifiées

| Obligation | Base légale | Statut |
|---|---|---|
| Privacy Policy (droits utilisateurs) | Art. 437-448 | ✅ Publiée |
| CGU (dont exception rétractation) | Art. 347-354 | ✅ Publiée |
| Politique cookies | Art. 383 | ✅ Publiée |
| Cookie banner (consentement) | Art. 383 | ✅ Implémenté |
| Déclaration APDP | Art. 405 | ⏳ À faire |
| Registre des activités de traitement | Art. 435 | ⏳ À faire |
| Rapport annuel APDP (avant 30 juin) | Art. 387 | ⏳ À venir |
| Consentement marketing préalable | Art. 330-332 | ⏳ À implémenter |
| Contrats de sous-traitance | Art. 426 | ⏳ À faire |
| Encadrement transferts hors Bénin | Art. 391+ | ⏳ À documenter |

### 7.3 Droits utilisateurs à garantir
- **Accès** : réponse ≤ 60 jours
- **Opposition** (prospection) : réponse ≤ 30 jours
- **Rectification / Suppression** : réponse ≤ 45 jours
- **Portabilité** : format structuré

### 7.4 Coordonnées APDP
APDP – Rue 6.076, Aidjèdo, Immeuble El MARZOUK Joël, Cotonou
Tél : (+229) 21 32 57 88 — Email : contact@apdp.bj — Web : www.apdp.bj

---

## 8. CONFIGURATION

### 8.1 Variables backend (`backend/.env`)

```bash
# App
APP_NAME=CandidatIA
APP_ENV=development
SECRET_KEY=<32+ caractères>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=60

# IA (ordre de fallback)
GROQ_API_KEY=<clé>            # recommandé : clé principale valide
GEMINI_API_KEY=<clé>
MISTRAL_API_KEY=<clé>
COHERE_API_KEY=<clé>          # ⚠️ actuellement invalide → régénérer
AI_PROVIDER_ORDER=groq,gemini,mistral,cohere

# Supabase
SUPABASE_URL=https://uftodzmoktbxbgfdotgn.supabase.co
SUPABASE_ANON_KEY=<clé>
SUPABASE_SERVICE_KEY=<clé>    # utilisé par le backend (bypass RLS)
DATABASE_URL=postgresql://postgres.xxx:xxx@...

# Redis (⚠️ actuellement indisponible → debug recommandé)
REDIS_URL=redis://localhost:6379

# Brevo
BREVO_API_KEY=<clé>
BREVO_SENDER_EMAIL=<email vérifié>
BREVO_SENDER_NAME=CandidatIA

# FedaPay (sandbox actif, testé)
FEDAPAY_SECRET_KEY=sk_sandbox_xxx
FEDAPAY_PUBLIC_KEY=pk_sandbox_xxx
FEDAPAY_ENV=sandbox
FEDAPAY_WEBHOOK_SECRET=<secret>

# Flutterwave
FLUTTERWAVE_SECRET_KEY=<clé>
FLUTTERWAVE_PUBLIC_KEY=<clé>
FLUTTERWAVE_WEBHOOK_SECRET=<secret>

# Raenest
RAENEST_API_KEY=<clé>
RAENEST_WEBHOOK_SECRET=<secret>

# Scheduler
CRON_SECRET_TOKEN=<token aléatoire long>

# OCR
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe

# Stockage
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=./fichiers_generes
MAX_FILE_SIZE_MB=10
```

### 8.2 Variables frontend (`frontend/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://uftodzmoktbxbgfdotgn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé>
```

---

## 9. LANCEMENT EN LOCAL

### 9.1 Backend
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```
- Backend : http://localhost:8000
- Docs : http://localhost:8000/docs
- Health : http://localhost:8000/health

### 9.2 Frontend
```powershell
cd frontend
npm run dev
```
- Frontend : http://localhost:3000

### 9.3 Tests
```powershell
# Backend
cd backend
pytest -m "not integration"
pytest -m integration -v
```

---

## 10. DÉCISIONS D'ARCHITECTURE

1. **Orchestrateur IA multi-provider** : résilience (les modèles gratuits changent), performance, économie (cache).
2. **FedaPay en priorité** : encaissement au Bénin, couverture Mobile Money, frais bas.
3. **Scheduler en mode "pull"** : compatible avec tous les hébergeurs, protégé par token.
4. **Texte sans accents dans le code** : contournement des problèmes d'encodage Windows.
5. **Fallback OCR en cascade** : pypdf → pdfplumber → Tesseract + PyMuPDF.
6. **Titres Word traduits par dictionnaire** : `TITLES`, `CV_TITLES`, `LETTRE_TITLES`, `RELANCE_TITLES`.
7. **Sauvegarde systématique après génération** : toute génération réussie insère une ligne dans `generations` (fix du 2026-10-14).
8. **Validator + fallback guide** : si l'IA omet des sections du guide, le validator les enrichit avec des templates contextualisés.
9. **Grille tarifaire 5 plans B2C** : Découverte (gratuit) + Express + Candidature Active + Recherche Intensive + Pro Illimité.
10. **Filigrane sur plan gratuit** : incite à l'achat tout en permettant un test complet.

---

## 11. DETTES TECHNIQUES CONNUES

| Dette | Impact | Priorité |
|---|---|---|
| Redis indisponible (`redis_unavailable`) | Élevé (pas de cache IA → coût + latence) | 🔴 Haute |
| Clé Cohere invalide (401) | Moyen (fallback fonctionne sur Groq) | 🟡 Moyenne |
| Warnings Pydantic V2 (`json_encoders`, `Config`) | Aucun | Basse |
| `test_*.py` à la racine backend (obsolètes) | Aucun | Basse |
| Absence de rate limiting avancé | Moyen | Moyenne |
| Pas de tests frontend (Jest/Playwright) | Moyen | Moyenne |
| Différenciation fonctionnelle par plan non implémentée | Moyen | Moyenne (Phase B) |
| Filigrane plan gratuit non implémenté | Moyen | Haute (PRICING-v2) |
| Plan Pro Illimité non implémenté (abonnement manuel) | Moyen | Haute (PRICING-v2) |
| Aucun endpoint de téléchargement d'un ancien pack | Bas | Basse |
| Pagination/filtres sur l'historique | Bas | Basse |

---

## 12. PROCHAINES ÉTAPES

### Phase PRICING-v2 — Nouvelle grille tarifaire
- [ ] Backup automatique des fichiers concernés
- [ ] Réécriture de `plans.py` avec les 5 plans (Découverte, Express, Candidature Active, Recherche Intensive, Pro Illimité)
- [ ] Alignement de `quota_service.py` (PLAN_QUOTAS)
- [ ] Ajout du champ `is_free_tier` dans `user.py` + migration SQL
- [ ] Nouveau user a `is_free_tier = true` par défaut
- [ ] Filigrane conditionnel dans `word_cv.py` et `word_guide.py`
- [ ] Propagation du flag dans `pack_builder.py` et `generation.py`
- [ ] Mise à jour de la landing (`page.tsx`) avec les 5 plans
- [ ] Mise à jour des traductions (`fr.json`, `en.json`)
- [ ] Mise à jour de `billing/page.tsx` (5 plans au lieu de 3)
- [ ] Mise à jour de `PlanCard.tsx` (support 5 plans + badge)
- [ ] Mise à jour de `context.md`
- [ ] Script de validation `verify-pricing-v2.py`

### Phase 8 — Déploiement production
- [ ] Backend sur Render.com (Web Service + Cron Job)
- [ ] Frontend sur Vercel
- [ ] Supabase déjà en production
- [ ] Webhooks FedaPay/Flutterwave/Raenest configurés avec URL publique
- [ ] Scheduler cron configuré (appel quotidien `/api/scheduler/run`)
- [ ] Domaine personnalisé (optionnel)
- [ ] **Debug Redis** (Upstash en production)

### Phase 9 — Conformité APDP
- [ ] Effectuer la déclaration APDP (https://www.apdp.bj)
- [ ] Compléter `privacy/page.tsx` avec adresse réelle + n° déclaration
- [ ] Tenir le registre des activités de traitement
- [ ] Signer les contrats de sous-traitance (Supabase, Brevo, paiement)
- [ ] Implémenter le consentement marketing explicite
- [ ] Préparer le rapport annuel (avant 30 juin)

### Phase 10 — Marketing + B2B
- [ ] Landing SEO multilingue
- [ ] Blog articles
- [ ] Programme d'affiliation
- [ ] Analytics (Plausible ou Umami)
- [ ] Offre B2B (écoles, ONG, cabinets)
- [ ] Dashboard admin B2B
- [ ] API publique + white-label

---

## 13. RISQUES ET MITIGATIONS

| Risque | Impact | Mitigation |
|---|---|---|
| Provider IA tombe | Élevé | Fallback cascade + circuit breaker |
| Sanction APDP | Élevé | Déclaration + registre + conformité |
| FedaPay/Flutterwave refuse KYC | Élevé | Backup Paystack + CinetPay |
| Abus free tier | Élevé | 1 pack unique + email vérifié + fingerprint |
| Coût IA explose | Moyen | Cache Redis (à réparer) + monitoring `ai_logs` |
| Attaque DDoS | Faible | Vercel + Render + Cloudflare |

---

## 14. RESSOURCES

- **Repo** : local (C:\Users\togninoubi.aho\Desktop\projets\CandidatIA\candidatia)
- **Tags Git** : `phase-6-complete`, `fix-history`, `pricing-v2-pending`
- **Supabase** : https://uftodzmoktbxbgfdotgn.supabase.co
- **FedaPay** : https://dashboard.fedapay.com
- **Render** : https://dashboard.render.com (à venir)
- **Vercel** : https://vercel.com/dashboard (à venir)
- **APDP** : https://www.apdp.bj

---

## 15. HISTORIQUE DES VERSIONS

| Version | Date | Événement |
|---|---|---|
| 0.1.0 | 2026-09-29 | Phase 0-1 : Fondations + Moteur IA |
| 0.2.0 | 2026-09-29 | Phase 2 : Ingestion |
| 0.3.0 | 2026-09-29 | Phase 3 : Génération Word/PDF |
| 0.4.0 | 2026-09-30 | Phase 4 : Auth + DB + quotas |
| 0.5.0 | 2026-09-30 | Phase 5 : Paiement multi-canal |
| 0.6.0 | 2026-10-01 | Phase 6 : Relance + scheduler + emails |
| 0.7.0 | 2026-10-01 | Phase 7 : Frontend complet |
| 0.8.0 | 2026-10-01 | Phase 7e-legal + Conformité Bénin identifiée |
| **0.9.0** | **2026-10-14** | **Fix historique + Guide enrichi 8 phases + Nouvelle grille tarifaire** |

---

**Fin du contexte.** Ce document doit être mis à jour à chaque évolution majeure du projet.
```

---

## 📋 Récapitulatif des changements dans cette version 0.9.0

| Section | Changement |
|---|---|
| **En-tête** | Version 0.8.0 → **0.9.0** |
| **2.1 Roadmap** | Ajout des phases `FIX-historique`, `FIX-billing`, `GUIDE-v2`, `PRICING-v2` |
| **2.2 Capacités** | Ajout : guide 8 phases, validator, historique sauvegardé, mapping culturel entretien |
| **3.2 Structure** | Ajout de `guide_validator.py` et annotations des fichiers modifiés |
| **4. DB** | Note sur RLS et bypass par `service_role` |
| **5. Modèle économique** | **Refonte complète** : 5 plans B2C + tableau de différenciation fonctionnelle + filigrane |
| **6. Guide enrichi (NOUVEAU)** | Section entièrement nouvelle documentant GUIDE-v2 |
| **7. Conformité** | Inchangé (Phase 9 à venir) |
| **10. Décisions** | Ajout des décisions 7, 8, 9, 10 (sauvegarde, validator, pricing, filigrane) |
| **11. Dettes** | Ajout : Redis, Cohere, différenciation fonctionnelle, filigrane, Pro Illimité |
| **12. Prochaines étapes** | Ajout de la section PRICING-v2 détaillée + Phase 10 étendue B2B |
| **13. Risques** | Ajout : abus free tier |
| **15. Historique** | Version 0.9.0 documentée |

---

## 🚀 Prochaine action

Ce fichier `context.md` est prêt à être **copié dans `docs/context.md`** et commité :

```powershell
# Depuis la racine du projet
Copy-Item "chemin\vers\ce\fichier.md" "docs\context.md" -Force

git add docs/context.md
git commit -m "docs: context.md v0.9.0 (fix historique + guide enrichi + pricing v2)"
```

Une fois ce commit fait, **dis-moi "go PRICING-v2"** et je te livre le script `setup-pricing-v2.js` complet et testé pour appliquer la nouvelle grille tarifaire.