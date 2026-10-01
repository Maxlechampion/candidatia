# 📄 Mise à jour de `docs/context.md`

Voici le contenu complet mis à jour du fichier `docs/context.md` reflétant l'état du projet après la Phase 6.

---

## 📋 Instructions

1. **Ouvre** `docs/context.md`
2. **`CTRL+A`** puis **`Delete`** (tout effacer)
3. **Colle** le contenu ci-dessous
4. **Sauvegarde**

---

## 📄 `docs/context.md` (version 0.6.0)

```markdown
# context.md — Contexte global du projet CandidatIA

> **Version** : 0.6.0
> **Dernière mise à jour** : 2026-10-01
> **Statut** : Backend 100% fonctionnel — Frontend en construction
> **Tag Git** : `phase-6-complete`

---

## 1. VISION DU PRODUIT

### 1.1 Pitch
CandidatIA est un SaaS mondial, multilingue, qui génère en quelques secondes
un **pack de candidature complet** (CV optimisé méthode STAR, lettre de motivation
culturellement adaptée, guide d'entretien personnalisé, suivi de relance programmable)
dans la langue choisie par l'utilisateur, avec un score de matching ATS.

### 1.2 Proposition de valeur
- **Pour le candidat** : gain de temps massif, qualité "chasseur de têtes",
  adaptation culturelle automatique au marché cible.
- **Pour la plateforme** : modèle freemium scalable, encaissement au Bénin,
  coût opérationnel proche de zéro au lancement.

### 1.3 Cibles
- **B2C primaire** : chercheurs d'emploi francophones (France, Afrique de l'Ouest, diaspora)
- **B2C secondaire** : marché anglophone mondial, MENA, APAC
- **B2B** : écoles de commerce, cabinets de recrutement, ONG, institutions

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
| **7** | Frontend Next.js 14 (i18n FR/EN) | — | 🚧 En cours (7a) |
| **8** | Déploiement production (Vercel + Render) | — | ⏳ À venir |
| **9** | Marketing + itération | — | ⏳ À venir |
| **TOTAL** | | **176** | |

### 2.2 Capacités opérationnelles du backend

| Fonctionnalité | Statut |
|---|---|
| Ingestion PDF, DOCX, ODT, RTF, HTML, MD, images (OCR), texte | ✅ |
| Détection langue (15 langues) + mapping culturel | ✅ |
| Moteur IA fallback (Groq → Gemini → Mistral → Cohere) | ✅ |
| Circuit breaker + cache Redis | ✅ |
| Génération CV méthode STAR | ✅ |
| Génération Lettre AIDA | ✅ |
| Génération Guide d'entretien | ✅ |
| Génération Brouillon relance | ✅ |
| Assemblage ZIP | ✅ |
| Auth JWT (register, login, /me) | ✅ |
| Gestion crédits + quotas par plan | ✅ |
| Protection de `/api/generate` | ✅ |
| Historique + statistiques par utilisateur | ✅ |
| Paiement Mobile Money (FedaPay) | ✅ |
| Paiement carte (Flutterwave) | ✅ |
| Paiement crypto (Raenest) | ✅ |
| Webhooks sécurisés HMAC | ✅ |
| Crédit automatique après paiement | ✅ |
| Relances programmables | ✅ |
| Scheduler quotidien | ✅ |
| Rappels email automatiques (Brevo) | ✅ |
| 3 plans tarifaires | ✅ |

---

## 3. ARCHITECTURE TECHNIQUE

### 3.1 Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- next-intl (i18n)
- Zustand (state)
- Axios (HTTP)
- Déploiement : Vercel

**Backend**
- FastAPI
- Pydantic v2
- Python 3.11+
- Déploiement : Render.com

**IA (fallback en cascade)**
- Groq (Llama 3.3 70B) — primary
- Google Gemini (1.5 Flash)
- Mistral (Small)
- Cohere (Command R)

**Données**
- Supabase Postgres (DB)
- Supabase Auth (optionnel)
- Upstash Redis (cache)
- Brevo (emails)

**Paiement (encaissement au Bénin)**
- FedaPay (Mobile Money — MTN MoMo, Moov, Celtiis)
- Flutterwave (cartes internationales)
- Raenest (USDT/USDC → USD → Bénin)

### 3.2 Structure du projet

```
candidatia/
├── backend/
│   ├── app/
│   │   ├── core/          # config, errors, security, logging, telemetry
│   │   ├── models/        # schémas Pydantic
│   │   ├── routers/       # endpoints FastAPI
│   │   └── services/
│   │       ├── ai/        # orchestrateur multi-provider + prompts
│   │       ├── auth/      # bcrypt, JWT, users, quotas
│   │       ├── email/     # Brevo + templates
│   │       ├── generation/# Word CV/Lettre/Guide/Relance + PackBuilder
│   │       ├── ingestion/ # extracteurs multi-format
│   │       ├── language/  # détection + locale_map
│   │       ├── payment/   # FedaPay + Flutterwave + Raenest + orchestrateur
│   │       └── relance/   # service + scheduler
│   ├── scripts/           # schema.sql, init_db.py, test_*.py
│   └── tests/             # 176 tests (unitaire + intégration)
├── frontend/              # Next.js 14 (en construction)
├── docs/                  # context.md, architecture.md, API docs
├── ops/                   # runbook, monitoring
└── scripts/setup/         # tous les setup-phase*.js
```

### 3.3 Endpoints disponibles

**Santé**
- `GET /health`
- `GET /`

**Ingestion**
- `POST /api/ingest`

**Génération**
- `POST /api/generate`
- `GET /api/generate/info`

**Auth**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/me/quota`

