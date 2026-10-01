# 📌 Traduction en français + Mise à jour de `context.md`

---

## 一、Traduction en français

**结论：是的，你有法律义务遵守贝宁的数据保护规则，因为你的平台面向贝宁用户提供服务。“国际平台”的身份并不能免除这一义务，关键在于你是否“有意向贝宁境内的人提供商品或服务”。**

### 贝宁法律的域外效力

贝宁《数字法典》第381条明确规定了域外适用情形。如果你的平台符合以下任一条件，就必须遵守贝宁的个人数据保护规则：

1. **在贝宁境内处理数据**：无论处理行为是否实际发生在贝宁，只要你的处理活动是在贝宁境内的“负责人”或“处理者”框架下进行。
2. **针对贝宁境内用户提供服务**：你（无论是否在贝宁设立）处理了位于贝宁境内的**数据主体**的数据，且处理活动与“**向贝宁境内的人提供商品或服务**”相关，无论是否要求付款。这与你“国际平台”的定位直接相关。
3. **监控贝宁境内用户的行为**：如果你的平台追踪或分析用户在贝宁境内的行为。

### 核心判定标准：“有意 targeting”

法律适用的关键不在于“平台是否可被贝宁访问”，而在于你是否有**意图**向贝宁用户提供服务。贝宁法律参考了类似GDPR的“targeting”标准。

**以下迹象可能表明你有意向贝宁用户提供服务**：
- 你的平台支持**贝宁使用的货币**（如XOF）或当地支付方式（如MTN MoMo）。
- 你的平台使用**法语**（贝宁官方语言）作为主要界面语言，或明确提及服务贝宁用户。
- 你在营销中提及贝宁市场。

**单纯“可被访问”通常不够**：如果只有居住在欧洲的贝宁人碰巧使用了你的平台，且你的平台明显只面向欧洲市场，则不一定触发贝宁法律的适用。但鉴于你已计划集成FedaPay等贝宁支付方式，**“有意 targeting”的证据是比较充分的**。

### 你必须履行的核心义务

如果你被认定为需要遵守贝宁法律，以下义务是强制性的：

1. **遵守数据处理基本原则**：包括**合法性、目的限制、数据最小化、准确性、存储限制、完整性与保密性**。
2. **向APDP进行申报或申请授权**：根据处理活动的性质，你可能需要向贝宁个人数据保护局（APDP）提交**申报**或申请**授权**。建立用户数据库通常需要申报。
3. **保障用户权利**：必须为用户提供行使**访问权、更正权、反对权、删除权和可携带权**的渠道。其中，对**商业营销目的的反对权**必须得到响应，时限为**30天**。
4. **履行其他义务**：包括**保密义务、安全义务、数据保留义务**等。对于数据跨境传输（你的数据可能存储在Supabase海外服务器），需要确保具备充分保障。

### 违规风险

贝宁法律对违规行为有严厉的处罚规定。历史上，法律对**欺诈性、不忠诚或非法收集**个人数据等严重违规行为，规定了**5年至10年监禁**以及**1000万至5000万西非法郎**的罚款。

### 简化的合规路径

对于初创平台，贝宁官方指南建议采取以下步骤：
- **指定一名数据保护官（DPO）** 或责任人。
- **建立处理活动登记册**，记录每项处理的目的、数据类别、保留期限、分包商和安全措施。
- **制定合规的文件**，包括隐私政策、数据处理协议（与Supabase、Brevo等分包商签署）。
- **向APDP履行申报手续**，并按要求提交年度报告。

### 是否需要考虑其他司法辖区？

你的问题聚焦贝宁，但**全球性平台可能触发多地法律**。例如，如果你的平台**有意向欧盟用户提供服务**（如支持欧元、提供欧洲语言版本），则可能同时需要遵守**GDPR**。核心逻辑与贝宁类似：**“有意 targeting”** 是启动法律适用的关键。

**建议**：鉴于你已经明确计划支持贝宁货币和支付方式，**主动向APDP进行咨询并完成申报**是降低风险最稳妥的做法。

---

## 二、`context.md` 更新版本（v0.8.0）

**Ouvre `docs/context.md`** et **remplace tout le contenu** par :

