# Flutter hybride

Ce module contient maintenant une base Flutter orientee modification et suppression d'incidents.

## Objectif couvert

Cette application couvre la partie :

- vue mobile hybride en modification ou suppression

Fonctionnalites actuellement implementees :

- affichage de la liste des incidents
- consultation du detail d'un incident
- modification de la priorite
- modification du statut
- suppression d'un incident avec confirmation

## API cible

- `GET /api/incidents`
- `GET /api/incidents/:id`
- `PUT /api/incidents/:id`
- `PATCH /api/incidents/:id/status`
- `DELETE /api/incidents/:id`

## URL API actuelle

Le module utilise par defaut :

`http://10.0.2.2:3000/api`

Cette URL est adaptee a un emulateur Android.

La valeur est maintenant centralisee dans :

- `lib/config/api_config.dart`

Pour un appareil physique ou une autre cible Flutter, tu peux surcharger l'URL sans modifier le code :

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.20:3000/api
```

## Fichiers principaux

- `lib/main.dart`
- `lib/config/api_config.dart`
- `lib/models/incident.dart`
- `lib/services/api_service.dart`
- `lib/pages/incidents_page.dart`
- `lib/pages/incident_detail_page.dart`
- `lib/widgets/status_badge.dart`

## Pour le lancer

1. Installer Flutter
2. Ouvrir ce dossier :

```bash
cd mobile/flutter-hybrid
```

3. Si besoin, generer la structure de plateforme avec Flutter :

```bash
flutter create .
```

4. Lancer :

```bash
flutter run
```

## Etat actuel

Le module est maintenant suffisamment avance pour servir de base de demonstration mobile hybride.

Je n'ai pas pu l'executer dans cette session car `flutter` n'est pas installe sur cette machine d'execution.
