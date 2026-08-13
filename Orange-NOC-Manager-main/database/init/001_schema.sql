CREATE TABLE IF NOT EXISTS users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(40) NOT NULL CHECK (role IN ('admin', 'operator', 'supervisor')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS technicians (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  employee_code VARCHAR(50) NOT NULL UNIQUE,
  specialty VARCHAR(50) NOT NULL CHECK (specialty IN ('radio', 'fiber', 'core', 'fixed_internet', 'power')),
  zone VARCHAR(80) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS network_sites (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  city VARCHAR(100) NOT NULL,
  region VARCHAR(100) NOT NULL,
  site_type VARCHAR(50) NOT NULL CHECK (site_type IN ('radio', 'fiber_hub', 'datacenter', 'pop', 'switching_center')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_types (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  label VARCHAR(120) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  required_specialty VARCHAR(50) NOT NULL CHECK (required_specialty IN ('radio', 'fiber', 'core', 'fixed_internet', 'power')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incidents (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reference VARCHAR(30) NOT NULL UNIQUE,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('reported', 'qualified', 'assigned', 'in_progress', 'resolved', 'closed', 'cancelled')),
  site_id INTEGER NOT NULL REFERENCES network_sites(id) ON DELETE RESTRICT,
  type_id INTEGER NOT NULL REFERENCES incident_types(id) ON DELETE RESTRICT,
  technician_id INTEGER REFERENCES technicians(id) ON DELETE RESTRICT,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  CONSTRAINT incidents_resolution_date_check CHECK (resolved_at IS NULL OR resolved_at >= created_at),
  CONSTRAINT incidents_closed_date_check CHECK (closed_at IS NULL OR closed_at >= created_at),
  CONSTRAINT incidents_in_progress_requires_technician CHECK (
    status <> 'in_progress' OR technician_id IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS interventions (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  technician_id INTEGER NOT NULL REFERENCES technicians(id) ON DELETE RESTRICT,
  action TEXT NOT NULL,
  comment TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN ended_at IS NULL THEN NULL
      ELSE GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (ended_at - started_at)) / 60))::INTEGER
    END
  ) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT interventions_dates_check CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE TABLE IF NOT EXISTS logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name VARCHAR(80) NOT NULL,
  record_id INTEGER NOT NULL,
  action VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  db_user TEXT NOT NULL DEFAULT CURRENT_USER
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_site_id ON incidents(site_id);
CREATE INDEX IF NOT EXISTS idx_incidents_type_id ON incidents(type_id);
CREATE INDEX IF NOT EXISTS idx_incidents_technician_id ON incidents(technician_id);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents(priority);
CREATE INDEX IF NOT EXISTS idx_interventions_incident_id ON interventions(incident_id);
CREATE INDEX IF NOT EXISTS idx_logs_table_record_changed_at ON logs(table_name, record_id, changed_at DESC);

CREATE OR REPLACE FUNCTION set_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_incidents_updated_at ON incidents;
CREATE TRIGGER trg_set_incidents_updated_at
BEFORE UPDATE ON incidents
FOR EACH ROW
EXECUTE FUNCTION set_incidents_updated_at();

CREATE OR REPLACE FUNCTION log_incident_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO logs (table_name, record_id, action, old_data, new_data)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO logs (table_name, record_id, action, old_data, new_data)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO logs (table_name, record_id, action, old_data, new_data)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_incident_changes ON incidents;
CREATE TRIGGER trg_log_incident_changes
AFTER INSERT OR UPDATE OR DELETE ON incidents
FOR EACH ROW
EXECUTE FUNCTION log_incident_changes();
