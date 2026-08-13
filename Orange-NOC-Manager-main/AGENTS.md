# AGENTS.md

## Objectif du projet

Construire un MVP full-stack simple et professionnel pour la gestion des incidents reseau d'Orange, avec une architecture monolithique legere basee sur React + Vite, Node.js + Express et PostgreSQL 16.

## Regles de travail

- Respecter strictement le perimetre MVP du cahier des charges.
- Conserver uniquement deux conteneurs Docker : `postgres` et `app`.
- Servir le frontend React compile depuis l'application Express.
- Utiliser des noms techniques en anglais dans le code, les routes internes et la base.
- Garder l'interface et les contenus metier visibles en francais.
- Utiliser uniquement des donnees fictives.
- Ajouter des contraintes SQL, cles etrangeres, index et journalisation SQL.
- Preferer des dependances minimales et justifiees.
- Eviter toute architecture microservices ou toute technologie hors perimetre.
- Implementer une gestion d'erreurs claire et stable cote API.

## Conventions techniques

- `server/` contient l'API Express, l'acces PostgreSQL, les schemas Zod et le demarrage applicatif.
- `client/` contient uniquement le frontend React/Vite.
- `database/` contient le schema SQL, les seeds et les scripts lies a la base.
- `tests/` peut accueillir des tests automatises ou des scripts de verification simples.
- Les routes HTTP exposees pendant la phase 1 restent sous le prefixe `/api`.
- Les scripts SQL doivent etre idempotents pour simplifier les redemarrages Docker.

## Priorites de livraison

1. D'abord la base PostgreSQL, les contraintes et les seeds.
2. Ensuite les routes backend minimales et testables.
3. Enfin une coquille frontend compilee et servie par Express.

## Hors perimetre actuel

- Authentification complexe
- IA ou suggestions automatiques
- Microservices
- Integrations Orange reelles
- Mobile natif
