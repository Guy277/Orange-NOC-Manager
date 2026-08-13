# Dossier mobile

Ce dossier est reserve aux extensions mobiles du projet `Orange Network Operations Center (NOC) Manager`.

## Objectif

L'application principale reste dans :

- `client/` : application web React
- `server/` : API Express
- `database/` : base PostgreSQL

Le dossier `mobile/` sert uniquement a ajouter les livrables mobiles demandes par l'enonce initial.

## Structure

```text
mobile/
├── android-native/
├── flutter-hybrid/
└── README.md
```

## Sous-dossiers

### `android-native/`

Ce dossier accueillera une application Android native, en Kotlin, destinee a la consultation des donnees.

Objectif prevu :

- afficher la liste des incidents
- consulter le detail d'un incident
- utiliser l'API existante en lecture

### `flutter-hybrid/`

Ce dossier accueillera une application Flutter hybride.

Objectif prevu :

- modifier certaines donnees
- supprimer certaines donnees si l'API l'autorise
- reutiliser les routes backend existantes

## Important

Le dossier `mobile/` ne remplace pas l'application principale.

Il vient en complement pour couvrir la partie mobile de la consigne initiale si cette partie doit etre realisee strictement.

## URL backend partagee

Le web, Android et Flutter utilisent le meme backend Express et les memes routes `/api`.

Selon l'environnement, l'hote change :

- web : `/api` via `http://localhost:3000`
- emulateur Android : `http://10.0.2.2:3000/api`
- appareil physique : `http://IP_DE_TA_MACHINE:3000/api`
