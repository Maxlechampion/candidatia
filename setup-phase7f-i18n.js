#!/usr/bin/env node
/**
 * setup-phase7f-i18n.js — CandidatIA
 * Traduction complète de l'interface (FR + EN)
 *
 * Met à jour :
 *   - frontend/messages/fr.json
 *   - frontend/messages/en.json
 *   - frontend/components/Layout/Header.tsx
 *   - frontend/components/Layout/Sidebar.tsx (déjà fait)
 *   - frontend/app/[locale]/login/page.tsx
 *   - frontend/app/[locale]/register/page.tsx
 *   - frontend/app/[locale]/dashboard/page.tsx (déjà fait)
 *   - frontend/app/[locale]/dashboard/generate/page.tsx
 *   - frontend/app/[locale]/dashboard/history/page.tsx
 *   - frontend/app/[locale]/dashboard/relances/page.tsx
 *   - frontend/app/[locale]/dashboard/billing/page.tsx
 *   - frontend/components/relance/RelanceCard.tsx
 *   - frontend/components/relance/ScheduleModal.tsx
 *   - frontend/components/billing/PlanCard.tsx
 *   - frontend/components/billing/PaymentMethods.tsx
 *
 * Usage : node setup-phase7f-i18n.js
 * Prérequis : setup-phase7e-legal.js exécuté
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const FRONTEND = path.join(ROOT, 'frontend');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeLines(relPath, lines) {
  const fullPath = path.join(FRONTEND, relPath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, lines.join('\n') + '\n', 'utf-8');
  console.log('  OK  ' + relPath);
}

function writeJson(relPath, obj) {
  const fullPath = path.join(FRONTEND, relPath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, JSON.stringify(obj, null, 2) + '\n', 'utf-8');
  console.log('  OK  ' + relPath);
}

function logHeader(title) {
  console.log('');
  console.log('='.repeat(70));
  console.log('  ' + title);
  console.log('='.repeat(70));
  console.log('');
}

function logStep(step) {
  console.log('');
  console.log('> ' + step);
}

logHeader('CandidatIA - Traduction complete FR + EN');

if (!fs.existsSync(FRONTEND)) {
  console.error('');
  console.error('  ERREUR : dossier frontend/ introuvable.');
  console.error('');
  process.exit(1);
}

console.log('  Frontend : ' + FRONTEND);