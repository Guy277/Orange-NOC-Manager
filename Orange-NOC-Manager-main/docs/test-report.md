# Rapport de tests

## Portee

Ce rapport couvre la recette finale executee sur le MVP :

- build Docker
- sante des conteneurs
- accessibilite de l'application React servie par Express
- verification des routes backend principales
- creation et cycle de vie d'un incident de recette
- logs et export XML

## Commandes executees

```bash
docker compose up --build -d
docker compose ps
powershell -ExecutionPolicy Bypass -File .\tests\phase4-smoke.ps1
```

## Resultats reels

Date d'execution :

- Lundi 3 aout 2026

Etat Docker apres recette :

- `orange-noc-postgres` : `healthy`
- `orange-noc-app` : `healthy`

Resultat du script `tests/phase4-smoke.ps1` :

```json
{
  "health": {
    "status": "ok",
    "service": "orange-noc-manager",
    "database": "ok",
    "incidentCount": 5
  },
  "rootPageStatus": 200,
  "dashboardPageStatus": 200,
  "detailPageStatus": 200,
  "createdIds": {
    "siteId": 25,
    "typeId": 25,
    "technicianId": 25,
    "incidentId": 25,
    "interventionId": 17
  },
  "incidentStatus": "resolved",
  "summary": {
    "total_incidents": 6,
    "open_incidents": 3,
    "critical_incidents": 3,
    "resolved_incidents": 3,
    "average_resolution_minutes": "181.67"
  },
  "recentCount": 5,
  "xmlStatus": 200,
  "deletedIncidentCheck": 404
}
```

## Interpretations

- `GET /api/health` : OK
- `GET /` : OK
- `GET /dashboard` : OK
- `GET /incidents/1` : OK
- creation d'un site, type, technicien, incident : OK
- affectation du technicien : OK
- passage de l'incident a `resolved` : OK
- creation d'une intervention : OK
- export XML : OK
- suppression et nettoyage de la recette : OK
- verification post-suppression de l'incident : `404` attendu

## Limites de recette

- la verification de la console navigateur n'est pas couverte par ce script
- la verification visuelle mobile et tablette doit encore etre faite manuellement dans un navigateur
- un navigateur pilote par outil n'etait pas disponible dans cette session
