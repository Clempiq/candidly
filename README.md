# 🎯 Candidly — Suivi de candidatures

> Une PWA moderne pour centraliser et suivre toutes vos candidatures d'emploi.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-BDD%2FAuth-green?logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-cyan?logo=tailwindcss)

## ✨ Fonctionnalités

- **Tableau de bord** avec statistiques clés (taux de réponse, entretiens, offres)
- **Vue liste** et **vue Kanban** avec drag & drop entre les statuts
- **Gestion complète** : entreprise, poste, date, URL, contact, salaire, notes, score d'intérêt
- **Rappels de relance** configurables avec notifications push actionnables
- **Alertes offres France Travail** : soyez notifié quand une offre correspond à vos critères
- **Authentification** : email/password + Google OAuth
- **Dark mode** automatique
- **PWA** : installable sur mobile et desktop, mode hors-ligne

## 🚀 Installation

### Prérequis
- Node.js 18+
- Un projet [Supabase](https://supabase.com)
- (Optionnel) Clés API [France Travail](https://francetravail.io)

### Setup

```bash
# 1. Cloner le repo
git clone https://github.com/YOUR_USERNAME/candidly.git
cd candidly

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Remplir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

# 4. Initialiser la base de données Supabase
# Copier/coller le contenu de supabase/migrations/001_candidly_schema.sql
# dans le SQL Editor de votre projet Supabase

# 5. Lancer en développement
npm run dev
```

### Variables d'environnement

| Variable | Obligatoire | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | URL de votre projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Clé anon publique Supabase |
| `VITE_FT_CLIENT_ID` | ⬜ | Client ID France Travail API |
| `VITE_FT_CLIENT_SECRET` | ⬜ | Client Secret France Travail API |
| `VITE_VAPID_PUBLIC_KEY` | ⬜ | Clé publique VAPID (push notifications) |

## 🛠️ Stack technique

| Catégorie | Technologie |
|---|---|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 + CSS custom |
| Routing | React Router v6 |
| Base de données | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + Google) |
| PWA | Service Worker manuel |
| Déploiement | Vercel |

## 📱 Statuts de candidature

| Statut | Description |
|---|---|
| Postulé | Candidature envoyée, en attente |
| Entretien planifié | RDV confirmé |
| Entretien passé | Entretien réalisé |
| Offre reçue 🎉 | Offre d'emploi reçue |
| Refus | Réponse négative |
| Ghosté | Pas de réponse depuis longtemps |
| Retiré | Candidature retirée |

## 📄 Licence

MIT