```markdown
# context.md — Contexte global du projet CandidatIA

> **Version** : 0.8.0
> **Dernière mise à jour** : 2026-10-01
> **Statut** : Frontend complet — En attente de déploiement et de conformité APDP
> **Tags Git** : `phase-6-complete`

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
| **7a** | Structure Next.js 14 + Tailwind + i18n | — | ✅ Terminée |
| **7b** | Pages Auth (Login + Register) + composants UI | — | ✅ Terminée |
| **7c** | Dashboard + Générateur + Historique | — | ✅ Terminée |
| **7d** | Relances + Paiement + fix multilingue | — | ✅ Terminée |
| **7e** | Landing complète + Pages légales + Cookie banner | — | ✅ Terminée |
| **7e-legal** | Pages légales conformes au Code du numérique du Bénin | — | ✅ Terminée |
| **8** | Déploiement production (Vercel + Render) | — | ⏳ À venir |
| **9** | Conformité APDP (déclaration + registre) | — | ⏳ À venir |
| **10** | Marketing + itération | — | ⏳ À venir |
| **TOTAL** | | **176** | |

### 2.2 Capacités opérationnelles

| Fonctionnalité | Statut |
|---|---|
| Ingestion PDF (texte + OCR), DOCX, ODT, RTF, HTML, MD, images | ✅ |
| Détection langue (15 langues) + mapping culturel | ✅ |
| Moteur IA fallback (Groq → Gemini → Mistral → Cohere) | ✅ |
| Circuit breaker + cache Redis | ✅ |
| Génération CV méthode STAR (multilingue) | ✅ |
| Génération Lettre AIDA (multilingue) | ✅ |
| Génération Guide d'entretien (multilingue) | ✅ |
| Génération Brouillon relance (multilingue) | ✅ |
| Assemblage ZIP | ✅ |
| Auth JWT (register, login, /me) | ✅ |
| Gestion crédits + quotas par plan | ✅ |
| Protection de `/api/generate` | ✅ |
| Historique + statistiques par utilisateur | ✅ |
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
- Groq (Llama 3.3 70B) — primary
- Google Gemini (1.5 Flash)
- Mistral (Small)
- Cohere (Command R)

**Ingestion**
- pypdf + pdfplumber (PDF textuels)
- Tesseract OCR + PyMuPDF (PDF scannés)
- python-docx (Word)
- odfpy (ODT), striprtf (RTF), BeautifulSoup (HTML)

**Données**
- Supabase Postgres (DB)
- Upstash Redis (cache)
- Brevo (emails)

**Paiement (encaissement au Bénin)**
- FedaPay (Mobile Money — MTN MoMo, Moov, Celtiis)
- Flutterwave (cartes internationales)
- Raenest (USDT/USDC → USD → Bénin)

### 3.2 Structure du projet

```
candidatia/
├── backend/              # FastAPI (176 tests)
│   ├── app/
│   │   ├── core/         # config, security, logging, telemetry, database
│   │   ├── models/       # schémas Pydantic
│   │   ├── routers/      # endpoints FastAPI
│   │   └── services/
│   │       ├── ai/       # orchestrateur multi-provider + prompts
│   │       ├── auth/     # bcrypt, JWT, users, quotas
│   │       ├── email/    # Brevo + templates
│   │       ├── generation/ # Word CV/Lettre/Guide/Relance + PackBuilder
│   │       ├── ingestion/ # extracteurs multi-format
│   │       ├── language/ # détection + locale_map
│   │       ├── payment/  # FedaPay + Flutterwave + Raenest + orchestrateur
│   │       └── relance/  # service + scheduler
│   ├── scripts/          # schema.sql, init_db.py, test_*.py
│   └── tests/            # 176 tests
├── frontend/             # Next.js 14
│   ├── app/[locale]/
│   │   ├── page.tsx               # Landing enrichie
│   │   ├── login/, register/      # Auth
│   │   ├── dashboard/             # Espace utilisateur
│   │   │   ├── page.tsx           # Accueil (stats)
│   │   │   ├── generate/          # Générateur
│   │   │   ├── history/           # Historique
│   │   │   ├── relances/          # Relances
│   │   │   └── billing/           # Paiement
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
**Paiement** : `/api/billing/plans`, `/api/billing/providers`, `/api/billing/checkout`, `/api/billing/payments`
**Webhooks** : `/webhooks/fedapay`, `/webhooks/flutterwave`, `/webhooks/raenest`
**Relance** : `/api/relance/schedule`, `/api/relance/pending`, `/api/relance`, `/api/relance/{id}/cancel`, `/api/relance/{id}/mark-sent`
**Scheduler** : `/api/scheduler/run`, `/api/scheduler/health`