**Générations (historique)**
- `GET /api/generations`
- `GET /api/generations/stats`

**Quota**
- `GET /api/quota/plans`
- `GET /api/quota/me`

**Paiement**
- `GET /api/billing/plans`
- `GET /api/billing/providers`
- `POST /api/billing/checkout`
- `GET /api/billing/payments`

**Webhooks**
- `POST /webhooks/fedapay`
- `POST /webhooks/flutterwave`
- `POST /webhooks/raenest`

**Relance**
- `POST /api/relance/schedule`
- `GET /api/relance/pending`
- `GET /api/relance`
- `POST /api/relance/{id}/cancel`
- `POST /api/relance/{id}/mark-sent`

**Scheduler**
- `POST /api/scheduler/run`
- `GET /api/scheduler/health`

---

## 4. BASE DE DONNÉES (Supabase)

### Tables créées

| Table | Rôle |
|---|---|
| `profiles` | Utilisateurs (id, email, password_hash, credits, plan, locale) |
| `generations` | Historique des packs (user_id, score_matching, paths, langues) |
| `payments` | Paiements (provider, transaction_id, amount, status, credits) |
| `relances` | Relances programmables (user_id, scheduled_date, email_draft, status) |
| `ai_logs` | Monitoring des appels IA (provider, tokens, latency, success) |

### Schéma SQL
Disponible dans `backend/scripts/schema.sql`.

