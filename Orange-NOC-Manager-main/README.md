# Orange Network Operations Center (NOC) Manager

## Presentation

Orange Network Operations Center (NOC) Manager est un MVP full-stack de gestion d'incidents reseau.

Le projet simule un outil interne de supervision et de suivi permettant de :

- declarer un incident reseau
- l'affecter a un technicien
- suivre son evolution
- enregistrer des interventions
- consulter un historique technique
- visualiser des statistiques
- exporter les incidents en XML

Toutes les donnees du projet sont fictives.

## Objectif

Ce projet a ete concu pour demontrer la capacite a transformer une idee metier en application complete avec :

- base relationnelle PostgreSQL
- backend Node.js / Express
- frontend React
- conteneurisation Docker
- dashboard et export

Le perimetre reste volontairement simple, leger et demonstrable.

## Fonctionnalites principales

- creation d'incidents
- liste des incidents avec recherche, filtres et pagination
- detail d'un incident
- modification de la priorite et du statut
- affectation d'un technicien
- gestion des interventions
- gestion des techniciens
- gestion des sites reseau
- consultation des logs techniques
- dashboard statistique
- export XML

## Stack technique

- Frontend : React + Vite
- Navigation : React Router
- Graphiques : Chart.js + react-chartjs-2
- Backend : Node.js + Express
- Validation : Zod
- Base de donnees : PostgreSQL 16
- Export XML : xmlbuilder2
- Conteneurs : Docker Compose

## Architecture

Le projet repose sur seulement deux conteneurs :

1. `postgres`
   Stocke les donnees, les contraintes SQL, les index et le trigger de journalisation.

2. `app`
   Contient le backend Express et sert aussi le frontend React compile.

L'application suit une architecture monolithique legere.

Voir aussi :

- [architecture.md](C:\Users\user\Desktop\OSC_2026\Orange-NOC-Manager\architecture.md)

## Structure du projet

- `client/`
  Frontend React/Vite

- `server/`
  API Express, validation, logique metier, acces PostgreSQL

- `database/init/`
  Schema SQL, migrations idempotentes et donnees initiales

- `docs/`
  Cahier des charges, documentation API, guide de demo, rapport de tests

- `tests/`
  Scripts de recette et de verification

## Demarrage

```bash
docker compose up --build -d
```

Acces :

- Frontend : `http://localhost:3000`
- API : `http://localhost:3000/api`

Configuration des URLs :

- web React : `/api` via `client/src/api/config.js`
- Android natif : `http://10.0.2.2:3000/api` via `mobile/android-native/app/src/main/java/com/orange/nocmanager/AppConfig.kt`
- Flutter hybride : `http://10.0.2.2:3000/api` via `mobile/flutter-hybrid/lib/config/api_config.dart`

Les trois clients utilisent le meme backend. Seul l'hote change selon l'environnement d'execution.

Verification :

```bash
docker compose ps
curl http://localhost:3000/api/health
```

## Arret

```bash
docker compose down
```

Pour plus simple sur le lancement et l'arret :

- [lancer.md](C:\Users\user\Desktop\OSC_2026\Orange-NOC-Manager\lancer.md)

## Routes principales

- `GET /api/health`
- `GET /api/incidents`
- `POST /api/incidents`
- `GET /api/incidents/:id`
- `PUT /api/incidents/:id`
- `DELETE /api/incidents/:id`
- `PATCH /api/incidents/:id/status`
- `PATCH /api/incidents/:id/assignment`
- `GET /api/incidents/:id/interventions`
- `POST /api/incidents/:id/interventions`
- `GET /api/incidents/:id/logs`
- `GET /api/technicians`
- `GET /api/sites`
- `GET /api/logs`
- `GET /api/dashboard/summary`
- `GET /api/exports/incidents.xml`

## Route HTML native sans AJAX

Pour couvrir la consigne de formulaire HTML classique :

- `GET /legacy/incidents/new`
- `POST /legacy/incidents`

Cette page soumet un formulaire HTML en `POST` standard vers Express, sans `fetch`, sans React et sans AJAX.

## Regles importantes du projet

- interface en francais
- noms techniques en anglais dans le code et la base
- donnees fictives uniquement
- pas d'authentification complexe
- pas d'IA
- pas de microservices
- pas d'application mobile separee

## Documentation complementaire

- [architecture.md](C:\Users\user\Desktop\OSC_2026\Orange-NOC-Manager\architecture.md)
- [lancer.md](C:\Users\user\Desktop\OSC_2026\Orange-NOC-Manager\lancer.md)
- [docs/api-reference.md](C:\Users\user\Desktop\OSC_2026\Orange-NOC-Manager\docs\api-reference.md)
- [docs/demo-guide.md](C:\Users\user\Desktop\OSC_2026\Orange-NOC-Manager\docs\demo-guide.md)
- [docs/test-report.md](C:\Users\user\Desktop\OSC_2026\Orange-NOC-Manager\docs\test-report.md)