---

## 4. BASE DE DONNÉES (Supabase)

| Table | Rôle |
|---|---|
| `profiles` | Utilisateurs (id, email, password_hash, credits, plan, locale) |
| `generations` | Historique des packs (user_id, score, paths, langues) |
| `payments` | Paiements (provider, transaction_id, amount, status, credits) |
| `relances` | Relances programmables (user_id, scheduled_date, email_draft, status) |
| `ai_logs` | Monitoring des appels IA (provider, tokens, latency, success) |

Schéma SQL : `backend/scripts/schema.sql` (créé via Supabase SQL Editor).

---

## 5. MODÈLE ÉCONOMIQUE

| Plan | Code | Prix | Crédits |
|---|---|---|---|
| Découverte | `free` | 0 € | 1/mois |
| Essentiel | `essentiel` | 4,99 € | 5 |
| Pro | `pro` | 14,99 €/mois | 30/mois |
| Carrière | `carriere` | 39,99 €/mois | Illimité |

**Canaux de paiement** : FedaPay (Mobile Money), Flutterwave (cartes), Raenest (crypto).
**Encaissement** : tout au Bénin.

---

## 6. CONFORMITÉ LÉGALE (BÉNIN)

### 6.1 Applicabilité
CandidatIA est soumise au **Code du numérique du Bénin (Loi n° 2017-20 du 20 avril 2018)** car :
- Elle cible des utilisateurs au Bénin (support XOF, Mobile Money, français)
- Elle traite des données de personnes situées au Bénin
- Elle encaisse via des providers béninois

### 6.2 Obligations identifiées

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

### 6.3 Droits utilisateurs à garantir

- **Accès** : réponse ≤ 60 jours
- **Opposition** (prospection) : réponse ≤ 30 jours
- **Rectification / Suppression** : réponse ≤ 45 jours
- **Portabilité** : format structuré

### 6.4 Coordonnées APDP
APDP – Rue 6.076, Aidjèdo, Immeuble El MARZOUK Joël, Cotonou
Tél : (+229) 21 32 57 88 — Email : contact@apdp.bj — Web : www.apdp.bj

---

## 7. CONFIGURATION

### 7.1 Variables backend (`backend/.env`)

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

# Brevo
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

# OCR
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe

# Stockage
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=./fichiers_generes
MAX_FILE_SIZE_MB=10
```

### 7.2 Variables frontend (`frontend/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé>
```

---

## 8. LANCEMENT EN LOCAL

### 8.1 Backend
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```
- Backend : http://localhost:8000
- Docs : http://localhost:8000/docs
- Health : http://localhost:8000/health

### 8.2 Frontend
```powershell
cd frontend
npm run dev
```
- Frontend : http://localhost:3000

### 8.3 Tests
```powershell
# Backend
cd backend
pytest -m "not integration"
pytest -m integration -v
```

---

## 9. DÉCISIONS D'ARCHITECTURE

1. **Orchestrateur IA multi-provider** : résilience (les modèles gratuits changent), performance, économie (cache).
2. **FedaPay en priorité** : encaissement au Bénin, couverture Mobile Money, frais bas.
3. **Scheduler en mode "pull"** : compatible avec tous les hébergeurs, protégé par token.
4. **Texte sans accents dans le code** : contournement des problèmes d'encodage Windows.
5. **Fallback OCR en cascade** : pypdf → pdfplumber → Tesseract + PyMuPDF.
6. **Titres Word traduits par dictionnaire** : `TITLES`, `CV_TITLES`, `LETTRE_TITLES`, `RELANCE_TITLES`.

---

## 10. DETTES TECHNIQUES CONNUES

| Dette | Impact | Priorité |
|---|---|---|
| Warnings Pydantic V2 (`json_encoders`, `Config`) | Aucun | Basse |
| Non-compatibilité Stripe Bénin | Utilisation de FedaPay | Résolu |
| `test_*.py` à la racine backend (obsolètes) | Aucun | Basse |
| Absence de rate limiting avancé | Moyen | Moyenne |
| Pas de tests frontend (Jest/Playwright) | Moyen | Moyenne |

---

## 11. PROCHAINES ÉTAPES