Les tables sont créées via le **SQL Editor de Supabase** (pas via `psycopg2` qui a des problèmes d'encodage sur Windows).

---

## 5. MODÈLE ÉCONOMIQUE

### 5.1 Plans tarifaires

| Plan | Code | Prix | Crédits | Public |
|---|---|---|---|---|
| Découverte | `free` | 0 € | 1/mois | Acquisition |
| Essentiel | `essentiel` | 4,99 € | 5 | Candidat occasionnel |
| Pro | `pro` | 14,99 €/mois | 30/mois | Chercheur actif |
| Carrière | `carriere` | 39,99 €/mois | Illimité | Cadre en transition |

### 5.2 Canaux de paiement

| Canal | Provider | Frais | Usage |
|---|---|---|---|
| Mobile Money Bénin | FedaPay | ~1.8-2.5% | MTN MoMo, Moov, Celtiis |
| Cartes internationales | Flutterwave | ~3.8% | Visa, Mastercard |
| Crypto | Raenest | 2 USD/ACH | USDT, USDC |

**Encaissement** : tout au Bénin (FedaPay → MoMo Bénin, Flutterwave → banque Bénin, Raenest → USDT → USD → Bénin).

---

## 6. CONFIGURATION

### 6.1 Variables d'environnement (backend)

Fichier : `backend/.env`

```bash
# App
APP_NAME=CandidatIA
APP_ENV=development
SECRET_KEY=<32+ caractères>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=60

# IA
GROQ_API_KEY=<clé>
GEMINI_API_KEY=<clé>
MISTRAL_API_KEY=<clé>
COHERE_API_KEY=<clé>
AI_PROVIDER_ORDER=groq,gemini,mistral,cohere

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=<clé>
SUPABASE_SERVICE_KEY=<clé>
DATABASE_URL=postgresql://postgres.xxx:xxx@...

# Redis
REDIS_URL=redis://localhost:6379

# Brevo (emails)
BREVO_API_KEY=<clé>
BREVO_SENDER_EMAIL=<email vérifié>
BREVO_SENDER_NAME=CandidatIA

# FedaPay
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

# Stockage
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=./fichiers_generes
MAX_FILE_SIZE_MB=10

# Observabilité
SENTRY_DSN=<optionnel>
LOG_LEVEL=INFO
```

### 6.2 Variables d'environnement (frontend)

Fichier : `frontend/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé>
```

---

## 7. LANCEMENT EN LOCAL

### 7.1 Backend

```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

**Backend** : http://localhost:8000
**Docs** : http://localhost:8000/docs
**Health** : http://localhost:8000/health

### 7.2 Tests

```powershell
# Tests rapides
pytest -m "not integration"

# Tests d'intégration
pytest -m integration -v

# Tous les tests
pytest
```

### 7.3 Frontend (en cours)

```powershell
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

**Frontend** : http://localhost:3000

---

## 8. DÉCISIONS D'ARCHITECTURE

### 8.1 Pourquoi un orchestrateur IA multi-provider ?
- **Résilience** : les modèles gratuits changent souvent (Groq a retiré `llama-3.3-70b-versatile`).
- **Performance** : le fallback évite les échecs visibles par l'utilisateur.
- **Économie** : cache Redis + circuit breaker réduisent les coûts.

### 8.2 Pourquoi FedaPay en priorité ?
- **Encaissement au Bénin** : nécessaire pour l'objectif business.
- **Couverture Mobile Money** : MTN MoMo, Moov, Celtiis.
- **Frais bas** : ~1.8-2.5% vs 3.8% pour Flutterwave.

### 8.3 Pourquoi le scheduler en mode "pull" ?
- **Compatible avec tous les hébergeurs** (Render, Fly, Vercel).
- **Pas de dépendance à un cron système**.
- **Protégé par token** (`CRON_SECRET_TOKEN`).

### 8.4 Pourquoi le texte sans accents dans le code ?
- **Problèmes d'encodage Windows** : `psycopg2` a échoué sur `0xf4`.
- **Portabilité** : évite les bugs d'encodage entre OS.
- **Robustesse** : les fichiers restent en UTF-8 pur.

---

## 9. DETTES TECHNIQUES CONNUES

| Dette | Impact | Priorité |
|---|---|---|
| `psycopg2` non fonctionnel sur Windows | `init_db.py` utilise le client Supabase | Basse (contourné) |
| Cache Redis local non testé en prod | Aucun impact en dev | Basse |
| `test_fedapay_raw.py` retiré | Aucun | Résolu |
| Warnings Pydantic V2 (`json_encoders`) | Aucun | Basse |
| Non-compatibilité Stripe Bénin | Utilisation de FedaPay | Résolu |

---

## 10. PROCHAINES ÉTAPES

### Phase 7 — Frontend (en cours)
- [x] **7a** — Structure Next.js 14 + Tailwind + i18n
- [ ] **7b** — Landing page complète + pages Auth (login, register)
- [ ] **7c** — Dashboard + Générateur + Upload
- [ ] **7d** — Historique + Relances + Paiement
- [ ] **7e** — Polish + Tests + Déploiement Vercel

### Phase 8 — Déploiement
- [ ] Backend sur Render.com (Web Service + Cron Job)
- [ ] Frontend sur Vercel
- [ ] Supabase en production
- [ ] Webhooks FedaPay/Flutterwave/Raenest configurés
- [ ] Brevo en production
- [ ] Domaine personnalisé

### Phase 9 — Marketing
- [ ] Landing SEO multilingue
- [ ] Blog articles
- [ ] Programme d'affiliation
- [ ] Analytics (Plausible ou Umami)

---

## 11. RISQUES ET MITIGATIONS

| Risque | Impact | Mitigation |
|---|---|---|
| Provider IA tombe | Élevé | Fallback cascade + circuit breaker |
| Quota IA épuisé | Élevé | 4 providers + cache Redis |
| FedaPay/Flutterwave refuse KYC | Élevé | Backup Paystack + CinetPay |
| Abus free tier | Moyen | Email vérifié + fingerprint + rate limit |
| Coût IA explose | Moyen | Cache + monitoring `ai_logs` |
| Attaque DDoS | Faible | Vercel + Render + Cloudflare |

---

## 12. RESSOURCES

- **Repo** : local (`C:\Users\togninoubi.aho\Desktop\projets\CandidatIA\candidatia`)
- **Tag Git** : `phase-6-complete`
- **Supabase** : https://uftodzmoktbxbgfdotgn.supabase.co
- **FedaPay** : https://dashboard.fedapay.com
- **Render** : https://dashboard.render.com (à venir)
- **Vercel** : https://vercel.com/dashboard (à venir)

---

## 13. HISTORIQUE DES VERSIONS

| Version | Date | Événement |
|---|---|---|
| 0.1.0 | 2026-09-29 | Phase 0-1 : Fondations + Moteur IA |
| 0.2.0 | 2026-09-29 | Phase 2 : Ingestion |
| 0.3.0 | 2026-09-29 | Phase 3 : Génération Word/PDF |
| 0.4.0 | 2026-09-30 | Phase 4 : Auth + DB + quotas |
| 0.5.0 | 2026-09-30 | Phase 5 : Paiement multi-canal |
| **0.6.0** | **2026-10-01** | **Phase 6 : Relance + scheduler + emails** |
| 0.7.0 | (à venir) | Phase 7 : Frontend |

---

**Fin du contexte.** Ce document doit être mis à jour à chaque évolution majeure du projet.
```

---

## 🎯 Après avoir collé

### 1. Sauvegarder

**`CTRL+S`** dans Notepad (ou VS Code).

### 2. Vérifier le fichier

```powershell
type docs\context.md | Select-Object -First 20
```

### 3. Commit Git

```powershell
git add docs/context.md
git commit -m "docs: Mise a jour context.md (version 0.6.0 - Phase 6 complete)"

git log --oneline -5
```

**Colle-moi le résultat.**

---

## 📋 Envoie-moi

1. **Résultat de `git log --oneline -5`** (après commit context.md)
2. **"Prêt pour Phase 7a"** (ou lance directement `node setup-phase7a.js` si tu es prêt)

---

## 💡 Notes importantes

**Le fichier `context.md` mis à jour contient** :
- État complet du projet (Phases 0-6 terminées)
- Architecture technique à jour
- Liste de tous les endpoints disponibles
- Modèle économique et tarifs
- Configuration complète (variables d'env)
- Décisions d'architecture expliquées
- Dettes techniques connues
- Roadmap Phase 7-9
- Historique des versions

**C'est ton document de référence** pour reprendre le projet après une pause, ou pour onboarder un nouveau développeur.

**Envoie-moi le résultat du commit.**