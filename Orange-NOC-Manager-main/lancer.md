# Lancer la plateforme

## Demarrer

Depuis la racine du projet, executer :

```bash
docker compose up --build -d
```

La plateforme sera disponible sur :

- Frontend : `http://localhost:3000`
- API : `http://localhost:3000/api`

Selon le client utilise :

- navigateur web : `http://localhost:3000`
- emulateur Android : `http://10.0.2.2:3000/api`
- telephone physique : `http://IP_DE_TA_MACHINE:3000/api`

## Verifier que tout fonctionne

Verifier l'etat des conteneurs :

```bash
docker compose ps
```

Les services `postgres` et `app` doivent etre `healthy`.

Verifier rapidement l'API :

```bash
curl http://localhost:3000/api/health
```

Tester aussi le formulaire HTML natif :

- `http://localhost:3000/legacy/incidents/new`

## Voir les logs

Afficher les logs des services :

```bash
docker compose logs
```

Afficher seulement les logs de l'application :

```bash
docker compose logs app
```

## Arreter la plateforme

Arreter les conteneurs :

```bash
docker compose down
```

## Arreter et supprimer aussi les donnees locales Docker

Attention : cette commande supprime aussi le volume PostgreSQL du projet.

```bash
docker compose down -v
```
