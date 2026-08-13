# Architecture du projet

## Vue d'ensemble

Orange Network Operations Center (NOC) Manager suit une architecture monolithique legere.

Le projet est compose de :

- un frontend React
- un backend Express
- une base PostgreSQL
- un lancement unifie avec Docker Compose

L'objectif est de garder une application simple, lisible et facilement demonstrable.

## Conteneurs Docker

Le projet utilise uniquement deux conteneurs :

### 1. `postgres`

Responsabilites :

- stocker les donnees metier
- appliquer les contraintes SQL
- maintenir les cles etrangeres et index
- executer le trigger de journalisation sur la table `incidents`

### 2. `app`

Responsabilites :

- executer le backend Node.js / Express
- exposer toutes les routes API sous `/api`
- exposer une route HTML classique sous `/legacy` pour la soumission sans AJAX
- servir le frontend React compile
- centraliser les regles metier

## Organisation logique

### Frontend

Dossier :

- `client/`

Role :

- afficher l'interface utilisateur
- appeler l'API via `fetch()`
- gerer les formulaires, filtres, listes et dashboard

Technologies :

- React
- Vite
- React Router
- Chart.js

### Backend

Dossier :

- `server/`

Role :

- exposer les routes REST
- valider les requetes avec Zod
- appliquer les regles metier
- interroger PostgreSQL
- retourner du JSON ou du XML

Sous-ensembles :

- `routes/` : points d'entree HTTP
- `validation/` : schemas Zod
- `services/` : logique metier
- `repositories/` : acces SQL
- `db/` : pool PostgreSQL et transactions
- `utils/` : erreurs et fonctions communes

### Base de donnees

Dossier :

- `database/init/`

Role :

- definir le schema officiel
- ajouter les migrations SQL idempotentes
- inserer les donnees fictives de depart

Tables principales :

- `users`
- `technicians`
- `network_sites`
- `incident_types`
- `incidents`
- `interventions`
- `logs`

## Flux de fonctionnement

### 1. Chargement de l'interface

- le navigateur charge le frontend depuis le conteneur `app`
- React affiche les pages metier

### 2. Appels API

- le frontend appelle les routes `/api/...`
- Express valide les parametres et le JSON
- les services appliquent les regles metier
- les repositories executent les requetes SQL parametrees

### 3. Journalisation

- toute modification SQL sur `incidents` declenche automatiquement un log dans `logs`
- cela permet la tracabilite technique sans logique supplementaire cote frontend

### 4. Export

- la route XML construit un document via `xmlbuilder2`
- le frontend declenche simplement le telechargement

## Architecture complete des dossiers et fichiers

