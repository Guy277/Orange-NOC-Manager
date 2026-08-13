# Android native

Ce module contient une premiere application Android native en Kotlin pour la consultation des incidents.

## Objectif couvert

Cette application couvre la partie :

- vue mobile native en lecture

Fonctionnalites actuellement implementees :

- appel de `GET /api/incidents`
- affichage d'une liste d'incidents
- ouverture d'un detail incident
- appel de `GET /api/incidents/:id`

## URL API

Le module Android utilise actuellement :

`http://10.0.2.2:3000/api`

Cette URL fonctionne depuis un emulateur Android lorsque le backend tourne en local sur la machine hote.

La valeur est maintenant centralisee dans :

- `app/src/main/java/com/orange/nocmanager/AppConfig.kt`

Pour un appareil physique, il faudra remplacer `10.0.2.2` par l'adresse IP locale de la machine qui heberge Docker.

## Fichiers principaux

- `ApiClient.kt` : appels HTTP natifs vers l'API
- `AppConfig.kt` : URL du backend mobile
- `Models.kt` : modeles Kotlin
- `IncidentListAdapter.kt` : affichage de la liste
- `MainActivity.kt` : liste des incidents
- `IncidentDetailActivity.kt` : detail d'un incident

## Etat actuel

Le module est maintenant un vrai socle de lecture seule.

Il reste possible d'ajouter ensuite :

- pagination
- ecran de rafraichissement manuel
- meilleur design Material
- gestion plus fine des erreurs reseau
