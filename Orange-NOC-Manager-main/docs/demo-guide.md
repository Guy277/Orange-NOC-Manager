# Guide de demonstration

## Objectif

Demonstrer un parcours MVP complet en moins de 10 minutes.

## Preparation

1. Lancer :

```bash
docker compose up --build -d
```

2. Verifier :

```bash
docker compose ps
```

3. Ouvrir :

- `http://localhost:3000/dashboard`

## Scenario recommande

### 1. Tableau de bord

- montrer les KPI
- montrer les graphes
- montrer les incidents recents
- montrer les techniciens les plus actifs

### 2. Creation d'un incident

- aller sur `Nouvel incident`
- saisir un titre, une description, un site, un type, une priorite
- creer l'incident
- verifier la redirection vers le detail

### 3. Liste des incidents

- aller sur `Incidents`
- rechercher l'incident cree
- tester un filtre statut ou priorite

### 4. Detail incident

- modifier la priorite ou la description
- affecter un technicien
- passer l'incident `En cours`
- ajouter une intervention
- passer l'incident `Resolue`

### 5. Historique

- afficher les logs de l'incident dans sa page detail
- aller dans `Historique`
- filtrer par table `incidents`

### 6. Dashboard mis a jour

- revenir au dashboard
- montrer la coherence des chiffres

### 7. Export XML

- ouvrir `Export XML`
- telecharger le fichier

### 8. Suppression

- supprimer l'intervention
- supprimer l'incident si la regle metier l'autorise

## Points a souligner pendant la demo

- architecture monolithique legere
- deux conteneurs seulement
- donnees fictives
- trigger PostgreSQL sur `incidents`
- frontend React branche sur les vraies routes `/api`
- export XML reeel, sans donnees simulees
