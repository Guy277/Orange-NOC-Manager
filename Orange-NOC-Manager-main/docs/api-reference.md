# Reference API

Base URL locale :

`http://localhost:3000/api`

Format d'erreur standard :

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Corps de requete invalide.",
  "details": {},
  "timestamp": "2026-08-03T10:00:00.000Z"
}
```

## Health

### `GET /api/health`

Retourne l'etat de l'application et de la base.

## Incidents

### `GET /api/incidents`

Parametres acceptes :

- `page`
- `limit`
- `search`
- `status`
- `priority`
- `siteId`
- `typeId`
- `technicianId`

### `POST /api/incidents`

Corps :

```json
{
  "title": "Coupure fibre",
  "description": "Incident de demonstration",
  "priority": "high",
  "status": "reported",
  "siteId": 1,
  "typeId": 1,
  "technicianId": null,
  "createdBy": 1
}
```

### `PUT /api/incidents/:id`

Corps partiel autorise :

- `title`
- `description`
- `priority`
- `siteId`
- `typeId`
- `technicianId`

### `PATCH /api/incidents/:id/status`

```json
{
  "status": "resolved"
}
```

### `PATCH /api/incidents/:id/assignment`

```json
{
  "technicianId": 2
}
```

### `GET /api/incidents/:id/interventions`

Liste des interventions de l'incident.

### `POST /api/incidents/:id/interventions`

```json
{
  "technicianId": 2,
  "action": "Diagnostic terrain",
  "comment": "Controle sur site",
  "startedAt": "2026-08-03T11:00:00Z",
  "endedAt": "2026-08-03T11:30:00Z"
}
```

### `GET /api/incidents/:id/logs`

Historique PostgreSQL lie a l'incident.

## Interventions

### `PUT /api/interventions/:id`

Corps partiel autorise.

### `DELETE /api/interventions/:id`

## Techniciens

### `GET /api/technicians`

Parametres :

- `page`
- `limit`
- `search`
- `specialty`
- `zone`
- `active`

### `POST /api/technicians`

```json
{
  "name": "Jean Test",
  "email": "jean.test@demo.local",
  "employeeCode": "TECH-999",
  "specialty": "radio",
  "zone": "Abidjan",
  "isActive": true
}
```

## Sites

### `GET /api/sites`

Parametres :

- `page`
- `limit`
- `search`
- `region`
- `city`
- `siteType`

### `POST /api/sites`

```json
{
  "code": "ABJ-TEST-01",
  "name": "Site de test",
  "city": "Abidjan",
  "region": "Lagunes",
  "siteType": "radio"
}
```

## Types d'incident

### `GET /api/incident-types`

Parametres :

- `page`
- `limit`
- `search`
- `requiredSpecialty`

### `POST /api/incident-types`

```json
{
  "label": "Radio Link Failure",
  "description": "Perte de disponibilite radio",
  "requiredSpecialty": "radio"
}
```

## Logs

### `GET /api/logs`

Parametres :

- `action`
- `tableName`
- `recordId`
- `dateFrom`
- `dateTo`
- `page`
- `limit`

## Dashboard

### `GET /api/dashboard/summary`

Retourne :

- `total_incidents`
- `open_incidents`
- `critical_incidents`
- `resolved_incidents`
- `average_resolution_minutes`

### `GET /api/dashboard/incidents-by-type`

Retourne `data[]` avec `id`, `label`, `count`.

### `GET /api/dashboard/incidents-by-status`

Retourne `data[]` avec `status`, `count`.

### `GET /api/dashboard/recent-incidents`

Parametre usuel :

- `limit`

### `GET /api/dashboard/technician-performance`

Parametre usuel :

- `limit`

## Export XML

### `GET /api/exports/incidents.xml`

Retourne un document XML telechargeable contenant :

- incident
- type
- site
- technicien
- interventions
