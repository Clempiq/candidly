# 🎯 Candidly

> Une PWA pour centraliser toutes ses candidatures d'emploi, suivre leur avancement et ne plus jamais oublier une relance.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-BDD%2FAuth-green?logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-cyan?logo=tailwindcss)

**Démo :** [candidly-nine.vercel.app](https://candidly-nine.vercel.app)

## Le problème

Quand on cherche un emploi ou une alternance, les candidatures s'éparpillent entre les mails, les sites d'offres et un vieux tableur. Résultat : on oublie de relancer, on ne sait plus où on en est avec telle entreprise et on n'a aucune vision de ce qui marche.

**Pour qui :** toute personne en recherche active (emploi, stage, alternance) qui envoie beaucoup de candidatures et veut un suivi simple, sur mobile comme sur ordinateur.

## Fonctionnalités clés

- **Tableau de bord** : taux de réponse, nombre d'entretiens, offres reçues.
- **Vue liste et vue Kanban** avec glisser-déposer entre les statuts (postulé, entretien planifié, entretien passé, offre, refus, ghosté, retiré).
- **Fiche candidature complète** : entreprise, poste, date, lien, contact, salaire, notes, score d'intérêt.
- **Rappels de relance** avec notifications push.
- **Alertes d'offres France Travail** : recherche via l'API officielle et vérification périodique par une Edge Function Supabase.
- **Connexion** par email/mot de passe ou Google.
- **Mode sombre** et **PWA installable** (service worker, usage hors ligne).

## Stack

| Catégorie | Technologie |
|---|---|
| Front | React 18, Vite 5, React Router 6 |
| Style | Tailwind CSS 3, icônes Lucide |
| Back | Supabase (PostgreSQL, Auth, Edge Functions) |
| API externe | France Travail (offres d'emploi v2, OAuth2) |
| PWA | Service worker écrit à la main |
| Déploiement | Vercel |

## Installation

Prérequis : Node.js 18+ et un projet [Supabase](https://supabase.com). Les clés [France Travail](https://francetravail.io) sont optionnelles.

```bash
git clone https://github.com/Clempiq/candidly.git
cd candidly
npm install
cp .env.example .env   # renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
npm run dev
```

Pour la base de données, exécuter `supabase/migrations/001_candidly_schema.sql` dans l'éditeur SQL de Supabase. Le fichier `002_cron_alerts.sql` explique comment planifier la vérification des alertes.

| Variable | Obligatoire | Rôle |
|---|---|---|
| `VITE_SUPABASE_URL` | oui | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | oui | Clé publique Supabase |
| `VITE_FT_CLIENT_ID` / `VITE_FT_CLIENT_SECRET` | non | Accès à l'API France Travail |
| `VITE_VAPID_PUBLIC_KEY` | non | Notifications push |

## Statut

✅ **Fonctionnel et déployé.** Né de ma propre recherche d'alternance : je l'ai conçu pour mon usage, puis rendu générique.

Pistes suivantes : déplacer entièrement les appels France Travail côté serveur (Edge Function) pour ne plus exposer d'identifiants dans le front, et ajouter un export CSV.

## Ce que j'ai appris

- **Partir d'un vrai irritant** : j'étais mon propre utilisateur, ce qui m'a obligé à prioriser ce qui sert vraiment (relances, vue Kanban) avant le reste.
- **Modéliser un parcours en statuts** clairs, compréhensibles d'un coup d'œil, et en tirer des indicateurs utiles.
- **Intégrer une API publique avec OAuth2** (flux client credentials, mise en cache du jeton) et planifier un traitement côté serveur.
- **Rendre une app web installable** : manifeste, service worker, notifications push.

## Licence

MIT
