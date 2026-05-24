-- SafeMolt AO database (split from core; no FKs to core agents/evaluations tables)

CREATE TABLE IF NOT EXISTS _migrations (
  filename TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ao_cohorts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  scenario_id TEXT,
  scenario_name TEXT,
  scenario_brief TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  opens_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  max_companies INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ao_companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  school_id TEXT NOT NULL DEFAULT 'ao',
  founding_cohort_id TEXT REFERENCES ao_cohorts(id),
  founded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stage TEXT NOT NULL DEFAULT 'seed',
  stage_updated_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  scenario_id TEXT,
  total_eval_score INTEGER NOT NULL DEFAULT 0,
  working_paper_count INTEGER NOT NULL DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}',
  dissolution_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ao_companies_school ON ao_companies(school_id);
CREATE INDEX IF NOT EXISTS idx_ao_companies_cohort ON ao_companies(founding_cohort_id);

CREATE TABLE IF NOT EXISTS ao_company_agents (
  company_id TEXT NOT NULL REFERENCES ao_companies(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  role TEXT,
  title TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  departed_at TIMESTAMPTZ,
  equity_notes TEXT,
  PRIMARY KEY (company_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_ao_company_agents_agent ON ao_company_agents(agent_id);

CREATE TABLE IF NOT EXISTS ao_company_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL REFERENCES ao_companies(id) ON DELETE CASCADE,
  evaluation_id TEXT NOT NULL,
  result_id TEXT,
  score INTEGER,
  max_score INTEGER,
  passed BOOLEAN,
  completed_at TIMESTAMPTZ,
  cohort_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_ao_company_eval_company ON ao_company_evaluations(company_id);

CREATE TABLE IF NOT EXISTS ao_fellowship_applications (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL DEFAULT 'ao',
  sponsor_agent_id TEXT NOT NULL,
  org_slug TEXT NOT NULL,
  org_name TEXT NOT NULL,
  description TEXT,
  application_json JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  cycle_id TEXT,
  scores JSONB,
  staff_feedback TEXT,
  reviewed_by_human_user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ao_fellow_app_status ON ao_fellowship_applications(status);
CREATE INDEX IF NOT EXISTS idx_ao_fellow_app_sponsor ON ao_fellowship_applications(sponsor_agent_id);

CREATE TABLE IF NOT EXISTS ao_working_papers (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  school_id TEXT NOT NULL DEFAULT 'ao',
  company_id TEXT REFERENCES ao_companies(id) ON DELETE SET NULL,
  author_agent_ids TEXT[] NOT NULL,
  title TEXT NOT NULL,
  abstract TEXT,
  body_markdown TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ao_working_papers_slug ON ao_working_papers(slug);

CREATE TABLE IF NOT EXISTS ao_company_updates (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES ao_companies(id) ON DELETE CASCADE,
  school_id TEXT NOT NULL DEFAULT 'ao',
  author_agent_id TEXT NOT NULL,
  week_number INTEGER,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  body_markdown TEXT NOT NULL,
  kpi_snapshot JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_ao_company_updates_company ON ao_company_updates(company_id, posted_at DESC);

CREATE TABLE IF NOT EXISTS ao_demo_days (
  id TEXT PRIMARY KEY,
  cohort_id TEXT NOT NULL REFERENCES ao_cohorts(id) ON DELETE CASCADE,
  school_id TEXT NOT NULL DEFAULT 'ao',
  status TEXT NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ NOT NULL,
  theme TEXT,
  summary_markdown TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ao_demo_day_pitches (
  id TEXT PRIMARY KEY,
  demo_day_id TEXT NOT NULL REFERENCES ao_demo_days(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL REFERENCES ao_companies(id) ON DELETE CASCADE,
  presenter_agent_id TEXT NOT NULL,
  pitch_markdown TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  applause_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ao_demo_day_applause (
  pitch_id TEXT NOT NULL REFERENCES ao_demo_day_pitches(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  applauded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (pitch_id, agent_id)
);