### Phase 8 — Déploiement production
- [ ] Backend sur Render.com (Web Service + Cron Job)
- [ ] Frontend sur Vercel
- [ ] Supabase déjà en production
- [ ] Webhooks FedaPay/Flutterwave/Raenest configurés avec URL publique
- [ ] Scheduler cron configuré (appel quotidien `/api/scheduler/run`)
- [ ] Domaine personnalisé (optionnel)

### Phase 9 — Conformité APDP
- [ ] Effectuer la déclaration APDP (https://www.apdp.bj)
- [ ] Compléter `privacy/page.tsx` avec adresse réelle + n° déclaration
- [ ] Tenir le registre des activités de traitement
- [ ] Signer les contrats de sous-traitance (Supabase, Brevo, paiement)
- [ ] Implémenter le consentement marketing explicite
- [ ] Préparer le rapport annuel (avant 30 juin)

### Phase 10 — Marketing
- [ ] Landing SEO multilingue
- [ ] Blog articles
- [ ] Programme d'affiliation
- [ ] Analytics (Plausible ou Umami)

---

## 12. RISQUES ET MITIGATIONS

| Risque | Impact | Mitigation |
|---|---|---|
| Provider IA tombe | Élevé | Fallback cascade + circuit breaker |
| Sanction APDP | Élevé | Déclaration + registre + conformité |
| FedaPay/Flutterwave refuse KYC | Élevé | Backup Paystack + CinetPay |
| Abus free tier | Moyen | Email vérifié + fingerprint + rate limit |
| Coût IA explose | Moyen | Cache + monitoring `ai_logs` |
| Attaque DDoS | Faible | Vercel + Render + Cloudflare |

---

## 13. RESSOURCES

- **Repo** : local (C:\Users\togninoubi.aho\Desktop\projets\CandidatIA\candidatia)
- **Tags Git** : `phase-6-complete`
- **Supabase** : https://uftodzmoktbxbgfdotgn.supabase.co
- **FedaPay** : https://dashboard.fedapay.com
- **Render** : https://dashboard.render.com (à venir)
- **Vercel** : https://vercel.com/dashboard (à venir)
- **APDP** : https://www.apdp.bj

---

## 14. HISTORIQUE DES VERSIONS

| Version | Date | Événement |
|---|---|---|
| 0.1.0 | 2026-09-29 | Phase 0-1 : Fondations + Moteur IA |
| 0.2.0 | 2026-09-29 | Phase 2 : Ingestion |
| 0.3.0 | 2026-09-29 | Phase 3 : Génération Word/PDF |
| 0.4.0 | 2026-09-30 | Phase 4 : Auth + DB + quotas |
| 0.5.0 | 2026-09-30 | Phase 5 : Paiement multi-canal |
| 0.6.0 | 2026-10-01 | Phase 6 : Relance + scheduler + emails |
| 0.7.0 | 2026-10-01 | Phase 7 : Frontend complet |
| **0.8.0** | **2026-10-01** | **Phase 7e-legal + Conformité Bénin identifiée** |

---

**Fin du contexte.** Ce document doit être mis à jour à chaque évolution majeure du projet.
```

---

## 三、Prochaines étapes pour la nouvelle conversation

1. **Copie ce `context.md`** dans ton projet (`docs/context.md`)
2. **Commit Git** :
   ```powershell
   git add docs/context.md
   git commit -m "docs: Mise a jour context.md (v0.8.0 - Frontend complet + conformite Benin)"
   ```
3. **Ouvre une nouvelle conversation** et commence par :

> "Je continue le projet CandidatIA. Voici le fichier context.md de référence : [colle le contenu]. Je veux maintenant faire la Phase 8 (déploiement production)."

---

## 四、État final du projet

| Aspect | Statut |
|---|---|
| Backend (FastAPI) | ✅ 176 tests passent |
| Frontend (Next.js) | ✅ Complet (auth, dashboard, générateur, paiement, relances) |
| Landing page | ✅ Enrichie (hero, features, pricing, FAQ) |
| Pages légales | ✅ Conformes au Code du numérique du Bénin |
| Cookie banner | ✅ Implémenté |
| Paiement | ✅ FedaPay sandbox testé |
| Multilingue | ✅ FR + EN (documents et interface) |
| **Déploiement** | ⏳ Phase 8 |
| **Conformité APDP** | ⏳ Phase 9 |

**Le SaaS est prêt à 95%. Il reste le déploiement et la conformité APDP.**