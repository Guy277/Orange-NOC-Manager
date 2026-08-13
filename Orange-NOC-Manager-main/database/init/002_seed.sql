INSERT INTO users (name, email, role, is_active)
VALUES
  ('Aminata Kone', 'aminata.kone@demo.orange-noc.local', 'operator', TRUE),
  ('Cedric Nguessan', 'cedric.nguessan@demo.orange-noc.local', 'operator', TRUE),
  ('Nadia Bamba', 'nadia.bamba@demo.orange-noc.local', 'supervisor', TRUE),
  ('Samuel Traore', 'samuel.traore@demo.orange-noc.local', 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO technicians (name, email, employee_code, specialty, zone, is_active)
VALUES
  ('Jean Kouadio', 'jean.kouadio@demo.orange-noc.local', 'TECH-001', 'fiber', 'Abidjan Nord', TRUE),
  ('Mireille Yao', 'mireille.yao@demo.orange-noc.local', 'TECH-002', 'radio', 'Abidjan Sud', TRUE),
  ('Koffi Nzi', 'koffi.nzi@demo.orange-noc.local', 'TECH-003', 'core', 'Yamoussoukro', TRUE),
  ('Aicha Soro', 'aicha.soro@demo.orange-noc.local', 'TECH-004', 'fixed_internet', 'Bouake', TRUE),
  ('David Tano', 'david.tano@demo.orange-noc.local', 'TECH-005', 'power', 'San Pedro', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO network_sites (code, name, city, region, site_type)
VALUES
  ('ABJ-RAD-01', 'Abidjan Plateau Radio 01', 'Abidjan', 'Lagunes', 'radio'),
  ('ABJ-FIB-01', 'Abidjan Cocody Fiber Hub', 'Abidjan', 'Lagunes', 'fiber_hub'),
  ('YAM-DC-01', 'Yamoussoukro Datacenter', 'Yamoussoukro', 'Lacs', 'datacenter'),
  ('BKE-POP-01', 'Bouake POP Central', 'Bouake', 'Gbeke', 'pop'),
  ('SPD-SWC-01', 'San Pedro Switching Center', 'San Pedro', 'Bas-Sassandra', 'switching_center')
ON CONFLICT (code) DO NOTHING;

INSERT INTO incident_types (label, description, required_specialty)
VALUES
  ('Fiber Cut', 'Coupure ou attenuation importante sur une liaison fibre.', 'fiber'),
  ('Radio Link Failure', 'Perte de disponibilite sur un lien radio ou BTS.', 'radio'),
  ('Core Network Saturation', 'Degradation ou saturation du coeur de reseau.', 'core'),
  ('Fixed Internet Outage', 'Panne touchant les acces internet fixe.', 'fixed_internet'),
  ('Power Failure', 'Defaillance d''alimentation electrique sur site.', 'power')
ON CONFLICT (label) DO NOTHING;

INSERT INTO incidents (
  reference,
  title,
  description,
  priority,
  status,
  site_id,
  type_id,
  technician_id,
  created_by,
  created_at,
  updated_at,
  resolved_at,
  closed_at
)
SELECT *
FROM (
  VALUES
    (
      'INC-202608-0001',
      'Coupure fibre sur le hub de Cocody',
      'Perte de signal detectee sur une liaison principale alimentant plusieurs clients entreprise.',
      'critical',
      'in_progress',
      (SELECT id FROM network_sites WHERE code = 'ABJ-FIB-01'),
      (SELECT id FROM incident_types WHERE label = 'Fiber Cut'),
      (SELECT id FROM technicians WHERE employee_code = 'TECH-001'),
      (SELECT id FROM users WHERE email = 'aminata.kone@demo.orange-noc.local'),
      '2026-08-01T08:10:00Z'::timestamptz,
      '2026-08-01T09:00:00Z'::timestamptz,
      NULL,
      NULL
    ),
    (
      'INC-202608-0002',
      'Indisponibilite radio sur Plateau 01',
      'Le site radio remonte une indisponibilite totale depuis le debut de matinee.',
      'high',
      'assigned',
      (SELECT id FROM network_sites WHERE code = 'ABJ-RAD-01'),
      (SELECT id FROM incident_types WHERE label = 'Radio Link Failure'),
      (SELECT id FROM technicians WHERE employee_code = 'TECH-002'),
      (SELECT id FROM users WHERE email = 'cedric.nguessan@demo.orange-noc.local'),
      '2026-08-02T06:45:00Z'::timestamptz,
      '2026-08-02T07:15:00Z'::timestamptz,
      NULL,
      NULL
    ),
    (
      'INC-202607-0148',
      'Surcharge coeur de reseau Yamoussoukro',
      'Des ralentissements recurrentes affectent plusieurs services data dans la zone centrale.',
      'medium',
      'resolved',
      (SELECT id FROM network_sites WHERE code = 'YAM-DC-01'),
      (SELECT id FROM incident_types WHERE label = 'Core Network Saturation'),
      (SELECT id FROM technicians WHERE employee_code = 'TECH-003'),
      (SELECT id FROM users WHERE email = 'aminata.kone@demo.orange-noc.local'),
      '2026-07-28T11:30:00Z'::timestamptz,
      '2026-07-28T15:45:00Z'::timestamptz,
      '2026-07-28T15:45:00Z'::timestamptz,
      NULL
    ),
    (
      'INC-202607-0137',
      'Panne internet fixe sur Bouake centre',
      'Plusieurs abonnes signalent une coupure internet fixe dans le centre-ville.',
      'high',
      'closed',
      (SELECT id FROM network_sites WHERE code = 'BKE-POP-01'),
      (SELECT id FROM incident_types WHERE label = 'Fixed Internet Outage'),
      (SELECT id FROM technicians WHERE employee_code = 'TECH-004'),
      (SELECT id FROM users WHERE email = 'cedric.nguessan@demo.orange-noc.local'),
      '2026-07-25T13:00:00Z'::timestamptz,
      '2026-07-25T18:40:00Z'::timestamptz,
      '2026-07-25T17:50:00Z'::timestamptz,
      '2026-07-25T18:40:00Z'::timestamptz
    ),
    (
      'INC-202607-0119',
      'Defaut d''alimentation sur site San Pedro',
      'L''equipement de commutation principal signale une alimentation instable depuis la nuit.',
      'critical',
      'reported',
      (SELECT id FROM network_sites WHERE code = 'SPD-SWC-01'),
      (SELECT id FROM incident_types WHERE label = 'Power Failure'),
      NULL,
      (SELECT id FROM users WHERE email = 'nadia.bamba@demo.orange-noc.local'),
      '2026-07-21T02:18:00Z'::timestamptz,
      '2026-07-21T02:18:00Z'::timestamptz,
      NULL,
      NULL
    )
) AS seed (
  reference,
  title,
  description,
  priority,
  status,
  site_id,
  type_id,
  technician_id,
  created_by,
  created_at,
  updated_at,
  resolved_at,
  closed_at
)
ON CONFLICT (reference) DO NOTHING;

INSERT INTO interventions (incident_id, technician_id, action, comment, started_at, ended_at)
VALUES
  (
    (SELECT id FROM incidents WHERE reference = 'INC-202608-0001'),
    (SELECT id FROM technicians WHERE employee_code = 'TECH-001'),
    'Diagnostic terrain',
    'Verification du point de rupture probable sur la liaison principale.',
    '2026-08-01T08:30:00Z'::timestamptz,
    '2026-08-01T09:10:00Z'::timestamptz
  ),
  (
    (SELECT id FROM incidents WHERE reference = 'INC-202607-0148'),
    (SELECT id FROM technicians WHERE employee_code = 'TECH-003'),
    'Ajustement de capacite',
    'Reequilibrage temporaire du trafic et nettoyage des files de saturation.',
    '2026-07-28T13:10:00Z'::timestamptz,
    '2026-07-28T14:05:00Z'::timestamptz
  ),
  (
    (SELECT id FROM incidents WHERE reference = 'INC-202607-0137'),
    (SELECT id FROM technicians WHERE employee_code = 'TECH-004'),
    'Relance equipement d''acces',
    'Redemarrage controle de l''equipement et validation du retour de service.',
    '2026-07-25T14:15:00Z'::timestamptz,
    '2026-07-25T15:00:00Z'::timestamptz
  )
ON CONFLICT DO NOTHING;