```text
Orange-NOC-Manager/
├── AGENTS.md
├── architecture.md
├── lancer.md
├── README.md
├── docker-compose.yml
├── .dockerignore
├── .gitignore
│
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── styles.css
│       ├── api/
│       │   ├── client.js
│       │   ├── config.js
│       │   └── index.js
│       ├── utils/
│       │   ├── formatters.js
│       │   ├── hooks.js
│       │   └── labels.js
│       ├── components/
│       │   ├── common/
│       │   │   ├── ConfirmDialog.jsx
│       │   │   ├── DataTable.jsx
│       │   │   ├── EmptyState.jsx
│       │   │   ├── ErrorState.jsx
│       │   │   ├── KpiCard.jsx
│       │   │   ├── LoadingState.jsx
│       │   │   ├── PageSection.jsx
│       │   │   ├── Pagination.jsx
│       │   │   ├── PriorityBadge.jsx
│       │   │   └── StatusBadge.jsx
│       │   ├── incidents/
│       │   │   └── IncidentForm.jsx
│       │   └── layout/
│       │       ├── AppHeader.jsx
│       │       ├── AppLayout.jsx
│       │       └── Sidebar.jsx
│       └── pages/
│           ├── DashboardPage.jsx
│           ├── ExportPage.jsx
│           ├── HistoryPage.jsx
│           ├── IncidentCreatePage.jsx
│           ├── IncidentDetailPage.jsx
│           ├── IncidentsPage.jsx
│           ├── SitesPage.jsx
│           └── TechniciansPage.jsx
│
├── server/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── index.js
│       ├── config/
│       │   └── env.js
│       ├── constants/
│       │   └── incident.js
│       ├── db/
│       │   ├── migrate.js
│       │   ├── pool.js
│       │   └── transaction.js
│       ├── errors/
│       │   └── AppError.js
│       ├── repositories/
│       │   ├── dashboardRepository.js
│       │   ├── exportRepository.js
│       │   ├── incidentRepository.js
│       │   ├── incidentTypeRepository.js
│       │   ├── interventionRepository.js
│       │   ├── logRepository.js
│       │   ├── referenceRepository.js
│       │   ├── siteRepository.js
│       │   └── technicianRepository.js
│       ├── routes/
│       │   ├── dashboardRoutes.js
│       │   ├── exportRoutes.js
│       │   ├── healthRoutes.js
│       │   ├── incidentRoutes.js
│       │   ├── incidentTypeRoutes.js
│       │   ├── interventionRoutes.js
│       │   ├── legacyRoutes.js
│       │   ├── logRoutes.js
│       │   ├── siteRoutes.js
│       │   └── technicianRoutes.js
│       ├── services/
│       │   ├── dashboardService.js
│       │   ├── exportService.js
│       │   ├── incidentService.js
│       │   ├── incidentTypeService.js
│       │   ├── interventionService.js
│       │   ├── legacyFormService.js
│       │   ├── logService.js
│       │   ├── siteService.js
│       │   └── technicianService.js
│       ├── utils/
│       │   ├── http.js
│       │   └── validation.js
│       └── validation/
│           ├── commonSchemas.js
│           ├── incidentSchemas.js
│           ├── incidentTypeSchemas.js
│           ├── interventionSchemas.js
│           ├── logSchemas.js
│           ├── siteSchemas.js
│           └── technicianSchemas.js
│
├── database/
│   └── init/
│       ├── 001_schema.sql
│       ├── 002_seed.sql
│       ├── 003_incidents_assigned_at.sql
│       └── 004_interventions_seed_guard.sql
│
├── docs/
│   ├── api-reference.md
│   ├── cahier-des-charges.docx
│   ├── demo-guide.md
│   ├── postman_collection.json
│   └── test-report.md
│
├── mobile/
│   ├── README.md
│   ├── android-native/
│   │   ├── README.md
│   │   ├── build.gradle.kts
│   │   ├── settings.gradle.kts
│   │   └── app/
│   │       ├── build.gradle.kts
│   │       └── src/
│   │           └── main/
│   │               ├── AndroidManifest.xml
│   │               ├── java/com/orange/nocmanager/
│   │               │   ├── ApiClient.kt
│   │               │   ├── AppConfig.kt
│   │               │   ├── IncidentDetailActivity.kt
│   │               │   ├── IncidentListAdapter.kt
│   │               │   ├── MainActivity.kt
│   │               │   └── Models.kt
│   │               └── res/
│   │                   ├── layout/
│   │                   │   ├── activity_incident_detail.xml
│   │                   │   ├── activity_main.xml
│   │                   │   └── item_incident.xml
│   │                   └── values/
│   │                       ├── strings.xml
│   │                       └── themes.xml
│   └── flutter-hybrid/
│       ├── README.md
│       ├── analysis_options.yaml
│       ├── pubspec.yaml
│       ├── lib/
│       │   ├── main.dart
│       │   ├── config/
│       │   │   └── api_config.dart
│       │   ├── models/
│       │   │   └── incident.dart
│       │   ├── pages/
│       │   │   ├── incident_detail_page.dart
│       │   │   └── incidents_page.dart
│       │   ├── services/
│       │   │   └── api_service.dart
│       │   └── widgets/
│       │       └── status_badge.dart
│       └── test/
│           └── widget_test.dart
│
└── tests/
    ├── phase4-smoke.ps1
    └── README.md
```

## Role de chaque zone du projet

### Racine

- `docker-compose.yml` : point d'entree du lancement complet
- `README.md` : presentation generale du projet
- `lancer.md` : guide simple de lancement et d'arret
- `architecture.md` : description technique et structure du depot
- `AGENTS.md` : regles de travail du projet

### `client/`

Contient toute l'application React :

- le point d'entree
- les pages
- les composants reutilisables
- le module d'appels API
- les styles

### `server/`

Contient toute l'API Express :

- initialisation applicative
- routes REST
- validation Zod
- logique metier
- acces SQL
- gestion d'erreurs

### `database/`

Contient la source officielle de la structure SQL et des migrations :

- schema principal
- seeds
- ajustements incrementaux idempotents

### `docs/`

Contient les documents de livraison :

- cahier des charges
- reference API
- guide de demonstration
- rapport de tests
- collection Postman

### `mobile/`

Contient les deux modules mobiles adosses au meme backend :

- `android-native/` pour la lecture native Android en Kotlin
- `flutter-hybrid/` pour la modification et la suppression en Flutter

### `tests/`

Contient les scripts de verification :

- recette de bout en bout
- documentation des tests

## Pourquoi cette architecture

Cette architecture a ete choisie pour :

- limiter la complexite
- respecter le perimetre MVP
- faciliter les tests
- rendre la demonstration fluide
- montrer une maitrise full-stack complete sans sur-ingenierie

## Avantages

- simple a lancer
- facile a comprendre
- peu de dependances
- deployment local reproductible
- structure claire entre UI, logique metier et SQL

## Limites assumees

- pas d'authentification avancee
- pas de temps reel
- pas de microservices
- pas d'integration reseau reelle
- mobile ajoute en complement du MVP web

Ces limites sont volontaires pour proteger le MVP et garantir une application finissable et stable.
